<template>
  <label :class="['ms-checkbox', { 'event-none': readOnly }, 'ms-editor']">
    <input
      type="checkbox"
      :value="value"
      class="ms-checkbox-control"
      :readOnly="readOnly"
      :checked="value"
      :disabled="disabled"
      v-on="listeners"
    >
    <span :class="['checkmark', { 'event-none': readOnly }]" />
    <span
      v-if="text"
      class="ms-checkbox--text text-black"
    >{{ text }}</span>
  </label>
</template>
<script>
export default {
  name: "MsCheckbox",
  props: {
    value: {
      type: [Boolean, Number],
    },
    text: {
      default: null,
      type: String,
    },
    disabled: {
      default: false,
      type: [Boolean, Function],
    },
    readOnly: {
      default: false,
      type: Boolean,
    },

    /**
     * Dữ liệu bind thêm vào để xác định control
     */
    extraData: {},
  },
  data() {
    return {
      focused: false,
    };
  },
  computed: {
    listeners() {
      const me = this;
      return {
        click: (event) => {
          me.$emit("click", event);
        },
        input: (event) => {
          me.$emit("input", !me.value, me.extraData);
        },
        change: (event) => {
                   
          me.$emit("change", me.value, me.extraData);
        },
        focus: (event) => {
          me.onFocus(event);
        },
        blur: (event) => {
          me.onBlur(event);
        },
      };
    },
  },
  methods: {
    onFocus(e) {
      const me = this;
      me.focused = true;
    },
    onBlur(e) {
      const me = this;
      me.focused = false;
    },
  },
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
//   @import "@/assets/scss/_sm-variables.scss";
//   @import "@/assets/scss/components/msCheckbox.scss";
// }
// @media screen and (min-width: 1367px) {
//   @import "@/assets/scss/_variables.scss";
//   @import "@/assets/scss/components/msCheckbox.scss";
// }
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msCheckbox.scss";
</style>