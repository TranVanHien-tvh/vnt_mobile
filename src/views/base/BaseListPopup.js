import BaseList from "@/views/base/BaseList";
import { permission } from "@/mixins/common/permission";
import { mapState, mapActions, mapGetters } from "vuex";
import {
  ModuleLayoutTemplate,
  ModuleContext,
  ModuleOrganization,
} from "@/stores/module-const";
// import exportApi from "@/apis/exportAPI";
import MSJson from "@/commons/json";
import { shortkeyStatusbar } from "@/mixins/common/shortkeyStatusbar";
import popupUtil from "@/commons/popupUtil";
import commonFn from "@/commons/commonFunction";

export default {
  extends: BaseList,
  name: "BaseListPopup",
  mixins: [permission, shortkeyStatusbar],
  data: function () {
    return {
      /**
       * Action của từng bản ghi khi active
       */
      rowActions: [],
      /**
       * Tên key mẫu
       */
      layoutTag: null,
      /**
       * Các action khi chọn nhiều
       */
      actionMulti: [],
      /**
       * refname control hiển thị action khi chọn nhiều bản ghi
       */
      actionMutilRef: "actionMulti",
      /**
       * refname control hiển thị action khi chọn nhiều bản ghi ( màn hình to hơn 1200)
       */
      actionMutilRefBigScreen: "actionMultiBigScreen",

      layout: {},

      title: "",
      /**
       * có show tất cả icon filter header grid lên k
       */
      showAllIconFilter: false,
      /**
       * Show filter box
       */
      isShowFilter: false,
      /**
       * Show more action box
       */
      isShowActionGroup: false,
    };
  },
  computed: {
    ...mapGetters(ModuleContext, ["Context"]),
    ...mapGetters({
      orgs: ModuleOrganization + "/tree",
    }),
    /**
     * Đối tượng state của store
     */
    storeState() {
      return this.$store.state[this.module];
    },
    /**
     * Không có dữ liệu trong bảng
     * Dùng cờ này để hiển thị mặc hình trống trên danh sách
     */
    empty() {
      return this.storeState.empty;
    },
    /**
     * Dữ liệu hiển thị
     */
    items() {
      return this.storeState.items;
    },

    /**
     * Tổng số
     */
    total() {
      return this.storeState.total;
    },
    /**
     * Summary của grid
     */
    summary() {
      return this.storeState.summary;
    },
    /**
     * loading
     */
    loading() {
      return this.storeState.loading;
    },
    /**
     * loading summary
     */
    loadingSummary() {
      return this.storeState.loadingSummary;
    },
    /**
     * Cột theo cấu hình của mẫu
     */
    layoutColumns() {
      return this.$store.state[ModuleLayoutTemplate].apply;
    },
    /**
     * Control hiển thị action khi chọn nhiều bản ghi
     */
    actionMultiComponent() {
      return this.$refs[this.actionMutilRef];
    },
    /**
     * Control hiển thị action khi chọn nhiều bản ghi (màn hình lớn)
     */
    actionMultiBigScreenComponent() {
      return this.$refs[this.actionMutilRefBigScreen];
    },
  },
  created() { },

  mounted: function () {
    const me = this;
    window._xx = this;

    //init layout
    me.initLayout();

    //init event
    me.initEvent();
  },
  methods: {
    ...mapActions({
      loadApplyLayout: ModuleLayoutTemplate + "/loadApply",
    }),

    /**
     * Lấy cấu hình cột theo mẫu áp dụng
     */
    async getLayoutTemplate() {
      const me = this;

      let cacheLayoutTemplate = await me.getCacheLayoutTemplate();

      if (cacheLayoutTemplate) {
        return cacheLayoutTemplate;
      }
      return this.layoutColumns[this.layoutTag];
    },

    /**
     * Xử lý cấu hình mẫu của form
     */
    async initLayout() {
      const me = this;

      if (me.layoutTag) {
        let layout = await me.getLayoutTemplate();

        if (!layout || process.env.NODE_ENV === "development") {
          layout = await me.loadApplyLayout(me.layoutTag);
        }
        me.layout = me.convertToLayoutTemplete(layout);

        let columns = me.getLayoutColumn(layout);

        me.grid.initColumns(columns);
      }

      //load dữ liệu lần đầu
      me.$nextTick(() => {
        me.reload();
      });
    },

    convertToLayoutTemplete(layout) {
      let layoutTemplete = {};
      if (layout) {
        layoutTemplete.LayoutTemplateID = layout.LayoutTemplateID;
        layoutTemplete.LayoutTag = layout.LayoutTag;
        layoutTemplete.UserID = layout.UserID || this.Context.UserID;
        layoutTemplete.IsSystem = layout.IsSystem;
        layoutTemplete.LayoutConfig = layout.Columns;
        layoutTemplete.LayoutTemplateName = layout.LayoutTemplateName;
      }
      return Object.assign({}, layoutTemplete);
    },

    /**
     * Lấy thông tin column render từ thông tin của mẫu
     */
    getLayoutColumn(layout) {
      if (layout != undefined) {
        const me = this;
        let columns = JSON.parse(layout.Columns);

        //nếu là mẫu mặc định và ngôn ngữ khác tiếng việt -> cập nhật caption/title theo ngôn ngữ
        if (layout.IsSystem) {
          me.localizationColumn(columns);
        }
        //nnlam: orderby lại theo sort_order và lock.
        columns = _(columns)
          .chain()
          .sortBy("sort_order")
          .sortBy(function (column) {
            return !column.lock;
          })
          .value();
        return columns;
      }
    },

    /**
     * Gọi request load dữ liệu
     * Gọi vào crud-base
     */
    requestLoadData(payload) {
      const me = this;

      if (me.grid && me.grid.isGridTree) {
        me.$store.dispatch(`${me.module}/loadListTree`, payload);
      } else {
        me.$store.dispatch(`${me.module}/load`, payload).then((res) => {
          /**
           * delay để đợi grid select dòng đầu
           * NMTUAN2 04.12.2021
           */
          if (me.isSearching) {
            me.isSearching = false;
            setTimeout(() => {
              if (me.searchBox && me.searchBox.$refs.input) {
                me.searchBox.$refs.input.focus();
              }
            }, 200);
          }
        });
      }
    },

    /**
     * Gọi request load summary
     */
    requestLoadDataSummary(payload) {
      const me = this;
      if (me.grid && !me.grid.isGridTree) {
        me.$store.dispatch(`${me.module}/loadSummary`, payload);
      }
    },

    /**
     * dbclick bản ghi trên grid
     */
    gridRowDbClick(record, e) {
      this.edit(record);
    },

    /**
     * sự kiện ấn vào các action trên form
     */
    buttonClick(command, e) { },

    /**
     * Thêm
     */
    add() {
      const me = this;
      if (
        !me.checkActionPermissionAlert(
          me.$t("i18nPermission.SubSystemCode.Code.ADD")
        )
      ) {
        return;
      }
      let param = me.getDetailParameter(
        me.formDetailName,
        this.$ms.enum.FormState.Add
      );
      me.showDetail(me.formDetailName, this.$ms.enum.FormState.Add, param);
    },

    /**
     * Sử dụng cho sự kiện dblick vào dòng trên grid để show form tương ứng
     * */
    edit(record, action = "EDIT") {
      const me = this;
      if (!me.checkActionPermissionAlert(action)) {
        return;
      }

      let param = me.getDetailParameter(
        me.formDetailName,
        this.$ms.enum.FormState.Edit,
        record
      );

      me.showDetail(me.formDetailName, this.$ms.enum.FormState.Edit, param, {
        submit: function (saveResult, saveParam) {
          if (saveResult.Success) {
            me.afterSaveEdit(record, saveResult, saveParam);
          }
        },
      });
    },

    /**
     * pvduy 27/02/2021: thêm dữ liệu cho mode view
     * */
    view(record, action = "WATCH") {
      const me = this;
      if (!me.checkActionPermissionAlert(action)) {
        return;
      }

      let param = me.getDetailParameter(
        me.formDetailName,
        this.$ms.enum.FormState.View,
        record
      );

      me.showDetail(me.formDetailName, this.$ms.enum.FormState.View, param, {
        submit: function (saveResult, saveParam) {
          if (saveResult.Success) {
            me.afterSaveView(record, saveResult, saveParam);
          }
        },
      });
    },
    /**
     * Nhân bản bản ghi
     * */
    duplicate(record) {
      const me = this;
      if (
        !me.checkActionPermissionAlert(
          me.$t("i18nPermission.SubSystemCode.Code.ADD")
        )
      ) {
        return;
      }

      let param = me.getDetailParameter(
        me.formDetailName,
        this.$ms.enum.FormState.Duplicate,
        record
      );

      me.showDetail(
        me.formDetailName,
        this.$ms.enum.FormState.Duplicate,
        param
      );
    },

    refreshClick() {
      this.refresh();
    },

    /**
     * drilldown khi click vào grid
     * */
    drilldownClick(metaData) {
      let me = this;
      if (metaData.dataRow) {
        me.edit(metaData.dataRow);
      } else {
        me.$toast.error(me.$t("i18nBaseForm.Message.Error"));
      }
    },

    /**
     * @author TVLOI 20.05.2021
     * drilldown vào chi tiết khi ấn vào các cột có dạng đại diện cho số nhiều(Nhiều dòng chi tiết)
     * */
    viewMoreDetails(metaData) {
      let me = this;
      if (metaData.dataRow) {
        me.view(metaData.dataRow);
      } else {
        me.$toast.error(me.$t("i18nBaseForm.Message.Error"));
      }
    },

    /**
     * Xóa
     */
    async delete(record, sub) {
      const me = this;

      if (
        !me.checkActionPermissionAlert(
          sub ?? me.$t("i18nPermission.SubSystemCode.Code.DELETE")
        )
      ) {
        return;
      }

      //TDNGHIA 27/10/2021: validate cho một vài case xử lý trên client ngay được
      if (!me.validateBeforeDelete(record, sub)) {
        return;
      }

      let configMessage = await me.getDeleteConfirmMessage(record);
      let answer = await me.$ms.msgBox.showQuestion(configMessage);
      if (answer == "Yes") {
        let temp = {};

        //Bỏ bớt các thông tin gửi lên sv.
        let dropedColumns = me.getIgnoredColumns();

        for (let i in record) {
          let isDropedColumn = dropedColumns.find((_) => _ == i);
          if (!isDropedColumn) {
            temp[i] = record[i];
          }
        }

        let auditingLog = {
          description: MSJson.serialize(
            me.generateDescriptionAuditingLog(record)
          ),
          reference: me.buildReference(record),
          action: me.actionAuditingLog,
          entity: me.getEntityType() || me.module,
          time: new Date(),
        };

        let param = {
          Entity: [temp],
          ByPassValidate: null,
          AuditingLog: MSJson.serialize(auditingLog),
          Type: me.$ms.enum.DeleteType.Single,
        };

        param = me.customDeleteParam(record, param);

        me.$ms.commonFn.mask();
        let result = await me.requestDeleteData(record, param);
        me.$ms.commonFn.unmask();
        me.afterDelete(record, result);

        //Log firebase
        // me.logDataFireBase();
      }
    },

    /**
     * Lấy thông tin log firebase
     * NTTHANH1
     */
    logDataFireBase() {
      const me = this;
      try {
        let menuNameCurrent = null;
        let parent = me.$parent;

        if (me.$router || me.$$router) {
          menuNameCurrent = me.$route ? me.$route.name : me.$$route.name;
        }
        else {
          if (parent && (parent.$router || parent.$$router)) {
            menuNameCurrent = parent.$router ? parent.$route.name : parent.$$route.name;
          }
        }
        if (menuNameCurrent) {
          commonFn.logDataFireBaseUpdate(menuNameCurrent, me.context);
        }
      }
      catch (ex) {
        console.log(ex);
      }
    },

    /**
     * Gọi request xóa
     * @returns
     */
    async requestDeleteData(record, param) {
      const me = this;
      return await me.$store.dispatch(`${this.module}/delete`, param);
    },

    /**
     * overrideable để check một vài case validate được ngay trên client
     * @returns
     * TDNGHIA 27/10/2021
     */
    validateBeforeDelete(records) {
      return true;
    },

    /**
     * @overridable Trả về những trường không muốn gửi lên serve để xóa
     * @author TVLoi 19.06.2021
     */
    getIgnoredColumns() {
      let me = this;
      //default 1 số cột mặc định không gửi lên.
      let columnsIgnored = [
        "parentNode",
        "isHide",
        "isSelected",
        "level",
        "__vKeyValue",
        "_isSelectedMultiple",
        "expanded",
      ];
      let customIgnoredColumns = me.getCustomIgnoredColumnsBeforeDelete();
      if (
        Array.isArray(customIgnoredColumns) &&
        customIgnoredColumns.length > 0
      ) {
        customIgnoredColumns.forEach((item) => {
          columnsIgnored.push(item);
        });
      }
      return columnsIgnored;
    },

    //CustomColumns ko gửi lên
    getCustomIgnoredColumnsBeforeDelete() {
      let me = this;
      return [];
    },

    /**
     * tham chiếu nhật ký (lưu dạng json : {key: key, code: code, name: name})
     * key: khóa chính của bảng module, dùng để drildown khi click vào
     * code, name: mã, tên để hiểu thị ở cột tham chiếu khi xem log: ví dụ: Quạt điện (QD00001)
     */
    buildReference(records) {
      let me = this;
      let field = this.$store.state[me.module]._config.field;
      if (field) {
        if (Array.isArray(records)) {
          let reference = [];
          records.forEach((record) => {
            reference.push({
              key: record[field.key],
              code: record[field.code],
              name: record[field.name],
            });
          });
          return MSJson.serialize(reference);
        } else {
          return MSJson.serialize({
            key: records[field.key],
            code: records[field.code],
            name: records[field.name],
          });
        }
      } else {
        return null;
      }
    },

    /**
     * Sinh mô tả của nhật ký
     * CreatedBy: nnlam 24/03/2021
     */
    generateDescriptionAuditingLog(records) {
      let me = this;
      let listDescription = { master: [] };
      let field = this.$store.state[me.module]._config.field;
      if (Array.isArray(records)) {
        records.forEach((record) => {
          let objDescription = {};
          objDescription[field.code] = record[field.code]; //{newValue:me.currentItem[field.code], switchCaption: me.switchCaption.master[field.code]};
          objDescription[field.name] = record[field.name]; //{newValue:me.currentItem[field.name], switchCaption: me.switchCaption.master[field.name]};
          if (field.quantity) {
            objDescription[field.quantity] = record[field.quantity]; //{newValue:me.currentItem[field.quantity] || 1, switchCaption: me.switchCaption.master[field.quantity]};
          }
          listDescription.master.push(objDescription);
        });
      } else {
        let objDescription = {};
        objDescription[field.code] = records[field.code]; //{newValue:me.currentItem[field.code], switchCaption: me.switchCaption.master[field.code]};
        objDescription[field.name] = records[field.name]; //{newValue:me.currentItem[field.name], switchCaption: me.switchCaption.master[field.name]};
        if (field.quantity) {
          objDescription[field.quantity] = records[field.quantity]; //{newValue:me.currentItem[field.quantity] || 1, switchCaption: me.switchCaption.master[field.quantity]};
        }
        listDescription.master.push(objDescription);
      }

      return listDescription;
    },

    /**
     * Lấy câu thông báo khi xóa
     */
    async getDeleteConfirmMessage(records) {
      const me = this;

      let moduleName = me.getModuleName() || "";
      let targetName = "";
      var mes = "";
      if (records.length > 1) {
        let deleteMultiMsg = me.getDeleteMultiMsg();
        mes = deleteMultiMsg.format(
          records.length > 9 ? records.length : "0" + records.length,
          moduleName
        );
      } else {
        let record = records;
        if (Array.isArray(records)) {
          record = records[0];
        }
        if (record) {
          targetName = me.getDeleteSingleMesContent(record);
        }
        let deleteMsg = me.getDeleteMsg(records);
        mes = deleteMsg.format(me.$ms.commonFn.encodeHTML(targetName));
      }

      return {
        title: me
          .$t("i18nBaseForm.Message.ConfirmDeleteTitle")
          .format(moduleName),
        message: mes,
      };
    },

    /**
     * Custom câu nội dung xóa nhiều
     * NTBAO: 25.11.2021
     * @returns
     */
    getDeleteMultiMsg() {
      const me = this;
      return me.$t("i18nBaseForm.Message.ConfirmDeleteMutiTitleCegov");
    },

    /**
     * Custom câu nội dung xóa đơn
     * NTBAO: 25.11.2021
     * @returns
     */
    getDeleteMsg(records) {
      const me = this;
      return me.$t("i18nBaseForm.Message.ConfirmDeleteShort");
    },

    /**
     * Lấy nội dung xóa
     */
    getDeleteSingleMesContent(record) {
      const me = this;
      return (
        record[me.$store.state[me.module]._config.field.name] ||
        record[me.$store.state[me.module]._config.field.code]
      );
    },
    /**
     * Lấy tên đối tượng của form
     */
    getModuleName() {
      const me = this;
      return me.$t("i18nCommon.module." + me.module.toLowerCase());
    },

    /**
     * Xử lý sau khi xóa
     */
    async afterDelete(record, result) {
      const me = this;
      if (result.Success) {
        // clone lại giá trị xóa dùng cho việc custom
        // NTBAO: 07.11.2021
        let deleteRecord = _.clone(record);
        me.$toast.success(me.$t("i18nBaseForm.Message.DeleteSuccess"));
        /**
         * nếu xoá bản ghi được tích thì đang không tự cập nhật ở selected
         * nên phải thực hiện xoá khỏi selected (chỉ tự động khi xoá trên dòng của gridEditor)
         * bật change vào các bản ghi còn được tích
         * NMTUAN2 28.11.2021
         */
        me.selected.remove(record);
        me.selectionChange(me.selected);
        /**
         * Hàm custom xử lý thêm
         * NTBAO 02.11.2021
         */
        me.customAfterDelete(deleteRecord, result);
      } else {
        /**
         * Sửa lỗi khi xóa nhiều bản ghi
         * ModifiyBy: NTAnh (09/03/2021)
         * ModifiyBy: NTTHANH1 (20/11/2021)
         */
        const CODE = me.$ms.enum.ServiceResponseCode;
        let moduleName = me.getModuleName(),
          // lấy cấu hình field theo từng đối tượng
          field = me.getFields() ?? this.$store.state[me.module]._config.field,
          listArisend = [], // Mảng tên các bản ghi phát sinh
          configMessage, // Câu thông báo cho popup
          answer, //Kết quả ấn btn popup thông báo
          isAriseMulti; //Biến đánh dấu nhiều bản ghi phát sinh
        // Nhiều bản đã có phát sinh
        if (result.Data && result.Data.length > 1) {
          isAriseMulti = true;
          if (field) {
            result.Data.forEach((element) => {
              // lấy unique hoặc name
              var name = field.unique || field.name;
              listArisend.push(element.Entity[name]);
            });
          }
        }
        // 1 bản ghi có phát sinh:
        else {
          isAriseMulti = false;
          var name = field.unique || field.name;
          var obj = result.Data[0];
          listArisend.push(obj.Entity[name]);
        }
        switch (result.Code) {
          case CODE.DeleteMultiArisened:
            if (field.isInactiveAndDelete) {
              //Chỉ thông báo ngừng sử dụng và xóa với các màn danh mục
              configMessage = me.getAriseConfirmMesage(
                moduleName,
                listArisend,
                CODE.DeleteMultiArisened
              );
              answer = await me.$ms.msgBox.showQuestion(configMessage);
              if (answer == "Yes") {
                let inactiveArise, //kết quả ngưng sử dụng
                  deleteNoArise; // kết quả xóa
                //Ngừng sử dụng bản ghi phát sinh
                let recordsInactive = []; //mảng bản ghi cần ngừng sử dụng
                result.Data.forEach((element) => {
                  recordsInactive.push(element.Entity);
                });
                inactiveArise = await me.setInactiveArise(recordsInactive);

                //Xóa bản ghi không phát sinh
                let recordsDelete = []; //mảng bản ghi cần xóa
                if (record.length > recordsInactive.length) {
                  //Nếu có bản ghi không phát sinh thì ms xóa
                  record.filter(function (itemRecord) {
                    let recordDuplicate = false;
                    recordsInactive.filter(function (itemRecordsInactive) {
                      if (
                        itemRecordsInactive[field.key] == itemRecord[field.key]
                      ) {
                        recordDuplicate = true;
                      }
                    });
                    if (!recordDuplicate) {
                      recordsDelete.push(itemRecord);
                    }
                  });
                  deleteNoArise = await me.deleteMutiRowsNoConfirm(
                    recordsDelete
                  );
                }

                //Show toast thông báo
                if (recordsDelete.length > 0) {
                  //Ngừng sử dụng và xóa
                  if (inactiveArise.Success && deleteNoArise.Success) {
                    me.$toast.success(me.$t("i18nBaseForm.SaveSuccessMessage"));
                  } else {
                    me.$toast.error(me.$t("i18nBaseForm.SaveErrorMessage"));
                  }
                } else {
                  //Chỉ ngừng sử dụng
                  if (inactiveArise.Success) {
                    me.$toast.success(me.$t("i18nBaseForm.SaveSuccessMessage"));
                  } else {
                    me.$toast.error(me.$t("i18nBaseForm.SaveErrorMessage"));
                  }
                }
              }
            } else {
              me.$ms.msgBox.showWarning(
                me.$t("i18nBaseForm.Validate.CanNotDeleteArise")
              );
            }
            break;
          // xóa 1 bản ghi và bản ghi đó bị có phát sinh
          case CODE.Arisened:
            if (field.isInactiveAndDelete) {
              //Chỉ thông báo ngừng sử dụng và xóa với các màn danh mục
              configMessage = me.getAriseConfirmMesage(
                moduleName,
                listArisend,
                CODE.Arisened
              );
              answer = await me.$ms.msgBox.showQuestion(configMessage);
              if (answer == "Yes") {
                //Ngừng sử dụng bản ghi phát sinh
                me.setActiveMutiRows(result.Data[0].Entity, "inactive");
              }
            } else {
              me.$ms.msgBox.showWarning(
                me.$t("i18nBaseForm.Validate.CanNotDeleteArise")
              );
            }
            break;
          case CODE.PartInvalidData:
            if (isAriseMulti) {
              me.$ms.msgBox.showWarning(
                me.$t("i18nBaseForm.Validate.ErrorDeleteMulti")
              );
              break;
            } else {
              //me.$toast.error(me.$t("i18nBaseForm.Validate.NewMessageDelete").format(moduleName, codes));
              me.$ms.msgBox.showWarning(
                me.$t("i18nBaseForm.Validate.ErrorDeleteMulti")
              );
              if (result.Data) {
                let keyField = me.$store.state[me.module]._config.field.key;
                record.forEach((i) => {
                  result.Data.forEach((item) => {
                    if (i[keyField] != item.Entity[keyField] && i[keyField]) {
                      me.grid.datax.remove(i);
                    }
                  });
                });
              }
              // record = [];
              //me.selectionChange(record);
              // me.selected = [];
              //me.reload();
              break;
            }
          default:
            if (isAriseMulti) {
              me.$ms.msgBox.showWarning(
                me.$t("i18nBaseForm.Validate.ErrorDeleteMulti")
              );
              break;
            }
        }
        record = [];
        me.selected = [];
        me.reload();
      }
    },

    /**
     * Câu thông báo khi có phát sinh dữ liệu
     * NTTHANH1
     */
    getAriseConfirmMesage(moduleName, listArisend, code) {
      const me = this;
      const CODE = me.$ms.enum.ServiceResponseCode;
      let titleName = me
        .$t("i18nBaseForm.Message.ConfirmDeleteTitle")
        .format(moduleName),
        mes,
        mesListArise;
      //Build câu thông báo
      mesListArise =
        listArisend.length > 2
          ? `<b>${listArisend[0]}</b>, <b>${listArisend[1]}</b> và <b>${listArisend.length - 2
          }</b> ${moduleName} khác`
          : `<b>${listArisend.join("</b>, <b>")}</b>`;

      mes = me.getAriseMessage(code, listArisend, mesListArise, moduleName);

      //Config các button
      let btnConfig = [
        {
          key: "No",
          target: "Right",
          text: "Hủy",
          typeButton: "secondary",
        },
        {
          key: "Yes",
          target: "Right",
          text: "Đồng ý",
          focus: true,
          typeButton: "blue",
        },
      ];

      return {
        title: titleName,
        message: mes,
        btnConfig: btnConfig,
      };
    },

    /**
     * Lấy câu thông báo khi phát sinh
     * Viết riêng ra để override lại vì một số màn có câu thông báo là Ngừng theo dõi thay vì Ngừng sử dụng
     * @param {*} code
     * NTDIEM 15.12.2021
     */
    getAriseMessage(code, listArisend, mesListArise, moduleName) {
      const me = this;
      let mes = "";
      const CODE = me.$ms.enum.ServiceResponseCode;
      switch (code) {
        case CODE.DeleteMultiArisened:
          mes = me
            .$t("i18nBaseForm.Validate.DeleteMultiHasMultiArisened")
            .format(moduleName, mesListArise);
          break;
        // xóa 1 bản ghi và bản ghi đó bị có phát sinh:
        case CODE.Arisened:
          mes = me
            .$t("i18nBaseForm.Validate.DeleteArise")
            .format(moduleName, listArisend[0]);
          break;
      }
      return mes;
    },

    /**
     * Ngừng sử dụng bản ghi phát sinh dữ liệu
     * NTTHANH1
     */
    async setInactiveArise(records) {
      const me = this;
      let inactive = 1;

      if (!Array.isArray(records)) {
        records = [records];
      }
      //show mask
      // me.loading = true;
      let field = me.$store.state[me.module]._config.field;
      let listID = records
        .map(function (item) {
          return item[field.key];
        })
        .join(",");

      let param = {
        TableName: field.table,
        KeyField: field.key,
        Value: inactive,
        ListID: listID,
        OrganizationID: me.getOrganizationFilter(),
      };

      return await me.$store.dispatch(`${this.module}/updateStatus`, param);
    },

    /**
     * Xóa nhiều bản ghi không cần poup thông báo
     * NTTHANH1
     */
    async deleteMutiRowsNoConfirm(records) {
      const me = this;
      let temps = [];

      records.forEach((record) => {
        let temp = {};

        //Bỏ bớt các thông tin gửi lên sv.
        let dropedColumns = me.getIgnoredColumns();

        for (let i in record) {
          let isDropedColumn = dropedColumns.find((_) => _ == i);
          if (!isDropedColumn) {
            temp[i] = record[i];
          }
        }

        temps.push(temp);
      });

      let auditingLog = {
        description: MSJson.serialize(
          me.generateDescriptionAuditingLog(records)
        ),
        reference: me.buildReference(records),
        action: me.actionAuditingLog,
        entity: me.module,
        time: new Date(),
      };

      let param = {
        Entity: temps,
        ByPassValidate: null,
        AuditingLog: MSJson.serialize(auditingLog),
        Type: me.$ms.enum.DeleteType.Multi,
      };
      return await me.$store.dispatch(`${this.module}/delete`, param);
    },

    /**
     * Hàm custom dùng cho xử lý thêm sau khi xóa
     * NTBAO 02.11.2021
     */
    customAfterDelete(deleteRecord, result) { },

    getFields() {
      return null;
    },

    /**
     * Lấy tham số khi mở form chi tiết
     * */
    getDetailParameter(formName, mode, defaultData) {
      const me = this;
      let param = {
        data: defaultData || null,
      };

      switch (mode) {
        case me.$ms.enum.FormState.Duplicate:
        case me.$ms.enum.FormState.Edit:
        case me.$ms.enum.FormState.View:
          let keyField = me.$store.state[me.module]._config.field.key;
          if (keyField) {
            param.id = defaultData[keyField];
          }
          break;
      }

      param.mode = mode;

      me.customDetailParam(param);

      return param;
    },

    customDetailParam(param) { },

    /**
     * hover bản ghi -> hiển thị menu
     */
    gridRowHover() { },

    /**
     * click bản ghi -> hiển thị menu
     */
    gridRowOver(record, e) {
      const me = this;

      me.rowActions = me.getRecordActions(record);
    },

    /**
     * lấy danh sách action của bản ghi
     */
    getRecordActions(record) {
      return [
        {
          command: "Edit",
          icon: "edit",
          text: this.$t("i18nCommon.command.edit"),
        },
        {
          command: "Delete",
          icon: "delete",
          text: this.$t("i18nCommon.command.delete"),
        },
      ];
    },

    /**
     * click action row
     */
    gridRowActionClick(command, record, event) {
      const me = this;
      switch (command) {
        case "Edit":
          me.edit(record);
          break;
        case "Delete":
          me.delete(record);
          break;
        case "Duplicate":
          me.duplicate(record);
          break;
        case "View":
          me.view(record);
          break;
        case "active":
        case "inactive":
          me.setActiveMutiRows(record, command);
          break;
        default:
          me.$ms.msgBox.showInfo(me.$t("i18nCommon.FeaturesIsDeveloping"));
          break;
      }
    },

    /**
     * Thay đổi bản ghi chọn
     */
    selectionChange(records) {
      const me = this;
      let actions = [];
      if (records.length >= 1) {
        actions = me.getActionMulti(records, me.selectAllPage);
      }
      me.actionMulti = actions;
    },

    /**
     * Lấy danh sách action xử lý khi nhiều bản ghi được chọn
     * TDNGHIA 10/10/2021
     * mặc định chỉ cần xóa nhiều thôi, màn nào thêm tính năng thì phải override lại
     */
    getActionMulti(records, selectAllPage) {
      return [
        {
          command: "active",
          text: "Theo dõi",
          cls: "secondary-outline",
        },
        {
          command: "inactive",
          text: "Ngừng theo dõi",
          cls: "primary-outline",
        },
        {
          command: "delete",
          text: "Xóa",
          cls: "secondary-outline-red",
        },
      ];
    },

    /**
     * Click vào action chọn nhiều bản ghi
     */
    multiSelectActionClick(command, records, selectAllPage, event) {
      const me = this;
      switch (command) {
        case "delete":
          me.deleteMutiRows(records);
          break;
        case "active":
        case "inactive":
          me.setActiveMutiRows(records, command);
          break;
      }
    },
    /*
     *  Hàm xóa nhiều bản ghi.
     * @modified by TVLoi 21.06.2021. lược bỏ 1 số thông tin trước khi gửi bản ghi lên serve
     */
    async deleteMutiRows(records) {
      const me = this;

      if (
        !me.checkActionPermissionAlert(
          me.$t("i18nPermission.SubSystemCode.Code.DELETE")
        )
      ) {
        return;
      }

      /**
       * Kiểm tra từng bản ghi trước khi xóa
       * NMTUAN3 28/10/2021
       * ntthanh 02/11/2021 Không duyệt qua for để lấy tất cả các obj đã chọn
       */
      if (!me.validateBeforeDelete(records)) {
        return;
      }

      // confirm('Có muốn xóa không?')
      let configMessage = await me.getDeleteConfirmMessage(records);
      let answer = await me.$ms.msgBox.showQuestion(configMessage);
      if (answer == "Yes") {
        let temps = [];

        records.forEach((record) => {
          let temp = {};

          //Bỏ bớt các thông tin gửi lên sv.
          let dropedColumns = me.getIgnoredColumns();

          for (let i in record) {
            let isDropedColumn = dropedColumns.find((_) => _ == i);
            if (!isDropedColumn) {
              temp[i] = record[i];
            }
          }

          temps.push(temp);
        });

        let auditingLog = {
          description: MSJson.serialize(
            me.generateDescriptionAuditingLog(records)
          ),
          reference: me.buildReference(records),
          action: me.actionAuditingLog,
          entity: me.module,
          time: new Date(),
        };

        let param = {
          Entity: temps,
          ByPassValidate: null,
          AuditingLog: MSJson.serialize(auditingLog),
          Type: me.$ms.enum.DeleteType.Multi,
        };

        // Custom lại param xóa
        param = me.customDeleteParam(records, param);

        me.$ms.commonFn.mask();
        let result = await me.requestDeleteData(records, param);
        me.$ms.commonFn.unmask();
        me.afterDelete(records, result);

        //log firebase
        // me.logDataFireBase()
      }
    },

    /**
     * Hàm custom delete param
     * NTBAO: 07.12.2021
     * @param {*} param
     * @returns
     */
    customDeleteParam(record, param) {
      const me = this;
      return param;
    },

    /**
     * Click vào action chọn nhiều bản ghi: Chọn tất cả
     */
    multiSelectAllClick() {
      this.selectAllPage = !this.selectAllPage;
      if (!this.selectAllPage) {
        this.selected = [];
        this.grid.checkall = false;
      } else {
        this.grid.checkall = true;
        this.grid.$emit("input", this.grid.datax);
      }
    },
    /**
     * Bỏ tích chọn các bản ghi
     */
    multiSelectUncheck() {
      const me = this;

      me.selected = [];
      // NMTUAN2 28.11.2021: bỏ tích chọn trên gridEditor
      if (Array.isArray(me.grid.listRowSelected)) {
        me.grid.listRowSelected = [];
      }
    },
    /**
     * Khai báo sự kiện của form
     */
    initEvent() {
      const me = this,
        grid = me.grid,
        actionMulti = me.actionMultiComponent,
        actionMultiBigScrenn = me.actionMultiBigScreenComponent;

      if (grid) {
        grid.$on("loadData", me.loadData);
        grid.$on("dblclick", me.gridRowDbClick);
        grid.$on("rowmouseover", me.gridRowOver);
        grid.$on("rowactionclick", me.gridRowActionClick);
        grid.$on("input", me.selectionChange);
        grid.$on("changepagesize", me.gridChangePageSize);
        if (!grid.isGridTree) {
          grid.$on("filter", me.reload);
        }
        grid.$on("resizeCol", me.gridResizeCol);
      }

      if (actionMulti) {
        actionMulti.$on("actionclick", me.multiSelectActionClick);
        actionMulti.$on("selectall", me.multiSelectAllClick);
        actionMulti.$on("uncheck", me.multiSelectUncheck);
      }

      if (actionMultiBigScrenn) {
        actionMultiBigScrenn.$on("actionclick", me.multiSelectActionClick);
        actionMultiBigScrenn.$on("selectall", me.multiSelectAllClick);
        actionMultiBigScrenn.$on("uncheck", me.multiSelectUncheck);
      }
    },
    /**
     * remove event add động
     */
    removeEvent() {
      const me = this,
        grid = me.grid,
        actionMulti = me.actionMultiComponent,
        actionMultiBigScrenn = me.actionMultiBigScreenComponent;

      if (grid) {
        grid.$off("loadData", me.loadData);
        grid.$off("dblclick", me.gridRowDbClick);
        grid.$off("rowmouseover", me.gridRowClick);
        grid.$off("rowactionclick", me.gridRowActionClick);
        grid.$off("input", me.selectionChange);
        grid.$off("changepagesize", me.gridChangePageSize);
        if (!grid.isGridTree) {
          grid.$off("filter", me.reload);
        }
        grid.$off("resizeCol", me.gridResizeCol);
      }

      if (actionMulti) {
        actionMulti.$off("actionclick", me.multiSelectActionClick);
        actionMulti.$off("selectall", me.multiSelectAllClick);
        actionMulti.$off("uncheck", me.multiSelectUncheck);
      }

      if (actionMultiBigScrenn) {
        actionMultiBigScrenn.$off("actionclick", me.multiSelectActionClick);
        actionMultiBigScrenn.$off("selectall", me.multiSelectAllClick);
        actionMultiBigScrenn.$off("uncheck", me.multiSelectUncheck);
      }
    },
    /**
     * Xuất khẩu excel
     */
    async exportExcel() {
      const me = this;
      if (
        !this.checkActionPermissionAlert(
          me.$t("i18nPermission.SubSystemCode.Code.EXPORT")
        )
      ) {
        return;
      }

      let param = await this.getExportExcelParam();

      await this.customParamBeforeExport(param);

      //   exportApi.export(param);
    },

    /**
     * Lấy tham số xuất khẩu
     */
    async getExportExcelParam() {
      let param = this.getGridExportParameter(this.grid);
      param.FileType = "xlsx";

      let controller = await this.$store.dispatch(
        `${this.module}/getController`
      );
      param.GetDataUrl = [controller, "list"].join("/");
      param.GetDataMethod = "POST";
      param.ReportTitle = this.getTitleExport();
      param.FileName = this.getFileName();
      return param;
    },

    /**
     * lấy tiêu đề file excel
     * @returns tiêu đề danh sách
     */
    getTitleExport() {
      let title = "";
      let el = this.$el.querySelector(".list-title");
      if (el && typeof el.innerHTML === "string") {
        title = el.innerHTML.trim();
      } else {
        title = this.title ? this.title.trim() : "";
      }
      return title;
    },

    /**
     * Lấy tên file khi xuất khẩu
     * @returns tên file : nếu để trống thì mặc định lấy tiêu đề
     */
    getFileName() {
      return null;
    },

    /**
     * Hàm mở popup sửa mẫu
     */
    openPrototype() {
      this.showDetail("MsConfigListLayout", this.$ms.enum.FormState.Add, {
        layout: this.layout,
        parent: this,
      });
    },

    /**
     * @author vvkiet - 18.03.2021
     * Hàm custom lại param trước khi xuất excel
     */
    async customParamBeforeExport(param) { },

    /**
     * @author vvkiet - 14.04.2021
     * Hàm xử lý extData
     */
    decodeExtData(data) {
      const me = this;

      // Xử lý dữ liệu mở rộng
      let originFields = [];
      if (data.hasOwnProperty("ExtData")) {
        // Danh sách các trường dữ liệu gốc của dữ liệu
        for (let i in data) {
          originFields.push(i);
        }

        // Map dữ liệu mở rộng
        if (data.ExtData && typeof data.ExtData === "string") {
          let extData = JSON.parse(data.ExtData);
          if (extData) {
            me.$ms.commonFn.processServerResponseData(extData);
            for (let m in extData) {
              // Chỉ map các trường không có trong dữ liệu gốc
              if (data && data[m]) {
                data[m] = extData[m];
              }
            }
          }
        }
      }
    },

    /**
     * Xử lý dữ liệu sau khi sửa
     * @param {*} record bản ghi gốc
     * @param {*} saveResult bản ghi trên server trả về
     * @override
     */
    afterSaveEdit(record, saveResult) { },
    /**
     * Xử lý dữ liệu sau khi sửa tại mode view
     * @param {*} record bản ghi gốc
     * @param {*} saveResult bản ghi trên server trả về
     * @override
     */
    afterSaveView(record, saveResult) { },
    /**
     * Hàm show All iconfilter
     * @param {*} record bản ghi gốc
     * @param {*} saveResult bản ghi trên server trả về
     * @override
     */
    funShowAllIconFilter() {
      //this.$nextTick(()=>{
      this.showAllIconFilter = !this.showAllIconFilter;
      this.$refs[this.viewRef].funShowAllIconFilter(this.showAllIconFilter);
      //})
    },

    /**
     * custom điều kiện lọc/search màn hình grid tree
     * @param {*} record bản ghi check
     * @param properties danh sách field cần check đk
     * @param searchText đoạn text nhập ở ô tìm kiếm
     * Mặc định trả về true
     */
    checkFilterGridTreeCustom(record, properties, searchText) {
      return true;
    },
    /**
     * Hàm show các popup theo tên lấy đường dẫn từ hàm getPopupomponent
     * @param name tên của component
     * Created by LTDAT(17.06.2020)
     */
    showDetail(name, mode, data, option) {
      const me = this;
      popupUtil.show(me, name, data, me.getPopupOption(name, option));
    },
    /**
     * Author: ĐVThi
     * Create date: 11/03/2021
     * Cho phép detail gọi tới submitDetailCallback của danh sách sau khi cất xong
     */
    getPopupOption(name, option) {
      const me = this;
      return {
        submit: me.submitDetailCallback,
        single: true,
      };
    },

    /**
     * Author: ĐVThi
     * Create date: 11/03/2021
     * Cho phép detail gọi tới submitDetailCallback của danh sách sau khi cất xong
     */
    submitDetailCallback(result, param, action) {
      const me = this;
    },

    /**
     * @override
     */
    getConditionParameter() {
      const me = this;
      let result = me.super("getConditionParameter");

      return result;
    },

    /**
     * Hàm thực hiện custom entity đối với nghiệp vụ đặc thù
     * @author vvkiet - 27.07.2021
     */
    getEntityType() {
      return null;
    },

    /**
     * show filter popup
     */
    showActionBox() {
      if (this.isShowActionGroup == true) {
        this.isShowActionGroup = false;
      } else {
        this.isShowActionGroup = true;
      }
    },

    /**
     * hide filter popup
     */
    hiddenActionBox(event) {
      this.isShowActionGroup = false;
    },

    /**
     * Cập nhật trạng thái các bản ghi được chọn
     * TDNGHIA 12/11/2021
     * @param {*} records
     * @param {*} command
     */
    async setActiveMutiRows(records, command) {
      const me = this;
      let inactive = command == "active" ? 0 : 1;

      if (!Array.isArray(records)) {
        records = [records];
      }
      //show mask
      // me.loading = true;
      let field = me.$store.state[me.module]._config.field;
      let listID = records
        .map(function (item) {
          return item[field.key];
        })
        .join(",");

      let param = {
        TableName: field.table,
        KeyField: field.key,
        Value: inactive,
        ListID: listID,
        OrganizationID: me.getOrganizationFilter(),
      };

      let result = await me.$store.dispatch(
        `${this.module}/updateStatus`,
        param
      );
      me.afterUpdateStatus(records, result);
    },

    /**
     * cập nhật sau khi update status
     * @param {*} record
     * @param {*} result
     */
    afterUpdateStatus(record, result) {
      const me = this;

      if (result && result.Success) {
        me.$toast.success(me.$t("i18nBaseForm.SaveSuccessMessage"));
        me.selected = [];
        me.reload();

        me.customAfterUpdate(record)
      } else {
        me.$toast.error(me.$t("i18nBaseForm.Message.Error"));
      }
    },

    /**
     * Lấy organizationID để update status,...
     * TDNGHIA 16/11/2021
     * @returns
     */
    getOrganizationFilter() {
      return null;
    },

    /**
     * Hàm custom xử lý sau khi cập nhật trạng thái
     * NMTUAN3 15/3/2022
     * @param {*} record bản ghi cập nhật trạng thái
     */
    customAfterUpdate(record) { },
  },
  beforeDestroy() {
    this.removeEvent();
  },
};
