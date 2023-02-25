<template>
  <div
    v-tooltip="hasTooltip() ? internalText : null"
    class="ms-input ms-editor w-100"
  >
    <div
      class="flex-row border"
      :class="{ error: errorProvider.isValid||isErrorlogin, disabled: disabled }"
    >
      <div
        v-if="leftIcon"
        :class="['icon24 icon left', leftIcon]"
        :title="errorProvider.message"
      />

      <input
        ref="input"
        v-model="internalText"
        class="ms-input-item flex"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readOnly"
        :maxlength="maxLength"
        :class="{ disabled: disabled }"
        :customlogin="customLogin"
        v-on="listeners"
      />
      <div
        v-show="errorProvider.isValid && !isShowText"
        class="icon24 error error-icon"
        :title="errorProvider.message"
      />
      <div
        v-if="rightIcon == 'default-icon-right' && internalText != null && internalText != '' && !disabled && isRightIconDefault"
        :class="['icon24 icon right', rightIcon]"
        @mousedown="hideRightIconDefault"
      />
      <div
        v-if="rightIcon && rightIcon != 'default-icon-right'"
        :class="['icon24 icon right', rightIcon]"
        @click.prevent="toggleContext"
      />
    </div>
    <div
      v-if="errorProvider.isValid && isShowText"
      v-show="!isErrorlogin"
      class="error-text"
      :class="{ errorTextCustom: customLogin }"
    >
      <span v-if="customLogin" class="icon24 error-login" />{{
        errorProvider.message
      }}
    </div>
  </div>
</template>
<script>
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
import { validateText } from "@/mixins/component/validateText";
export default {
  name: "MsInput",
  extends: msBaseComponent,
  mixins: [validateText],
  props: {
    /**
     * V-model bắn ra ngoài binding 2 chiều
     */
    value: {
      default: null,
    },
    isErrorlogin: {
      default: false,
    },
    type: {
      default: "text",
      type: String,
    },
    /**
     * Hiện thị chũ mờ ở dưới ô input
     * Created by LTDAT(22.06.2020)
     */
    placeholder: {
      default: null,
      type: [Number, String],
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    //icon left
    leftIcon: {
      default: null,
      type: String,
    },
    //icon right
    rightIcon: {
      default: "default-icon-right",
      type: String,
    },
    //input chỉ đọc không cho nhập
    readOnly: {
      default: false,
      type: Boolean,
    },
    //Giới hạn nhập của ô input
    maxLength: {
      default: null,
      type: Number,
    },
    isShowText: {
      type: Boolean,
      default: true,
    },
    /*
     * Hàm show ra câu thông báo riêng theo từng trường hợp
     * pvduy 18/03/2021
     * ví dụ: customWarring {rules:'required', mes: 'Tài sản này là của pvduy'}
     */
    customWarring: {
      type: Object,
      default: null,
    },

    /**
     * Validate khi blur
     * @author NDHUY 06.01.2021
     */
    validateOnBlur: {
      type: Boolean,
      default: true,
    },

    //Thêm biến này để custom lại câu warning cho form Login - 11.01.2021
    customLogin: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      internalText: this.value,
      focused: false,
      displayValue: null,
      scrollWidth: 0,
      isRightIconDefault: false,
    };
  },
  computed: {
    listeners() {
      return {
        blur: (e) => {
          this.validate(this.internalText);
          this.onBlur(e);

          //Ẩn icon xóa bên phải NTTHANH1
          if(this.rightIcon == "default-icon-right") {
            this.isRightIconDefault = false;
          }
        },
        focus: (e) => {
          this.onFocus(e);

          // Hiện icon xóa bên phải NTTHANH1
          if(this.rightIcon == "default-icon-right") {
            this.isRightIconDefault = true;
          }
        },
        change: (e) => {
          this.$emit("change", this.internalText, e);
        },
        keydown: (e) => {
          // e.stopPropagation();
          this.$emit("keydown", e);
        },
      };
    },
    // hasTooltip() {
    // 	const me = this;
    // 	if (me.$refs.input && me.scrollWidth > me.$refs.input.offsetWidth) {
    // 		return true;
    // 	}
    // 	return false;
    // }
  },
  watch: {
    internalText: {
      handler(newVal, oldVal) {
        const me = this;
        me.$emit("input", newVal);
        if (me.validateOnBlur) {
          me.$nextTick(() => {
            this.validate(this);
          });
        }

        me.scrollWidth = me.$refs.input.scrollWidth;
      },
    },
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;
        me.setValue(newVal);
      },
    },
    disabled: {
      handler(newVal, oldVal) {
        if (newVal) {
          this.validate(this);
        }
      },
    },
  },
  methods: {
    hasTooltip() {
      const me = this;
      if (me.$refs.input && me.scrollWidth > me.$refs.input.offsetWidth) {
        return true;
      }
      return false;
    },
    //Sự kiện focus vào ô input
    onFocus(e) {
      const me = this;
      me.focused = true;
      me.$emit("focus", e);
    },
    //Sự kiên blur ra ngoài ô input
    onBlur(e) {
      const me = this;
      me.focused = false;
      me.$emit("blur", e);
    },
    //Reset lại giá trị về ban đầu
    reset() {
      const me = this;
      me.internalText = null;
      me.displayValue = null;
    },
    //Set giá trị cho ô input
    setValue(value) {
      const me = this;
      if (me.rules) {
        let listRules = me.rules.split("|");
        if (value && listRules.includes("phone")) {
          value = value.replace(/ /g, "").replace(/\./g, "");
        }
      }
      me.internalText = value;
    },

    /**
     * Sự kiện click vào rightIcon
     * DLHuy 11.01.2021
     */
    toggleContext(event) {
      const me = this;

      me.$emit("toggleContext", event);
    },

    /**
     * Sự kiện ấn chuột xuống vào icon xóa mặc định
     * NTTHANH1 24/03/2022
     */
    hideRightIconDefault(event) {
      const me = this;

      if(me.rightIcon == "default-icon-right") {
        me.internalText = "";
        me.displayValue = "";
        me.$emit("change", "", event);
        me.$emit("keydown", event);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msInput.scss";

</style>
