import popupUtil from "@/commons/popupUtil";
export const listPopup = {
    data: function () {
        return {
        };
    },
    methods: {
        /**
         * Lấy tham số khi mở form chi tiết
         * TDNGHIA 23/11/2021
         * */
        getDetailParameter(formName, mode, defaultData) {
            const me = this;
            let param = {
                data: defaultData || null
            };

            switch (mode) {
                case me.$ms.enum.FormState.Duplicate:
                case me.$ms.enum.FormState.Edit:
                case me.$ms.enum.FormState.View:
                    let keyField = me.$store.state[me.module]._config.field.key;
                    if (keyField) {
                        param.id = defaultData[keyField];
                    }
                    break;
            }

            param.mode = mode;

            me.customDetailParam(param)

            return param;
        },

        /**
         * Chế lại param gửi đi
         * TDNGHIA 23/11/2021
         * @param {*} param 
         */
        customDetailParam(param) {
        },

        /**
         * Hiển thị popup
         * TDNGHIA 23/11/2021
         * @param {} name 
         * @param {*} mode 
         * @param {*} data 
         * @param {*} option 
         */
        showDetail(name, mode, data, option) {
            const me = this;

            popupUtil.show(me, name, data, me.getPopupOption(name, option));
        },

        /**
         * Cài option cho popup
         * TDNGHIA 23/11/2021
         * @param {} name 
         * @param {*} option 
         * @returns 
         */
        getPopupOption(name, option) {
            const me = this;
            return {
                submit: me.submitDetailCallback,
                single: true
            };
        },
    }
};
