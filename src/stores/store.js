import Vue from "vue";
import Vuex, { createLogger } from "vuex";

Vue.use(Vuex);

// Global
import state from "./base/state";
import getters from "./base/getters";
import mutations from "./base/mutations";
import actions from "./base/actions";

// Module
import context from "./context/module-context";
import user from "./system/module-user";
import authen from "./system/module-authen";
import activityDetail from "./activities/module-activity-detail";
import other from "./system/module-other";
import event from "./event/module-event";

// Init instance of store
const store = new Vuex.Store({
  getters,
  mutations,
  state,
  actions,
  modules: {
    context,
    user,
    authen,
    activityDetail,
    other,
    event
  },
  strict: false,
});

export default store;
