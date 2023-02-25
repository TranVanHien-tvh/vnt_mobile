<template>
  <label
    class="ms-radio"
    @keypress="keyDownActive"
    @focus="onFocus"
    @blur="onBlur"
  >
    <input
      v-model="value"
      type="radio"
      :name="name"
      :value="keyValue"
      :checked="value"
      :disabled="disabled"
      @input="$emit('input', keyValue)"
      @change="$emit('change', $event)"
    />
    <!-- <input  v-show="value != keyValue" :disabled="disabled"> -->
    <span class="checkmark" />
    <span
      v-if="text"
      @click="changeInput"
      class="ms-radio--text text-black"
      >{{ text }}</span
    >
  </label>
</template>
<script>
export default {
  name: "MsRadio",
  props: {
    value: {
      type: [Number, String, Boolean],
      default: null,
    },
    text: {
      default: null,
      type: String,
    },
    keyValue: {
      type: [Number, String, Boolean],
      default: null,
    },
    name: {
      default: null,
      type: String,
    },
    type: {
      default: "radio",
      type: String,
    },
    cssLabel: {
      default: null,
      type: String,
    },
    cssText: {
      default: null,
      type: String,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      focused: false,
    };
  },
  computed: {
    listeners() {
      return {
        ...this.$listeners,
      };
    },
    checkHasEvent() {
      let me = this;
      if (me.checked) {
        return true;
      }
      return false;
    },
  },
  watch: {},
  methods: {
    keyDownActive(e) {
      event.preventDefault();
      switch (e.which) {
        case 32:
        case 13:
          this.$emit("input", this.keyValue);
          this.$el.querySelector('input[type="radio"]').focus();
          break;
      }
    },
    onFocus(e) {
      const me = this;
      me.focused = true;
    },
    onBlur(e) {
      const me = this;
      me.focused = false;
    },

    /**
     * Thêm bắt sự kiện click vào text để thao tác tick, bỏ tick được
     * NTDIEM 14/12/2021
     */
    changeInput() {
      const me = this;
      this.$emit("input", this.keyValue);
      this.$emit("change", this.value);
      this.$el.querySelector('input[type="radio"]').focus();
    },
  },
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
//   @import "@/assets/scss/_sm-variables.scss";
//   @import "@/assets/scss/components/msRadio.scss";
// }
// @media screen and (min-width: 1367px) {
//   @import "@/assets/scss/_variables.scss";
//   @import "@/assets/scss/components/msRadio.scss";
// }
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msRadio.scss";
</style>
