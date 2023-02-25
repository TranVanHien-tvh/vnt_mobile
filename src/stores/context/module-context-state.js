export const defaultConfigState = {
  /**
   * Cờ đang xử lý
   */
  Loading: false,

  /**
   * Đã getting chưa
   * Nếu chưa thì sẽ điều hướng về màn hình getting
   */
  GettingStarted: false,

  /*
   * Trạng thái Collapse của left menu
   */
  LeftMenuCollapse: false,

  /**
   * Phiên làm việc
   */
  Context: {
    /**
     * ID đơn vị
     */
    OrganizationID: 1,
    /**
     * Ngôn ngữ hiện tại
     */
    Culture: "vi",

  },

  /**
   * Thông tin phân quyền
   * Key là subsystemCode, value sẽ là mảng string danh sách perrmission
   */
  Permission: {},

  /**
   * Thông tin thuê bao
   */
  License: {},

  /**
   * Thông tin tài khoản
   */
  User: {
    UserID: null
  },

  /**
   * Thông tin config
   */
  ConfigInfo: {
    CurrentDate: new Date(),
    CurrentDateText: ""
  },
  /**
   * Định dạng số
   */
  NumberFormat: {
    GeneralDecimalSeparator: ",",
    GeneralGroupSeparator: ".",
    QuantityDecimalDigits: 1,
    AmountDecimalDigits: 2,
    AmountOCDecimalDigits: 2,
    UnitPriceDecimalDigits: 1,
    UnitPriceOCDecimalDigits: 1,
    ExchangRateDecimalDigits: 2,
    CoefficientDecimalDigits: 2,
    AllocationDecimalDigits: 2
  },

  /**
   * Tùy chọn người dùng
   */
  OptionsData: {},

  /**
   * Thông tin đơn vị
   */
  Organization: {
    OrganizationID: 0,
    OrganizationName: "",
    AdministrativeLevel: 1,
    ParentID: 0
  }
};

export default {
  ...defaultConfigState
};
