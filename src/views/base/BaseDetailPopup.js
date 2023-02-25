import BaseDetail from "@/views/base/BaseDetail";
import Vue from 'vue';
import { mapGetters } from "vuex";
import { popup } from "@/mixins/common/popup";
import { ModuleContext } from "@/stores/module-const";

export default {
  extends: BaseDetail,
  name: "BaseDetailPopup",
  mixins: [popup],
  data: function () {
    return {

    };
  },
  watch: {},
  mounted: function () {
  },
  computed: {
    ...mapGetters(ModuleContext, ['Context']),

  },
  methods: {
    setHelpId(helpId) {
      window._helpId = helpId;
    },

    /**
     * Hàm mở popup
     * thực hiện set giá trị cho currentItem và oldData
     * chuyển biến hiện thị popup thành true
     * Created by LTDAT(22.06.2020)
     *  */
    show(param, options) {
      let me = this;
      //giữ lại option cho các tình huống cần sử dụng
      me.options = options;
      me.param = {};
      if (param) {
        Object.assign(me.param, param);
      }
      //reset cờ có dữ liệu thay đổi
      me.isChangeData = false;

      //show popup
      me.active = true;

      //load dữ liệu
      me.editMode =
        typeof param.mode === "number" ? param.mode : me.$ms.enum.FormState.Add;
      switch (me.editMode) {
        case me.$ms.enum.FormState.Add:
          me.add(param);
          break;
        case me.$ms.enum.FormState.Edit:
          me.edit(param);
          break;
        //Thêm dữ liệu cho mode view
        case me.$ms.enum.FormState.View:
          me.view(param);
          break;
        case me.$ms.enum.FormState.Duplicate:
          me.duplicate(param);
          break;
        default:
          throw "Not Implement exception with mode " + mode;
      }
      //xử lý trước khi hiển thị
      me.beforeShowPopup(param);
    },

    /**
     * Hàm đóng popup
     * thực hiện chuyển giá trị hiện thị cho popup thành false
     * Created by LTDAT 22.06.2020
     *  */
    hide() {
      const me = this;

      me.active = false;
      me.$emit("close", this.isChangeData);
    },

    beforeHide() {
      let me = this;
      //todo
      me.hide();
    },

    /**
     * Hàm thực hiện trước khi showpopup
     * Dùng để form tự overide lại theo nghiệp vụ tương ứng
     * Created by LTDAT 22.06.2020
     */
    beforeShowPopup(param) { },

    //Hàm xử lý sự kiện dóng form
    //Created by LTDAT(18.06.2020)
    close() {
      const me = this;

      me.hide();
    },

    /*
     * show câu cảnh báo hỏi khách hành khi bấm nút hủy và có thay đổi dữ liệu
     * ttanh(25/07/2020)
     */
    showQuestionBeforeClose() {
      var me = this,
        msg = me.getCloseConfirmMessage();
      me.$ms.msgBox.showConfirm(msg).then(answer => {
        if (answer === "Yes") {
          me.save(this.$ms.enum.SaveMode.Save);
        }
        if (answer == "No") {
          me.hide();
        }
      });
    },

    /*
     * lấy câu thông báo trước khi đóng form
     * ttanh(25/07/2020)
     */
    getCloseConfirmMessage() {
      return "Bạn có muốn lưu lại thay đổi trước khi quay lại?";
    },

    afterSubmitModeSave(result, param) {
      const me = this;
      me.$emit("savesuccess", param.Entity);
      me.hide();
    },

    /* 
     * xử lý sau khi cất thành công của mode view 
     * pvduy 04/03/2021
     */
    afterSubmitModeView() {

    },

    /**
     * Hàm lấy câu thông báo
     */
    getNotiSuccess() {
      const me = this;

      me.$toast.success(me.$t("i18nBaseForm.SaveSuccessMessage"));
    },

    /**
     * Xử lý sau khi cất
     * */
    afterSubmit(result, param, action) {
      const me = this;

      //DLHuy 06.11.2021 thêm hàm này để custom lại câu thông báo
      me.getNotiSuccess();

      if (me.options && me.options.submit) {
        me.options.submit(result, param, action);
      }

      me.isChangeData = true;

      switch (param.Mode) {
        case me.$ms.enum.SaveMode.Save:
          me.afterSubmitModeSave(result, param);
          break;
        case me.$ms.enum.SaveMode.SaveNew:
          me.add({});
          break;
        // pvduy 04/03/2021 cất thành công tại mode view
        case me.$ms.enum.SaveMode.SaveView:
          me.afterSubmitModeView();
          break;
        case me.$ms.enum.SaveMode.SaveAndConfig:
          me.afterSubmitModeSaveAndConfig(result, param, action);
          break;
        default:
          me.hide();
          break;
      }

      // NMTUAN3 7/3/2022: Tạo thông báo sau khi submit
      me.createNotification(result.Data, param, action);
    },

    /**
     * Thực hiện custom lại dữ liệu trước khi bind data ở mode view
     * @param {*} asset 
     * @param {*} usageHistory 
     */
    customAmountModeView(asset, usageHistory) {
      let quantityAsset = asset.Quantity;
      let quantityUsageHistory = usageHistory.Quantity;

      if (quantityAsset) {
        asset.RemainingAmount = (asset.RemainingAmount / quantityAsset) * quantityUsageHistory;
        asset.OrgAmount = quantityUsageHistory * asset.OrgPrice;
        asset.Quantity = quantityUsageHistory;
      }
    },

    /**
     * Thêm thông báo
     * @param {*} param 
     * NMTUAN3 7/3/2022
     */
    createNotification(data, param, action) { },
  },

  afterSubmitModeSaveAndConfig() { },

  /**
   * Trước khi destroy form
   */
  beforeDestroy() {
    let me = this;

    // me.removeHandler();
  },

  /**
   * Sự kiện khi chuyển sang router khác
   */
  beforeRouteLeave(to, from, next) {
    //Lưu lại thông tin của form
    // this.saveState();
    next();
  },
};
