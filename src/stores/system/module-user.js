import api from "@/apis/system/userAPI";
import Crud from "@/stores/base/crud-base";

var crud = new Crud("user", api);

const state = {
  ...crud.state,

  _config: {
    field: {
      key: "UserId",
      code: "Email",
      name: "FullName",
    },
  },
  datas: [],
};

const getters = {
  ...crud.getters,
};

const actions = {
  ...crud.actions,

  /**
   * Lấy thông tin người dùng
   */
   async getUserInfo(context, payload) {
    let res = await api.getUserInfo(payload);

    return res;
  },

  /**
   * Lấy thông tin người dùng
   */
   async updateUser(context, payload) {
    let res = await api.updateUser(payload);

    return res;
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
