<template>
  <div>
    <!-- Đang diễn ra -->
    <div v-if="data.MovementAction == 1" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-InProcess" />
      </div>
      <div class="text text-InProcess">
        {{ $t("i18nEnum.MovementAction.InProcess") }}
      </div>
    </div>

    <!-- Chưa diễn ra -->
    <div v-else-if="data.MovementAction == 0" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-NotInProcess" />
      </div>
      <div class="text text-NotInProcess">
        {{ $t("i18nEnum.MovementAction.NotInProcess") }}
      </div>
    </div>

    <!-- Đã kết thúc -->
    <div v-else-if="data.MovementAction == 2" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-Processed" />
      </div>
      <div class="text text-Processed">
        {{ $t("i18nEnum.MovementAction.Processed") }}
      </div>
    </div>

    <!-- Trường hợp PT theo đợt nhưng k lưu từ ngày, đến ngày => Không xác định -->
    <div v-else class="flex-row">
      <div class="text text-InProcess">-</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "msMovementAction",
  props: {
    data: {},
    column: {},
  },

  computed: {
    /**
     * Thời gian hiện tại
     * DlHuy 16.10.2021
     */
    currentTime() {
      const me = this;
      let currentTime = new Date().getTime();

      return currentTime;
    },

    /**
     * Thời gian bắt đầu
     * DLHuy 16.10.2021
     */
    fromDate() {
      const me = this;
      let fomrDate = me.data.FromDate.getTime();

      return fomrDate;
    },

    /**
     * Thời gian đến
     * DLHuy 16.10.2021
     */
    toDate() {
      const me = this;
      let toDate = me.data.ToDate.getTime();

      return toDate;
    },
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

// .text-Processed {
//   color: #9e9fab;
// }
</style>
