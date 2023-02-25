import api from "@/apis/activities/activityAPI";
import Crud from "@/stores/base/crud-base";

var crud = new Crud("activityDetail", api);

const state = {
  ...crud.state,

  _config: {
    field: {
      key: "id",
      name: "id",
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
   * tvhien 10.06.2022
   */
   async getActivityByID(context, payload) {
    let res = null;

    try {
      res = await api.getActivityByID(payload);
    }
    finally {
    }

    return res;
  },

  /**
   * lấy danh sách các hoạt động
   * @param {*} context 
   * @param {*} payload 
   * @returns 
   * tvhien 11/06/2022
   */
  async getListActivities(context, payload) {
    let res = null;

    try {
      res = await api.getListActivities(payload);
    }
    finally {
    }

    return res;
  },

  async getListActivitiesJoin(context, payload) {
    let res = null;
    res = await api.getListActivitiesJoin(payload);
    return res;
  },

  async getListActivitiesFollow(context, payload) {
    let res = null;
    res = await api.getListActivitiesFollow(payload);
    return res;
  },

  /**
   * Tạo hoạt động
   * @param {*} context 
   * @param {*} payload 
   * @returns 
   * tvhien 22/10/2022
   */
  async createActivity(context, payload){
    let res = null;
    res = await api.createActivity(payload);
    return res;
  },

  /**
   * tham gia hoạt động
   * @param {*} context 
   * @param {*} payload 
   * @returns 
   * tvhien 27/11/2022
   */
  async joinActivity(context, payload){
    let res = null;
    res = await api.joinActivity(payload);
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
