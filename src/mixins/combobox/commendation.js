import commendationAPI from "@/apis/commendation/commendationAPI";

//Dùng cho combo danh sách các phong trào
export const commendationCombo = {
    data() {
        return {
            commendationSource: [],
        }
    },

    watch: {
        /**
         * Thay đổi dữ liệu -> reset source
         */
        '$store.state.commendation.version': function (newVal) {
            const me = this;
            me.commendationSource = null;
        }
    },

    methods: {
        /**
         * Gọi api lấy dữ liệu cho component suggestion
         * DLHuy 24.11.2021
         */
        loadDecisionOrganization(payload) {
            const me = this;

            commendationAPI.loadSuggestDecisionOrganization(payload)
                .then(result => {
                    me.commendationSource = result.PageData;
                });
        }

    }
}