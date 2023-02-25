import i18n from "@/i18ns/i18n";
import commonFunction from "@/commons/commonFunction";
import store from "@/stores/store";

/**
 * Xử lý hiển thị popup
 */
class PopupUtil {
  /**
   * Đối tượng cache lại các component popup
   */
  _components = {};

  /**
   * Danh sách các popup đang hiển thị
   * key: tên popup
   * value: instance
   */
  _visible = {};

  /**
   * Ẩn tất cả các popup đang hiển thị đi
   */
  hideAll() {
    const me = this;
    let names = [];
    for (let i in me._visible) {
      names.push(i);
    }
    names.forEach((item) => {
      me.hide(item);
    });
  }

  /**
   * Ẩn popup theo tên nếu đang hiển thị
   */
  hide(name) {
    let popup = this._visible[name];
    if (popup) {
      delete this._visible[name];
      if (typeof popup.beforeHide === "function") {
        popup.beforeHide();
      }
      if (typeof popup.close === "function") {
        popup.close();
      }
    }
  }

  /**
   * Hiển popup chi tiết
   * @param {Object} owner Form/Component gọi show
   * @param {EnumQuickAdd} type Loại popup
   * @param {} data Các trường thông tin mặc định cho đối tượng được mở form lên
   * @param {Object} options Các biến hỗ trợ điều khiền luồng
   * @public
   */
  show(owner, type, data, options) {
    var me = this,
      component = me._components[type];

    if (!type) {
      throw new Error("DEV: Vui lòng xem lại cấu hình popup.");
    } else {
      var promise;
      options = options || {};
      me._customParam(type, options);
      if (!component) {
        component = me._loadComponent(type);

        if (component) {
          promise = new Promise((resolve, reject) => {
            var fnSuccess = function (module) {
              if (module) {
                var popupModule = module.default;
                if (process.env.NODE_ENV === "development") {
                  console.log(popupModule.__file);
                }
                if (popupModule) {
                  me._components[type] = popupModule;
                  me._show(type, popupModule, owner, options, data).then(
                    (record) => {
                      resolve(record);
                    },
                    function (error) {
                      reject(error);
                    }
                  );
                }
              }
            };

            var fnFailure = function (error) {
              commonFunction.handleException(error);
              reject(error);
            };

            component.then(fnSuccess, fnFailure);
          });
        }
      } else {
        promise = me._show(type, component, owner, options, data);
      }

      return promise;
    }
  }

