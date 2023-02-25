<template>
  <tr
    :class="['ms-tr']"
    @keydown="row_keydown"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
  >
    <!-- , { 'row-selected': isSelected } -->
    <td v-if="multiple" class="ms-td multiple-cell sticky">
      <ms-checkbox
        ref="multiple"
        :value="disabledCheckedMultipleTbody ? false : isSelected"
        :checked="isSelected"
        class="center"
        :disabled="disabledCheckedMultipleTbody"
        check-only
        @click="checkMultiple"
      />
    </td>
    <td
      v-if="serial"
      class="ms-td serial text-center"
      :class="{ sticky: hasLockColumn, 'big-row': growToHeight }"
    >
      {{ rowIndex + 1 }}
    </td>

    <td
      v-if="dataDragable"
      class="ms-td drag-data"
      :class="[{ 'big-row': growToHeight }]"
    >
      <div class="icon24 move" />
    </td>

    <td
      v-for="(col, colIndex) in columns"
      :key="col.dataField"
      class="ms-td"
      :style="styleWidth(col)"
      :class="[
        col.cssCellClass,
        col.dataField,
        { sticky: col.lock },
        { 'big-row': growToHeight },
      ]"
      @click="cell_click(col, colIndex)"
      @dblclick="cell_dblclick"
    >
      <!-- NTBAO: 21/09/2021: Bổ sung thêm option template này để có thể custom
      được template cho editor // v-else: Mặc định template theo col.type -->
      <component
        :is="col.template"
        v-if="col.template"
        :ref="`editor-${colIndex}`"
        :col="col"
        :data-row="dataRow"
        :row-index="rowIndex"
        :col-index="colIndex"
        :editable="editable"
        class="editor-display"
        :read-only="
          customReadOnly
            ? customReadOnly(col, dataRow, isSelected)
            : col.readOnly
        "
        :custom-validate-rules="customValidateRules"
        :row-selected="rowSelected"
        v-on="listeners"
      />
      <component
        :is="getEditorType(col)"
        v-else
        :ref="`editor-${colIndex}`"
        :col="col"
        :data-row="dataRow"
        :row-index="rowIndex"
        :col-index="colIndex"
        :editable="editable"
        :read-only="
          customReadOnly
            ? customReadOnly(col, dataRow, isSelected)
            : col.readOnly
        "
        :custom-validate-rules="customValidateRules"
        :row-selected="rowSelected"
        :title="titleToolTip(dataRow, col)"
        v-on="listeners"
      />
    </td>
    <td
      v-if="widgetOptions"
      class="ms-td widget-item"
      :style="styleWidth(widgetOptions)"
      :class="[widgetOptions.class, { 'big-row': growToHeight }]"
    >
      <component
        :is="widgetOptions.components"
        :form-used="widgetOptions.formUsed"
        :data-row="dataRow"
        @widgetEvent="widgetEvent"
      />
    </td>
    <div
      v-show="(showRowAction || customShowAction) && actionInline"
      ref="rowAction"
      class="row-actions"
      :style="rowActionStyle"
      :heightOffset="-2"
      :class="{ 'row-actions-big-row': growToHeight }"
    >
      <div
        v-for="action in actionInline"
        :key="action.command"
        class="item"
        :class="{ 'row-actions-big-row': growToHeight }"
        :title="action.text"
        @click.prevent="rowActionClick(action, $event)"
      >
        <div :class="['icon24', action.icon]" />
      </div>

      <vue-context ref="actionMenu" :custom-position-menu="true">
        <li v-for="action in actionContext" :key="action.command">
          <div
            href="javascript:void(0)"
            :class="['menu-item has-icon', action.cls]"
            @click.prevent="rowActionClick(action, $event)"
          >
            <div :class="['icon24 menu-icon', action.icon]" />
            {{ action.text }}
          </div>
        </li>
      </vue-context>
    </div>
  </tr>
