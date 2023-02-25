<template>
  <div>
    <div v-if="!data[column.dataField]" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-active" />
      </div>
      <div class="text">
        {{ $t("i18nCommon.inuse") }}
      </div>
    </div>
    <div v-else class="flex-row">
      <div class="icon">
        <div class="icon-image icon-not-active" />
      </div>
      <div>{{ $t("i18nCommon.outuse") }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "msInUse",
  props: {
    data: {},
    column: {},
  },
};
</script>

<style lang="scss" scoped>
.icon {
  background-color: rgba(31, 31, 31, 0);
  width: 16px;
  height: 16px;
  position: relative;
  margin-right: 3px;
  .icon-image {
    border-radius: 50%;
    width: 8px;
    height: 8px;
    overflow: hidden;
    position: absolute;
    top: 5px;
    left: 1px;
  }
  .icon-active {
    background-color: #2979ff;
  }
  .icon-not-active {
    background-color: #9e9e9e;
  }
}
</style>


