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
export default {
  name: "MsEmulationName",
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

      let groupMotive,
        emulationType = "";

      //Cấp phát động
      switch (me.data.GroupMotive) {
        case 0:
          groupMotive = "Cấp Nhà nước";
          break;
        case 1:
          groupMotive = "Cấp Tỉnh/tương đương";
          break;
        case 2:
          groupMotive = "Cấp Huyện/tương đương";
          break;
        case 3:
          groupMotive = "Cấp Xã/tương đương";
          break;
      }

      //Loại phong trào
      switch (me.data.EmulationType) {
        case 0:
          emulationType = "Thường xuyên";
          break;
        case 1:
          emulationType = "Theo đợt";
          break;
      }

      return (
        "Loại phong trào: " + emulationType + " - Cấp phát động: " + groupMotive
      );
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
