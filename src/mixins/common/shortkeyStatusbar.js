import EventBusGlobal, { GlobalEventName } from "@/commons/eventBusGlobal";


export const shortkeyStatusbar = {
    props: {},
    data: function() {
        return {
            /**
             * Chuỗi text hiển thị ở status bar: dùng cho hiển thị phím tắt, hướng dẫn,....
             */
            statusBarText: null,
        };
    },
    mounted: function() {
		EventBusGlobal.$on(GlobalEventName.controlFocus,this.controlFocus);
		EventBusGlobal.$on(GlobalEventName.controlBlur,this.controlBlur);
		EventBusGlobal.$on(GlobalEventName.gridFocus,this.gridFocus);
		EventBusGlobal.$on(GlobalEventName.gridBlur,this.gridBlur);

	},
	destroyed()
	{
		EventBusGlobal.$off(GlobalEventName.controlFocus,this.controlFocus);
		EventBusGlobal.$off(GlobalEventName.controlBlur,this.controlBlur);
		EventBusGlobal.$off(GlobalEventName.gridFocus,this.gridFocus);
		EventBusGlobal.$off(GlobalEventName.gridBlur,this.gridBlur);
	},
    watch: {},
    computed: {},
    methods: {
        /**
         * Focus control: hiển thị phím tắt
         */
        controlFocus(e) {
            this.statusBarText = this.getControlShortkeyDescription(e.target);
        },

        /**
         * Unfocus control: hiển thị phím tắt
         */
        controlBlur(event) {
            this.statusBarText = null;
        },

        /**
         * cho form override để custom text hiển thị
         */
        customShortkeyTextDisplay(target, text) {
            return text;
        },

        /**
         * Lấy text hiển thị
         */
        getControlShortkeyDescription(target) {
            let config = this.getShortkeyConfig(target);

            this.customControlShortkeyConfig(target, config);

            return this.mapShortkeyText(target, config);
        },

        /**
         * cho form custom config shortkey của control
         */
        customControlShortkeyConfig(target, config) {},

        /**
         * maping từ short text
         */
        mapShortkeyText(target, keys) {
            let texts = [];

            if (keys) {
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    if (key && this.checkAllowShortkey(target, key)) {
                        texts.push(this.$t('i18nShortkey.StatusDisplay.' + key));
                    }
                }
            }

            this.customShortkeyTextDisplay(target, texts);

            return texts.join(', ');
        },

        /**
         * maping shortkey tooltip theo key
         */
         mapShortkeyTooltip(key) {
             let tooltip = "";
            if(key){
                tooltip = this.$ms.enum.ShortKeyToolTip[key];
            } 

            return tooltip;
        },


        /**
         * Kiểm tra xem target có được phép thực hiện shortkey không
         */
        checkAllowShortkey(target, shortkey) {
            return true;
        },

        /**
         * Kiểm tra control focus có phải là control ref không
         */
        shortkeyTargetMaped(target, ref) {
            return this._shortkeyTargetMaped(target, ref.$el, 0);
        },
        _shortkeyTargetMaped(target, refEl, i) {
            if (i > 15) {
                return false;
            }

            if (target === refEl) {
                return true;
            } else {
                return this._shortkeyTargetMaped(target.parentElement, refEl, i + 1);
            }
        },

        /**
         * Xử lý phím tắt
         */
        shortkeyAction(e) {
            let me = this;
            switch (e.originEvent.which) {
                case 120:
                case 114:
                case 27: //esc
                    /**
                     * Một số phím tắt do config với phím tắt của control -> cần delay đợi control xử lý xong mới xử lý
                     */
                    setTimeout(() => {
                        me.executeShortkey(e);
                    }, 10);
                    break;
                default:
                    me.executeShortkey(e);
                    break;
            }
        },

        /**
         * Xử lý phím tắt
         */
        executeShortkey(e) {

            if (e.originEvent.cancel && e.srcKey != 'Close') {
                return;
            }
            let me = this;
            const shortkey = e.target.getAttribute('shortkey');
            if (shortkey && shortkey.split('|').indexOf(e.srcKey) > -1) {
                e.originEvent.preventDefault();
                e.originEvent.stopPropagation();
                e.originEvent.cancel = true;

                //click vào body để unfocus khỏi control hiện tại -> submit giá trị đang nhập
                document.body.click();

                var selector = ['[shortkey-target="', e.srcKey, '"]'].join('');
                var target = me.$el.querySelector(selector);
                if (target) {
                    if(target.classList.contains('split-button')){
                        let button = target.querySelector('button');
                        if(button){
                            button.click();
                        }
                    }else{
                        target.click();
                    }
                } else {
                    setTimeout(() => {
                        //gọi hàm xử lý tương ứng với phím tắt
                        me.buttonClick(e.srcKey, e);
                    }, 10);
                }
            }
        },

        /**
         * Đọc cấu hình shortkey
         */
        getShortkeyConfig(el, i) {
            if (el.attributes.shortkey) {
                if (el.attributes.shortkey.value) {
                    return el.attributes.shortkey.value.split('|');
                } else {
                    return null;
                }
            }

            let j = i || 0;
            if (el.parentNode && j < 10) {
                return this.getShortkeyConfig(el.parentNode, j + 1);
            } else {
                return null;
            }
        },
        /**
         * focus vào editor trên grid
         */
        gridFocus(meta, e, grid) {
            if (e) {
                let keys = this.getShortkeyConfig(e.target) || [];

                if (meta.dataRow && meta.dataRow.inventory_item_id) {
                    const viewBalance = 'ctrl_f2';
                    if (keys.indexOf(viewBalance) === -1) {
                        keys.push(viewBalance);
                    }
                }

                if (meta.column.allowCopy && meta.dataRow != meta.gridData[meta.gridData.length - 1]) {
                    const copy = 'ctrl_2';
                    if (keys.indexOf(copy) === -1) {
                        keys.push(copy);
                    }
                }

                if (this.allowRecalculator
                    && meta.dataRow.unit_price_after_tax
                    && grid.checkColumnVisible('unit_price_after_tax')) {
                    const ctrl4 = 'ctrl_4';
                    if (keys.indexOf(ctrl4) === -1) {
                        keys.push(ctrl4);
                    }
				}
				//ntlan 29.09.2020 sửa bug 48576 lỗi 2
				if (meta.dataRow && (meta.dataRow.credit_account || meta.dataRow.debit_account)) {
                    const viewBalanceAccount = 'ctrl_3';
                    if (keys.indexOf(viewBalanceAccount) === -1) {
                        keys.push(viewBalanceAccount);
                    }
                }

                this.statusBarText = this.mapShortkeyText(e.target, keys);
            }
        },
        /**
         * unfocus khỏi editor của grid
         */
        gridBlur(meta, e) {
            this.statusBarText = '';
        },

    }
};
