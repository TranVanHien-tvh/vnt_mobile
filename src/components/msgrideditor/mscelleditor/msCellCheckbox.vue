<template>
  <div
    class="ms-cell-editor checkbox"
    :class="[col.customCellClass]"
  >
    <ms-checkbox
      v-if=" typeof dataRow[col.dataField] !== 'undefined'"
      v-model="dataRow[col.dataField]"
      :value="dataRow[col.dataField]"
      size="small"
      :disabled="readOnly || !editable"
      @change="changeHandler"
    />
  </div>
</template>
<script>
import msCellInput from "./msCellInput";
export default {
  name: "MsCellCheckbox",
  extends: msCellInput,
  methods: {
    changeHandler(value) {
      const me = this;
      let metaData = {
        dataRow: me.dataRow,
        column: me.col,
        newValue: value,
        cell: me
      };
      me.$emit("change", metaData);
    }
  }
};
</script>

<style lang="scss" scoped>
.checkbox {
  text-align: center;
}
</style>

