<template>
  <div
    class="ms-textarea ms-editor"
  >
    <div 
      class="flex-row border"
      :class="{'error':errorProvider.isValid,'disabled':disabled, error:warning}"
    >
      <textarea
        ref="input"
        v-model="internalText"
        class="ms-textarea-item flex"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength"
        :rows="rows"
        :readonly="readOnly"
        :style="styleCustom"
        v-on="listeners"
      />
      <div
        v-if="errorProvider.isValid && !isShowText"
        class="icon24 error error-icon"
      />
    </div>
    <div
      v-if="errorProvider.isValid"
      class="error-text"
    >
      {{ errorProvider.message }}
    </div>
  </div>
</template>
<script>
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
import { validateText } from "@/mixins/component/validateText";
export default {
  name: "MsTextarea",
  extends: msBaseComponent,
  mixins: [validateText],
  props: {
    styleCustom: {
      default: null,
      type: String
    },
    /**
     * V-model bắn ra ngoài binding 2 chiều
     */
    value: {
      default: null
    },
    /**
     * Hiện thị chũ mờ ở dưới ô input
     * Created by LTDAT(22.06.2020)
     */
    placeholder: {
      default: null,
      type: [Number, String]
    },
    disabled: {
      default: false,
      type: Boolean
    },
    //class chứa icon
    icon: {
      default: null,
      type: String
    },
    /**
     * Số dòng
     */
    rows: {
      default: 4,
      type: Number
    },

    // chỉ đọc không cho nhập
    readOnly: {
      default: false,
      type: Boolean
    },
    //ĐVThi 09/03/2021:  bổ sung Giới hạn nhập của ô input của TextArea
    maxLength: {
      default: null,
      type: Number
    },

  /**
   * Kiểm tra chỉ show text hay show cả icon
   */
    isShowText: {
      type: Boolean,
      default: true,
    },

    /*
     * True: show border đỏ khi focus
     NTDIE 15.02.2022
     */
    warning: {
      type: Boolean,
      default: false,
    },

  },
  data() {
    return {
      internalText: this.value,
      focused: false
    };
  },
  computed: {
    listeners() {
      return {
        blur: e => {
          this.validate(this.internalText);
          this.onBlur(e);
        },
        focus: e => {
          this.onFocus(e);
        },
        change: e => {
          this.$emit("change", this.internalText, e);
        }
      };
    }
  },
  watch: {
    internalText: {
      handler(newVal, oldVal) {
        const me = this;
        me.validate(newVal);
        me.$emit("input", newVal);
      }
    },
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;
        me.setValue(newVal);
      }
    }
  },
  methods: {
    //Sự kiện focus vào ô input
    onFocus(e) {
      const me = this;
      me.focused = true;
    },
    //Sự kiên blur ra ngoài ô input
    onBlur(e) {
      const me = this;
      me.focused = false;
    },
    //Reset lại giá trị về ban đầu
    reset() {
      const me = this;
      me.internalText = null;
    },
    //Set giá trị cho ô input
    setValue(value) {
      const me = this;
      me.internalText = value;
    },    
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msTextArea.scss";
</style>

