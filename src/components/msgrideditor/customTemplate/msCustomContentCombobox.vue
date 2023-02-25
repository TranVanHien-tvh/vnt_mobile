<!-- =========================================================================================
	template custom cho mscellcombobox đang có yêu cầu hiển thị màu sắc
    TDNGHIA 10/10/2021
========================================================================================== -->

<template>
  <div :class="getCustomClass || ''">
    {{ dataRow[col.displayField] }}
  </div>
</template>

<script>
import commonFn from "@/commons/commonFunction";

export default {
  name: "MsCustomContentCombobox",
  props: {
    dataRow: {},
    col: {},
  },

  computed: {
    /**
     * Hiển thị dòng nội dung chính in đậm
     */
    getCustomClass() {
      const me = this;
      let cls = "";

      // switch (me.col.editorProperty.propsData.comboName) {
      //   case "Emto":
      //     cls = "red-text";
      //     break;

      //   default:
      //     break;
      // }

      switch (me.dataRow[me.col.dataField]) {
        case 2:
          cls = "red-text";
          break;
        case 1:
          cls = "green-text";
          break;
        case 3:
          cls = "black-text";
          break;
        default:
          break;
      }
      return cls;
    },
  },
};
</script>

<style lang="scss" scoped>
.red-text {
  color: #ff6565;
  font-weight: 900;
  width: 30px;
  margin: 0px auto !important;
}
.green-text {
  color: #00c853;
  font-weight: 900;
  width: 30px;
  margin: 0px auto !important;
}
.black-text {
  color: #182d4b;
  font-weight: 900;
  width: 30px;
  margin: 0px auto !important;
}
</style>
