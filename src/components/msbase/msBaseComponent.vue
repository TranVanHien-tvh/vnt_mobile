<script>
import i18nValidate from "@/i18ns/vi/i18nValidate";
import { mixinSuper } from "@/mixins/common/mixinSuper";

export default {
  name: "MsBaseComponent",
  mixins: [mixinSuper],
  props: {
    readonly: {
      default: false,
      type: Boolean,
    },
    //rule dùng để validate control
    //Created by LTDAT(22.06.2020)
    rules: {
      type: String,
      default: null,
    },
    /**
     * Tên của control phục vụ việc hiện thị message cho validate
     * Created by LTDAT(22.06.2020)
     */
    name: {
      default: null,
      type: String,
    },
    /**
     * NNLAM 22/03/2021
     * prop kiểu hàm cho phép custom validate trên cell grid
     */
    customValidateRules: {
      type: Function,
      default: null,
    },
    /**
     * thuộc tính readOnly cho các form sử dụng có thể khai báo trực tiếp
     */
    readOnly: {
      type: Boolean,
      default: false,
    },

    /**
     * Thuộc tính disable control (bổ sung lên đây để dùng chung cho toàn bộ các component)
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      errorProvider: {},
    };
  },

  watch: {
    disabled: function() {
      if(this.disabled) {
        this.resetValidate();
      }
    }
  },

  computed: {
    isReadOnly: function () {
      return this.readOnly || this.readOnlyState;
    },
    isDisabled: function () {
      return this.disabled || this.disabledState;
    },
  },
  created() {
    const me = this;
  },
  mounted() {
    const me = this;
  },
  methods: {
    setPlacementTooltip() {
      const me = this;
      let placement = "bottom";
      let pos = me.$el ? me.$el.getBoundingClientRect() : {},
        windowWidth =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth;
      if (pos.right > windowWidth - 200) {
        placement = "bottom-end";
      }
      return placement;
    },
    getErrorProvider() {
      return this.errorProvider;
    },

    /**
     * Custom lại rule validate
     */
    customRuleValidateRules(rules) {},

    /**
     * Validate component sự kiện validate control
     * Created by LTDAT(22.06.2020)
     * mdofiy by ĐVThi 05/02/2020: Đáp ứng validate không cho phép chọn đối tượng cha
     * modify by nnlam 22/03/2021: custom lại trong trường hợp component là cell grid
     *
     *  */
    validate(editor) {
      const me = this;
      if (me.disabled) {
        me.errorProvider = {};
        return me.errorProvider;
      }
      let listRules = [],
        rulesValidate = null,
        ret = false,
        colRules = null,
        colField = null,
        isCell = false,
        titleCell = null,
        thisEditor = null;
      //check xem editor là msinput/msnumber... (gọi là control gốc) hay là mscellInput/msCellNumber.... (gọi chung là cell grid)
      if (editor && editor.col) {
        colRules = editor.col.rules;
        colField = editor.col.dataField;
        titleCell = editor.col.caption;
        isCell = true;
        if (editor.$refs.editor) {
          thisEditor = editor.$refs.editor.querySelector(".ms-editor");
          if (thisEditor && thisEditor.getVueInstance()) {
            thisEditor = thisEditor.getVueInstance();
            thisEditor.$data.col = editor.col;
          }
        }
      }
      if (me.rules || colRules) {
        listRules = me.rules ? me.rules.split("|") : colRules.split("|");
      }

      //cho các control custom lại rule validate
      me.customRuleValidateRules(listRules);

      for (let i = 0; i < listRules.length; i++) {
        let value = me.value;
        if (editor) {
          //ưu tiên lấy value theo control gốc
          if (editor.hasOwnProperty("internalValue")) {
            value = editor.internalValue;
          }
          if (typeof editor.getValue == "function") {
            value = editor.getValue();
          }
          //nếu không có value thì => đây là edit trên cell grid
          if (!value) {
            if (editor.dataRow) {
              value = editor.dataRow[colField];
            }
          }
        }
        
        ret = !me.validateRule(listRules[i], me.internalText || value, editor);
        if (ret) {
          rulesValidate = listRules[i];
          break;
        }
      }

      if (ret) {
        let label = me.name || me.title || titleCell || me.getValidateName();
        if (editor && editor.customMessage) {
          me.$set(me.errorProvider, "message", editor.customMessage);
        } else {
          if (i18nValidate.messages[rulesValidate]) {
            me.$set(
              me.errorProvider,
              "message",
              i18nValidate.messages[rulesValidate](label)
            );
          }
        }
        /*
         * Pvduy 18/03/2021: thêm đoạn xử lý custom lại message thông báo lỗi.
         */
        if (
          me.customWarring != null &&
          me.customWarring.rules == rulesValidate &&
          me.customWarring.mes != ""
        ) {
          me.errorProvider.message = me.customWarring.mes;
        }
        let element = null;
        if (me.$refs) {
          element = me.$refs.input;
        } else if (thisEditor && thisEditor.$refs) {
          element = thisEditor.$refs.input;
        } else {
          element = null;
        }
        me.$set(me.errorProvider, "isValid", true);
        let placement = me.setPlacementTooltip();
        me.$set(me.errorProvider, "placementTooltip", placement);
        me.$set(me.errorProvider, "rules", rulesValidate);
        me.$set(me.errorProvider, "element", element);
        //nếu là cell grid thì cần gán lại errorProvider cho control gốc để hiển thị validate
        if (isCell) {
          if (thisEditor) {
            thisEditor.errorProvider = editor.errorProvider;
          }
        }
      } else {
        me.errorProvider = {};
      }
      return me.errorProvider;
    },

    /**
     * Cập nhật lại trạng thái validate về ban đầu
     * Created by LTDAT(23.06.2020)
     */
    resetValidate() {
      const me = this;
      me.errorProvider = {};
    },

    /**
     * Thiết lập mesage khi dữ liệu rỗng
     *
     * Created by: pvduong1 - 18/09/2019
     * pvduy 14/05/2021: thêm đoạn xử lý kiểm tra trống mes thì ẩn cảnh báo.
     */
    setError(message) {
      const me = this;
      setTimeout(() => {
        if (message) {
          me.$set(me.errorProvider, "isValid", true);
          me.$set(me.errorProvider, "message", message);
          me.$set(me.errorProvider, "element", this);
        } else {
          me.$set(me.errorProvider, "isValid", false);
        }
      });
    },

    /**
     * Nếu control không khai báo name để hiển thị thông tin lỗi validate -> up parent find label
     */
    getValidateName() {
      let fn = function (el, c) {
        if (!el || c > 10) {
          return null;
        }

        let labelEl = el.querySelector("label");
        if (labelEl) {
          return (labelEl.innerText || "").replace("*", "");
        }

        return fn(el.parentNode, c + 1);
      };

      return fn(this.$el, 0);
    },
    validateRule(rule, value, editor) {
      const me = this;
      let res = true;
      switch (rule) {
        
        case "required":
          if (value) {
            //đề phòng người dùng nhập toàn dấu cách
            value = (value + "").trim();
          }
          res = me.validateRequired(value);
          break;
        case "errorlogin":
          if(value) {
            res = me.validateErrorLogin(value);
          }
          break;
        case "upToNow":
          if (value) {
            if (value > new Date()) {
              res = false;
            }
          }

          break;
        case "upToCurrentYear":
          if (value) {
            if (value > new Date().getFullYear()) {
              res = false;
            }
          }

          break;
        default:
          if (typeof me.customValidateRules == "function") {
            res = me.customValidateRules(rule, value, editor);
          } else if (
            me.$cell &&
            typeof me.$cell.customRuleValidateRules == "function"
          ) {
            res = me.$cell.customValidateRules(rule, value, editor);
          }
          break;
      }

      return res;
    },

    //Validate required
    validateRequired(value) {
      // return !!this.$refs.input.value;
      if (value === undefined || value === null || value === "") {
        return false;
      } else {
        return true;
      }
    },
    //Validate ErrorLogin
    validateErrorLogin(value) {
      if (value === "###") {
        return false;
      } else {
        return true;
      }
    },
    //-------------------------------------------

    applyValidate(message) {
      const me = this;
      if (message) {
        me.$set(me.errorProvider, "message", message);
        me.$set(me.errorProvider, "isValid", true);
        let placement = me.setPlacementTooltip();
        me.$set(me.errorProvider, "placementTooltip", placement);
        me.errorProvider.element = me.$refs.input;
      } else {
        me.errorProvider = {};
      }
    },
  },
};
</script>
<style lang="scss" scoped>
</style>

