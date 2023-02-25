import jobPositionAPI from "@/apis/dictionary/jobPositionAPI";

//TDNGHIA 29/10/2021
//Dùng cho load các combo chức vụ chức danh
//0 là chức vụ 1 là chức danh
export const jobPositionSource = {
    data() {
        return {
            listJobPositionSource: [],
            listJobTitleSource: [],
        }
    },

    watch: {
        /**
         * Thay đổi dữ liệu -> reset source
         */
        // '$store.state.jobPosition.version': function (newVal) {
        //     const me = this;
        //     me.listJobPositionSource = null;
        // }
    },

    methods: {
        /**
         * Gọi lấy dữ liệu danh sách chức vụ
         * TDNGHIA 28/10/2021
         * @param {*} payload 
         */
        loadJobPosition(payload) {
            const me = this;

            if (typeof me.customPayloadCombo === "function") {
                me.customPayloadCombo(payload, 0); //truyền thêm type = 0 để load chức vụ
            }

            jobPositionAPI.getComboboxPaging(payload)
                .then(result => {
                    me.listJobPositionSource = result.PageData;
                });

        },

        /**
         * Gọi lấy dữ liệu danh sách chức danh
         * TDNGHIA 28/10/2021
         * @param {*} payload 
         */
        loadJobTitle(payload) {
            const me = this;

            if (typeof me.customPayloadCombo === "function") {
                me.customPayloadCombo(payload, 1); //truyền thêm type = 0 để load chức vụ
            }

            jobPositionAPI.getComboboxPaging(payload)
                .then(result => {
                    me.listJobTitleSource = result.PageData;
                });

        },
    }
}