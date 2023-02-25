<template>
  <div>
    <div v-if="data[column.dataField] == 1" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-InProcess" />
      </div>
      <div class="text text-InProcess">
        {{ $t("i18nEnum.IsMotive.Motive") }}
      </div>
    </div>
    <div v-else-if="data[column.dataField] == 0" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-NotInProcess" />
      </div>
      <div class="text text-NotInProcess">
        {{ $t("i18nEnum.IsMotive.NotMotive") }}
      </div>
    </div>
    <!-- <div v-else class="flex-row">
      <div class="icon">
        <div class="icon-image icon-Processed" />
      </div>
      <div class="text text-Processed">
        {{ $t("i18nEnum.IsMotive.Processed") }}
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
  name: "msIsMotive",
  props: {
    data: {},
    column: {},
  },
};
</script>

<style lang="scss" scoped>
.icon {
  background-color: rgba(252, 189, 189, 0);
  width: 16px;
  height: 16px;
  position: relative;
  margin-right: 3px;

  .icon-image {
    border-radius: 50%;
    width: 10px;
    height: 10px;
    overflow: hidden;
    position: absolute;
    top: 5px;
    left: 1px;
  }

  .icon-InProcess {
    background-color: #2979ff;
  }

  .icon-NotInProcess {
    background-color: #ff5722;
  }

  .icon-Processed {
    background-color: #9e9fab;
  }
}

// .text-InProcess {
//   color: #2979ff;
// }

// .text-NotInProcess {
//   color: #ff5722;
// }

.text-Processed {
  color: #9e9fab;
}
</style>
