<template>
  <div :title="displayName">
    <div class="movementName p-text-nowrap p-text-truncate">
      {{ displayName }}
    </div>
    <div class="movementNameDetail">
      {{ displayNameDetail }}
    </div>
  </div>
</template>

<script>
// Module
import { ModuleEmulationApproval } from "@/stores/module-const";
export default {
  name: "MsMovementNameRegister",
  props: {
    data: {},
    column: {},
  },

  computed: {
    displayName() {
      const me = this;
      return me.data[me.column.dataField];
    },

    /**
     * Hiển thị dòng custom của cột Tên phong trào
     * DLHuy 22.09.2021
     */
    displayNameDetail() {
      const me = this;

      // NTBAO thêm trường này để case có hiển thị hạn đăng ký không.
      let showRegisterDate = true;
      if (me.column.showRegisterDate != undefined) {
        showRegisterDate = me.column.showRegisterDate;
      }

      // Convert date
      let fromDate = me.$ms.commonFn.convertDateToString(
        new Date(me.data.FromDate)
      );
      let toDate = me.$ms.commonFn.convertDateToString(
        new Date(me.data.ToDate)
      );
      let registerDate = me.$ms.commonFn.convertDateToString(
        new Date(me.data.RegisterDate)
      );
      let registerText = showRegisterDate
        ? " - Hạn đăng ký: " + registerDate
        : "";

      // Result Text
      let resultText =
        "Thời gian diễn ra: " + fromDate + " - " + toDate + registerText;

      return resultText;
    },
  },
};
</script>

<style lang="scss" scoped>
.movementNameDetail {
  color: #616161;
  font-size: 13px;
}
</style>
