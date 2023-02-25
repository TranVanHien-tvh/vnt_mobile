import { MSEnum } from '@/commons/enumeration';
import _ from 'lodash';
import msValidate from "@/components/msValidate/msValidate.vue";
import reportApi from '@/apis/report/reportAPI';
import popupUtil from "@/commons/popupUtil";

export default {
    name: "BaseFormParam",

    components: {
        msValidate,
    },
    data() {
        window._xx = this;
        return {
            popParam: null,

            /**
             * Dữ liệu báo cáo đã chọn truyền từ list sang
             * TDNGHIA 23/11/2021
             */
            reportData: null,

            /**
            * Tham số gọi API lấy keycache báo cáo
            * TDNGHIA 23/11/2021
            */
            reportParam: {},

            /**
            * Tiêu đề form
            */
            title: null,

            loading: false,

            active: false,

            //key Cache báo cáo
            keyCache: null,

            //Teen form preview
            previewFormName: "PreviewDetail",

            //Auto focus vào input đầu tiên
            isAutoFocus: true,

        };
    },

    mounted() {
        const me = this;

        if (me.$refs.popupReportParam) {
            popParam = me.$refs.popupReportParam;
        }
    },

    methods: {
        /**
         * TDNGHIA 23/11/2021
         * Đóng Popup và emit close của instance đang đợi để kill $el khỏi DOM.
         */
        close(event) {
            const me = this;
            me.$emit("close", me, event);
            me.hide();
        },

        /**
         * ẩn popup
         * TDNGHIA 23/11/2021
         */
        hide() {
            const me = this;
            me.active = false;
        },

        /**
         * Hàm validate control trước khi call api
         * TDNGHIA 24/11/2021
         */
        validate() {
            const me = this;
            //refs của ms-validate
            if (me.$refs.validateObserver) {
                return me.$refs.validateObserver.validate();
            }
            return true;
        },

        /**
         * Validate nghiệp vụ nếu cần
         * @param {*} param 
         * @returns 
         */
        validateBusiness(param) {
            return true;
        },

        /**
         * Xử lý show form chọn tham số báo cáo
         * cache lại report đã chọn
         * thực hiện load data
         * TDNGHIA 24/11/2021
         * @param {Object} options 
         */
        show(data, options) {
            var me = this;
            me.options = options;
            me.reportData = data.data;

            //Xử lý trước khi load
            if (me.reportData) {
                me.prepareBeforeShow(options, data);
            }

            //reset validate
            me.$nextTick(() => {
                if (me.isAutoFocus) {
                    //focus first control
                    setTimeout(function () {
                        me.$ms.commonFn.focusFirstControlInput(me.$el);
                    }, 200);
                }

                me.resetValidate();
            });

            //Sau này có yêu cầu cache các tham số báo cáo thì viết hàm load ở đây

            me.active = true;
        },

        /**
         * Cập nhật lại trạng thái validate về ban đầu
         * TDNGHIA 25/11/2021
         */
        resetValidate() {
            const me = this;
            if (me.$refs.validateObserver) {
                me.$refs.validateObserver.reset();
            }
        },

        /*
        * Hàm reset lại giá trị
        * TDNGHIA 25/11/2021: phục vụ mục đích khi tích chức năng x trên control mscontrol field
        */
        resetData() {
            const me = this;

            for (let field in me.currentItem) {
                if (me.currentItem.hasOwnProperty(field)) {
                    me.currentItem[field] = null;
                }
            }
        },

        /**
         * Thực hiện một số action cần thiết trước khi show form tham số báo cáo
         * @overrideable
         */
        prepareBeforeShow(options, data) { },

        /**
         * Gọi API lưu thông tin config trả về keycache để gọi sang Report lấy file
         * TDNGHIA 23/11/2021
         */
        async getKeycache() {
            const me = this;

            me.loading = true;
            //Validate các kiểu ở đây

            try {
                if (me.validate()) {
                    //param gửi lên để lấy keycache
                    let param = me.getReportParam();
                    me.customReportParam(param);

                    if (me.validateBusiness(param)) {
                        me.keyCache = await reportApi.saveParamater(param);

                        if (me.keyCache) {
                            let urlPreview = reportApi.getPrintLink(me.keyCache);
                            //Sau khi có keycache thì gọi sang Report để lấy file pdf về
                            //Show file pdf len form preview
                            me.showPreview(urlPreview)
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                me.loading = false;
            }
        },

        /**
         * Build param gọi API report
         * TDNGHIA 24/11/2021
         */
        getReportParam() {
            const me = this;
            let parameters = [],
                parameter = {
                    ExportType: me.$ms.enum.ExportType.Pdf,
                    ReportID: me.reportData.ReportID,
                    ReportName: me.reportData.ReportName,
                    ReportTitle: "",
                    ReportSubTitle: "",
                    TemplateParam: {
                        //Tham số dùng cho template file
                    },
                    ReportList: {
                        ReportListID: me.reportData.ReportListID,
                        ReportID: me.reportData.ReportID,
                        ReportName: me.reportData.ReportName,
                        ReportType: me.$ms.enum.ReportType.Stimul,
                        //Đây là những thông tin cơ bản, mình còn những prop khác nữa 
                    },
                    DataParam: {
                        //Tham số dùng cho việc load store dữ liệu
                    },
                    MisaObject: {
                        //Tham số chứa các thông tin về đơn vị
                    }
                };

            parameters.push(parameter);

            return parameters;
        },

        /**
         * override
         * Chế lại các tham số tùy ý
         * TDNGHIA 24/11/2021
         */
        customReportParam(param) {

        },

        /**
         * Show màn hình preview
         * NTDIEM 24.11.2021
         * @param {} urlPreview : link pdf để preview
         */
        showPreview(urlPreview) {
            const me = this;
            popupUtil.show(me, me.previewFormName, me.getPreviewData(urlPreview), me.getPreviewOptions());
        },

        /**
         * Lấy dữ liệu để mở form preview
         * NTDIEM 24.11.2021
         * @param {*} urlPreview 
         * @returns dữ liệu cho form preview
         */
        getPreviewData(urlPreview) {
            const me = this;
            return {
                previewURL: urlPreview,
                reportData: me.reportData
            }
        },

        /**
         * Lấy option cho form preview
         * NTDIEM 24.11.2021
         * @returns option cho form preview
         */
        getPreviewOptions() {
            const me = this;
            return me.options;
        }
    },
    beforeDestroy(urlPreview) {
        var me = this;
    }
};
