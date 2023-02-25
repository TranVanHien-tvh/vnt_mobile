import moment from "moment";
import commonFn from "@/commons/commonFunction";

export default {

  /**
   * Cập nhật context
   * @param {*} state
   * @param {*} payload
   */
  updateContext(state, payload) {
    let currentDate = moment(payload.CurrentDate).toDate();

    state.Context = {...payload.Context};
    state.User = {...payload.User};
    state.Permission = {...payload.Permission};
    state.License = {...payload.License};
    state.Organization = {...payload.Organization};
    state.ConfigInfo = {
      ...state.ConfigInfo,
      ...payload,
      CurrentDate: currentDate,
      CurrentDateText: moment(currentDate).format("YYYY-MM-DD HH:mm:ss")
    };

    commonFn.setLocalStorage("context", JSON.stringify(state.Context));
  },

  /**
  *  Lấy trạng thái collapse của left menu
  * @param {*} state
  * @param {*} payload
  */
  updateLeftMenuCollapse(state, payload) {
    state.LeftMenuCollapse = payload;
  },

  /**
   * Đánh dấu đã hoàn thành getting
   * @param {*} state
   */
  completeGetting(state) {
    let getting = {
      GettingStarted: true,
      SeenGetting: true
    };

    state.GettingStarted = getting;
    commonFn.setLocalStorage("GettingStarted", JSON.stringify(getting));
    window._getting = getting;
  }
};
