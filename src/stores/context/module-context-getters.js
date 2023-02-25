export default {
  ConfigInfo(state) {
    return state.ConfigInfo;
  },
  CurrentDate(state) {
    return state.ConfigInfo.CurrentDate;
  },
  NumberFormat(state) {
    return state.NumberFormat;
  },
  Culture(state) {
    return state.Context.Culture;
  },
  OptionsData(state) {
    return state.OptionsData;
  },
  Context(state) {
    return state.Context;
  },
  Loading(state) {
    return state.Loading;
  },
  User(state) {
    return state.User;
  },
  Permission(state) {
    return state.Permission;
  },
  LeftMenuCollapse(state) {
    return state.LeftMenuCollapse;
  }
};
