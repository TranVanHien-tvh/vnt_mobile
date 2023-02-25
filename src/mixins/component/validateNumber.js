/**
 * Mixin xử lý validate number
 */
export const validateNumber = {
  methods: {
    /**
     * @override
     */
    validateRule(rule, value, editor) {
      const me = this;
      let res = true;
      
      switch (rule) {
        // pvduy 22/03/2021 thêm đoạn xử lý validate giá trị khác 0
        case "diffierentZero":
          res = me.validatediffierentZero(value);
          break;
        default:
          res = me.super("validateRule", rule, value, editor);
          break;
      }

      return res;
    },
    /*
     * validate khác không
     * pvduy 22/03/2021 
     */
    validatediffierentZero(value) {
      const me = this;
      if (value == undefined || value === null || value === "" || value <= 0) {
        return false;
      }
      else {
        return true;
      }
    },
  }
};
