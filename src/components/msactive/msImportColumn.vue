<!-- =========================================================================================
	Component build content của cột thông tin trên phần mềm 
  popup nhập khẩu
  TDNGHIA 30/10/2021
========================================================================================== -->
<template>
  <div class="d-flex import-content" :title="fullText">
    <div class="import-column p-text-nowrap p-text-truncate d-flex">
      {{ displayName }}
    </div>
    <span class="required ml-1" v-if="dataRow.Required">*</span>
    <span class="sub-text ml-1" v-if="dataRow.SubText">{{
      `(${dataRow.SubText})`
    }}</span>
  </div>
</template>

<script>
export default {
  name: "msImportColumn",
  props: {
    dataRow: {},
    column: {},
    //Trạng thái tích chọn ở cột multiple
    isSelected: {
      default: false,
      type: Boolean,
    },
    rowIndex: {
      default: 0,
      type: Number,
    },
    colIndex: {
      default: 0,
      type: Number,
    },
    rowSelected: {
      default: null,
    },
  },

  data() {
    return {
      required: false,
    };
  },

  computed: {
    /**
     * Build text lên
     */
    displayName() {
      const me = this;

      return me.dataRow.Text;
    },

    /**
     * Build full text để làm title
     * NTDIEM 17.12.2021
     */
    fullText() {
      const me = this;
      let fullTextTitle = me.dataRow.Text.concat(
        me.dataRow.Required ? " *" : " ",
        me.dataRow.SubText ? `(${me.dataRow.SubText})` : ""
      );
      return fullTextTitle;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .sub-text {
  color: #707070;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
::v-deep .p-text-truncate {
  overflow: unset;
}

::v-deep .ml-1 {
  margin-left: 5px;
}
.import-content {
  max-width: 340px;
}
</style>
