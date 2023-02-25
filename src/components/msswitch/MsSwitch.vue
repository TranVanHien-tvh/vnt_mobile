<template>
  <label class="ms-switch">
    <input
      type="checkbox"
      :value="value"
      :checked="value"
      :disabled="disabled"
      v-on="listeners"
    />
    <span class="checkmark">
      <span class="icon" />
    </span>
    <span v-if="text" class="ms-switch-text">{{ text }}</span>
  </label>
</template>
<script>
import msCheckbox from "@/components/mscheckbox/msCheckbox.vue";
/**
 * Kế thừa xử lý của checkbox chỉ đổi UI
 */
export default {
  name: "MsSwitch",
  extends: msCheckbox,
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msSwitch.scss";
</style>
