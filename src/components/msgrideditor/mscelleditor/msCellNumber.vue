<template>
  <div class="ms-cell-editor number">
    <div
      v-show="!isSelected || readOnly || !editable || !cellEditable"
      key="show"
      class="flex-row flex show-value"
      :class="{ 'edit-disabled': readOnly, 'ms-editor-text': editable }"
      :title=" errorProvider.message"
    >
      <div class="editor-display text-right">
        <span>{{
          dataRow[col.dataField] | formatData({ formatType: col.formatType })
        }}</span>
      </div>
      <div
        v-show="errorProvider.isValid && !isShowText && !readOnly"
        class="icon24 error error-icon"
        :title=" errorProvider.message"
      />
    </div>

    <div
      v-show="isSelected && !readOnly && editable && cellEditable"
      ref="editor"
      key="editor"
      class="ms-editor flex-row flex"
      :class="{ error: errorProvider.isValid }"
      :title=" errorProvider.message"
    >
      <!-- <div class="icon24 error error-icon" v-show="errorProvider.isValid && isShowText"></div> -->
      <!--<div
        class="icon-input float-right"
        v-tooltip="{ content: errorProvider.message, classes: 'error' }"
        v-if="errorProvider.isValid"
      >
        <div
          :class="['icon24 icon left', leftIcon]"
          v-if="leftIcon"
          :title="errorProvider.message"
        ></div>

        <div class="mi mi-20 mi-icon-error mr-2"></div>
      </div>-->
    </div>
  </div>
</template>
<script>
import msCellInput from "./msCellInput";
import msNumber from "@/components/msnumber/msNumber.vue";
export default {
  name: "MsCellNumber",
  extends: msCellInput,
  props: {
    //có cho phép show text validate bên dưới cell k
    isShowText:{
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      errorProvider: {},
      cellEditable: true
    };
  },
  created() {
    const me = this;
    // if (!me.dataRow[me.col.dataField]) {
    //   me.$set(me.dataRow, me.col.dataField, 0);
    // }
  },
  methods: {
    /**
     * Hàm để lấy component cần sử dụng
     * @returns component được import để sử dụng
     * Created by LTDAT(30.06.2020)
     *  */
    getEditorControl() {
      return msNumber;
    },
    customBeforeEdit() {
      const me = this;
      // if (!me.dataRow[me.col.dataField]) {
      //   me.$set(me.dataRow, me.col.dataField, 0);
      // }
    }
  }
};
</script>
<style lang="scss" scoped>
.editor-display {
  flex: 1;
  padding: 0 6px;
}
</style>
