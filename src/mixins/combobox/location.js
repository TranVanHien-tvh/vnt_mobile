import locationAPI from "@/apis/common/locationAPI.js";

/**
 * Chỉ dùng cho form chi tiết
 */
export const locationData = {
    data() {
        return {
            provinceDataSrc: [],
        }
    },
    watch: {
        /**
         * Thay đổi dữ liệu -> reset source
         */
        '$store.state.locationData.version': function (newVal) {
            const me = this;
            me.provinceDataSrc = null;
        }
    },
    methods: {
        /**
         * load source
         */
        loadProvinceData(payload) {
            const me = this;

            locationAPI.getProvinceData(payload).then(result => {
                me.provinceDataSrc = result;
            });
        },
    }
};
