<!-- =========================================================================================
    Base cho ô number input
    Bao gồm các tính năng:
      + Tự động fomat loại tiền tệ, số lượng (có ngăn cách giữa các số phần nguyên và phân tách phần nguyên và phần thập phân)
      + Số tự động căn phải
      + Auto foucus
    Created by nnanh2 - 24/06/2019
========================================================================================== -->

<template>
  <div class="ms-number ms-editor w-100">
    <div
      class="flex-row border"
      :class="{ error: errorProvider.isValid, disabled: disabled }"
    >
      <input
        ref="input"
        v-bind="$attrs"
        :autofocus="autofocus"
        :step="step"
        :readonly="readOnly"
        :class="['ms-number-item flex', customCss]"
        :disabled="disabled"
        :tabindex="0"
        v-on="listeners"
        @keydown="upDownValue"
        @click="onInputClick"
        @focus="onInputFocus"
      />
      <div
        v-show="errorProvider.isValid && !isShowText"
        class="icon24 error error-icon"
        :title="errorProvider.message"
      />

      <div v-if="spin" class="ms-number-spin flex-column">
        <div class="flex spin up" @click="plus()" />
        <div class="flex spin down" @click="less()" />
      </div>
    </div>
    <div v-if="errorProvider.isValid && isShowText" class="error-text">
      {{ errorProvider.message }}
    </div>
  </div>
</template>

<script >
import AutoNumeric from "autonumeric";
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
import { validateNumber } from "@/mixins/component/validateNumber";

