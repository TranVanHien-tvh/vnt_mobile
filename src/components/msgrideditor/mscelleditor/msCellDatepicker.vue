<template>
  <div class="ms-cell-editor date">
    <div
      v-show="!isSelected || readOnly"
      :class="{'edit-disabled':readOnly,'ms-editor-text':editable}"
    >
      <div class="editor-display">
        <span>{{ dataRow[col.dataField]| formatData({formatType:col.formatType}) }}</span>
      </div>
      <div
        v-if="errorProvider.isValid"
        v-tooltip="{ content:errorProvider.message,classes:'error'}"
        class="icon-input float-right"
      >
        <div class="mi mi-20 mi-icon-error mr-2" />
      </div>
    </div>
    <div
      v-show="isSelected && !readOnly && editable"
      ref="editor"
      class="ms-editor  "
    />
  </div>
</template>
<script>
import msCellInput from "./msCellInput";
import msdatepicker from "@/components/msdatepicker/MsDatePicker.vue";
export default {
  name: "MsCellDatepicker",
  extends: msCellInput,
  methods: {
    /**
     * Hàm để lấy component cần sử dụng
     * @returns component được import để sử dụng
     * Created by LTDAT(30.06.2020)
     *  */
    getEditorControl() {
      return msdatepicker;
    },
    changeHandler(newVal, oldVal) {
      const me = this;
      let metaData = {
        dataRow: me.dataRow,
        column: me.col,
        newValue: newVal,
        oldValue: oldVal,
        cell: me
      };
      me.$emit("change", metaData);
    }
  }
};
</script>
<style lang="scss" scoped>
// .editor-display {
//   padding: 6px;
//   flex: 1;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   width: 50px;
//   overflow: hidden;
// }
</style>

