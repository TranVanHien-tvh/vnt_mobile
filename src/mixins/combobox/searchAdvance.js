import searchAdvancedConditionAPI from "@/apis/searchadvanced/searchAdvancedConditionAPI";
import { formatWithCursor } from "prettier";

//Combo danh hiệu thi đua
//TDNGHIA 1/11/2021
export const searchAdvanceComboData = {
    data() {
        return {
            searchAdvanceComboSource: [],
        }
    },

    methods: {
        /**
         * Gọi lấy dữ liệu danh sách bộ lọc 
         * NTTHANH1
         * @param {*} payload 
         */
        loadSearchAdvanceComboSource(payload) {
            const me = this;
            if (typeof me.customPayloadCombo === "function") {
                me.customPayloadCombo(payload);
            }

            searchAdvancedConditionAPI.getList(payload)
                .then(result => {
                    if(result.PageData.length > 0) {
                        me.searchAdvanceComboSource = result.PageData;
                    }
                });

        },
    }
}