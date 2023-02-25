/**
 * Mixin xử lý validate combobox
 */
export const validateCombobox = {
  methods: {
    /**
     * @override
     */
    validateRule(rule, value, editor) {
      const me = this;
      let res = true;

      switch (rule) {
        case "forceSelection":
          res = me.validateForceSelection(value, editor);
          break;
        case "notSelectParent":
          res = me.validateNotSelectParent(value, editor);
          break;

        default:
          res = me.super("validateRule", rule, value, editor);
          break;
      }

      return res;
    },
    validateForceSelection(value, editor) {
      const me = this;

      if (editor && editor.internalText) {
        //nếu là binding trên grid
        if (editor.$cell && editor.queryMode === "remote" && !editor.lastRequestParam) {
          return true;
        }

        let dataSource = editor.internalDataSource;

        //nếu là binding thì trả về true
        // pvduy 29/06/2021: sửa lỗi khi hủy form thêm mới trên combobox thì ko cảnh báo.
        if (editor.internalText === editor.initText && dataSource.length === 0 
          && (!me.forceSelection || me.internalValue)) {
          return true;
        }

        if (dataSource && dataSource.length > 0) {
          if(editor.value){
            return true
          }
          let valueText = editor.internalText;
          let typeAheadPointer = editor.filterIndexItemByText(valueText);
          if (
            typeAheadPointer != null &&
            typeAheadPointer != undefined &&
            typeAheadPointer >= 0
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return false
        }
      }
      return true;
    },
    /**
     * ĐVThi 05/02/2020: Validate bắt buộc chọn con, không được chọn cha
     */

    validateNotSelectParent(value, editor) {
      if (editor) {
        let item = editor.internalSelectedItem;
        if (item && item.hasOwnProperty("isParent") && item["isParent"]) {
          return false;
        }
      }
      return true;
    },
  }
};
