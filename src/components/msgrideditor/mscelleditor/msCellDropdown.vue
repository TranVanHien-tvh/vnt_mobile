<template>
  <div class="ms-cell-editor dropdown">
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
    <ms-dropdown
      v-if="isSelected && !readOnly"
      ref="dropdown"
      class="  bg-white"
      type="button"
      btn-type="secondary"
      :animation="false"
      :title="dataRow[col.dataField]| formatData({formatType:col.formatType})"
    >
      <component
        :is="col.templateDropdown"
        ref="templateDropdown"
        :data-row="dataRow"
        v-bind="col.dropdownProperty"
        @close="closeDropdownMenu"
        @accept="acceptDropdownMenu"
        @tabend="$emit('next')"
      />
    </ms-dropdown>
  </div>
</template>
<script>
import msCellInput from "./msCellInput";
export default {
  name: "MsCellDropdown",
  extends: msCellInput,
  watch: {
    isSelected: {
      handler(newVal, oldVal) {
        const me = this;
        if (newVal == false) {
          me.validateCell();
          me.closeDropdownMenu();
        }
      }
    }
  },
  methods: {
    //Sự kiện click vào cell editor
    cellSelected() {
      const me = this;
      me.isSelected = true;
      me.$nextTick(() => {
        me.focusHandler();
      });
    },
    focusHandler(e) {
      const me = this;
      if (me.$refs.dropdown) {
        let col = me.col;
        if (
          me.$refs.templateDropdown &&
          typeof me.$refs.templateDropdown.afterShow == "function"
        ) {
          me.$refs.templateDropdown.afterShow();
        }
        if (
          me.$refs.dropdown.applyValidate &&
          typeof me.$refs.dropdown.applyValidate == "function"
        ) {
          me.$refs.dropdown.applyValidate(me. errorProvider.message);
        }
        me.$ms.commonFn.focusFirstControl(me.$el);
        setTimeout(() => {
          if (me.$refs.dropdown && !me.$refs.dropdown.showDropdownMenu) {
            me.$refs.dropdown.clickIcon();
            me.$nextTick(() => {
              me.$ms.commonFn.focusFirstControlInput(
                me.$refs.templateDropdown.$el
              );
            });
          }
        }, 100);
      }
    },
    closeDropdownMenu() {
      const me = this;
      if (me.$refs.dropdown) {
        me.isSelected = false;
        me.$refs.dropdown.closeDropdownMenu();
      }
    },
    acceptDropdownMenu(data) {
      const me = this;
      let col = me.col;
      me.$set(me.dataRow, col.dataField, data);
      let editor = me.col.__editor;
      if (editor) {
        if (typeof editor.reset === "function") {
          editor.reset();
        }
        if (typeof editor.setValue === "function") {
          editor.setValue(me.dataRow[col.dataField]);
        }
      }
      me.closeDropdownMenu();
      me.$emit("next");
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
::v-deep .ms-button-dropdown {
  text-align: start;
}
</style>

