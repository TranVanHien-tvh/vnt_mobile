import emulationGroupAPI from "@/apis/system/emulationGroupAPI";

//Combo danh hiệu thi đua
//TDNGHIA 1/11/2021
export const gridEmulationGroupDetail = {
    data() {
        return {
            gridEmulationGroupDetailSource: [],
        }
    },

    watch: {
        /**
         * Thay đổi dữ liệu -> reset source
         */
        '$store.state.emulationGroup.version': function (newVal) {
            const me = this;
            me.gridEmulationGroupDetailSource = null;
        }
    },

    methods: {
        /**
         * Gọi lấy dữ liệu danh sách phòng ban 
         * TDNGHIA 28/10/2021
         * @param {*} payload 
         */
        loadGridEmulationGroupDetailSource(payload) {
            const me = this;

            if (typeof me.customPayloadGridDetail === "function") {
                me.customPayloadGridDetail(payload);
            }

            emulationGroupAPI.getList(payload)
                .then(result => {
                    me.gridEmulationGroupDetailSource = result.PageData;
                });

        },
    }
}