  /**
   * Thực hiện load các component quickAdd theo type
   * @privates
   */
  _loadComponent(type) {
    var component;
    switch (type) {
      // case "DownloadAppGuide": // Màn hình hướng dẫn tải app
      //   component = import(
      //     /*webpackChunkName:'popup'*/
      //     "@/views/common/DownloadAppGuide.vue"
      //   );
      //   break;
      //Màn hình chi tiết Tiêu chí thi đua
      case "QrDownLoad":
        component = import(
          /*webpackChunkName:'popup'*/
          "@/views/qrDownload.vue"
        );
        break;
      //Màn hình slide chức danh
      case "EventRegister":
        component = import(
          /*webpackChunkName:'popup'*/
          "@/views/event/EventRegister.vue"
        );
        break;
    //   //popup quá trình làm việc
    //   case "WorkProcessDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/employee/WorkProcessDetail.vue"
    //     );
    //     break;
    //   //popup danh hiệu thi đua
    //   case "EmulationTitleDetailPopup":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/employee/EmulationTitleDetail.vue"
    //     );
    //     break;
    //   //popup đánh giá xếp loại
    //   case "EvaluationDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/employee/EvaluationDetail.vue"
    //     );
    //     break;
    //   //popup tập tin đính kèm
    //   case "MSAttachmentDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/components/mspopup/attachment/MSAttachmentDetail.vue"
    //     );
    //     break;
    //   //popup hình thức khen thưởng
    //   case "RewardCategoryDetailPopup":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/employee/RewardCategoryDetail.vue"
    //     );
    //     break;
    //   //popup thông tin kỷ luật
    //   case "DisciplineDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/employee/DisciplineDetail.vue"
    //     );
    //     break;
    //   //popup Quyền và nhiệm vụ được giao
    //   case "MissionRole":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/employee/RoleDetail.vue"
    //     );
    //     break;
    //   //popup sáng kiến phát minh
    //   case "InventDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/employee/InventDetail.vue"
    //     );
    //     break;
    //   //Màn hình thêm mới phong trào thi đua từ tab Hưởng ứng (cũ)
    //   case "ResponseMovementDetailOld":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/emulationmovement/ResponseMovementDetailOld.vue"
    //     );
    //     break;
    //   //Màn hình thêm mới phong trào thi đua từ tab Hưởng ứng (mới)
    //   case "ResponseMovementDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/emulationmovement/ResponseMovementDetail.vue"
    //     );
    //     break;
    //   //Màn hình chi tiết hồ sơ tập thể
    //   case "GroupEmployeeProfileDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/groupemployee/Detail.vue"
    //     );
    //     break;
    //   //Màn hình popup sáng kiến thành tích của tập thể
    //   case "GroupEmployeeAchievement":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/groupemployee/GroupEmployeeAchievement.vue"
    //     );
    //     break;
    //   //Màn hình popup danh hiệu thi đua của tập thể
    //   case "GroupEmployeeEmulationTitle":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/groupemployee/GroupEmployeeEmulationTitle.vue"
    //     );
    //     break;
    //   //Màn hình popup hình thức khen thưởng tập thể
    //   case "GroupEmployeeRewardForm":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/dictionary/groupemployee/GroupEmployeeRewardForm.vue"
    //     );
    //     break;
    //   //Màn hình PopUp thêm link liên kết của phong trào thi đua
    //   case "AddEmulationMovementLinkAttachment":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/emulationmovement/popup/AttachmentLinkPopUp.vue"
    //     );
    //     break;
    //   //Màn hình PopUp thêm từ phong trào hưởng ứng
    //   case "AddEmulationFromResponse":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/emulationmovement/popup/AddEmulationFromResponse.vue"
    //     );
    //     break;
    //   //Màn hình PopUp thêm, sửa cụm khối thi đua
    //   case "EmulationGroupListDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/system/emulationgroup/EmulationGroupListDetail.vue"
    //     );
    //     break;
    //   //Màn hình PopUp thêm, sửa cụm khối thi đua
    //   case "AddMemberUnit":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/system/emulationgroup/AddMemberUnit.vue"
    //     );
    //     break;
    //   //Màn hình chi tiết Đăng ký thi đua
    //   case "RegisterEmulationDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/registeremulation/RegisterEmulationDetail.vue"
    //     );
    //     break;
    //   //Màn hình popup chọn hình thức khen thưởng
    //   case "RegisterRewardDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/registeremulation/popup/RegisterRewardFormDetail.vue"
    //     );
    //     break;
    //   //Màn hình popup chọn danh hiệu thi đua
    //   case "RegisterEmulationTitleDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/registeremulation/popup/RegisterEmulationTitleDetail.vue"
    //     );
    //     break;
    //   //Màn hình popup nhập nội dung thi đua
    //   case "EmulationContentDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/registeremulation/popup/EmulationContentDetail.vue"
    //     );
    //     break;
    //   // Màn hình PopUp thêm cá nhân đăng ký
    //   case "AddPersonalRegisterPopUp":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/registeremulation/popup/AddPersonalRegisterPopUp.vue"
    //     );
    //     break;
    //   //Màn hình PopUp thêm mới hồ sơ
    //   case "AddNewEmployeeProfile":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/registeremulation/popup/AddNewEmployeeProfile.vue"
    //     );
    //     break;
    //   //Màn hình PopUp thêm tập thể đăng ký
    //   case "AddTeamRegister":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/registeremulation/popup/AddTeamRegister.vue"
    //     );
    //     break;
    //   //Màn hình PopUp chi tiết tập thể đăng ký
    //   case "TeamTabDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/registeremulation/tabDetail/TeamTabDetail.vue"
    //     );
    //     break;
    //   //Màn hình PopUp chi tiết cá nhân đăng ký
    //   case "PersonalTabDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/registeremulation/tabDetail/PersonalTabDetail.vue"
    //     );
    //     break;
    //   //Màn hình detail phê duyệt đăng ký
    //   case "ApprovalRegisterDetailMore":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/approvalandsynthesize/ApprovalRegisterDetailMore.vue"
    //     );
    //     break;
    //   //Màn hình PopUp chi tiết tập thể phê duyệt
    //   case "ApproveTeamTabDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/approvalandsynthesize/tabDetail/TeamTabDetail.vue"
    //     );
    //     break;
    //   //Màn hình PopUp chi tiết cá nhân phê duyệt
    //   case "ApprovePersonalTabDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/approvalandsynthesize/tabDetail/PersonalTabDetail.vue"
    //     );
    //     break;
    //   //Màn hình detail thêm hồ sơ bình xét
    //   case "EmulationProfileDetail":
    //     component = import(
    //       "@/views/movement/votation/popup/AddNewVotation.vue"
    //     );
    //     break;
    //   //Màn hình detail thêm danh hiệu thi đua
    //   case "AddRegisterEmulationTitleDetail":
    //     component = import(
    //       "@/views/movement/votation/popup/AddRegisterEmulationTitleDetail.vue"
    //     );
    //     break;
    //   //Màn hình detail thêm hình thức khen thưởng
    //   case "AddRegisterRewardCategoryDetail":
    //     component = import(
    //       "@/views/movement/votation/popup/AddRegisterRewardCategoryDetail.vue"
    //     );
    //     break;
    //   //Màn hình detail thêm hồ sơ bình xét
    //   case "EmulationProfileDetail":
    //     component = import(
    //       "@/views/movement/votation/popup/AddNewVotation.vue"
    //     );
    //     break;
    //   //Màn hình detail hồ sơ bình xét full màn hình
    //   case "VotationProfileFull":
    //     component = import(
    //       "@/views/movement/votation/detail/VotationDetailTabList.vue"
    //     );
    //     break;
    //     //Màn hình detail tùy chỉnh mẫu
    //   case "CustomTemplate":
    //     component = import(
    //       "@/views/movement/votation/detail/CustomTemplate.vue"
    //     );
    //     break;
    //     //Màn hình detail tùy chỉnh mẫu
    //   case "CustomAdvanced":
    //     component = import(
    //       "@/views/movement/votation/detail/CustomAdvanced.vue"
    //     );
    //     break;
    //   //Màn hình detail hồ sơ bình xét cho đơn vị chủ quản full màn hình
    //   case "VotationDetailForParentFull":
    //     component = import(
    //       "@/views/movement/votation/detail/VotationDetailTabListForParent.vue"
    //     );
    //     break;
    //   //Màn hình popup thêm hồ sơ bình xét thi đua cá nhân
    //   case "AddRegisterPersonalProfilePopup":
    //     component = import(
    //       "@/views/movement/votation/popup/AddRegisterPersonalProfilePopup.vue"
    //     );
    //     break;
    //   //Màn hình popup thêm hồ sơ bình xét thi đua cá nhân chi tiết
    //   case "AddRegisterPersonalProfileDetailPopup":
    //     component = import(
    //       "@/views/movement/votation/popup/AddRegisterPersonalProfileDetailPopup.vue"
    //     );
    //     break;
    //   //Màn hình popup thẩm định
    //   case "ValuationListPopup":
    //     component = import(
    //       "@/views/movement/votation/popup/ValuationListPopup.vue"
    //     );
    //     break;
    //   //Màn hình xuất khẩu danh hiệu/hình thức thẩm định
    //   case "ExportValuationPopup":
    //     component = import(
    //       "@/views/movement/votation/popup/ExportValuationPopup.vue"
    //     );
    //     break;
    //   //Màn hình popup thẩm định
    //   case "ValuationDetailPopup":
    //     component = import(
    //       "@/views/movement/votation/popup/ValuationDetailPopup.vue"
    //     );
    //     break;
    //   //Màn hình popup thẩm định
    //   case "ValuationTeamDetail":
    //     component = import(
    //       "@/views/movement/votation/popup/ValuationTeamDetailPopup.vue"
    //     );
    //     break;
    //   //Màn hình popup thẩm định
    //   case "ValuationPersonalDetail":
    //     component = import(
    //       "@/views/movement/votation/popup/ValuationPersonalDetailPopup.vue"
    //     );
    //     break;
    //   //Màn hình popup thẩm định
    //   case "ValuationTeamCateDetail":
    //     component = import(
    //       "@/views/movement/votation/popup/ValuationTeamDetailCatePopup.vue"
    //     );
    //     break;
    //   //Màn hình popup thẩm định
    //   case "ValuationPersonalCateDetail":
    //     component = import(
    //       "@/views/movement/votation/popup/ValuationPersonalDetailCatePopup.vue"
    //     );
    //     break;
    //   //Màn hình popup thẩm định tâp thể
    //   case "ValuationTeamDetailTab":
    //     component = import(
    //       "@/views/movement/votation/tabdetail/ValuationTeamDetailTab.vue"
    //     );
    //     break;
    //   case "VotationValuationDetailPopup":
    //     component = import(
    //       "@/views/commendation/commendationprofile/detail/ValuationTabList.vue"
    //     );
    //     break;
    //   //Màn hình popup thêm hình thức khen thưởng
    //   case "RegisterProfileRewardFormDetail":
    //     component = import(
    //       "@/views/movement/emulationprofile/popup/RegisterProfileRewardFormDetail.vue"
    //     );
    //     break;
    //   //Màn hình popup thêm danh hiệu thi đua
    //   case "RegisterProfileEmulationTitleDetail":
    //     component = import(
    //       "@/views/movement/emulationprofile/popup/RegisterProfileEmulationTitleDetail.vue"
    //     );
    //     break;
    //   //Màn hình popup thêm hồ sơ bình xét thi đua tập thể
    //   case "AddRegisterCollectiveProfilePopup":
    //     component = import(
    //       "@/views/movement/votation/popup/AddRegisterCollectiveProfilePopup.vue"
    //     );
    //     break;
    //   //Màn hình popup thêm hồ sơ bình xét thi đua tập thể chi tiêt
    //   case "AddRegisterCollectiveProfileDetailPopup":
    //     component = import(
    //       "@/views/movement/votation/popup/AddRegisterCollectiveProfileDetailPopup.vue"
    //     );
    //     break;
    //   //slide chi tiết của tab cá nhân bình xét
    //   case "PersonalDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/votation/popup/PersonalDetail.vue"
    //     );
    //     break;
    //   //slide chi tiết của tab tập thể bình xét
    //   case "TeamDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/votation/popup/TeamDetail.vue"
    //     );
    //     break;
    //   // Chi tiết Tổng hợp đăng ký thi đua
    //   case "SynthesizeRegisterMovementDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/approvalandsynthesize/SynthesizeRegisterMovementDetail.vue"
    //     );
    //     break;
    //   // Các popup trong Chi tiết Tổng hợp đăng ký thi đua
    //   // Gửi đăng ký tổng hợp
    //   case "SynthesizeRegisterMovementPopup":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/approvalandsynthesize/popup/SynthesizeRegisterMovementPopup.vue"
    //     );
    //     break;
    //   // Phê duyệt đăng ký
    //   case "ApprovalRegisterPopup":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/approvalandsynthesize/popup/ApprovalRegisterPopup.vue"
    //     );
    //     break;
    //   // Từ chối đăng ký
    //   case "RejectRegisterPopup":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/approvalandsynthesize/popup/RejectRegisterPopup.vue"
    //     );
    //     break;
    //   // Hủy phê duyệt đăng ký
    //   case "CancelApproveRegisterPopup":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/approvalandsynthesize/popup/CancelApproveRegisterPopup.vue"
    //     );
    //     break;
    //   // Màn hình detail của tab phát động
    //   case "MotiveMovementDetailOld":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/emulationmovement/MotiveMovementDetailOld.vue"
    //     );
    //     break;
    //   case "MotiveMovementDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/movement/emulationmovement/MotiveMovementDetail.vue"
    //     );
    //     break;
    //   // Màn hình detail của Quyết định khen thưởng
    //   case "CommendationDecisionDetail":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/commendation/commendationdecision/CommendationDecisionDetail.vue"
    //     );
    //     break;
    //   // Màn hình chọn loại khen thưởng của Quyết định khen thưởng
    //   case "CommendationDecision":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/commendation/commendationdecision/CommendationDecision.vue"
    //     );
    //     break;
    //   // Quyết định khen thưởng - Thêm khen thưởng từ bình xét
    //   case "CommendationDetail_AddRewardFromVotation":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/commendation/commendationdecision/popup/AddRewardFromVotation.vue"
    //     );
    //     break;
    //   // Quyết định khen thưởng - Thêm mới khen thưởng
    //   case "CommendationDetail_AddNewReward":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/commendation/commendationdecision/popup/AddNewReward.vue"
    //     );
    //     break;
    //   // Quyết định khen thưởng - Thêm mới cá nhân
    //   case "CommendationDetail_AddPersonal":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/commendation/commendationdecision/popup/AddPersonalCommendation.vue"
    //     );
    //     break;
    //   // Quyết định khen thưởng - Thêm mới tập thể
    //   case "CommendationDetail_AddTeam":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/commendation/commendationdecision/popup/AddTeamCommendation.vue"
    //     );
    //     break;
    //   // NMTUAN3 3/11/2021: Màn hình popup thêm hồ sơ bình xét khen thưởng
    //   case "CommendationProfileAdd":
    //     component = import(
    //       /*webpackChunkName:'popup'*/
    //       "@/views/commendation/commendationprofile/CommendationProfileAdd.vue"
    //     );
    //     break;
    //   //Form tham số cơ bản
    //   case "FormParamDetail":
    //     component = import("@/views/report/detail/FormParam.vue");
    //     break;
    //   //Form full màn hình preview
    //   case "PreviewDetail":
    //     component = import("@/views/report/preview/Preview.vue");
    //     break;
    //   //Form import mapping chung
    //   case "ImportMapping":
    //     component = import("@/views/import/ImportMapping.vue");
    //     break;
    //   //Form mapping các danh mục khi nhập khẩu
    //   case "MappingDictionary":
    //     component = import("@/views/import/MappingDictionary.vue");
    //     break;
    //   case "SearchAdvancedList":
    //     component = import("@/views/searchadvanced/SearchAdvancedList.vue");
    //     break;
    //   //Xem chi tiết tập thể màn tra cứu
    //   case "SearchAdvanced_TeamDetail":
    //     component = import("@/views/searchadvanced/SearchTeamDetail.vue");
    //     break;
    //   //Xem chi tiết cá nhân màn tra cứu
    //   case "SearchAdvanced_PersonalDetail":
    //     component = import("@/views/searchadvanced/SearchPersonalDetail.vue");
    //     break;
    //   //Popup bộ lọc màn tra cứu
    //   case "SearchAdvancedPopup":
    //     component = import("@/views/searchadvanced/SearchAdvancedPopup.vue");
    //     break;
    //   /**
    //    * Chi tiết tập thể trong tab tập thể trong chi tiết hồ sơ thẩm định
    //    * NMTUAN3 21/1/2022
    //    */
    //   case "CommendationValuation_TeamDetail":
    //     component = import(
    //       "@/views/commendation/commendationprofile/popup/TeamDetail.vue"
    //     );
    //     break;
    //   /**
    //    * Chi tiết cá nhân trong tab cá nhân trong chi tiết hồ sơ thẩm định
    //    * NMTUAN3 21/1/2022
    //    */
    //   case "CommendationValuation_PersonalDetail":
    //     component = import(
    //       "@/views/commendation/commendationprofile/popup/PersonalDetail.vue"
    //     );
    //     break;

    //   /**
    //    * Màn hình lấy hồ sơ từ QLCB
    //    * NMTUAN2 14.02.2022
    //    */
    //   case "QLCBEmployeeTabList":
    //     component = import(
    //       "@/views/dictionary/employee/QLCB/QLCBEmployeeTabList.vue"
    //     );
    //     break;

    //   /**
    //    * Popup từ chối hồ sơ thẩm định bình xét
    //    * NMTUAN3 15/2/2022
    //    */
    //   case "RejectionValuationProfile":
    //     component = import(
    //       "@/views/commendation/commendationprofile/popup/RejectionPopup.vue"
    //     );
    //     break;
    //   //Popup thêm đơn vị ở màn quyết định
    //   case "CommendationDetail_AddOrganization":
    //     component = import(
    //       "@/views/commendation/commendationdecision/popup/AddOrganization.vue"
    //     );
    //     break;
    //   //Popup thông báo cá nhân, tập thể chưa có danh hiệu hình thức
    //   case "ConfirmNonEmulationAndReward":
    //     component = import(
    //       "@/views/movement/votation/popup/ConfirmNonEmulationAndReward.vue"
    //     );
    //     break;
    //   // NMTUAN3 10/3/2022: Popup danh sách thông báo
    //   case "NotificationList":
    //     component = import(
    //       "@/views/notification/NotificationList.vue"
    //     );
    //     break;
    //   //Popup thông tin thuê bao - DLHuy 16.03.2022
    //   case "PopupLicense":
    //     component = import(
    //       "@/views/license/PopupLicense.vue"
    //     );
    //     break;
    //   case "FormRegisterMovementParam":
    //     component = import(
    //       "@/views/report/detail/FormRegisterMovementParam.vue"
    //     );
    //     break;
    //   //popup xem trước nội dung mẫu tùy chỉnh NTTHANH1 18/04/2022 
    //   case "PreviewCustomTemplate":
    //     component = import(
    //       "@/views/system/customtemplate/PreviewCustomTemplate.vue"
    //     );
    //     break;
    //   case "FormEmulationRegisterStatus":
    //     component = import(
    //       "@/views/report/detail/FormEmulationRegisterStatus.vue"
    //     );
    //     break;
    //   //popup lấy tham số báo cáo cho cá nhân, tập thể được đề nghị khen thưởng
    //   case "FormVotationProfileParam":
    //     component = import(
    //       "@/views/report/detail/FormVotationProfileParam.vue"
    //     );
    //     break;
    }
    return component;
  }

