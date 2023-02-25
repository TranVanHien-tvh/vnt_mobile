<template>
  <div
    v-if="isShow"
    class="condition-container nofilter"
    :style="stylex"
  >
    <div
      v-if="isShowPin"
      @click="lockClick"
    >
      <div
        v-if="!isLock"
        class="lock"
      >
        {{ $t('i18nComponent.i18nHeaderOption.Pin') }}
      </div>
      <div
        v-else
        class="lock unlock"
      >
        {{ $t('i18nComponent.i18nHeaderOption.Unpin') }}
      </div>
    </div>
  </div>
</template>
<script>
import msThOptionBase from "@/components/msgridviewer/columnoption/msThOptionBase.js";
export default {
  name: "MsThOptionNoFilter",
  extends: msThOptionBase,
  props: {},
  data() {
    return {};
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msThOption.scss";
</style>
