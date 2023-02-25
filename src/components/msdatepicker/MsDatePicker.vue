<template>
  <div ref="refWrap" class="ms-datepicker ms-editor">
    <div v-if="title && showTitle" class="combo-title flex">
      <div class="combo-title__text">
        {{ title }}
      </div>
    </div>
    <div
      ref="refParent"
      class="ms-container--datepicker flex-row border"
      :class="{ error: errorProvider.isValid, disabled: disabled }"
    >
          <div
        ref="icon"
        :class="[
          'ms-calendar',
          { disabled: disabled },
          { 'event-none': readOnly },
        ]"
        @click="toggleClick"
      />
      <input
        ref="input"
        class="ms-input--datepicker flex"
        :value="rawValue"
        :tabindex="0"
        :autofocus="autofocus"
        :disabled="disabled"
        :placeholder="placeholder"
        :class="{ disabled: disabled }"
        :readonly="readOnly"
        v-on="listeners"
      />
      <div v-if="errorProvider.isValid" class="icon24 error error-icon" />
    </div>

    <div v-if="errorProvider.isValid" class="error-text">
      {{ errorProvider.message }}
    </div>

    <div ref="datepickerContent" class="datepicker-content">
      <datepicker
        v-if="isShowDatePicker"
        ref="datepicker"
        v-model="valueDatePicker"
        :screen-x="0"
        :screen-y="0"
        class="datepicker"
        :min-date="minDate"
        :max-date="maxDate"
        @close.stop="updateDatePicker"
        @hide.stop="isShowDatePicker = false"
      />
    </div>
  </div>
</template>

<script>
`use strict`;
import Datepicker from "./Datepicker.vue";
import { IMaskDirective } from "vue-imask";
import IMask from "imask";
import msDateUtil from "./msDateUtil";
import moment from "moment";
import { setTimeout } from "timers";
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
import { ModuleContext } from "@/stores/module-const";
import { mapGetters } from "vuex";

/**
 * Regular kiểm tra có sử dụng thông tin giờ không?
 */
let regHourInfo = /[aAhHksSZ]/;

