<template>
  <tr
    class="ms-tr"
    :indexRow="rowIndex"
    tabindex="0"
    :class="{
      parent: dataRow.isParent,
      'action-hover': showRowAction && actionInline,
    }"
    @click="row_click"
    @dblclick="row_dblclick"
    @keydown="row_keydown"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
  >
    <td v-if="multiple && isCustom" class="ms-td multiple-cell">
      <ms-checkbox
        :value="isSelected"
        class="center"
        ref="multiple"
        checkOnly
        @click="checkMultiple"
      />
    </td>
    <td
      v-for="(col, colIndex) in columns"
      :key="col.dataField"
      ref="td"
      class="ms-td"
      :class="[
        colIndex == 0 ? `level-${dataRow.level}` : null,
        `td-col-${colIndex}`,
      ]"
      :style="styleWidth(col)"
    >
      <!-- @click="row_click"
			@dblclick="row_dblclick" -->
      <component
        :is="col.template"
        v-if="col.template"
        :data="dataRow"
        :column="col"
        :data-row="dataRow"
        :col="col"
      />
      <div v-else class="flex-row">
        <div
          v-if="dataRow.isParent && colIndex == 0"
          @click="toggle_click"
          @dblclick.stop
        >
          <div v-if="dataRow.expanded" class="expand pointer" />
          <div v-else class="collapse pointer" />
        </div>
        <div v-else-if="colIndex == 0">
          <div class="image-not-chid" />
        </div>
        <ms-checkbox
          v-if="multiple && colIndex == 0 && !isCustom"
          ref="multiple"
          :value="isSelected"
          class="center checkbox-mutli"
          check-only
          @input="checkMultiple"
        />
        <div
          :class="[
            `text-${col.align || 'left'}`,
            col.cssClass,
            'content-cell text-overflow',
          ]"
          :style="styleTd(col)"
          :title="titleToolTip(dataRow, col)"
        >
          <!-- lấy dữ liệu theo enum cho control tree -->
          <span
            v-if="col.formatType === $ms.enum.FormatType.Checkbox"
            :ref="`text-${col.dataField}`"
            class="checkbox"
          >
            <ms-checkbox
              :value="dataRow[col.dataField]"
              class="center"
              :disabled="true"
            />
          </span>
          <span
            v-else-if="col.formatType === $ms.enum.FormatType.Drilldown"
            class="drilldown"
            @click="drilldownClick(col, dataRow)"
          >
            {{
              dataRow[col.dataField]
                | formatData({
                  formatType: col.formatType,
                  enumName: col.enum,
                  dataRow: dataRow,
                })
            }}
          </span>
          <span v-else>{{
            dataRow[col.dataField]
              | formatData({
                formatType: col.formatType,
                enumName: col.enum,
                dataRow: dataRow,
              })
          }}</span>
        </div>
        <!-- <div :class="content-cell">
					<span>{{dataRow[col.dataField]}}</span>
				</div> -->
      </div>
    </td>
    <td v-if="widgetOptions" class="ms-td widget-item">
      <component
        :is="widgetOptions.components"
        :data-row="dataRow"
        @widgetEvent="widgetEvent"
      />
    </td>
    <div
      v-show="showRowAction && actionInline"
      ref="rowAction"
      class="row-actions"
      :style="rowActionStyle"
      :heightOffset="-2"
    >
      <div
        v-for="action in actionInline"
        :key="action.command"
        class="item"
        @click.prevent="rowActionClick(action, $event)"
      >
        <v-popover
          ref="tooltipTemplateIcon"
          offset="15"
          class="popover"
          popover-class="custom-icon-popover"
          trigger="hover"
          placement="top-center"
        >
          <template slot="popover">
            <div class="custom-text">
              {{ action.text }}
            </div>
          </template>
          <div :class="['icon24', action.icon]" />
        </v-popover>
      </div>

      <vue-context ref="actionMenu">
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
import VueContext from "@/components/vue-context/vue-context";
export default {
  name: "MsTr",
  components: {
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
    //Ẩn/hiện cột checkbox tích chọn nhiều cột
    isCustom: {
      default: false,
      type: Boolean,
    },
    //Trạng thái tích chọn ở cột multiple
    isSelected: {
      default: false,
      type: Boolean,
    },
    //rowIndex
    rowIndex: {
      default: null,
      type: Number,
    },
    rowActions: {
      default: null,
      type: [Object, Array],
    },
    actionInlineCount: {
      type: Number,
    },
    isWidthFull: {
      default: false,
      type: Boolean,
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
    };
  },
  computed: {
    /**
     * Action hiển thị trên dòng chọn ngay
     */
    actionInline() {
      let result = [],
        actions = this.rowActions;

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
    //created by TVLOI(10/05/2021) - Xử lý drill down dòng chi tiết
    drilldownClick(col, dataRow, e) {
      let metaData = {
        col: col,
        dataRow: dataRow,
      };
      this.$emit("drilldownClick", metaData, e);
    },
    //Cập nhật lại width cho cell khi width của col bị thay đổi
    styleWidth(col) {
      const me = this;
      if (col.autoResize) {
        return { "min-width": `${col.width}px` };
      } else {
        return { "max-width": `${col.width}px`, "min-width": `${col.width}px` };
      }
    },
    toggle_click() {
      const me = this;
      me.dataRow.expanded = !me.dataRow.expanded;
      me.changeVisibleTr(me.dataRow, me.dataRow.expanded);
    },
    changeVisibleTr(data, expanded) {
      const me = this;
      let childNodes = data.childNodes;
      if (childNodes && childNodes.length > 0) {
        data.expanded = expanded;
        childNodes.forEach((item) => {
          item.isHide = !expanded;
          me.changeVisibleTr(item, expanded);
        });
      }
    },
    //Emit sự kiện từ widget ra ngoài
    widgetEvent(data, event) {
      const me = this;
      me.$emit("widgetEvent", data, event);
    },
    //Emit sự kiện click row ra ngoài grid
    row_click(e) {
      const me = this;
      me.$emit("click", me.dataRow, e);
    },
    //Emit sự kiện dblclickRow ra ngoài grid
    row_dblclick(e) {
      const me = this;
      me.$emit("dblclick", me.dataRow, e);
    },
    //Emit sự kiện ấn phím ra ngoài grid
    row_keydown(e) {
      const me = this;
      me.$emit("keydown", me.dataRow, e);
    },
    //Sự kiện click vào nút chọn ở cột multiple
    checkMultiple(event) {
      const me = this;
      me.$emit("clickMultiple", me.dataRow);
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
            if (actionEl) {
              let actionElOffset = actionEl.getBoundingClientRect();
              actionWidth = actionElOffset.width;
            }

            let trEl = event.target.closest("tr"),
              trOffset = trEl.getBoundingClientRect();
            let container = trEl.closest(".ms-content--table");
            let containerOffset = container.getBoundingClientRect();

            let scrollContainer = trEl.closest(".scroller"),
              scrollLeft = scrollContainer.scrollLeft;
            let actionLeft = containerOffset.width - actionWidth + scrollLeft;

            //set position display
            me.rowActionStyle = {
              left: actionLeft + "px",
            };

            if (me.columns.length == 1) {
              let listElTD = trEl.querySelectorAll(".ms-td");
              if (listElTD && listElTD.length > 0) {
                for (let i = 0; i < listElTD.length; i++) {
                  let testTD = listElTD[i].getBoundingClientRect();
                  var left = testTD.left - containerOffset.left + testTD.width;
                  var check = left - actionLeft;
                  if (check >= 0) {
                    listElTD[i].style.width = testTD.width - check + "px";
                    break;
                  } else {
                    if (me.isWidthFull) {
                      listElTD[i].style.width = "100%";
                    }
                  }
                }
              }
            } else {
              let listElTD = trEl.querySelectorAll(".ms-td .text-overflow");
              if (listElTD && listElTD.length > 0) {
                for (let i = 0; i < listElTD.length; i++) {
                  let testTD = listElTD[i].getBoundingClientRect();
                  var left = testTD.left - containerOffset.left + testTD.width;
                  var check = left - actionLeft;
                  if (check >= 0) {
                    listElTD[i].style.width = testTD.width - check + "px";
                    break;
                  } else {
                    if (me.isWidthFull) {
                      listElTD[i].style.width = "100%";
                    }
                  }
                }
              }
            }
          });
        }
      });
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
        me.$emit("rowactionclick", action.command, me.dataRow, event);
      }
    },
    /**
     * Show tooltip cho nội dung cell
     */
    titleToolTip(dataRow, col) {
      return this.$options.filters.formatData(dataRow[col.dataField], {
        formatType: col.formatType,
        enumName: col.enum,
        dataRow: dataRow,
      });
    },
    //Tính độ rộng của 1 cell
    styleTd(col) {
      const me = this;
      return { "max-width": col.width ? col.width : 100 + "px" };
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msTrTree.scss";
</style>