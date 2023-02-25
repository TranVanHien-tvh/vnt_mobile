<template>
  <div class="ms-cell-editor combobox">
    <div
      v-show="!isSelected || readOnly"
      :class="{ 'edit-disabled': readOnly, 'ms-editor-text': editable }"
    >
      <div
        class="editor-display"
        :class="[`text-${col.align || 'left'}`]"
        :title="dataRow[col.displayField] | formatNull"
      >
        <component
          :is="col.editorProperty.propsData.template"
          v-if="col.editorProperty.propsData.template"
          :col="col"
          :dataRow="dataRow"
        />
        <span v-else>{{
          dataRow[col.displayField]
            | formatData({ formatType: col.formatType, enumName: col.enum })
        }}</span>
      </div>
      <div
        v-show="errorProvider.isValid && !isShowText && !readOnly"
        class="icon-input float-right"
      >
        <!-- v-tooltip="{ content: errorProvider.message,classes:'error',placement:col.tooltipPlacement}" -->
        <div
          class="icon24 error error-icon mi-icon-error"
          :title="errorProvider.message"
        />
      </div>
    </div>
    <div v-show="isSelected && !readOnly" ref="editor" class="ms-editor" />
  </div>
</template>
<script>
import msCellInput from "./msCellInput";
import msCombobox from "@/components/mscombobox/msCombobox.vue";
export default {
  name: "MsCellCombobox",
  extends: msCellInput,
  props: {
    //có cho phép show text validate bên dưới cell k
    isShowText: {
      type: Boolean,
      default: false,
    },
    isLazyLoad: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formatNull: "-",
    };
  },
  computed: {},
  watch: {
    "col.editorProperty.propsData.data": {
      handler(after, before) {
        const me = this;
        if (me.col.__editor && me.col.__editor.$props.data !== after) {
          me.col.__editor.$props.data = after;
        }
      },
    },
    "col.editorProperty.propsData.pageTotal": {
      handler(after, before) {
        const me = this;
        if (me.col.__editor) {
          if (
            me.col.__editor.$props &&
            me.col.__editor.$props.pageTotal !== after
          ) {
            me.col.__editor.$props.pageTotal = after;
          }
        }
      },
    },
    "dataRow.AssetID": {
      immediate: true,
      handler(after, before) {},
    },
  },
  created() {
    const me = this;

    if (me.col.getDataFromField) {
      let watchName = "dataRow." + me.col.getDataFromField;
      me.$watch(watchName, function (newVal, oldVal) {
        if (me.col.__editor) {
          me.col.__editor.data = newVal;
        }
      });
    }
  },
  methods: {
    getEditorControl() {
      return msCombobox;
    },
    customEditProperty(editorProperty) {
      const me = this;

      if (editorProperty) {
        let props = editorProperty.propsData;

        props.isShowText = false; // không show text error như ở form control mà ẩn đi và show tooltip
        if (me.col.getDataFromField) {
          props.data = me.dataRow[me.col.getDataFromField];
        }
      }
    },
    //Hàm xử lý trước khi edit reset lại các giá trị trong editor cũ
    //Created by LTDAT(17.06.2020)
    beforeEdit(editor) {
      const me = this;

      let dataRow = me.dataRow,
        col = me.col;
      let editorProperty = me.getEditorProperty(),
        props = editorProperty.propsData;
      if (editor) {
        // if(typeof editor.reset === 'function')
        // {
        //   editor.reset();
        // }
        if (props.mapValueField && typeof editor.setValue === "function") {
          editor.setValue(me.dataRow[col.dataField]);
        }
        if (
          me.col.displayField &&
          typeof editor.setInternalText === "function"
        ) {
          editor.setInternalText(me.dataRow[me.col.displayField]);
        }
        if (col.getDataFromField && typeof col.getDataFromField == "function") {
          editor.data = dataRow[col.getDataFromField];
        }
        if (editor.applyValidate && typeof editor.applyValidate == "function") {
          me.$nextTick(() => {
            editor.applyValidate(me.errorProvider.message);
          });
        }
      }
      me.$emit("rowSelected", me.dataRow);
    },
    //Hàm custom thêm sự kiện cho control
    //Created by LTDAT(18.06.2020)
    addCustomHandler(editor) {
      const me = this;

      editor.$on("selected", me.directEventSelected);
      editor.$on("loadData", me.loadData);
    },
    loadData(payload) {
      const me = this,
        editorProperty = me.getEditorProperty(),
        props = editorProperty.propsData,
        metaData = {
          dataRow: me.dataRow,
          column: me.col,
        };

      if (typeof props.loadData === "function") {
        props.loadData(payload, metaData);
      } else {
        me.$emit("loadDataCombo", payload, metaData);
      }
    },
    directEventSelected() {
      let me = this,
        col = me.col,
        editor = me.col.__editor;

      if (editor) {
        editor.$cell.selectedHandler(...arguments);
      }
    },
    selectedHandler(data) {
      const me = this;

      let col = me.col;
      if (data.newData) {
        me.$set(
          me.dataRow,
          me.col.dataField,
          data.newData[me.col.editorProperty.propsData.valueField]
        );
        if (me.col.displayField) {
          me.$set(
            me.dataRow,
            me.col.displayField,
            data.newData[me.col.editorProperty.propsData.displayField]
          );
        }
      } else {
        me.$set(me.dataRow, me.dataField, null);
        if (me.col.displayField) {
          me.$set(me.dataRow, me.col.displayField, null);
        }
      }
      let metaData = {
        dataRow: me.dataRow,
        column: col,
        ...data,
      };
      if (
        data &&
        data.hasOwnProperty("userAction") &&
        data.userAction === false
      ) {
      } else {
        me.$emit("selected", metaData);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.editor-display {
  padding: 6px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 50px;
  overflow: hidden;
  white-space: nowrap;
}
</style>