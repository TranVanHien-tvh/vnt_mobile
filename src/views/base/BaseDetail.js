import { permission } from "@/mixins/common/permission";
import { mixinSuper } from "@/mixins/common/mixinSuper";
import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
import msValidate from "@/components/msValidate/msValidate.vue";
import commonFn from "@/commons/commonFunction";
import MSJson from "@/commons/json";
import { comboboxColumns } from "@/mixins/common/comboboxColumns";
import { filter } from "@/mixins/common/filter";
import { shortkeyStatusbar } from "@/mixins/common/shortkeyStatusbar";
import moment from "moment";
import Firebase from "@/firebase/firebase";

export default {
  name: "BaseDetail",
  mixins: [filter, mixinSuper, permission, comboboxColumns, shortkeyStatusbar],
  components: {
    msValidate,
  },
  data() {
    window._xx = this;
    return {
      //module chính của form
      module: null,
      //mở form ở mode nào: thêm, sửa, nhân bản
      editMode: this.$ms.enum.FormState.Add,
      //tiêu đề của form
      title: null,
      //dữ liệu binding
      currentItem: {},
      /**
       * TODO xem xét có dùng món này không
       */
      storeDetail: null,
      /**
       * Danh sách các trường dữ liệu gốc của dữ liệu
       */
      originFields: [],
      /**
       * biến có cho mặc định focus ko
       */
      isAutoFocus: true,
      /**
       * Đang xử lý với server
       */
      loading: false,
      /**
       * dữ liệu cũ
       */
      oldDataItem: {},
      /**
       * mô tả nhật ký
       */
      descriptionAuditingLog: {
        master: {},
        detail: [],
      },
      /**
       * hành động thao tác của nhật ký
       */
      actionAuditingLog: null,
      /**
       * danh sách các field có nhiều caption (title) và thay đổi theo điều kiện nào đó
       * ví dụ: accountObjectCode: mã nhà cung cấp (-nếu là nhà cc), mã khách hàng (-nếu là khách hàng)....
       * tuy nhiên thì tại 1 thời điểm các field này chỉ có 1 title duy nhất và cần lưu title của nó vào list này để sau có thể show mô tả chính xác
       * Demo: {master:{accountObjectCode: 1}}; khi gen log sẽ maping là : i18nAuditinglog.asset.master.accountObjectCode_1 hoặc i18nAuditinglog.asset.detail.accountObjectCode_1
       */
      switchCaption: {
        master: {},
        detail: {},
      },

      entityState: null,

      /**
       * Giữ tạm thời các file dc thông qua khi upload
       */
      fileTemps: [],
      /**
       * Có dùng shortkey không
       */
      hasShortKey: true,

      /**
       * Param
       */
      param: null,
    };
  },
  created() { },
  mounted() {
    const me = this;

    me.addHandler();

    //init cha của form sẽ ăn phím tắt
    if (me.hasShortKey) {
      this.$ms.commonFn.shortkeyPushView(this.$el);
    }
  },
  computed: {
    context() {
      return this.$store.state[ModuleContext]
    },
  },
  methods: {
    /**
     * Xử lý thêm mới
     * @param data
     */
    async add(param) {
      const me = this;
      //Gán form mode
      me.setFormMode(me.$ms.enum.FormState.Add);
      me.entityState = me.$ms.enum.ModelState.Insert;
      //lấy dữ liệu
      var data = await me.loadData("New", param);

      //Cập nhật dữ liệu vào currentItem
      me.bindData(data);
      //reset validate
      me.$nextTick(() => {
        if (me.isAutoFocus) {
          //focus first control
          setTimeout(function () {
            me.$ms.commonFn.focusFirstControlInput(me.$el);
          }, 200);
        }

        me.resetValidate();

        //Cập nhật OldData để track change
        me.setOldDataItem();
      });
    },

    /**
     * Gán state cho form
     */
    setFormMode(mode) {
      this.editMode = mode;

      //cập nhật tiêu đề cho form
      this.title = this.getFormTitle(mode);
    },

    /**
     * Lấy tiêu đề form
     */
    getFormTitle(mode) {
      const me = this;
      let title = [];

      title.push(me.$ms.commonFn.getEnumResource(mode, "FormState"));
      title.push((me.getModuleName() || "").toLowerCase());

      return title.join(" ");
    },

    /**
     * Lấy tên đối tượng của form
     * NMTUAN3 2/11/2021
     */
    getModuleName() {
      const me = this;
      return me.$t("i18nCommon.module." + (me.module || "").toLowerCase());
    },

    /**
     * Bind dữ liệu cho form
     */
    bindData(data) {
      const me = this;

      //details
      if (me.storeDetail) {
        // Lấy state cho các Row trên grid
        // BVHAU 19.05.2020: Ở mode Thêm thì mặc định dữ liệu đang khởi tạo chỉ là dòng tạm(isTemp)
        let objectState = { append: false, isTemp: true };

        for (let key in me.storeDetail) {
          let store = me.storeDetail[key],
            detailData = data[key];

          delete data[key];

          if (
            detailData &&
            Array.isArray(detailData) &&
            detailData.length > 0
          ) {
            store.loadData(detailData, objectState.append, objectState.isTemp);
          } else {
            store.owner.addNew({}, objectState.isTemp);
          }
        }
      }

      //master
      me.currentItem = data;
      me.beforeBindData();
    },
    async beforeBindData() { },
    /**
     * Xử lý sửa
     * @param data
     */
    async edit(param) {
      const me = this;

      me.entityState = me.$ms.enum.ModelState.Update;

      //nếu sửa có truyền dữ liệu -> binding dữ liệu truyền lên trước trong khi đang chờ load dữ liệu từ server
      if (typeof param.data === "object") {
        me.currentItem = { ...param.data };
      }

      //Gán form mode
      me.setFormMode(me.$ms.enum.FormState.Edit);

      //lấy dữ liệu
      let data = await me.loadData("Edit", param);

      //Cập nhật dữ liệu vào currentItem
      me.bindData(data);

      //reset validate
      me.$nextTick(() => {
        if (me.isAutoFocus) {
          //focus first control
          setTimeout(function () {
            me.$ms.commonFn.focusFirstControlInput(me.$el);
          }, 200);
        }
        me.resetValidate();

        //Cập nhật OldData để track change
        me.setOldDataItem();
      });
    },
    /**
     * Xử lý view
     * pvduy 27/02/2021
     * @param data
     */
    async view(param) {
      const me = this;

      //nếu sửa có truyền dữ liệu -> binding dữ liệu truyền lên trước trong khi đang chờ load dữ liệu từ server
      if (typeof param.data === "object") {
        me.currentItem = { ...param.data };
      }

      //lấy dữ liệu
      let data = await me.loadData("Edit", param);

      //Cập nhật dữ liệu vào currentItem
      me.bindData(data);

      //Gán form mode
      me.setFormMode(me.$ms.enum.FormState.View);
      //reset validate
      me.$nextTick(() => {
        if (me.isAutoFocus) {
          //focus first control
          setTimeout(function () {
            me.$ms.commonFn.focusFirstControlInput(me.$el);
          }, 200);
        }
        me.resetValidate();

        //Cập nhật OldData để track change
        me.setOldDataItem();
      });
    },

    /**
     * Nhân bản
     * @param data
     */
    async duplicate(param) {
      const me = this;

      //nếu sửa có truyền dữ liệu -> binding dữ liệu truyền lên trước trong khi đang chờ load dữ liệu từ server
      if (typeof param.data === "object") {
        me.currentItem = { ...param.data };
      }

      //Gán form mode
      me.setFormMode(me.$ms.enum.FormState.Duplicate);

      //lấy dữ liệu
      var data = await me.loadData("Duplicate", param);

      //Cập nhật dữ liệu vào currentItem
      me.bindData(data);

      //reset validate
      me.$nextTick(() => {
        if (me.isAutoFocus) {
          //focus first control
          setTimeout(function () {
            me.$ms.commonFn.focusFirstControlInput(me.$el);
          }, 200);
        }
        me.resetValidate();

        //Cập nhật OldData để track change
        me.setOldDataItem();
      });
    },

    /**
     * Gọi api load dữ liệu
     */
    async loadData(action, param) {
      const me = this;
      let result = null;

      me.loading = true;
      try {
        //xử lý dữ liệu truyền lên để không truyền gọi lên server
        let defaultData = param.data || {};
        let paramRequest = Object.assign({}, param);
        delete paramRequest.data;

        if (!me.isLocalLoad) {
          let loadParam = me.getLoadDataParameter(action, paramRequest);

          result = await me.$store.dispatch(`${me.module}/get`, loadParam);
        }

        if (!result) {
          result = { ...defaultData };
        }

        //xử lý trước khi render
        me.processLoadData(result, action, param);
      } catch (err) {
        console.error(err);
      } finally {
        me.loading = false;
      }

      return result;
    },

    async getAutoID() {
      let result = "",
        me = this;
      try {
        result = await me.$store.dispatch(`${me.module}/getAutoID`);
      } catch (err) {
        console.error(err);
      }
      return result;
    },

    /**
     * Xử lý dữ liệu client sau khi load từ server về trước khi binding
     */
    processLoadData(data, action, param) {
      const me = this;

      //xử lý dữ liệu mở rộng
      me.originFields = [];
      if (data.hasOwnProperty("ExtData")) {
        //Danh sách các trường dữ liệu gốc của dữ liệu
        for (let i in data) {
          me.originFields.push(i);
        }

        //map dữ liệu mở rộng
        if (data.ExtData && typeof data.ExtData === "string") {
          let extData = JSON.parse(data.ExtData);
          if (extData) {
            me.$ms.commonFn.processServerResponseData(extData);
            for (let m in extData) {
              //chỉ map các trường không có trong dữ liệu gốc
              if (me.originFields.indexOf(m) === -1) {
                data[m] = extData[m];
              }
            }
          }
        }
      }

      //xử lý mặc định quickAddText vào trường text
      if (param && param.quickAddText) {
        let fcf = me.$store.state[me.module]._config.field;
        if (fcf.name && !data[fcf.name]) {
          data[fcf.name] = param.quickAddText;
        }
      }

      // NDHUY 13.09.2021 Cập nhật entity state cho entity
      data.EntityState = me.entityState;
    },

    /**
     * Lấy tham số load dữ liệu cho form
     */
    getLoadDataParameter(action, param) {
      let result = {
        action: action,
      };

      switch (action) {
        case "Edit":
        case "View":
        case "Duplicate":
          result.id = param.id;
          break;
      }

      return result;
    },

    /**
     * Hàm lấy giá trị của currentItem
     *  */
    getCurrentItem() {
      return this.currentItem;
    },
    /**
     * Hàm lấy giá trị cũ của form
     * Created by LTDAT(22.06.22020)
     */
    getOldDataItem() {
      return this.oldDataItem;
    },
    /**
     * Hàm thực hiện set giá trị cho oldData mặc định là giá trị ban đầu khi mở form
     * Hàm này được gọi trong hàm mở form showPopup()
     */
    setOldDataItem(currentItem = this.currentItem) {
      const me = this;
      me.oldDataItem = _.cloneDeep(currentItem);
    },
    /*
     * Hàm reset lại giá trị
     * pvduy 02/07/2021: phục vụ mục đích khi tích chức năng x trên control mscontrol field
     */
    resetData() {
      const me = this;
      for (let field in me.currentItem) {
        if (me.currentItem.hasOwnProperty(field)) {
          me.currentItem[field] = me.oldDataItem[field];
        }
      }
      let data = me.currentItem;
      if (data.hasOwnProperty("ExtData")) {
        //Danh sách các trường dữ liệu gốc của dữ liệu
        for (let i in data) {
          me.originFields.push(i);
        }
        //map dữ liệu mở rộng
        if (data.ExtData && typeof data.ExtData === "string") {
          let extData = JSON.parse(data.ExtData);
          if (extData) {
            me.$ms.commonFn.processServerResponseData(extData);
            for (let m in extData) {
              //chỉ map các trường không có trong dữ liệu gốc
              if (me.originFields.indexOf(m) === -1) {
                data[m] = extData[m];
              }
            }
          }
        }
      }
    },

    /**
     * Hàm xử lý các sự kiện của form
     * @command : giá trị tương ứng với từng action như :Save,Close,SaveAndAdd,...
     */
    toolbarAction(command) {
      const me = this;
      switch (command) {
        case "Save":
          me.save(this.$ms.enum.SaveMode.Save);
          break;
        case "SaveAndAdd":
          me.save(this.$ms.enum.SaveMode.SaveNew);
          break;
        case "Close": {
          me.close();
        }
      }
      //me.logDataFireBase();
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
        
        if(me.$router || me.$$router) {
          menuNameCurrent = me.$route?me.$route.name:me.$$route.name;
        }
        else {
          if(parent && (parent.$router || parent.$$router)) {
            menuNameCurrent = parent.$router?parent.$route.name:parent.$$route.name;
          }
        }
        if(menuNameCurrent) {
          commonFn.logDataFireBaseUpdate(menuNameCurrent, me.context);
        }
      }
      catch(ex) {
        console.log(ex);
      }
    },

    /**
     * Xử lý phím tắt
     */
    // shortkeyAction(e) {
    //   let me = this;
    // 	switch (e.srcKey) {
    // 		case 'Save':
    // 			me.save(this.$ms.enum.SaveMode.Save);
    //       break;
    //     case 'SaveAndAdd':
    //       me.save(this.$ms.enum.SaveMode.SaveNew);
    //       break;
    //     case 'Print':
    //       me.print();
    //       break;
    //     default:
    //       break;
    // 	}
    // },

    //in
    print() { },
    /**
     * set dữ liệu cho currentItem
     * Created by LTDAT(25.06.2020)
     */
    setCurrentItem(data) {
      const me = this;
      me.currentItem = data;
    },
    /**
     * Hàm validate
     * Chạy qua hàm validate cho control và validate cho nghiệp vụ
     * @return trả về true/false
     * Created by LTDAT (22.06.2020)
     */
    validate() {
      const me = this;
      return me.validateComponents();
    },
    /**
     * validate File
     */
    validateFile(files) {
      let me = this,
        valid = true;
      me.fileTemps = [];
      files.forEach((file) => {
        var data = file.name.split(".");
        //Nếu không có extension -> fail
        if (data.length < 2) {
          valid = false;
          me.$ms.msgBox.showError(
            me.$t("i18nComponent.Attachment.FileNameInvalid")
          );
          return;
        }

        var ext = data.last().toLowerCase();
        if (
          window._fileConfig &&
          !window._fileConfig.UploadAllowExtension.contains(ext)
        ) {
          valid = false;
          me.$ms.msgBox.showError(
            me.$t("i18nComponent.Attachment.FileExtensionInvalid")
          );
          return;
        }

        if (
          window._fileConfig &&
          file.size > window._fileConfig.UploadMaxSizeMB * 1024 * 1024
        ) {
          valid = false;
          me.$ms.msgBox.showError(
            me.$t("i18nComponent.Attachment.FileLarger5MB")
          );
          return;
        }
        if (valid) {
          me.fileTemps.push(file);
        }
      });
      return valid;
    },
    /**
     * Hàm validate các control input
     * Hàm này sử dụng component ms-validate
     * để bao ngoài vùng được validate
     * @Chú ý:ref của ms-validate phải là validateObserver
     * Created by LTDAT(18.06.2020)
     */
    validateComponents() {
      const me = this;
      //refs của ms-validate
      if (me.$refs.validateObserver) {
        return me.$refs.validateObserver.validate();
      }
      return true;
    },
    /**
     * Hàm dùng để focus vào ô lỗi đầu tiên
     * Created by LTDAT(22.06.2020)
     * Modify by ĐVThi 18/03/2021: Không tìm được control lỗi thì không bắn lỗi TA
     * */
    focusFirstError() {
      const me = this;
      if (me.$refs.validateObserver) {
        let listError = me.$refs.validateObserver.getListError();
        if (listError && listError.length > 0 && listError[0].element) {
          if (typeof listError[0].element.focusEditor == "function") {
            listError[0].element.cellSelected();
          } else if (typeof listError[0].element.focus == "function") {
            listError[0].element.focus();
          }
        }
      }
    },
    /**
     * Cập nhật lại trạng thái validate về ban đầu
     * Created by LTDAT(23.06.2020)
     */
    resetValidate() {
      const me = this;
      if (me.$refs.validateObserver) {
        me.$refs.validateObserver.reset();
      }
    },

    //Hàm xử lý sự kiện lưu form
    //Created by LTDAT(18.06.2020)
    //PVDUY 27/02/2021 : lấy dữ liệu thêm cho mode view
    async save(mode) {
      const me = this;
      me.loading = true;
      // vvkiet - 12.04.2021: Thực hiện các công việc trước khi save
      await me.beforeSave();
      setTimeout(function () {
        try {
          if (me.validate()) {
            let saveMode =
              typeof mode === "number" ? mode : me.$ms.enum.SaveMode.Save;
            //Nếu edit là update, nếu add hoặc duplicate là insert
            let action =
              me.editMode === me.$ms.enum.FormState.Edit ||
                me.editMode === me.$ms.enum.FormState.View
                ? "update"
                : "insert",
              entity = me.getSaveData(
                saveMode,
                me.entityState || me.$ms.enum.ModelState.Insert
              );

            let saveParam = {
              Mode: saveMode,
              Entity: entity,
              ByPassValidate: [],
            };

            //validate and submit
            me.submitAction(saveParam, action);
          } else {
            me.focusFirstError();
            me.loading = false;
          }
        } catch (err) {
          console.error(err);
          me.loading = false;
          // } finally{
          //  TODO bnduc: bỏ chỗ này đi vì nếu exception thì đã gọi tắt còn success thì trong hàm submitAction sẽ tắt cờ loading
          //   me.loading = false;
        }
      }, window._appConfig.saveTimeout);
    },

    /**
     * Gọi validate client và submit dữ liệu lên server
     * tách ra phục vụ gọi lại cho luồng hỏi người dùng khi nhấn save
     */
    submitAction(saveParam, action) {
      const me = this;
      let validateResult = me.validateBusiness(saveParam, action);
      if (validateResult) {
        if (me.checkEditParam()) {
          // Gọi đến update trường của bảng UsageHistory
          me.submitEditForm(saveParam, action);
        } else {
          //submit server
          me.submit(saveParam, action);
        }

        //Log firebase
        // me.logDataFireBase();
      } else {
        me.loading = false;
      }
    },
    /**
     * Cất k validate
     * NNLAM
     */
    saveNotValidate(mode) {
      let me = this;
      let saveMode =
        typeof mode === "number" ? mode : me.$ms.enum.SaveMode.Save;
      //Nếu edit là update, nếu add hoặc duplicate là insert
      let action =
        me.editMode === me.$ms.enum.FormState.Edit ||
          me.editMode === me.$ms.enum.FormState.View
          ? "update"
          : "insert",
        entity = me.getSaveData(
          saveMode,
          me.entityState || me.$ms.enum.ModelState.Insert
        );

      let saveParam = {
        Mode: saveMode,
        Entity: entity,
        ByPassValidate: [],
      };

      if (me.checkEditParam()) {
        // Gọi đến update trường của bảng UsageHistory
        me.submitEditForm(saveParam, action);
      } else {
        me.submit(saveParam, action);
      }
      me.hide();
    },

    /**
     * @override
     */
    checkEditParam() {
      let me = this;
      return me.isUpdateNote;
    },

    /**
     * Xử lý khi cất lỗi
     * */
    processSubmitError(saveResult, param, action) {
      const me = this;
      switch (saveResult.Code) {
        case me.$ms.enum.ServiceResponseCode.InvalidData:
          let errors = saveResult.Data,
            alert = false,
            unconfirm = false,
            showError = function (index) {
              if (index === errors.length) {
                if (!alert && !unconfirm) {
                  //nếu người dùng xác nhận toàn bộ confirm thì sẽ submit lại
                  me.submit(param, action);
                }

                return;
              }
              let er = errors[index];
              if (!er.Message && er.Code) {
                er.Message = me.getValidateMessage(er.Code, er.Data);
              }

              switch (er.Type) {
                case me.$ms.enum.ValidateResultType.Info:
                  me.$ms.msgBox.showInfo(er.Message).then(() => {
                    showError(index + 1);
                  });
                  break;
                case me.$ms.enum.ValidateResultType.Warning:
                  me.$ms.msgBox
                    .showQuestion({
                      message: er.Message,
                    })
                    .then((answer) => {
                      if (answer === "Yes") {
                        param.ByPassValidate = param.ByPassValidate || [];
                        param.ByPassValidate.push(er.Code);

                        // vvkiet - 24.08.2021: Bổ sung hàm để custom lại param
                        me.customParamByPassValidate(param, er.Data).then(
                          () => {
                            showError(index + 1);
                          }
                        );
                      } else {
                        unconfirm = false;
                      }
                    });
                  break;
                default:
                  alert = true;
                  me.$ms.msgBox.showError(er.Message).then(() => {
                    showError(index + 1);
                  });
                  break;
              }
            };
          //Sắp xếp để confirm cuối cùng
          //ĐVThi 09/03/2021
          //sửa lỗi TA không sắp xếp được do truyền sai kiểu của tham số cho hàm sắp xếp
          // errors = errors.sortObject(["Type"]);
          //Hiển thị thông báo
          showError(0);
          break;
        case me.$ms.enum.ServiceResponseCode.Exception:
          if (saveResult.SystemMessage) {
            me.$ms.msgBox.showError(saveResult.SystemMessage);
          }
          break;
        //ĐVThi 19/03/2021: Thông báo lỗi vượt quá số lượng tồn
        case me.$ms.enum.ServiceResponseCode.OverQuantity:
          let strErrorOverQuantity = me.getValidateMessage(
            saveResult.SystemMessage
          );
          me.$ms.msgBox.showError(strErrorOverQuantity);

          me.processMarkControlForOverQuantityError(saveResult.SubCode);
          break;
        default:
          if (saveResult.Message) {
            me.$ms.msgBox.showError(saveResult.Message);
          } else {
            me.showCustomError(saveResult);
          }
          break;
      }
    },
    /**
     * ĐVThi 19/03/2021
     * Sau khi vượt qua số lượng tồn thì cho phép dev tùy biến focus vào các cột sộ lượng bị lỗi
     */
    processMarkControlForOverQuantityError(errorDetail) { },

    /**
     * Lấy nội dung thông báo theo mã validate
     * NMTUAN3 28/10/2021
     */
    getValidateMessage(validateCode, data) {
      const me = this;
      let msg = validateCode;
      let titleName = me.getFormTitle(me.editMode);
      let field = me.$store.state[me.module]._config.field;
      switch (validateCode) {
        case "Duplicate":
          var codeDuplicate =
            me.currentItem[field.unique] ||
            me.currentItem[field.code] ||
            me.currentItem[field.name];
          var moduleName = me.$t("i18nCommon.module." + me.module.toLowerCase());
          msg = this.$t("i18nBaseForm.Validate." + validateCode).format(
            moduleName.toLowerCase(),
            codeDuplicate
          );
          break;
        case "OverQuantity":
          msg = this.$t("i18nBaseForm.Validate." + validateCode).format(
            titleName
          );
          break;
        //ĐVThi 19/03/2021 chuyển về default để được nhiều trường hợp ví dụ  OverQuantity
        case "RefNoDuplicate":
          msg = this.$t("i18nBaseForm.Validate.RefNoDuplicate").format(
            me.customRefNoDuplicate(data) ||
            me.currentItem.ProcessNo ||
            me.currentItem.RefNo ||
            me.currentItem.TransferNo
          );
          break;
        default:
          msg = this.$t("i18nBaseForm.Validate." + validateCode);
          break;
      }

      return msg;
    },

    /**
     * Xử lý những lỗi khác
     */
    showCustomError(result) { },

    /**
     * Xử lý cất trường dữ liệu
     */
    submitEditForm(param) {
      const me = this;

      let action = "updateField";
      let module = "usageHistory";

      me.prepareSubmitParam(param);

      // Nếu từ điều chuyển và điều chuyển nhiều thì gọi sang module của transfer để được cập nhật item
      if (me.module == "transfer" && param.OldEntity) {
        module = me.module;
      }

      //show mask
      me.loading = true;

      me.$store
        .dispatch([module, action].join("/"), param)
        .then((result) => {
          if (result && result.Success) {
            //xử lý sau khi cất
            me.afterSubmit(result, param, action);
          } else {
            me.processSubmitError(result, param, action);
          }
        })
        .finally(() => {
          me.loading = false;
        });
    },

    /**
     * @overridable
     */
    prepareSubmitParam(param) { },

    /**
     * Xử lý cất dữ liệu
     * CreatedBy: PDKIEN 27/07/2019
     */
    submit(param, action) {
      const me = this;
      //show mask
      me.loading = true;
      me.$store
        .dispatch([me.module, action].join("/"), param)
        .then((result) => {
          if (result && result.Success) {
            try {
              me.insertAuditingLog(result, param, action);
            } catch (error) {
              console.log(error);
            }

            //xử lý sau khi cất
            me.afterSubmit(result, param, action);
          } else {
            me.processSubmitError(result, param, action);
          }
        })
        .finally(() => {
          me.loading = false;
        });
    },
    /**
     * tham chiếu nhật ký (lưu dạng json : {key: key, code: code, name: name})
     * key: khóa chính của bảng module, dùng để drildown khi click vào
     * code, name: mã, tên để hiểu thị ở cột tham chiếu khi xem log: ví dụ: Quạt điện (QD00001)
     * @override
     */
    buildReference() {
      let me = this;
      let field = me.getField() ?? this.$store.state[me.module]._config.field;
      if (field) {
        return MSJson.serialize({
          key: me.currentItem[field.key],
          code: me.currentItem[field.code],
          name: me.currentItem[field.name],
        });
      } else {
        return null;
      }
    },
    /**
     * custom Sinh mô tả của nhật ký
     * CreatedBy: nnlam 24/03/2021
     */
    customDescriptionAuditingLog(entity, oldEntity, action, isDetail) {
      return null;
    },

    /**
     * Sinh mô tả của nhật ký
     * CreatedBy: nnlam 24/03/2021
     */
    generateDescriptionAuditingLog(entity, oldEntity, action, isDetail) {
      let me = this;
      let objDescription = {};
      let field = me.getField() ?? this.$store.state[me.module]._config.field;
      if (isDetail) {
        for (var i of Object.keys(entity)) {
          if (entity[i] != oldEntity[i]) {
            let switchCap = me.switchCaption.detail[i];
            if (switchCap) {
              objDescription[i] = {
                oldValue: oldEntity[i],
                newValue: entity[i],
                switchCaption: switchCap,
              };
            } else {
              objDescription[i] = {
                oldValue: oldEntity[i],
                newValue: entity[i],
              };
            }
          }
        }
      } else {
        switch (action) {
          case me.$ms.enum.ModelState.Insert:
          case me.$ms.enum.ModelState.Duplicate:
          case me.$ms.enum.ModelState.Delete:
            objDescription[field.code] = me.currentItem[field.code]; //{newValue:me.currentItem[field.code], switchCaption: me.switchCaption.master[field.code]};
            objDescription[field.name] = me.currentItem[field.name]; //{newValue:me.currentItem[field.name], switchCaption: me.switchCaption.master[field.name]};
            break;
          case me.$ms.enum.ModelState.Update:
          case "update":
            me.buildDescriptionLog(entity, oldEntity, objDescription);
            break;
        }
      }
      return objDescription;
    },

    getField() {
      return null;
    },

    buildDescriptionLog(newEntity, oldEntity, objDescription) {
      let me = this;
      objDescription = objDescription ? objDescription : {};

      for (var j of Object.keys(newEntity)) {
        if (j != "ExtData") {
          var valueOldEntity = oldEntity[j],
            valueNewEntity = newEntity[j];

          // Nếu là ngày tháng thì format lại
          let fieldFormatDateIndex = me
            .fieldFormatDate()
            .findIndex((field) => field == j),
            removeAuditLogByFieldIndex = me
              .removeAuditLogByField()
              .findIndex((field) => field == j);
          if (j.contains("Date") || fieldFormatDateIndex != -1) {
            valueOldEntity = moment(valueOldEntity).format("DD/MM/YYYY");
            valueNewEntity = moment(valueNewEntity).format("DD/MM/YYYY");
          }

          if (
            (valueOldEntity || valueNewEntity) &&
            valueOldEntity != valueNewEntity &&
            removeAuditLogByFieldIndex == -1
          ) {
            let switchCap = me.switchCaption.master[j];
            let enumName = me.enums ? me.enums.master[j] : null;
            if (switchCap) {
              objDescription[j] = {
                oldValue: valueOldEntity,
                newValue: valueNewEntity,
                switchCaption: switchCap,
                enum: enumName,
              };
            } else {
              objDescription[j] = {
                oldValue: valueOldEntity,
                newValue: valueNewEntity,
                enum: enumName,
              };
            }
          }
        } else {
          let extObjNew = JSON.parse(newEntity[j]);
          let extObjOld = JSON.parse(oldEntity[j]);
          me.buildDescriptionLog(extObjNew, extObjOld);
        }

        me.customAuditingLogByField(newEntity, oldEntity, objDescription, j);
      }

      return objDescription;
    },

    /**
     * @author vvkiet - 25.06.2021
     * Thêm hàm custom log theo field
     */
    customAuditingLogByField(newEntity, oldEntity, objDescription, key) { },

    /**
     * @override Các trường sẽ không ghi log
     * @returns
     */
    removeAuditLogByField() {
      return [];
    },

    /**
     * @override Các trường sẽ format theo ngày tháng
     * @returns
     */
    fieldFormatDate() {
      return [];
    },

    /**
     * Get thông tin ext ( các trường bổ sung)
     * CreatedBy: nnlam 24/03/2021
     */
    getExtDataAuditingLog() {
      return null;
    },

    /**
     * Xử lý lỗi khi cất danh mục
     * CreatedBy: PDKIEN 24/07/2019
     */
    handleSubmitError(err) {
      var msg = this.getErrorMessage(err);
      // this.serverErrorList.push(msg);
      if (msg) {
        this.$ms.commonFn.toast({
          type: "error",
          text: msg,
          position: "top-right",
        });
      }

      this.afterSubmitError();
    },

    /**
     * Get lỗi khi cất danh mục
     * CreatedBy: NCThanh1 24/07/2019
     * Modified By: pvduong1 - 12/11/2019
     * Modified Descrition: Thay đổi nội dung mesage trả về
     */
    getErrorMessage(err) {
      let me = this,
        msg = "";

      if (Object.isObject(err)) {
        var paramCode = this.currentItem.getCodeField();

        switch (err.Code) {
          case 10:
            //	msg = apiResponseCode.getMessage(err.Code);
            if (this.editMode == this.$ms.enum.FormState.Edit) {
              msg =
                this.title +
                " " +
                this.currentItem[paramCode] +
                " đã có phát sinh không thể sửa đổi.";
            }
            break;

          case 3:
            msg =
              this.title + " " + this.currentItem[paramCode] + " đã tồn tại";
            break;

          case 5:
            msg = [
              this.title,
              " ",
              this.currentItem[paramCode],
              " đã bị thay đổi bởi người dùng khác, vui lòng nạp lại trước khi thay đổi dữ liệu.",
            ].join("");
            break;
          case 403:
            msg = this.$t("i18nPermission.Action.MessageCommon");
            break;
          // Trùng mã. Áp dụng cho VTHH, KH/NCC/NV
          case this.$ms.enum.EnumErrorCode.InvalidRefno:
            msg = me.handleErrorInvalidRefno(err, paramCode);
            break;
          // pvduong1 - 16/04/2020 - Bổ sung mã lỗi 99 => Trả về mesage thông báo đã có lỗi xảy ra
          case this.$ms.enum.EnumErrorCode.Error: {
            msg = "Đã có lỗi xảy ra";
            break;
          }
          default:
            if (err.SystemMessage.indexOf("duplicate key") > -1) {
              msg =
                this.title + " " + this.currentItem[paramCode] + " đã tồn tại";
            }
            break;
        }
      } else if (typeof err === "string") {
        msg = err;
      }

      return msg;
    },

    /**
     * Xử lý dữ liệu nếu trường hợp submit lỗi
     * Created by: pvduong1 - 15/11/2019
     */
    afterSubmitError() { },

    /**
     * Xử lý dữ liệu sau khi cất thành công
     * created bnduc 27.11.2019
     */
    processDataAfterSubmit(entity, resultData) { },

    /**
     * Lấy dữ liệu cất
     * */
    getSaveData(mode, action) {
      let me = this,
        data = null,
        descriptionLog = null;

      //master
      if (typeof me.currentItem.getData === "function") {
        data = { ...me.currentItem.getData() };
      } else {
        data = { ...me.currentItem };
      }

      if (me.module && me.$store.state[me.module]) {
        let field = me.$store.state[me.module]._config.field;
        if (field.unique) {
          data[field.unique] = data[field.unique].trim();
        }
      }

      //duyệt xử lý các dữ liệu mở rộng
      //pvduy 23/03/2021 sửa lỗi cất unit data trường hợp null bị lỗi...
      if (data.hasOwnProperty("ExtData")) {
        let extData = {};
        for (let i in data) {
          if (me.originFields.indexOf(i) === -1) {
            let value = data[i];
            //value có giá trị thỉ mới add vào extData
            if (value !== null && value !== "") {
              extData[i] = value + "";
            }
          }
        }
        data.ExtData = JSON.stringify(extData);
      }

      //detail
      if (me.storeDetail) {
        for (let key in me.storeDetail) {
          data[key] = me.getDetailSaveData(
            key,
            me.storeDetail[key],
            iscustomAuditinglog
          );
        }
      }

      //pvduy 08/03/2021 khi sửa sẽ truyền oldData để xử lý - ghi nhật ký truy cập, cập nhật cây....
      if (mode === me.$ms.enum.FormState.Edit) {
        data.OldData = me.oldDataItem;
      }
      //custom dữ liệu trước khi cất
      me.customSaveData(me.editMode, data);
      return data;
    },

    /**
     * Lấy dữ liệu chi tiết để cất
     */
    getDetailSaveData(key, store, iscustomAuditinglog) {
      let me = this,
        newRecords = store.getNewRecords(),
        updatedRecords = store.getUpdatedRecords(),
        removedRecords = store.getRemovedRecords(),
        result = [];
      let customDescriptionLog = {
        inserts: [],
        updates: [],
        deletes: [],
      };

      //Xử lý cho các bản ghi thêm mới
      if (newRecords && newRecords.length > 0) {
        newRecords.forEach(function (record) {
          record.EntityState = this.$ms.enum.ModelState.Insert;
          result.add(record.getData());
          if (iscustomAuditinglog) {
            customDescriptionLog.inserts.push(
              me.generateDescriptionAuditingLog(
                record.getData(),
                {},
                me.$ms.enum.ModelState.Insert,
                true
              )
            );
          }
        });
      }

      //Xử lý cho các bản ghi sửa
      if (updatedRecords && updatedRecords.length > 0) {
        updatedRecords.forEach(function (record) {
          let detailData = record.getData();
          //	oldData = me.getOldData(record);

          //if (oldData) {
          //	detailData.old_data = oldData;
          //}

          detailData.EntityState = this.$ms.enum.ModelState.Update;
          result.add(detailData);
          if (iscustomAuditinglog) {
            customDescriptionLog.updates.push(
              me.generateDescriptionAuditingLog(
                detailData,
                me.oldDataItem,
                me.$ms.enum.ModelState.Update,
                true
              )
            );
          }
        });
      }

      //Xử lý cho các bản ghi xóa
      if (removedRecords && removedRecords.length > 0) {
        removedRecords.forEach(function (record) {
          record.EntityState = this.$ms.enum.ModelState.Delete;
          result.add(record.getData());
          if (iscustomAuditinglog) {
            customDescriptionLog.deletes.push(
              me.generateDescriptionAuditingLog(
                record.getData(),
                {},
                me.$ms.enum.ModelState.Delete,
                true
              )
            );
          }
        });
      }
      if (iscustomAuditinglog) {
        me.descriptionAuditingLog.detail.push(customDescriptionLog);
      }

      return result;
    },

    /**
     * Custom dữ liệu thực hiện cất
     */
    customSaveData(editMode, data) { },

    /**
     * Validate lỗi nghiệp vụ
     * CreatedBy: PDKIEN 25/07/2019
     */
    validateBusiness(saveParam, action) {
      return true;
      //return this.businessErrorList.length == 0;
    },

    //Hàm xử lý sự kiện dóng form
    //Created by LTDAT(18.06.2020)
    close() { },
    //Kiểm tra form đã bị thay đổi hay chưa
    //Created by LTDAT(18.06.2020)
    checkChanges() {
      const me = this;
      return me.$ms.commonFn.checkDiff(me.currentItem, me.oldDataItem);
    },

    /**
     * Xử lý sự kiện widget của grid
     */
    gridWidgetEvent(grid, widgetData, e) {
      const me = this;
      switch (widgetData.command) {
        case "Delete":
          me.removeDetail(widgetData.dataRow, grid);
          break;
      }
    },

    /**
     * Xóa bản ghi chi tiết
     */
    removeDetail(record, grid) {
      grid.store.remove(record);
    },

    /**
     * Thêm bản ghi chi tiết
     */
    addDetail(grid) {
      grid.addNew({}, true);
    },

    /**
     * Khai báo handler
     * */
    addHandler() {
      const me = this;
      if (me.storeDetail) {
        for (let key in me.storeDetail) {
          let grid = me.storeDetail[key].owner;
          if (grid) {
            grid.$on("customAddNewData", me.gridCustomAddNewData);
            grid.$on("rowactionclick", me.gridRowActionClick);
          }
        }
      }
    },
    /**
     * Xóa handler đã khai báo trong hàm addHandler
     * */
    removeHandler() {
      const me = this;

      if (me.storeDetail) {
        for (let key in me.storeDetail) {
          let grid = me.storeDetail[key].owner;
          if (grid) {
            grid.$off("customAddNewData", me.gridCustomAddNewData);
            grid.$off("rowactionclick", me.gridRowActionClick);
          }
        }
      }
    },

    /**
     * Custom dữ liệu thêm mới trên grid
     */
    gridCustomAddNewData(grid, data) { },

    /**
     * Custom lại sự kiện khi thao tác trên grid
     * @param {*} command
     * @param {*} record
     * @param {*} event
     * @author vvkiet - 30.03.2021
     */
    gridRowActionClick(command, record, event) { },

    /**
     * Khởi tạo dữ liệu khi thêm mới dòng ch itiết
     * @param defaultData
     */
    initNewDetail(defaultData) {
      return defaultData;
    },

    /**
     * Lấy cấu hình cột của grid detail
     * */
    getGridDetailColumnConfig() {
      return this.columnDetail;
    },
    /*
     * pvduy 05/04/2021: thêm hàm xóa trong base detail để có thể xóa trên form chi tiết.
     */
    async delete(record) {
      const me = this;
      if (
        !me.checkActionPermission(
          me.$t("i18nPermission.SubSystemCode.Code.DELETE")
        )
      ) {
        return;
      }
      // confirm('Có muốn xóa không?')
      let configMessage = await me.getDeleteConfirmMessage(record);
      let answer = await me.$ms.msgBox.showQuestion(configMessage);
      if (answer == "Yes") {
        let temp = {};
        for (let i in record) {
          switch (i) {
            case "parentNode":
            case "isHide":
            case "isSelected":
            case "level":
            case "__vKeyValue":
            case "_isSelectedMultiple":
            case "expanded":
              //bỏ qua 1 só trường
              break;
            default:
              temp[i] = record[i];
              break;
          }
        }
        let auditingLog = {
          description: MSJson.serialize(
            me.generateDescriptionAuditingLog(record)
          ),
          reference: me.buildReference(record),
          action: me.actionAuditingLog,
          entity: me.module,
        };

        let param = {
          Entity: [temp],
          ByPassValidate: null,
          AuditingLog: MSJson.serialize(auditingLog),
        };

        let result = await me.$store.dispatch(`${me.module}/delete`, param);
        me.afterDelete(record, result);
      }
    },
    /**
     * Xử lý sau khi xóa
     * pvduy 05/04/2021: thêm thằng xóa trong base detail
     */
    afterDelete(record, result) {
      const me = this;
      let moduleName = me.getModuleName() || "";
      if (result.Success) {
        me.$toast.success(me.$t("i18nBaseForm.Message.DeleteSuccess"));
        record = [];
        me.selected = [];
        // pvduy 05/05/2021: khi xóa trên danh sách thì đóng popup đi.
        me.hide();
        // NMTUAN3 3/11/2021: sau khi xóa phải reload lại trang
        me.reload();
      } else {
        /**
         * Sửa lỗi khi xóa nhiều bản ghi
         * ModifiyBy: NTAnh (09/03/2021)
         */
        const CODE = me.$ms.enum.ServiceResponseCode;
        // Nhiều bản ghi muốn xóa đã có phát sinh
        if (result.Data && result.Data.length > 1) {
          // if(result.Data[0].Code == 'Arise'){
          //     me.$toast.error(me.$t("i18nBaseForm.Message.DeleteArisened"));
          // }
          var listArisend = [];

          //nnlam tạm thời xóa đoạn này đi sau sẽ vẽ form popup show dánh sách phát sinh sau
          // result.Data.forEach(element => {
          //   listArisend.push(element.Entity.AssetTypeCode);
          // });
          switch (result.Code) {
            case CODE.PartInvalidData:
              me.$toast.error(
                me.$t("i18nBaseForm.Validate.CanNotDeleteArise")
              );
              break;
            default:
              me.$toast.error(
                me.$t("i18nBaseForm.Validate.CanNotDeleteArise")
              );
              break;
          }
          //me.reload();
          // record = [];
          //me.selectionChange(record);
          // me.selected = [];
        }
        // có 1 bản ghi có phát sinh:
        else {
          switch (result.Code) {
            // xóa 1 bản ghi và bản ghi đó bị có phát sinh:
            case CODE.Arisened:
              me.$toast.error(
                me.$t("i18nBaseForm.Message.DeleteArisened").format(moduleName)
              );
              break;
            // xóa nhiều bản ghi và có 1 bản ghi bị có phát sinh:
            case CODE.PartInvalidData:
              //nnlam tạm thời xóa đoạn này đi sau sẽ vẽ form popup show dánh sách phát sinh sau
              // listArisend = [];
              // listArisend.push(result.Data[0].Entity.AssetTypeCode);
              me.$toast.error(
                me.$t("i18nBaseForm.Validate.DeleteMultiHasOneArisened")
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
        }
      }
    },
    /**
     * Lấy câu thông báo khi xóa
     * pvduy 05/04/2021
     */
    async getDeleteConfirmMessage(records) {
      const me = this;

      let moduleName = (me.getModuleName() || "").toLowerCase();
      let targetName = "";
      var mes = "";
      if (records.length > 1) {
        mes = me
          .$t("i18nBaseForm.Message.ConfirmDeleteMutiTitle")
          .format(moduleName);
      } else {
        targetName =
          records[me.$store.state[me.module]._config.field.name] ||
          records[me.$store.state[me.module]._config.field.code];
        mes = me
          .$t("i18nBaseForm.Message.ConfirmDelete")
          .format(moduleName, me.$ms.commonFn.encodeHTML(targetName));
      }

      return {
        title: me
          .$t("i18nBaseForm.Message.ConfirmDeleteTitle")
          .format(moduleName),
        message: mes,
      };
    },

    /**
    * Custom filter (có thể tùy dùng combobox hay grid .....)
    * Mặc định truyền Inactive vào lấy ra các bản ghi đang hoạt động
    * TDNGHIA 28/10/2021
    * overridable
    */
    customPayloadCombo(payload) {
      const me = this;

      if (!payload.filter) {
        payload.filter = [];
      }

      let map = null;
      for (let i = 0; i < payload.filter.length; i++) {
        let item = payload.filter[i];
        if (item.property === "Inactive") {
          map = item;
          break;
        }
      }

      if (!map) {
        payload.filter.push({
          property: "Inactive",
          value: false,
          operator: "="
        });
      }

      if (payload.filter.length == 0) {
        delete payload.filter;
      }
    },

    /**
     * Thực hiện các công việc trước khi save
     * @author vvkiet - 12.04.2021
     */
    async beforeSave() { },

    /**
     * Hàm ghi nhật ký truy cập
     * @param {*} result
     * @param {*} param
     * @param {*} action
     * @author vvkiet - 14.05.2021
     */
    insertAuditingLog(result, param, action) {
      const me = this;
      let auditingLogs = [];
      action = me.editMode;
      // Đối với xử lý hàng loạt
      if (result && result.Success && param && param.Entity) {
        if (me.IsAuditingLogBatch) {
          auditingLogs = me.customAuditingLogBatch(param.Entity, action);
        }
        // Đối với xử lý đơn
        else {
          // vvkiet: Code của người làm trước đó, không dám xóa
          //muốn custom mô tả nhật ký thì dùng hàm này
          let descriptionAuditingLog = me.customDescriptionAuditingLog(
            param.Entity,
            me.oldDataItem,
            action,
            false
          );
          if (
            descriptionAuditingLog &&
            Object.keys(descriptionAuditingLog).length !== 0
          ) {
            me.descriptionAuditingLog = descriptionAuditingLog;
          } else {
            me.descriptionAuditingLog.master =
              me.generateDescriptionAuditingLog(
                param.Entity,
                me.oldDataItem,
                action,
                false
              );
          }

          if (!me.actionAuditingLog) {
            // nmsinh : xử lý mặc định nếu form là thêm hoặc sửa thì vẫn gán actionAuditingLog để tránh tình trạng không ghi NKTC
            // TODO có thể có trường hợp đặc biệt nào đó mà show form sửa nhưng làm hành động khác
            me.actionAuditingLog =
              action == me.$ms.enum.FormState.Add
                ? me.$ms.enum.AuditingLogAction.Insert
                : action == me.$ms.enum.FormState.Edit
                  ? me.$ms.enum.AuditingLogAction.Edit
                  : null;
          }

          if (me.actionAuditingLog) {
            auditingLogs = [
              {
                description: MSJson.serialize(me.descriptionAuditingLog),
                reference: me.buildReference(),
                action: me.actionAuditingLog,
                entity: me.getEntityType() || me.module,
                // companyid: me.Context.TenantID,
                // userid: me.Context.UserID,
                username: me.Context.UserName,
                devicename: navigator.userAgent,
                time: new Date(),
                id: commonFn.generateUUID(),
              },
            ];
          }
        }
      }

      // vvkiet - Mặc định bỏ qua không ghi log nếu không có master và detail
      if (
        !auditingLogs &&
        me.descriptionAuditingLog["master"] &&
        Object.keys(me.descriptionAuditingLog["master"]).length == 0 &&
        me.descriptionAuditingLog["detail"] &&
        me.descriptionAuditingLog["detail"].length == 0
      ) {
        return;
      }
      if (auditingLogs.length > 0) {
        let payload = {
          auditingLogs: auditingLogs,
        };

        if (auditingLogs && auditingLogs.length > 0) {
        }
      } else {//tạm comment để không hiện popup warning khi sao chép
        // if (process.env.NODE_ENV === "development") {
        //   me.$ms.msgBox.showWarning("DEV chưa cấu hình auditing log");
        // }
      }
    },

    /**
     * Hàm thực hiện custom lại nhật ký truy cập cho các chức năng hàng loạt
     * @param {*} entity
     * @param {*} action
     * @author vvkiet - 14.05.2021
     */
    customAuditingLogBatch(entity, action) {
      return null;
    },

    /**
     * Hàm thực hiện custom entity đối với nghiệp vụ đặc thù
     * @author vvkiet - 14.05.2021
     */
    getEntityType() {
      return null;
    },
    /**
     * sự kiện ấn vào các action trên form
     */
    buttonClick(command, e) { },

    /**
     * Custom tham số payload trước khi call api
     * @author vvkiet - 23.06.2021
     */
    customPayload(payload) {
      return payload;
    },

    /**
     * Custom lại refno khi thông báo lỗi duplicate
     * @author vvkiet - 22.07.2021
     * @returns
     */
    customRefNoDuplicate(data) {
      return null;
    },

    /**
     * Thêm hàm custom lại param với TH có cảnh báo
     * @author vvkiet - 14.087.2021
     */
    async customParamByPassValidate(param, data) { },
  },
  /**
   * Trước khi destroy form
   */
  beforeDestroy() {
    let me = this;

    //xóa tham chiếu để tránh leak
    delete me.param;
    me.removeHandler();
    //destroy cha của form sẽ ăn phím tắt
    if (me.hasShortKey) {
      this.$ms.commonFn.shortkeyPopView(this.$el);
    }
  },
};