export default {
  name: "MsNumber",
  components: {},
  extends: msBaseComponent,
  mixins: [validateNumber],
  inheritAttrs: false,

  props: {
    value: {
      default: "",
      type: [String, Number],
    },
    //có cho phép show text validate bên dưới cell k
    isShowText: {
      type: Boolean,
      default: true,
    },
    /**
     * Cấu hình cho icon bên phải
     */
    hasCellButtons: {
      default: false,
      type: Boolean,
    },
    /**
     * Giá trị nhỏ nhất cho phép nhập
     */
    min: {
      default: -10000000000,
      type: [Number, String],
    },
    /**
     * Giá trị lớn nhất cho phép nhập
     */
    max: {
      default: 100000000000000,
      type: [Number, String],
    },
    /**
     * Tự động focus
     */
    autofocus: {
      default: false,
      type: [Boolean, String],
    },
    /**
     * Bước nhảy của giá trị
     */
    step: {
      default: 1,
      type: [Number, String],
    },
    /**
     * Chiều cao của input
     */
    height: {
      //chiều cao của ô input
      default: 30,
      type: [Number, String],
    },
    /**
     * Kích thước đường viền
     */
    borderSize: {
      default: "1px",
      type: String,
    },
    /**
     * Kích thước đường viền
     */
    customCss: {
      default: "",
      type: String,
    },
    /**
     * Tiêu đề của control
     */
    title: {
      type: String,
    },
    /**
     * Diễn giải thêm cho control
     */
    tooltip: {
      type: String,
    },
    /**
     * Title dành riêng cho việc xử lý validation trên grid (do không muốn show title lên)
     */
    titleValidation: {
      type: String,
    },
    /**
     * Trường bắt buộc nhập
     * Mặc định false
     */
    required: {
      type: Boolean,
      default: false,
    },
    /**
     * Kí hiệu cảnh báo trường bắt buộc nhập không được bỏ trống
     */
    textRequired: {
      type: String,
      default: "*",
      required: false,
    },
    /**
     * Có hiển thị ký tự required ra không
     */
    requiredVisible: {
      type: Boolean,
      default: false,
    },
    /**
     * Các rule phục vụ cho validate control
     */
    rules: {
      type: [Object, String],
      default: "",
    },
    /**
     * id của validator provider
     */
    vid: {
      type: String,
    },
    /**
     * Cho phép hiển thị số 0 ở đầu
     * [`allow`, `deny`, `keep`]
     * Mặc định là allow: Cho phép nhập nhưng sẽ mất khi focus ra bên ngoài
     */
    leadingZero: {
      type: String,
      default: "allow",
    },
    /**
     * Cờ bật tắt icon tăng giảm giá trị của number
     */
    spin: {
      type: Boolean,
      default: false,
    },
    /**
     * Format giá trị theo tùy chọn của hệ thống
     */
    formatType: {
      type: [Number, String],
      default: 0,
    },
    /**
     * Cho phép hiển thị đầy đủ số lượng phần thập phân
     */
    allowDecimalPadding: {
      type: Boolean,
      default: true,
    },
    /**
     * Cho phép phân tách các kí tự phần nguyên với nhau
     */
    allowDigitGroupSeparator: {
      type: Boolean,
      default: true,
    },
    /**
     * Set giá trị default của number khi người dùng không set giá trị
     */
    emptyInput: {
      type: Boolean,
      default: false,
    },
    /**
     * Cho phép có giá trị là null/undefined mà không phải set mặc định là 0
     * @author NVLAM 28.02.2020
     */
    isNullable: {
      type: Boolean,
      default: true,
    },
    readOnly: {
      default: false,
      type: Boolean,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    decimalPlaces: {
      default: 0,
      type: Number,
    },
    /*
     * Hàm show ra câu thông báo riêng theo từng trường hợp
     * pvduy 19/05/2021
     * ví dụ: customWarring {rules:'required', mes: 'Tài sản này là của pvduy'}
     */
    customWarring: {
      type: Object,
      default: null,
    },

    /**
     * validate khi blur
     */
    validateOnBlur: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      focused: false,
      // numberInput: this.value == null?'':this.value.toString(),
      // autoNumeric: null,
      // width: '',
    };
  },

  computed: {
    listeners() {
      return {
        ...this.$listeners,
        input: (evt) => {
          //  this.$emit("input", evt.target.value);
          this.onInput();
        },
        change: (evt) => {
          this.$emit("change", this.getValue(), evt);
        },
        blur: (event) => {
          this.onBlur();
          this.focused = false;
          this.$emit("blur", this.getValue(), event);
        },
        keydown: (event) => {
          // event.stopPropagation();
          this.$emit("keydown", event);
        },
        keyup: (event) => this.$emit("keyup", event),
        focus: (event) => {
          this.selectOnClick = true;
          // pvduong1 - 06/04/2020 - Khi focus vào thì select all dữ liệu trong controll
          event.target.select();
          this.focused = true;
          this.$emit("focus", event);
          this.changeFocus(true);
        },
        click: (evt) => {
          // this.selectAllTextWhenClick(this.$refs.input);
        },
        "autoNumeric:rawValueModified": this.updateVModel,
      };
    },
    boderInput() {
      return {
        border: `${this.borderSize} solid rgb(186, 190, 197)`,
      };
    },

    /**
     * @returns {Object}
     */
    anInfo() {
      return {
        value: this.value,
        numberFormat: this.$ms.session,
      };
    },
  },

  watch: {
    /**
     * Sửa lại watch theo value theo hướng dẫn của anh bnduc
     * @author pcminh 13.05.2020
     */
    value(newValue, oldValue) {
      const me = this;
      if (
        // Make sure this is only called when the value is set by an external script, and not from a user input
        me.getValue() !== newValue &&
        // Compare the 'newValue' with the current 'oldValue' so we do not `set` it again if it's not needed
        newValue !== oldValue
      ) {
        // The modification comes from a script, so we need to reformat the new value `newValue.value`
        if (typeof newValue === "undefined" || newValue === null) {
          me.autoNumeric.clear();
        } else {
          me.autoNumeric.set(newValue);
        }
      }

      // if (me.typing){
      me.$emit("changeValue", newValue, oldValue, me);
      // }
    },
  },

  mounted() {
    // Initialize the autoNumeric element

    let me = this,
      options = me.initOptions();
    if (me.emptyInput) {
      options.emptyInputBehavior = "zero";
    }
    //bỏ đi để control trên grid khi alt+tab xem số liệu ở chỗ khác quay lại thì bị select all text
    options.selectOnFocus = false;
    me.autoNumeric = new AutoNumeric(me.$refs.input, options);

    if (
      this.value !== null &&
      this.value !== "" &&
      typeof this.value !== "undefined"
    ) {
      this.autoNumeric.set(this.value);
      // The `v-model` must be updated with that default value on startup
      this.updateVModel();
    }
  },

  /**
   * Chuyển một số biến không cần reactive vào đây để tối ưu
   */
  created() {
    const me = this;

    /**
     * Cờ xác định có phải người dùng đang thực hiện typing trên control hay không
     */
    me.typing = false;
    me.valid = false;
    me.autoNumeric = null;
  },
  methods: {
    // Sự kiện blur
    blurHandler(valid, errors) {
      let me = this;
      if (!valid) {
        this.$emit("validationError", errors);
      }
      this.changeFocus(false);
    },
    /**
     * Thay đổi trạng thái focus
     */
    changeFocus(booleanx) {
      this.focused = booleanx;
    },
    /**
     * Thực hiện focus vào ô input number
     */
    focusInput() {
      this.$refs.input.focus();
    },
    /**
     * Sau sẽ bổ sung thêm DataType (Số tiền, Số lượng, tỷ lệ,...) để xác định đúng định dạng
     * Việc khởi tạo này sau này sẽ để 1 object mặc định trên session để tối ưu
     */
    initOptions() {
      let me = this;
      let options = {
        allowDecimalPadding: me.allowDecimalPadding, //Cho phép hiển thị đầy đủ số lượng phần thập phân
        decimalCharacter: ",", //Kí tự phân tách phần nguyên với phần thập phân
        digitGroupSeparator: ".", //Kí tự phân tách phần nguyên với nhau
        decimalCharacterAlternative: ".",
        negativePositiveSignPlacement: "p", //set vị trí dấu âm: [p - prefix, s - suffix, r - right, l - left]
        // emptyInputBehavior : 'zero', //set giá trị hiển thị mặc định khi number ko có giá trị là 0
        modifyValueOnWheel: "false", //hỗ trợ có lăn chuột thay đổi giá trị hay không
        // currencySymbol: sessionObj.CurrencySymbol,
        currencySymbolPlacement: "s", //vị trị đặt dấu tiền tệ
        // roundingMethod: 'U',
        maximumValue: me.max,
        minimumValue: me.min,
        leadingZero: me.leadingZero, //cho phép giữ số 0 ở đầu
      };
      if (me.allowDigitGroupSeparator === false) {
        options.digitGroupSeparator = "";
      }
      options.decimalPlaces = me.decimalPlaces;
      return options;
    },

    /**
     * Update the v-model value and make the parent aware of that change.
     *
     * @param {Event} event This is needed if we want to use the `event.timeStamp` attribute
     */
    updateVModel(event) {
      let me = this;
      if (me.autoNumeric != null) {
        let value = me.getValue();
        me.$emit("input", value, event);
        me.$nextTick(() => {
          this.validate(this);
        });
        // me.$emit('change', value, event);
      }
    },

    upDownValue(e) {
      let me = this;
      if (me.spin) {
        if (event.keyCode === 38) {
          event.preventDefault();
          this.plus();
        }
        if (event.keyCode === 40) {
          event.preventDefault();
          this.less();
        }
      } else {
        if (me.isGridEditor) {
          let el = me.$refs.input;
          if (
            el.selectionStart == 0 &&
            el.selectionEnd == el.value.length &&
            (e.which == 39 || e.which == 37)
          ) {
            let readonly = el.readOnly;
            if (!el.readOnly) {
              el.readOnly = true;
            }
            setTimeout(function () {
              el.readOnly = readonly;
            });
          }
        }
      }
    },
    plus() {
      //disable thì không làm gì
      if (this.disabled) {
        return;
      }

      this.changeFocus(true);
      let me = this;
      let value = me.getValue();
      if (!value) {
        value = 0;
      }
      value = parseInt(value);
      if (value < me.max) {
        value += me.step;
        // if (value < 10) {
        // 	value = '0' + value;
        // }
        me.autoNumeric.set(value);
        me.updateVModel();
        me.$nextTick(() => {
          this.$emit("change", me.getValue(), event);
        });
      }
    },
    less() {
      //disable thì không làm gì
      if (this.disabled) {
        return;
      }

      this.changeFocus(true);
      let me = this;
      let value = me.getValue();
      if (!value) {
        value = 0;
      }
      value = parseInt(value);
      if (value > me.min) {
        value -= me.step;
        // if (value < 10) {
        // 	value = '0' + value;
        // }
        me.updateVModel();
        me.$nextTick(() => {
          this.$emit("change", me.getValue(), event);
        });
      }
      me.autoNumeric.set(value);
    },
    /**
     * Lấy giá trị của control
     */
    getValue() {
      const me = this;
      if (!me.isNullable || me.autoNumeric.rawValue) {
        // if(this.value && this.value.toString().split('.')[1] && this.value.toString().split('.')[1].length > FormatUtil.getDecimalDigitByFormatType(me.formatType))
        // {
        // 	me.autoNumeric.set(this.value);
        // 	return this.value;
        // }
        return me.autoNumeric.getNumber();
      }
    },
    /**
     * Gán giá trị vào control
     */
    setInternalValue(value) {
      let me = this;
      me.autoNumeric.set(value);
      me.updateVModel();
    },
    /**
     * Sự kiện người dùng gõ vào ô input (dùng để bật cờ typing)
     */
    onInput() {
      this.typing = true;
    },

    onBlur() {
      const me = this;
      this.typing = false;

      if (me.internalText != "") {
        if (me.validateOnBlur) {
          me.$nextTick(() => {
            me.validate(me);
          });
        }
      }
      // me.autoNumeric.set(me.value);
    },
    setValue(value) {
      const me = this;

      if (me.$refs.input) {
        me.$refs.input.value = null;
      }

      if (me.autoNumeric && typeof value !== "undefined" && value != null) {
        me.setInternalValue(value);
      } else {
        me.innerValue = value;
        me.value = value;
        me.autoNumeric.rawValue = value || null;
      }
    },
    onInputClick() {
      // this.selectAllTextWhenClick(this.$refs.comboInput);
    },
    onInputFocus() {
      // this.trackFocus();
    },
  },
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msNumber.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msNumber.scss';
// }
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msNumber.scss";
</style>