export default {
  name: "MsDatepicker",
  extends: msBaseComponent,
  inheritAttrs: false,
  // extends: MsBaseComponent,
  props: {
    autofocus: {
      type: Boolean,
      default: false,
    },
    value: {
      required: false,
      // default: new Date(),
    },

    /**
     * Theo chuẩn của momentJS
     * VD: Nếu có full datetime:
     *  - DD/MM/YYYY kk:mm:ss (20/01/2020 15:03:45)
     *  - DD/MM/YYYY kk:mm:ss A (20/01/2020 15:03:45)
     */
    format: {
      type: String,
      default: "DD/MM/YYYY",
    },

    placeholder: {
      type: String,
      default: "dd/mm/yyyy",
    },

    /**
     * Loại date picker
     * @values 'secondary'
     * Created by: pvduong1 - 15/10/2019
     */
    type: {
      type: String,
      default: "",
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    defaultTime: {
      type: String,
      default: null,
    },
    minDate: {},
    maxDate: {},

    // chỉ đọc không cho nhập
    readOnly: {
      default: false,
      type: Boolean,
    },
    //pvduy 17/03/2021: thêm prop rule để có thể custom ở ngoài form
    rules: {
      type: String,
      default: "",
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
    showTitle: {
      type: Boolean,
      default: false,
    },
    /**
     * Danh sách các trường dữ liệu lấy về
     */
    title: {
      type: String,
      default: null,
    },

    /**
     * Validate khi blur
     * NTDIEM 31/03/2022
     */
    validateOnBlur: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters(ModuleContext, ["ConfigInfo"]),
    listeners() {
      return {
        input: (e) => {
          if (e.target.value == "__/__/____" || !e.target.value) {
            this.$nextTick(() => {
              this.updateVModel(null);
            });
          }
        },
        change: (e) => {
          this.onChange(e);
        },
        focus: (e) => {
          this.onFocus(e);
        },
        blur: (e) => {
          this.onBlur(e);
        },
      };
    },
  },

  watch: {
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;

        if (typeof newVal == "string") {
          let newValDate = new Date(newVal);
          me.setDefaultTime(newValDate);
          me.updateVModel(newValDate, oldVal);

          if (newValDate) {
            //Thực hiện reset lại value datePicker
            me.valueDatePicker = newValDate;
          }
        } else {
          me.setDefaultTime(newVal);
          me.setRawValue(newVal);

          if (newVal) {
            //Thực hiện reset lại value datePicker
            me.valueDatePicker = newVal;
          }
        }
      },
    },
    rules: {
      handler(newVal, oldVal) {
        const me = this;
        me.validate(me);
      },
    },
  },

  data() {
    return {
      topx: 0,
      leftx: 0,
      focused: false,
      rawValue: "",
      valueDatePicker: this.value ? this.value : new Date(), // ngày thao tác với datepicker popup, định dạng Date
      isShowDatePicker: false,
    };
  },

  components: {
    Datepicker,
    // ValidationProvider
  },

  mounted() {
    const me = this;

    me.initPicker();
  },

  created() {
    const me = this;
  },

  beforeDestroy() {
    const me = this;
    me.isShowDatePicker = false;
    if (me.$refs.datepicker) {
      me.$refs.datepicker.$el.remove();
    }
  },
  methods: {
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

        // me.$refs.provider.applyResult({
        // 	errors: [message],
        // 	valid: false,
        // 	failedRules: {},
        // });
      });
    },
    setDefaultTime(value) {
      const me = this;
      if (me.defaultTime) {
        let splitTime = me.defaultTime.split(":");
        if (splitTime && splitTime.length == 3) {
          value.setHours(splitTime[0]);
          value.setMinutes(splitTime[1]);
          value.setSeconds(splitTime[2]);
        }
      }
    },
    /**
     * Tự đọng cập nhật ngày khi control đang nhập dở ngày
     */
    autoNomalizeValue(value, masked) {
      const me = this;
      if (!masked.unmaskedValue) {
        me.updateVModel(null, me.value, false);
      } else if (value && typeof value == "string" && masked) {
        if (!masked.isComplete && !masked.date) {
          let dte = me.nomalizeDateTime(value, masked);
          if (dte) {
            me.momentMask.value = msDateUtil.parseDateTimeToString(
              dte,
              me.format
            );
          }
          return dte;
        } else {
          return me.nomalizeDateTime(value, masked);
        }
      }
      return null;
    },

    /**
     * Cập nhật string vào control input phục vụ hiển thị
     */
    setRawValue(valueDte, force) {
      const me = this;
      // if (!me.typing || force) {
      // if (!valueDte) valueDte = me.innerValue;

      if (valueDte) {
        let ret = msDateUtil.parseDateTimeToString(valueDte, me.format);
        if (me.rawValue !== ret) {
          me.rawValue = ret;
        }
      } else {
        me.rawValue = null;
      }

      // bnduc: Nếu me.rawValue giá trị thì mới update
      if (me.momentMask && me.rawValue && me.momentMask.value != me.rawValue) {
        me.momentMask.value = me.rawValue;
      }
      // }
    },

    /**
     * Thực hiện chuẩn hóa DateTime từ string
     * @param {String/DateTime} str Chuỗi DateTime cần chuẩn hóa
     * @param {MaskedDate} masked Chuỗi DateTime cần chuẩn hóa
     */
    nomalizeDateTime(str, masked) {
      const me = this;
      try {
        if (str) {
          if (str instanceof Date) {
            return str;
          } else {
            if (masked && masked.rawInputValue) {
              let mo = masked.parse(masked.rawInputValue);
              if (mo && mo.isValid()) {
                let dte = mo.toDate(),
                  now = new Date();
                if (me.hasTimeInfo && dte && dte.getHours() == 0) {
                  dte.setHours(now.getHours());
                  dte.setMinutes(now.getMinutes());
                  dte.setSeconds(now.getSeconds());
                  dte.setMilliseconds(now.getMilliseconds());
                }

                if (dte < masked.min || dte > masked.max) {
                  dte.setFullYear(now.getFullYear());
                }

                return dte;
              }
            }
          }
        }
      } catch (ex) {
        me.$ms.log.handleException(ex);
      }
    },

    onFocus(e) {
      this.focused = true;
    },
    onBlur(e) {
      const me = this;

      this.focused = false;
      this.$emit("blur"); // pvduy 17/03/2021 emit sự kiện blur ra ngoài.

      if (me.internalText != "") {
        if (me.validateOnBlur) {
          me.$nextTick(() => {
            me.validate(me);
          });
        }
      }
    },

    // onInputClick() {
    // 	// this.selectAllTextWhenClick(this.$refs.input);
    // },
    toggleClick(e) {
      const me = this;

      //disable thì không làm gì
      if (me.disabled) {
        return;
      }

      me.isShowDatePicker = !me.isShowDatePicker;
      me.setPickerDisplay(".datepicker-content", true);
      me.updatePositionDropdownMenu();
    },
    /**
     * ẩn picker đi
     */
    setPickerDisplay(selector, value) {
      let pickers = document.querySelectorAll(selector);
      if (pickers && pickers.length > 0) {
        for (let i = 0; i < pickers.length; i++) {
          pickers[i].hidden = !value;
        }
      }
    },
    //Cập nhật lại tọa độ của dropdown menu
    //Created by LTDAT(13.06.2020)
    updatePositionDropdownMenu() {
      const me = this;
      let rectDropdownMenu = me.$refs.datepickerContent.getBoundingClientRect(),
        rectIcon = me.$refs.icon.getBoundingClientRect(),
        windowWidth =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth,
        windowHeight =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight;
      let widthDropdown = rectDropdownMenu.width ? rectDropdownMenu.width : 300;
      let heightDropdown = rectDropdownMenu.height
        ? rectDropdownMenu.height
        : 300;

      // me.$refs.datepickerContent.style.left =
      //   rectIcon.left + widthDropdown + 10 + 28 + "px";
          me.$refs.datepickerContent.style.left =
        rectIcon.left + 10 + 28 + "px";
      me.$refs.datepickerContent.style.top =
        rectIcon.top + rectIcon.height + 1 + "px";
    },
    onChange(e) {
      // this.inputIsFocus = false;
      const me = this,
        momentMask = me.momentMask,
        masked = momentMask ? momentMask.masked : null,
        value = me.$refs.input.value;

      /**
       * Chốt chặn xử lý auto Gen ngày tháng theo text đang nhập dở
       */
      let newVal = me.autoNomalizeValue(value, masked);
      if (newVal === undefined) {
        newVal = new Date();
        this.$emit("input", newVal);
      }
      me.$nextTick(() => {
        if (newVal) {
          if (me.minDate && newVal.getTime() < me.minDate.getTime()) {
            newVal = new Date(me.minDate);
            me.updateVModel(newVal);
          }
        }
      });
      if (me.rules) {
        me.validate(me);
      }
      this.$emit("change", newVal, me.oldDate);
      // this.typing = false;
    },
    /**
     * Sự kiện chọn từ popup DatePicker
     */
    updateDatePicker(e) {
      const me = this;
      //esc
      if (e && e.which == 27) {
        e.cancel = true;
      }
      me.isShowDatePicker = false;
      let value = me.valueDatePicker;
      if (me.format == "DD/MM/YYYY") {
        if (value instanceof Date) {
          value.setHours(0);
          value.setMinutes(0);
          value.setSeconds(0);
        }
      }
      me.updateVModel(value);
      me.$refs.input.focus();
    },

    /**
     * Xử lý cập nhật vào v-model nếu đã hoàn thành việc nhập liệu
     */
    maskInputComplete() {
      const me = this,
        momentMask = me.momentMask,
        masked = momentMask ? momentMask.masked : null;

      if (masked && masked.isComplete && masked.date) {
        let ret = masked.date.toDate(),
          retText = msDateUtil.parseDateTimeToString(ret, me.format),
          currentValue = msDateUtil.parseDateTimeToString(me.value, me.format);
        // if (retText != currentValue) {
        me.updateVModel(ret, me.value, true);
        // }
      }
    },

    /**
     * Thực hiện gán value vào MsDatePicker
     * @param {Date} newVal Giá trị cần cập nhật
     * @param {Date} oldVal Giá trị cũ
     * @param {Boolean} changeBinding Thay đổi do binding 2 chiều
     * @private
     */
    updateVModel(newVal, oldVal, changeBinding = true) {
      const me = this;

      if (newVal) {
        me.valueDatePicker = newVal;
      } else {
        me.valueDatePicker = new Date();
      }
      me.setRawValue(newVal);
      if (changeBinding) {
        me.$emit("change", newVal, me.oldDate);
      }
      me.$emit("input", newVal);
      me.$nextTick(() => {
        if (me.rules) {
          me.validate(me);
        }
      });
    },
    setValue(value) {
      const me = this;
      if (value) {
        me.valueDatePicker = value;
        me.oldDate = new Date(me.valueDatePicker);
      } else {
        me.valueDatePicker = new Date();
        me.oldDate = null;
      }
      if (typeof value == "string") {
        let newValDate = new Date(value);
        me.updateVModel(newValDate, me.value, false);
      } else {
        me.updateVModel(value, me.value, false);
      }
    },
    initPicker() {
      const me = this;
      document.body.appendChild(me.$refs.datepickerContent);
      let element = me.$refs.input,
        momentFormat = me.format,
        momentMask = IMask(element, {
          mask: Date,
          pattern: momentFormat,
          lazy: false,
          min: new Date(1000, 0, 1),
          max: new Date(9999, 0, 1),
          // autofix: true,

          format: function (date) {
            let ret = moment(date).format(momentFormat);
            return ret;
          },
          parse: function (str) {
            let ret = moment(str, momentFormat);
            return ret;
          },

          commit: me.momentMaskCommit,

          blocks: {
            YYYY: {
              mask: IMask.MaskedRange,
              from: 1,
              to: 9999,
            },
            MM: {
              mask: IMask.MaskedRange,
              from: 1,
              to: 12,
            },
            DD: {
              mask: IMask.MaskedRange,
              from: 1,
              to: 31,
              //maxLength: 2
            },
            HH: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 23,
              //maxLength: 2
            },
            kk: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 23,
              //maxLength: 2
            },
            mm: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 59,
              //maxLength: 2
            },
            ss: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 59,
              //maxLength: 2
            },
            A: {
              mask: IMask.MaskedEnum,
              enum: ["AM", "PM", "SA", "CH"],
            },
            a: {
              mask: IMask.MaskedEnum,
              enum: ["am", "pm", "sa", "ch"],
            },
          },
        });

      momentMask.on("complete", me.maskInputComplete);

      me.momentMask = momentMask;
    },
  },
};
</script>
<style>
/* @import '../../assets/css/iconfont.css'; */
</style>

<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msDatepicker.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msDatepicker.scss';
// }
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msDatepicker.scss";
</style>
