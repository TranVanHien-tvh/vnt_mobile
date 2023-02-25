<template>
  <div
    class="ms-dropdown-item"
    @click="dropItemClick"
  >
    <slot />
  </div>
</template>
<script>
export default {
  name: "MsDropdownItem",
  methods: {
    dropItemClick(event) {
      const me = this;
      me.$parent.showDropdownMenu = false;
      me.$nextTick(() => {
        me.$emit("click", event);
      });
    }
  }
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msDropdownItem.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msDropdownItem.scss';
// }
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msDropdownItem.scss";
</style>