</template>
<script>
import msCellInput from "./mscelleditor/msCellInput.vue";
import msCellCombobox from "./mscelleditor/msCellCombobox.vue";
import msCellNumber from "./mscelleditor/msCellNumber.vue";
import msCellCheckbox from "./mscelleditor/msCellCheckbox.vue";
import msCellDatepicker from "./mscelleditor/msCellDatepicker.vue";
import msCellDropdown from "./mscelleditor/msCellDropdown.vue";
import VueContext from "@/components/vue-context/vue-context";
export default {
  name: "MsTrEditor",
  components: {
    msCellInput,
    msCellCombobox,
    msCellNumber,
    msCellCheckbox,
    msCellDatepicker,
    msCellDropdown,
    VueContext,
  },
  props: {
    //Lưu thông tin của các cột
    columns: {},
    //Lưu dữ liệu của dòng
    dataRow: {},
    //Lưu cấu hình của cột chức năng
    widgetOptions: {},
    //Ẩn/hiện cột checkbox tích chọn nhiều cột
    multiple: {
      default: false,
      type: Boolean,
    },
    rowIndex: {
      default: 0,
      type: Number,
    },
    //Trạng thái tích chọn ở cột multiple
    isSelected: {
      default: false,
      type: Boolean,
    },
    //Thuộc tính cấu hình hiện thị cột STT
    serial: {
      default: false,
      type: Boolean,
    },
    //Thuộc tính để cấu hình cho phép sửa trên grid hay không
    editable: {
      default: true,
      type: Boolean,
    },
    // function Custom ReadOnly
    customReadOnly: {
      type: Function,
      default: null,
    },
    /**
     * NNLAM 22/03/2021
     * hàm custom validate trên cell grid
     */
    customValidateRules: {
      type: [Function, Boolean],
      default: null,
    },
    rowSelected: {
      default: null,
    },
    /**
     * Cho phép sắp xếp lại dữ liệu
     */
    dataDragable: {
      default: false,
      type: Boolean,
    },
    rowActions: {
      default: null,
      type: [Object, Array],
    },
    actionInlineCount: {
      type: Number,
    },
    hasLockColumn: {
      type: Boolean,
      default: false,
    },
    /***
     * Có cho dòng rộng 64px không
     * DHPhi 17/11/2021
     */
    growToHeight: {
      type: Boolean,
      default: false,
    },
    //addby: NTTHANH1
    disabledCheckedMultipleTbody: {
      default: false,
      type: [Boolean, Function],
    },
  },
  data() {
    return {
      /**
       * Hiển thị row action không
       */
      showRowAction: false,
      /**
       * Style đặt vị trí hiển thị row action
       */
      rowActionStyle: {
        top: 0,
        left: 0,
      },
      rowActionsCustom: [],

      customShowAction: false,
    };
  },
  computed: {
    listeners() {
      const me = this;
      return {
        selected: (metaData) => {
          me.$emit("selected", metaData);
        },
        change: (metaData) => {
          me.$emit("change", metaData);
        },
        rowSelected: (data) => {
          me.$emit("rowSelected", data);
        },
        loadDataCombo: (metaData) => {
          me.$emit("loadDataCombo", metaData);
        },
        next: () => {
          me.$emit("next");
        },
      };
    },
    /**
     * Action hiển thị trên dòng chọn ngay
     */
    actionInline() {
      let result = [],
        actions =
          this.rowActionsCustom.length > 0
            ? this.rowActionsCustom
            : this.rowActions;

      if (actions) {
        if (actions.length > this.actionInlineCount) {
          for (let i = 0; i < this.actionInlineCount - 1; i++) {
            result.push(actions[i]);
          }

          result.push({
            command: "MORE",
            icon: "more",
            text: this.moreText,
          });
        } else {
          for (let i = 0; i < actions.length; i++) {
            result.push(actions[i]);
          }
        }
      }

      return result;
    },
    /**
     * Action hiển trong more context
     */
    actionContext() {
      let result = [],
        actions = this.rowActions;

      if (actions && actions.length > this.actionInlineCount) {
        for (let i = this.actionInlineCount; i < actions.length; i++) {
          result.push(actions[i]);
        }
      }

      return result;
    },
  },
  methods: {
    //Cập nhật lại width cho cell khi width của col bị thay đổi
    //Created by LTDAT (30.06.2020)
    styleWidth(col) {
      const me = this;
      let rs = {};
      if (col.lock) {
        rs.left = (col.stickyOffset || 0) + "px";
      }
      if (col.autoResize) {
        rs["max-width"] = `${col.width}px`;
      } else {
        rs["width"] = `${col.width}px`;
        rs["max-width"] = `${col.width}px`;
      }
      return rs;
    },
    //Lấy lại control editor
    //Created by LTDAT (17.06.2020)
    getEditorType(col) {
      const me = this;
      switch (col.columnType) {
        case me.$ms.enum.ColumnType.Combobox:
          return "msCellCombobox";
        case me.$ms.enum.ColumnType.Number:
          return "msCellNumber";
        case me.$ms.enum.ColumnType.Checkbox:
          return "msCellCheckbox";
        case me.$ms.enum.ColumnType.Datepicker:
          return "msCellDatepicker";
        case me.$ms.enum.ColumnType.Dropdown:
          return "msCellDropdown";
        case me.$ms.enum.ColumnType.Template:
          return col.template;
        default:
          return "msCellInput";
      }
    },
    //Emit sự kiện từ widget ra ngoài
    // Created by LTDAT (16.06.2020)
    widgetEvent(data, event) {
      const me = this;
      me.$emit("widgetEvent", data, event);
    },
    //Emit sự kiện click row ra ngoài grid
    //Created by LTDAT(13/06/2020)
    cell_click(col, colIndex) {
      const me = this;
      let editor = me.$refs[`editor-${colIndex}`];
      me.$emit("click", editor[0]);
    },
    //Emit sự kiện dblclickRow ra ngoài grid
    //Created by LTDAT(13/06/2020)
    cell_dblclick(e) {
      const me = this;
      me.$emit("dblclick", me.dataRow, e);
    },
    //Emit sự kiện ấn phím ra ngoài grid
    //Created by LTDAT(13/06/2020)
    row_keydown(e) {
      const me = this;
      me.$emit("keydown", me.dataRow, e);
    },
    //Sự kiện click vào nút chọn ở cột multiple
    //Created by LTDAT (28.05.2020)
    checkMultiple(event) {
      const me = this;
      me.dataRow.IsSelected = !me.isSelected;
      me.$emit("clickMultiple", me.dataRow, me.rowIndex, me.isSelected, event);
    },
    mouseover(event) {
      const me = this;
      me.$emit("mouseover", me.dataRow, event);

      me.$nextTick(() => {
        //nếu có action -> hiển thị
        if (me.rowActions != null && me.rowActions.length > 0) {
          //giữ lại record dc click cuối cùng
          me.actionRecord = me.dataRow;
          me.showRowAction = true;

          //đợi action render xong
          me.$nextTick(() => {
            let actionEl = me.$refs.rowAction;
            let actionWidth = 0;
            let actionHeight = 0;

            if (actionEl) {
              let actionElOffset = actionEl.getBoundingClientRect();
              actionWidth = actionElOffset.width;
              actionHeight = actionElOffset.height;
            }

            let trEl = event.target.closest("tr");
            if (trEl) {
              let trOffset = trEl.getBoundingClientRect();
              let containerOffset = trEl
                .closest(".ms-content--table")
                .getBoundingClientRect();

              let scrollContainer = trEl.closest(".scroller"),
                scrollLeft = scrollContainer.scrollLeft;
              let topOffset = (trOffset.height - actionHeight) / 2;

              //set position display
              me.rowActionStyle = {
                // top: trOffset.top - containerOffset.top + topOffset + "px",
                left: containerOffset.width - actionWidth + scrollLeft + "px",
                height: trOffset.height + "px",
              };
            }
          });
        }
      });
    },
    eventScrollGrid(trEl) {
      const me = this;
      if (me.rowActions != null && me.rowActions.length > 0) {
        let actionEl = me.$refs.rowAction;
        //me.showRowAction = true;
        let actionWidth = 0;
        let actionHeight = 0;

        if (actionEl) {
          let actionElOffset = actionEl.getBoundingClientRect();
          actionWidth = actionElOffset.width;
          actionHeight = actionElOffset.height;
        }
        if (trEl) {
          let trOffset = trEl.getBoundingClientRect();
          let containerOffset = trEl
            .closest(".ms-content--table")
            .getBoundingClientRect();

          let scrollContainer = trEl.closest(".scroller"),
            scrollLeft = scrollContainer.scrollLeft;
          let left = containerOffset.width - actionWidth + scrollLeft;
          let topOffset = (trOffset.height - actionHeight) / 2;

          if (
            scrollContainer.scrollWidth - actionWidth <
            containerOffset.width - actionWidth + scrollLeft
          ) {
            left = scrollContainer.scrollWidth - actionWidth;
          }

          //set position display
          me.rowActionStyle = {
            // top: trOffset.top - containerOffset.top + topOffset + "px",
            left: left + "px",
            height: trOffset.height + "px",
          };
        }
      }
    },
    mouseleave(event) {
      this.$emit("mouseleave", this.dataRow, event);
      this.showRowAction = false;
      this.$refs.actionMenu.close();
    },
    rowActionClick(action, event) {
      const me = this;
      if (action.command === "MORE") {
        let menu = me.$refs.actionMenu;
        if (!menu.show) {
          setTimeout(() => {
            menu.open(event);
          }, 10);
        }
      } else {
        // me.$parent.$emit("rowactionclick", action.command, me.dataRow, event);
        me.$emit("rowactionclick", action.command, me.dataRow, event);
      }
    },
    //sự kiện focus vào dòng trên body grid
    row_focus(e) {
      const me = this;
      me.$emit("focus", me.dataRow, e);
    },

    /**
     * Show tooltip cho nội dung cell
     */
    titleToolTip(dataRow, col) {
      let me = this;

      if (col.formatType == me.$ms.enum.FormatType.Html) {
        if (dataRow[col.dataField]) {
          return me.stripHtml(dataRow[col.dataField]);
        } else {
          return null;
        }
      } else if (col.columnType == me.$ms.enum.ColumnType.Checkbox) {
        return null;
      } else {
        return me.$options.filters.formatData(dataRow[col.dataField], {
          formatType: col.formatType,
          enumName: col.enum,
          dataRow: dataRow,
          optionFormat: col.optionFormat,
          formatString: col.formatString,
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msTrViewer.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msTrViewer.scss';
// }
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msTrViewer.scss";

//TDNGHIA 30/11/2021: cmt lại nó phải padding 16px mới đúng chứ
// ::v-deep.ms-td {
//   padding: 0 5px;
// }

// ::v-deep .editor-display {
//   // flex: 1;
//   white-space: nowrap;
//   text-overflow: ellipsis;
//   // width: 50px;
//   overflow: hidden;
//   padding: 0 7px;
//   height: 20px;
//   max-width: 800px;
// }
::v-deep .editor-display {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 0px 13px;
  // height: 20px;
  // max-width: 400px;
}
::v-deep .ms-td {
  padding: 0px 3px;
  height: 40px;
  vertical-align: middle;
  background-color: #fff;
  cursor: pointer;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}
::v-deep.ms-editor {
  .ms-number-item,
  .ms-input-item {
    padding: $ms-grid-cellpadding-editor;
  }
}

.ms-td.drag-data {
  padding: $ms-grid-cellpadding;
  .move {
    margin: 0 auto;
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
