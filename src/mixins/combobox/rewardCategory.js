import rewardCategoryAPI from "@/apis/dictionary/rewardCategoryAPI";

//Combo danh hiệu thi đua
//TDNGHIA 1/11/2021
export const rewardCategoryData = {
    data() {
        return {
            rewardCategorySource: [],
        }
    },

    watch: {
        /**
         * Thay đổi dữ liệu -> reset source
         */
        '$store.state.rewardCategory.version': function (newVal) {
            const me = this;
            me.rewardCategorySource = null;
        }
    },

    methods: {
        /**
         * Gọi lấy dữ liệu danh sách phòng ban 
         * TDNGHIA 28/10/2021
         * @param {*} payload 
         */
        loadRewardCategorySource(payload) {
            const me = this;

            if (typeof me.customPayloadCombo === "function") {
                me.customPayloadCombo(payload);
            }

            rewardCategoryAPI.getComboboxPaging(payload)
                .then(result => {
                    me.rewardCategorySource = result.PageData;
                });

        },
    }
}