import systemApi from "@/apis/system/systemAPI"
import commonFn from "@/commons/commonFunction";

export default {

  // /**
  //  * Lấy thông tin config cho client làm việc
  //  * @param {*} context
  //  */
  // async getContextData(context) {
  //   try {
      
  //     let res = await systemApi.getContextData();
  //     context.commit("updateContext", res);
  //   } catch (ex) {
  //     commonFn.errorLogging("Lỗi lấy thông tin config:: ", ex);
  //   }
  // },

  /**
  *  Lấy trạng thái collapse của left menu
  * @param {*} state
  * @param {*} payload
  */
  getLeftMenuCollapse(context, payload) {
    context.commit("updateLeftMenuCollapse", payload);
  },

  /**
   * Đánh dấu đã hoàn thành getting
   * @param {*} context
   */
  completeGetting(context) {
    context.commit("completeGetting");
  },

  /**
  * Đăng xuất
  */
  async logoff(context) {
    // await accountApi.logoff();
  }
};