  /**
   * Lấy ra options để truyền sang form dialog quickAdd cho một số tình huống đặc thù
   */
  _customParam(type, options) { }

  /**
   * Show form popup
   */
  _show(type, component, owner, options, data) {
    const me = this;
    var promise = new Promise((resolve, reject) => {
      if (component) {
        let frm;
        // pvduy thêm đoạn này để xử lý có thể truyền data vào một popup đang show (Đã trao đổi với SA a BNĐức)
        if (options.single && me._visible[type]) {
          frm = me._visible[type];
          options._reshow = true;
          frm.show(data, options);
          return;
        }
        frm = commonFunction.renderDynamicElement(
          document.body,
          component,
          owner,
          {
            i18n,
            store,
          },
          true
        );
        if (frm) {
          //tracking để quản lý các popup đang hiển thị
          me._visible[type] = frm;
          if (owner) {
            frm.$$router = owner.$router;
            frm.$$route = owner.$route;
          }

          //khi đóng form chi tiết -> lắng nghe để giải phóng
          frm.$on("close", function () {
            //để timeout để đảm bảm event chạy xong hết rồi mới giải phóng form
            setTimeout(() => {
              document.body.removeChild(frm.$el);
              delete frm.ownerForm;
              delete frm.editMode;
              delete frm.active;
              delete frm.$$router;
              delete frm.$$route;

              frm.$destroy();
              delete me._visible[type];
            }, 10);

            //gọi hàm close nếu có
            if (options && typeof options.close === "function") {
              options.close();
            }
          });

          if (options) {
            //sự kiện dùng cho base quickSearch
            if (typeof options.searchSubmit === "function") {
              frm.$on("searchsubmit", options.searchSubmit);
            }

            if (typeof options.submit === "function") {
              frm.$on("submit", options.submit);
            }
          }

          frm.ownerForm = owner;
          if (options.mode) {
            frm.editMode = options.mode;
          }

          if (typeof frm.active === "boolean") {
            frm.active = true;
          }
          if (typeof frm.show === "function") {
            frm.show(data, options);
          }
        }
      }
    });
    return promise;
  }

