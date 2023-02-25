<template>
  <label class="action-btn">
    <input
      type="checkbox"
      :checked="currentValue == valueChecked"
      @change="handleChange"
    />
    <div class="cover flex-center">
      <div
        v-if="icon"
        :class="['icon24 icon', icon, { active: currentValue == valueChecked }]"
      />
    </div>
  </label>
</template>
<script>
export default {
  props: {
    icon: {
      default: null,
      type: String,
    },

    value: {
      default: null,
    },

    valueChecked: {
      default: null,
    },

    valueUnChecked: {
      default: null,
    },
  },

  data() {
    return {
      currentValue: this.value,
    };
  },

  watch: {
    value() {
      this.currentValue = this.value;
    },
  },

  methods: {
    handleChange(event) {
      this.$emit(
        "input",
        event.target.checked ? this.valueChecked : this.valueUnChecked
      );

      this.$emit("change");
    },
  },
};
</script>
<style lang="scss">
@import "@/assets/scss/_variables.scss";

.action-btn {
  cursor: pointer;
  position: relative;

  input {
    position: absolute;
    opacity: 0;

    // &:checked + .cover {
    //   background-color: #2979ff;
    // }
  }

  .cover {
    color: #121212;
    border: 1px solid #e0e1ef;
    background: #fff;
    border-radius: 4px;
    width: 36px;
    height: 36px;
  }
}
</style>