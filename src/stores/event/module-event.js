import api from "@/apis/event/eventAPI";
import Crud from "@/stores/base/crud-base";

var crud = new Crud("event", api);

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
   * tvhien 04/02/2023
   */
  async eventRegister(context, payload){
    return await api.eventRegister(payload);
  },
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
