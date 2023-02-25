import emulationAPI from "@/apis/movement/emulationmovementAPI";
import commendationAPI from "@/apis/commendation/commendationAPI";

//Dùng cho combo danh sách các phong trào
export const emulationMovementCombo = {
    data() {
        return {
            emulationMovementSource: [],
        }
    },

    watch: {
        /**
         * Thay đổi dữ liệu -> reset source
         */
        '$store.state.emulationMovement.version': function (newVal) {
            const me = this;
            me.emulationMovementSource = null;
        }
    },

    methods: {
        /**
         * Gọi lấy dữ liệu danh sách phong trào
         * TDNGHIA 28/10/2021
         * @param {*} payload 
         */
        loadEmulationMovement(payload) {
            const me = this;

            if (typeof me.customPayloadCombo === "function") {
                me.customPayloadCombo(payload); //Chế lại có thể lấy những thằng đang phát động thôi
            }

            emulationAPI.getComboboxPaging(payload)
                .then(result => {
                    me.emulationMovementSource = result.PageData;
                });

        },

        /**
         * Gọi lấy dữ liệu cho combobox 
         * DLHuy 19.11.2021
         * @param {*} payload 
         */
        loadCommendationEmulation(payload) {
            const me = this;

            if (typeof me.customPayloadCombo === "function") {
                me.customPayloadCombo(payload); 
            }

            commendationAPI.loadComboCommendationEmulation(payload)
                .then(result => {
                    me.emulationMovementSource = result.PageData;
                });

        },
        
    }
}