  /**
   * render element vào target element
   * @param {HTMLElement} target vùng target để render
   * @param {Object} owner Form/Component gọi show
   * @param {EnumQuickAdd} type Loại popup
   * @param {} data Các trường thông tin mặc định cho đối tượng được mở form lên
   * @param {Object} options Các biến hỗ trợ điều khiền luồng
   * @public
   */
  append(target, owner, type, data, options, isAppendTarget) {
    var me = this,
      component = me._components[type];

    if (!type) {
      throw new Error("DEV: Vui lòng xem lại cấu hình popup.");
    } else {
      var promise;
      options = options ? options : {};
      me._customParam(type, options);

      if (!component) {
        component = me._loadComponent(type);

        if (component) {
          promise = new Promise((resolve, reject) => {
            var fnSuccess = function (module) {
              if (module) {
                var popupModule = module.default;
                if (popupModule) {
                  me._components[type] = popupModule;
                  me._append(
                    target,
                    popupModule,
                    owner,
                    options,
                    data,
                    isAppendTarget
                  ).then(
                    (record) => {
                      resolve(record);
                    },
                    function (error) {
                      reject(error);
                    }
                  );
                }
              }
            };

            var fnFailure = function (error) {
              commonFunction.handleException(error);
              reject(error);
            };

            component.then(fnSuccess, fnFailure);
          });
        }
      } else {
        promise = me._append(
          target,
          component,
          owner,
          options,
          data,
          isAppendTarget
        );
      }

      return promise;
    }
  }

  /**
   * render show
   */
  _append(target, component, owner, options, data, isAppendTarget) {
    var promise = new Promise((resolve, reject) => {
      if (owner && component) {
        let frm = commonFunction.renderDynamicElement(
          target,
          component,
          owner,
          {
            i18n,
            store,
          },
          isAppendTarget
        );
        if (frm) {
          //khi đóng form chi tiết -> lắng nghe để giải phóng
          frm.$on("close", function () {
            if (typeof options.close === "function") {
              options.close();
            } else {
              commonFunction.focusFirstControlInput(owner.$el);
            }

            target.removeChild(frm.$el);
            frm.$destroy();
          });

          //submit
          if (typeof options.submit === "function") {
            frm.$on("submit", options.submit);
          }

          frm.ownerForm = owner;
          if (options.mode) {
            frm.editMode = options.mode;
          }

          if (typeof frm.active === "boolean") {
            frm.active = true;
          }
          if (typeof frm.show === "function") {
            frm.show(data, options);
          }
        }
      }
    });

    return promise;
  }
}

export default new PopupUtil();
