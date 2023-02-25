import reportListApi from "@/apis/reportListAPI";
import dynamicReportApi from "@/apis/report/dynamicReportAPI";
import exportApi from "@/apis/exportAPI";
import { permission } from "@/mixins/common/permission";
import popupUtil from "@/commons/popupUtil";
import BaseList from "@/views/base/BaseList";
import { MSEnum } from "@/commons/enumeration";
import i18n from '@/i18ns/i18n';
import store from "@/stores/store";

/**
 * Base xử báo cáo động
 */
export default {
  extends: BaseList,
  name: "BaseDynamicReport",
  mixins: [permission],
  data: function () {
    let dataSourcePeriod = this.$ms.commonFn.getEnumSource('Period');
    return {
      /**
       * Tiêu đề form
       */
      title: null,
      /**
       * Mã báo cáo
       */
      reportId: null,
      /**
       * Đang sửa mẫu
       */
      editing: false,
      /**
       * Dữ liệu của trang
       */
      items: [],
      /**
       * Tổng số bản ghi
       */
      total: 0,
      /**
       * Đang loading dữ liệu
       */
      loading: false,
      /**
       * hiển thị tham số
       */
      showCondition: true,
      /**
       * tham số
       */
      condition: {
        ToDate: new Date(),
      },
      /**
       * kỳ báo cáo
       */
      period: MSEnum.Period.FirstMonthToPresent,
      /**
       * data chọn kỳ
       */
      dataSourcePeriod: dataSourcePeriod,
      /**
       * các tham số build title
       */
      buildReportTerm: '...',

      //#endregion mustOverride

      formTitle: this.$t('i18nReport.ReportParamTitle'),

      /**
       * Tham số load báo cáo
       */
      reportParam: {},
      /**
       * bản ghi summary
       */
      summary: {
        total: 0,
      },
      /**
       * cờ loading summary
       */
      loadingSummary: false,
      /**
       * override
       */
      splitLoadRequest: false,
      /*
       * pvduy 24/04/2021: cờ đánh dấu đã từng lấy dữ liệu của báo cáo hay chưa
       */
      isLoadedData: false,
      /**
       * Tên trường nhóm dữ liệu
       */
      groupField: null,
      /**
       * Sắp xếp nhóm dữ liệu
       */
      groupDir: null,
      /**
       * Dữ liệu sum của group trả về từ server
       */
      groupSummary: null,
      shortKeyReport: { Print: ['ctrl', 'p'], Close: ['esc'] }
    };
  },
  computed: {},
  watch: {
  },
  created: function () {
    this.subSystemCode = "Reports"; //màn hình phân hệ check quyền
  },
  mounted: function () {
    const me = this;
    window._xx = this;

    //lấy thông tin id mẫu đặc thù
    if (me.$route) {
      if (me.$route.params.id) {
        me.reportListId = parseInt(me.$route.params.id, 10);
      }

      //tvloi 13.08.2021 Lấy thông tin nhóm báo cáo
      if(me.$route.params.reportGroupID){
        me.reportGroupID = me.$route.params.reportGroupID;
      }


      me.initLayout();

      //init event
      me.initEvent();
    }

  },
  methods: {

    /**
     * custom tham số trước khi show popup
     * TVLoi 24.06.2021
     */
     paramPrepareBeforeShow() {
      return {};
    },


    /**
     * Xử lý quay lại
     */
    back() {
      this.$router.push({ name: "report" });
    },

    /**
     * init mẫu hiển thị
     * pvduy thêm callback phục vụ những báo cáo load động giao diện theo tham số
     */
    initLayout(callback) {
      const me = this;

      reportListApi.getApply(me.reportId, me.reportListId, true).then(layout => {

        if (!me.reportListId && layout && layout.ReportListID) {
          me.reportListId = layout.ReportListID;
        }

        if(!me.reportGroupID && layout && layout.ReportGroupID){
          me.reportGroupID =  layout.ReportGroupID;
        }

        //apply mẫu hiển thị
        me.customLayout(layout);
        me.applyLayout(layout);
        me.afterApplyLayout();

        if (typeof callback === 'function') {
          callback.call();
        }
      });
    },

    /**
     * Apply mẫu hiển thị
     */
    applyLayout(layout) {
      const me = this;

      //giữ lại layout dùng cho form sửa mẫu
      me.layout = layout;

      if (layout.IsSystem) {
        me.title = me.$t("i18nReport.ReportName." + me.reportId);
      } else {
        me.title = layout.Name;
      }

      //column
      let layoutConfig = JSON.parse(layout.Config);
      let columns = me.getLayoutColumn(layout, layoutConfig);
      me.grid.initColumns(columns);
      setTimeout(() => {
        me.grid.initColumns(columns);
      }, 200);

      //group
      let groupField = null,
        groupDir = 'ASC';
      if (layoutConfig.groups && layoutConfig.groups.length > 0) {
        let gs = layoutConfig.groups[0].split(' ');
        groupField = gs[0];

        if (gs.length > 0) {
          groupDir = gs[gs.length] === 'DESC' ? 'DESC' : "ASC";
        }
      }
      me.groupField = groupField;
      me.groupDir = groupDir;
    },

    /**
     * Xử lý sau khi load layout
     * created by ntphong 23/4/2021
     */
    afterApplyLayout() {

    },

    /**
     * Xử lý layout trước khi bind vào grids
     * @param {*} layout
     */
    customLayout(layout){
      const me = this;

    },

    /**
     * Lấy thông tin column render từ thông tin của mẫu
     */
    getLayoutColumn(layout, layoutConfig) {
      const me = this;
      let columns = layoutConfig.columns;

      //nếu là mẫu mặc định và ngôn ngữ khác tiếng việt -> cập nhật caption/title theo ngôn ngữ
      if (layout.IsSystem) {
        me.localizationColumn(columns);
      }

      return columns;
    },

    /**
     * @overide
     */
    processLoadParameter(payload) {
      const me = this;

      me.super("processLoadParameter", payload);
      payload.reportId = me.reportId;

      if (me.groupField) {
        payload.groupField = me.groupField;

        //Nếu danh sách trường lấy dữ liệu không có trường nhóm dữ liệu thì thêm vào
        if (!payload.columns) {
          payload.columns = [];
        }
        if (payload.columns.indexOf(payload.groupField) === -1) {
          payload.columns.push(payload.groupField);
        }
      }
    },

    /**
     * Gọi request load dữ liệu
     */
    requestLoadData(payload) {
      const me = this;

      //request load data
      payload.readType = 1;

      /**
       * Xử lý thêm request id để xử lý async callback
       * Kịch bản là tại request của trang đầu tiên sẽ có khả năng phải gọi gen dữ liệu -> tốn thời gian và có thể làm timeout request
       * NÊN:
       *  - Tại đây sẽ sinh requestId là 1 chuỗi ngâu nhiên, dùng chuỗi này khai báo async callback function (ACF)
       *  - Nếu request vào .then (complete) -> xóa ACF đi
       *  - Nếu request dính .catch (ngoại lệ thì kiểm tra xem phải timeout không)
       *    + Nếu là timeout thì khai báo 1 interval (sử dụng timeout và chủ động repeat để tối ưu hiệu năng và giảm rủi do tạo vòng lặp vô tận)
       *      để định kỳ kiểm tra xem việc gen dữ liệu xong chưa
       *        - request này lặp lại tiến trình từ đầu
       *  - Nếu ACF dính thì sẽ xóa interval đi và call request load dữ liệu - lưu ý chỗ này sẽ k fix sessionId nào vì có thể giao diện người dùng đã đổi tham số -> luôn lấy session mới nhất
       */
      if (!payload.sessionId) {
        payload.requestId = me.$ms.commonFn.generateUUID();

        //async event callback
        window[payload.requestId] = function () {
          delete payload.requestId;

          me.requestLoadData(payload);
        }
      }

      me.requestLoadDataApi(payload);
    },

    /**
     * Gọi request load dữ liệu
     */
    requestLoadDataApi(payload) {
      const me = this;

      me.loading = true;
      me.clearIntervalLoadData();

      dynamicReportApi
        .getPaging(payload)
        .then(result => {
          me.loading = false;

          //clear async callback
          if (payload.requestId) {
            delete window[payload.requestId];
          }

          //dữ liệu
          me.items = result.PageData;
          me.afterLoadData(payload, result);
          if (me.groupField) {
            me.groupSummary = result.GroupData || null;
          }

          //request đầu tiên (gen dữ liệu) sẽ gọi load summary
          if (!payload.skip) {
            //tổng bản ghi
            me.total = result.Total;
            //key tham số báo cáo
            me.sessionId = payload.sessionId = result.SessionID;

            //load dữ liệu summary
            let param = { ...payload, ...{ readType: 2 } };
            delete param.groupField;

            me.loadDataSumary(param);
          }
        })
        .catch(err => {
          console.error(err);

          //tạo interval xử lý timeout
          if (payload.requestId && window._appConfig.dynamicReportIntervalCheck > 0) {
            me.clearIntervalLoadData();

            me._ivLoad = setTimeout(() => {
              me.requestLoadDataApi(payload);
            }, window._appConfig.dynamicReportIntervalCheck);
          }
        })
        .finally(() => {
          // me.loading = false;
        });
    },

    /**
     * Xóa interval load dữ liệu nếu có
     */
    clearIntervalLoadData() {
      const me = this;
      if (me._ivLoad) {
        clearTimeout(me._ivLoad);
      }
    },

    /**
     * Gọi request load summary
     */
    requestLoadDataSummary(payload) {
      const me = this;

      //request load data
      me.loadingSummary = true;
      dynamicReportApi
        .getPaging(payload)
        .then(result => {
          me.summary = result.SummaryData;
          me.total = result.Total || 0;
          me.afterLoadDataSummary(payload, result);
        })
        .finally(() => {
          me.loadingSummary = false;
        });
    },

    /**
     * xử lý sau khi load xong data
     */
    afterLoadData(payload, resut){
      const me = this;
    },

    /**
     * Xử lý sau khi load dòng tổng
     * created by ntphong 26/4/2021
     */
    afterLoadDataSummary(payload, result) {
      const me = this;
    },

    /**
     * Xuất khẩu excel
     */
    exportExcel() {
      const me = this
      if (!me.checkActionPermissionAlert(me.$t("i18nPermission.SubSystemCode.Code.EXPORT"))) {
        return;
      }
      let param = me.getExportParam();
      param.FileType = "xlsx";
      exportApi.export(param);
    },
    /**
     * Xuất khẩu pdf
     */
    print() {
      const me = this;
      if (!me.checkActionPermissionAlert(me.$t("i18nPermission.SubSystemCode.Code.PRINT"))) {
        return;
      }
      let param = me.getExportParam();
      // custom lại tên báo cáo khi in nếu muốn
      param.ReportTitle = me.getCustomTitle() ? me.getCustomTitle() : param.ReportTitle;
      param.FileType = "pdf";
      let fileName = [me.$ms.commonFn.removeUnicode(param.ReportTitle), param.FileType].join(".");
      param.preview = fileName;
      exportApi.export(param);
    },
    /**
     * sinh hàm này để có thể custom lại tên báo cáo khi in
     * CreatedBy: NTAnh2 (26/04/2021)
     */
    getCustomTitle() {
      return null;
    },

     /**
     * Thêm hàm này để xử lý đoạn lấy dữ liệu cho báo cáo
     * pvduy
     */
      applyCondition(condition) {
        const me = this;
        me.condition = condition;
        me.getData();
      },

    /**
     * Lấy tham số xuất khẩu
     */
    getExportParam() {
      let me = this;
      let param = me.getGridExportParameter(me.grid);
      param.GetDataUrl = dynamicReportApi.getAPIUrl();
      param.GetDataMethod = "POST";
      param.ReportTitle = me.title;
      param.ReportSubTitle = me.getExportSubtitle();

      if (param.Columns && param.Columns.length > 0) {
        let col = param.Columns[0];
        if (col.Key === "SortOrder" || col.Width < 100) {
          col = param.Columns[1];
        }

        if (!col.hasOwnProperty("Sum")) {
          col.FooterText = me.$t("i18nReport.List.ExportSum");
        }
      }
      if (me.layout && typeof me.layout.Config === 'string') {
        let layout = JSON.parse(me.layout.Config);
        if (Array.isArray(layout.groups) && layout.groups.length > 0) {
          param.GroupBy = [];
          layout.groups.forEach(item => {
            let column = layout.columns.filter(i=>i.dataField == layout.groups[0]);
            if(column && column.length > 0){
              column = column[0];
            }
            let gs = layout.groups[0].split(' '),
              temp = {
                GroupField: gs[0],
                DisplayField: gs[0],
                EnumName: column.enum,
                Colspan: me.grid.groupData && me.grid.groupData.length>0?me.grid.groupData[0].colspan:0 || 0
              };
            if (gs.length > 1 && /desc/i.test(gs[gs.length - 1])) {
              temp.GroupDirection = "DESC";
            }
            else{
              // if(param.GetDataParam["groupField"] != null){
              //   param.GetDataParam["sort"] = param.GetDataParam["groupField"] + ' ASC';
              // }
            }
            param.GroupBy.push(temp);

          });

          param.DisplayGroupSummary = true;
          param.DisplayGroupSummaryInHeader = true;
          param.DisplayGroupCount = true;
          param.SummaryProperty = {};
          param.Columns.forEach(item => {
            if (typeof item.Sum === 'number') {
              param.SummaryProperty[item.Key] = item.Sum;
            }
          });
        }
      }

      return param;
    },

    /**
     * event saveNew -> Show Popup Cất thành mẫu mới
     * created by ntphong 5/7/2021
     */
     saveNew() {
      const me = this;

      me.$nextTick(() => {
        let data = {
          reportId: me.reportId,
          reportListId: me.reportListId,
          reportGroupID: me.reportGroupID,
          layout: me.layout.Config,
          name: me.title,
          isSystem: me.layout.IsSystem,
          sortOrder: me.layout.SortOrder,
          isCustomLayout: me.layout.IsCustomLayout
        };
        let options = {
          /**
           * xử lý khi đóng form
           */
          close: function () {
            me.editing = false;
          },
          /**
           * xử lý khi submit form
           */
          submit: function (report) {
            const curRouter = me.$route;
            if (report.ReportListID != curRouter.params.id) {
              //change router to new report
              me.$router.push({
                name: curRouter.name,
                params: {
                  id: report.ReportListID,
                  ReportGroupID : report.ReportGroupID
                }
              });
            }

            me.reportListId = report.ReportListID;
            me.applyLayout(report);

            //Load lại dữ liệu theo mẫu mới - do có thay đổi về column, group data -> phải gọi reload
            // me.$nextTick(() => {
            //   me.reload();
            // });
          }
        };
        popupUtil.show(me, 'ReportSaveAsNewTemplate', data, options);
      });
    },

    /**
     * Xử lý show Form tham số khi ấn Chọn tham số
     * @author TVLOI 27.05.2021
     * */
    pickUpParameters() {
      var me = this;
      if (me.reportId) {
        const me = this;
        let owner = me,
          param = {},
          options = {},
          formName = me.reportId + 'Param';

        param = me.paramPrepareBeforeShow();
        popupUtil.show(owner, formName, param, options);
      }
    },


    /**
     * @author tvloi(13/05/2021)
     * Lấy subtitle của báo cáo lúc in/xuất khẩu.
    */
    getExportSubtitle() {
      let me = this, subTitle = [];
      const selector = '.report-sub-title',
        target = me.$el.querySelectorAll(selector);
      if (target.length > 0) {
        target.forEach(element => {
          subTitle.push(element.innerText);
        })
      }
      return subTitle;
    },
    /**
     * Click vào icon thiết lập
     */
    setting() {
      const me = this;

      me.$nextTick(() => {
        let data = {
          reportId: me.reportId,
          reportListId: me.reportListId,
          reportGroupID: me.reportGroupID,
          layout: me.layout.Config,
          name: me.title,
          isSystem: me.layout.IsSystem,
          sortOrder: me.layout.SortOrder,
          isCustomLayout: me.layout.IsCustomLayout
        };
        let options = {
          /**
           * xử lý khi đóng form
           */
          close: function () {
            me.editing = false;
          },
          /**
           * xử lý khi submit form
           */
          submit: function (report) {
            const curRouter = me.$route;
            if (report.ReportListID != curRouter.params.id) {
              //change router to new report
              me.$router.push({
                name: curRouter.name,
                params: {
                  id: report.ReportListID,
                  ReportGroupID: report.ReportGroupID                }
              });
            }

            me.reportListId = report.ReportListID;
            me.reportGroupID =report.ReportGroupID;
            me.applyLayout(report);

            //Load lại dữ liệu theo mẫu mới - do có thay đổi về column, group data -> phải gọi reload
            me.$nextTick(() => {
              if (me.condition) {
                me.reload();
              }
            });
          }
        };
        popupUtil.show(me, "ReportTemplate", data, options);
      });
    },
    /**
     * Khai báo sự kiện của form
     */
    initEvent() {
      const me = this,
        grid = me.grid,
        actionMulti = me.actionMultiComponent;
      if (grid) {
        grid.$on("loadData", me.loadData);
        // grid.$on("dblclick", me.gridRowDbClick);
        // grid.$on("rowmouseover", me.gridRowOver);
        // grid.$on("rowactionclick", me.gridRowActionClick);
        // grid.$on("input", me.selectionChange);
        grid.$on("changepagesize", me.gridChangePageSize);
        grid.$on("filter", me.reload);
      }
    },
    /**
     * remove event add động
     */
    removeEvent() {
      const me = this,
        grid = me.grid,
        actionMulti = me.actionMultiComponent;
      if (grid) {
        grid.$off("loadData", me.loadData);
        // grid.$off("dblclick", me.gridRowDbClick);
        // grid.$off("rowmouseover", me.gridRowClick);
        // grid.$off("rowactionclick", me.gridRowActionClick);
        // grid.$off("input", me.selectionChange);
        grid.$off("changepagesize", me.gridChangePageSize);
        grid.$off("filter", me.reload);
      }
    },

    /**
     * build các title trên báo cáo
     */
    buildTitleReport() {
      let me = this;

      // build kỳ báo cáo
      if (me.paramsPopup && me.paramsPopup.hasOwnProperty('period')) {
        me.period = me.paramsPopup.period;
      }
      if (me.period != MSEnum.Period.Custom) {
        // nếu kỳ báo cáo khác "tùy chọn" thì lấy thông tin trên enum để show
        me.buildReportTerm = this.$ms.commonFn.getEnumResource(me.period, 'Period')
      } else {
        let fullMonthText = "";
        if (me.condition.FromDate && me.condition.ToDate) {
          //fullMonthText = me.$ms.commonFn.checkFullMonth(me.condition.FromDate, me.condition.ToDate);
          if (fullMonthText) {
            me.buildReportTerm = fullMonthText;
          }
        }
        if (!fullMonthText) {
          //ngược lại thì build theo ngày mà người dùng tùy chọn
          if (me.condition.FromDate) {
            me.buildReportTerm = me.$options.filters.formatDate(me.condition.FromDate) + ' - ';
          } else {
            me.buildReportTerm = '... - ';
          }

          if (me.condition.ToDate) {
            me.buildReportTerm += me.$options.filters.formatDate(me.condition.ToDate);
          } else {
            me.buildReportTerm += '...';
          }
        }
      }

    },


    /**
     * Hàm lấy dữ liệu
     * Hàm này được gán cho nút Lấy dữ liệu trên form
     */
    getData() {
      let me = this;
      me.buildTitleReport();
      me.reload();
      me.isLoadedData = true;
    },



    /**
     * @override
     */
    customExportColumn(column, config) {
      const me = this;

      if (config.footerCommand) {
        column.Sum = me.$ms.enum.ExportSummaryType[config.footerCommand] || me.$ms.enum.ExportSummaryType.Sum;
      }
    },
  },
  beforeDestroy() {
    let me = this;
    me.removeEvent();

    //xóa interval load dữ liệu nếu có
    me.clearIntervalLoadData();
  }
};
