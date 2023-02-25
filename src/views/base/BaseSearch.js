import BaseListPopup from "@/views/base/BaseListPopup";

export default {
    extends: BaseListPopup,
	name: 'BaseSearch',
	data: function() {
		return {
			/**
             * cờ hiển thị popup
             */
            active: false,
            /**
             * Đợi fill xong data mới gọi load
             */
            autoLoad: false,
		};
	},
	watch: {},
	created: function() {
    },
	computed: {
    },
	methods: {
        /**
         * @override
         */
        initLayout() {
            //nothing
        },
		/**
		 * Hàm mở popup
		 *  */
		show(param, options) {
			let me = this;

			//giữ lại option cho các tình huống cần sử dụng
            me.options = options;
            me.param = {};
			if (param) {
				Object.assign(me.param, param);
			}

			//show popup
            me.active = true;

            //load data
            me.$nextTick(() => {
                me.reload();
            });

            me.afterShow();
        },

        /**
         * Xử lý sau khi show form
         * created by ntphong 28/4/2021
         */
        afterShow() {

        },

		/**
		 * Hàm đóng popup
		 *  */
		close() {
			const me = this;
            me.active = false;

            me.$emit('close');
        },
        /**
         * Submit dữ liệu và đóng form
         */
        submit(records) {
            const me = this;
            let data = records || me.getSumitData();
            // NTAnh thêm hàm xử lý trước khi submit (để xử lý tự động chọn dòng đầu tiên khi người dùng ấn submit luôn)
            data = me.beforeSubmit(data);
            if (me.validate(data)) {

                //raise sumit event
                me.$emit('searchsubmit', data);

                //close form
                me.close();
            }
        },
        /**
         * Xử lý trước khi submit
         */
        beforeSubmit(data){
            return data;
        },

        /**
         * Xử lý trước khi submit
         * @overridable
         */
        validate(){
            return true;
        },
        /**
         * Lấy dữ liệu submit
         */
        getSumitData() {
            if(this.grid.multiple){
                return this.grid.value;
            }else{
                return [this.grid.getRowSelected().data];
            }
        },
        /**
         * @override
         */
        gridRowDbClick(record) {
            this.submit([record]);
        }
	},
    mounted() {
        //init cha của form sẽ ăn phím tắt
        this.$ms.commonFn.shortkeyPushView(this.$el);
    },
    /**
     * Trước khi destroy form
     */
    beforeDestroy() {
        //destroy cha của form sẽ ăn phím tắt
        this.$ms.commonFn.shortkeyPopView(this.$el);
    }
}