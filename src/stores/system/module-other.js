import api from "@/apis/system/otherAPI";
import Crud from "@/stores/base/crud-base";

var crud = new Crud("other", api);

const state = {
  ...crud.state,

  _config: {
    field: {
      key: "OtherId",
      code: "OtherCode",
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
   async uploadUserAvatar(context, payload) {
    let res = await api.uploadUserAvatar(payload);

    return res;
  },

  async getProvinces(context, payload) {
    let res = await api.getProvinces(payload);

    return res;
  },

  async getDistricts(context, payload) {
    let res = await api.getDistricts(payload);

    return res;
  },

  async getWards(context, payload) {
    let res = await api.getWards(payload);

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
