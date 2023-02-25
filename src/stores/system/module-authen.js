import api from "@/apis/system/authenAPI";
import Crud from "@/stores/base/crud-base";

var crud = new Crud("login", api);

const state = {
  ...crud.state,

  _config: {
    field: {
      key: "Email",
      name: "Email",
    },
  },
};

const getters = {
  ...crud.getters,
};

/**
 * Chứa các hàm action
 */
const actions = {
  ...crud.actions,

  /**
   * Đăng nhập
   * @param {*} context 
   * @param {*} payload 
   * @returns 
   * tvhien 10.11.2021
   */
  async login(context, payload){
      return await api.login(payload);
  },

  /**
   * Xử lý gửi mã OTP cho người dùng
   * @param {*} context 
   * @param {*} payload 
   * @returns 
   * npcuong 24.05.2022
   */
  async getOTP(context, payload){
    return await api.getOTP(payload);
  },

  /**
   * Kiểm tra xem số điện thoại có trong hệ thô ngs hay không
   * @param {*} context 
   * @param {*} payload 
   * @returns tvhien 27/08/2022
   */
  async checkPhone(context, payload){
    return await api.checkPhone(payload);
  },

  /**
   * Xác nhận đổi mật khẩu
   * @param {*} payload 
   * @returns 
   * tvhien 27/08/2022
   */
  async forgetPassword(context, payload){
    return await api.forgetPassword(payload);
  },

  /**
   * Đăng ký tài khoản
   * @param {*} context 
   * @param {*} payload 
   * @returns 
   */
  async signUp(context, payload){
    return await api.signUp(payload);
  }

};

const mutations = {
  ...crud.mutations,
};

export default {
  debug: process.env.NODE_ENV !== "production",
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
