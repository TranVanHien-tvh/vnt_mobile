import emulationTitleAPI from "@/apis/dictionary/emulationTitleAPI";

//Combo danh hiệu thi đua
//TDNGHIA 1/11/2021
export const emulationTitleData = {
    data() {
        return {
            emulationTitleSource: [],
        }
    },

    watch: {
        /**
         * Thay đổi dữ liệu -> reset source
         */
        '$store.state.emulationTitle.version': function (newVal) {
            const me = this;
            me.emulationTitleSource = null;
        }
    },

    methods: {
        /**
         * Gọi lấy dữ liệu danh sách phòng ban 
         * TDNGHIA 28/10/2021
         * @param {*} payload 
         */
        loadEmulationTitleSource(payload) {
            const me = this;
            if (typeof me.customPayloadCombo === "function") {
                me.customPayloadCombo(payload);
            }

            emulationTitleAPI.getComboboxPaging(payload)
                .then(result => {
                    me.emulationTitleSource = result.PageData;
                });

        },
    }
}