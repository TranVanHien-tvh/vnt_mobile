<template>
  <tr
    :class="['ms-tr', { 'action-hover': showRowAction && actionInline }]"
    tabindex="0"
    :indexRow="dataRow.rowIndex || index"
    @keydown="row_keydown"
    @focus="row_focus"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
  >
    <!-- TDNGHIA 1/10/2021 -->
    <!-- vẽ ra ô config-column (thực chất là 1 ô trống) -->
    <td
      v-if="isShowConfigColumn"
      :key="0"
      class="ms-td td-config-column text-center sticky"
      :class="{ 'big-row': growToHeight }"
    >
      <div class="config-column-empty-box"></div>
    </td>

    <!-- vẽ ra ô checkbox -->
    <td
      v-if="multiple"
      class="ms-td multiple-cell sticky"
      :class="[{ 'big-row': growToHeight }]"
      :style="{ left: multipleOffsetLeft }"
    >
      <ms-checkbox
        ref="multiple"
        :key="0"
        :value="disabledCheckedMultipleTbody ? false : isSelected"
        class="center"
        check-only
        :disabled="disabledCheckedMultipleTbody"
        @input="checkMultiple"
      />
    </td>
    <!-- vẽ ra ô stt -->
    <td
      v-if="serial"
      :key="0"
      class="ms-td serial text-center sticky"
      :style="{ left: serialOffsetLeft }"
      :class="{ 'big-row': growToHeight }"
    >
      {{ pageSize * (currentPage - 1) + index + 1 }}
    </td>
    <td
      v-for="col in columns"
      :key="col.dataField"
      :ref="`td-${col.dataField}`"
      class="ms-td ms-col-td"
      :class="[
        col.cssCellClass,
        col.dataField,
        { sticky: col.lock, 'big-row': growToHeight },
      ]"
      :style="styleWidth(col, false)"
      @click="row_click"
      @dblclick="row_dblclick"
    >
      <component
        :is="col.template"
        v-if="col.template"
        :data="dataRow"
        :column="col"
        :data-row="dataRow"
        :col="col"
        :row-selected="rowSelected"
        :is-selected="isSelected"
      />
      <div v-else-if="col.isSerial" :class="[`justify-center`, col.cssClass]">
        <span>{{ index + 1 }}</span>
      </div>

      <!-- Kiểu Text nhưng có dạng nhiều dòng value= MORE_DETAILS-->
      <div
        v-else-if="dataRow[col.dataField] === 'MORE_DETAILS'"
        :class="[
          `text-${col.align || 'left'}`,
          col.cssClass,
          'text-overflow',
          'icon24',
          'more-rows',
        ]"
        :title="titleToolTip(dataRow, col)"
        data-animation="animated bounceInDown"
        data-toggle="tooltip"
        @click="viewMoreDetails(col, dataRow)"
      >
        <span />
      </div>
      <div
        v-else
        :class="[`text-${col.align || 'left'}`, col.cssClass, 'text-overflow']"
        :title="titleToolTip(dataRow, col)"
        data-animation="animated bounceInDown"
        data-toggle="tooltip"
      >
        <!-- v-tooltip="{ content:titleToolTip(dataRow, col), placement: 'top'}" -->
        <!-- kiểu checkbox -->
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
          <!-- <span class="checked" v-if="dataRow[col.dataField]"></span> -->
        </span>
        <!-- kiểu Drilldown -->
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
                optionFormat: col.optionFormat,
              })
          }}
        </span>
        <!-- kiểu html -->
        <div
          v-else-if="col.formatType === $ms.enum.FormatType.Html"
          class="customStyleHtml"
          v-html="dataRow[col.dataField]"
        />
        <!-- kiểu text  tvloi 03.06.2021 _ Sửa lại formatType nếu data có giá trị thì dùng format cấu hình sẵn. else formatNull. bug 100945-->
        <span
          v-else
          :ref="`text-${col.dataField}`"
          :class="[`text-${col.align || 'left'}`], "
          >{{
            dataRow[col.dataField]
              | formatData({
                formatType: dataRow[col.dataField] ? col.formatType : null,
                enumName: col.enum,
                dataRow: dataRow,
                optionFormat: col.optionFormat,
                formatString: col.formatString,
              })
          }}</span
        >

        <div
          v-if="col.icon && col.icon.show(dataRow, col)"
          v-tooltip="{ ...col.icon.tooltip }"
          :class="['mi', 'mi-24', col.icon.type]"
        />
      </div>
    </td>
    <td
      v-if="widgetOptions"
      :key="100"
      class="ms-td widget-item"
      :style="styleWidth(widgetOptions, true)"
      :class="[{ 'big-row': growToHeight }]"
    >
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
      :class="{ 'row-actions-big-row': growToHeight }"
      :style="rowActionStyle"
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
          :placement="action.placement || 'top-center'"
        >
          <template slot="popover">
            <div class="custom-text">
              {{ action.text }}
            </div>
          </template>
          <div :class="['icon24', action.icon]" />
        </v-popover>
      </div>

      <vue-context
        ref="actionMenu"
        :height-offset="heightOffset"
        :custom-width="260"
        :customPositionMenu="true"
      >
        <li
          v-for="action in actionContext"
          :key="action.command"
          :class="[{ actionSub: action.subMenu }, `li-${action.command}`]"
        >
          <div
            href="javascript:void(0)"
            :class="[
              'action-menu menu-item',
              { disabled: action.disabled },
              { 'has-icon': hasIcon },
              action.cls,
            ]"
            @click.prevent="rowActionClick(action, $event)"
            @mouseover="showActionSub(action, $event)"
          >
            <div :class="['icon24 menu-icon', action.icon]" v-if="hasIcon" />
            <div :class="{ 'ml-2': !hasIcon }">
              {{ action.text }}
            </div>
            <div
              v-if="action.subMenu"
              class="icon24 menu-icon chevron-down f-right"
            />
            <!-- @click.prevent="rowActionSubClick(action, $event)" -->
          </div>
          <!-- Đây là sub menu nếu muốn có thì thêm property subMenu vào action -->
          <vue-context
            v-if="action.subMenu"
            ref="actionSubMenu"
            class="test"
            :height-offset="-2"
          >
            <li v-for="actionSub in action.subMenu" :key="actionSub.command">
              <div
                href="javascript:void(0)"
                :class="['menu-item has-icon', actionSub.cls]"
                @click.prevent="rowActionClick(actionSub, $event)"
              >
                <div :class="['icon24 menu-icon', actionSub.icon]" />
                {{ actionSub.text }}
              </div>
            </li>
          </vue-context>
        </li>
      </vue-context>
    </div>
  </tr>
</template>
<script>
import VueContext from "@/components/vue-context/vue-context";
import { setTimeout } from "timers";

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
    //Trạng thái tích chọn ở cột multiple
    isSelected: {
      default: false,
      type: Boolean,
    },
    index: {
      default: null,
      type: Number,
    },
    serial: {
      default: false,
      type: Boolean,
    },
    currentPage: {
      default: 1,
      type: Number,
    },
    pageSize: {
      default: 20,
      type: Number,
    },
    rowSelected: {
      default: null,
    },
    rowActions: {
      default: null,
      type: [Object, Array],
    },
    actionInlineCount: {
      type: Number,
    },
    disabledCheckedMultipleTbody: {
      default: false,
      type: [Boolean, Function],
    },
    hasLockColumn: {
      type: Boolean,
      default: false,
    },
    /***
     * Có cho dòng rộng 64px không
     * TDNGHIA 29/9/2021
     */
    growToHeight: {
      type: Boolean,
      default: false,
    },

    /***
     * Grid cột config column không
     * TDNGHIA 1/10/2021
     */
    isShowConfigColumn: {
      type: Boolean,
      default: false,
    },

    /**
     * Khoảng cách từ context menu đến mép trên của row
     * NMTUAN3 26/10/2021
     */
    heightOffset: {
      type: Number,
      default: -2,
    },

    /**
     * Hiển thị icon trong context menu
     * NMTUAN3 26/10/2021
     */
    hasIcon: {
      type: Boolean,
      default: true,
    },

    /**
     * giá trị style left của cột checkbox
     * NMTUAN2 22.03.2022
     */
    multipleOffsetLeft: {
      type: String,
      default: "0px",
    },

    /**
     * giá trị style left của cột serial
     * NMTUAN2 22.03.2022
     */
    serialOffsetLeft: {
      type: String,
      default: "0px",
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
        for (let i = this.actionInlineCount - 1; i < actions.length; i++) {
          result.push(actions[i]);
        }
      }

      return result;
    },
  },
  created() {
    const me = this;
    me.moreText = me.$t("i18nCommon.command.more");
  },
  methods: {
    //Cập nhật lại độ rộng của cột theo độ rộng cấu hình
    //Created by LTDAT
    styleWidth(col, widget) {
      let rs = {};
      if (col.lock) {
        rs.left = (col.stickyOffset || 0) + "px";
      }

      if (!widget) {
        rs["max-width"] = col.width + "px";
      }
      this.$emit("styleColumn", col, this.dataRow, rs);

      return rs;
    },
    //Emit sự kiện từ widget ra ngoài
    // Created by LTDAT (16.06.2020)
    widgetEvent(data, event) {
      const me = this;
      me.$emit("widgetEvent", data, event);
    },
    //Emit sự kiện click row ra ngoài grid
    //Created by LTDAT(13/06/2020)
    row_click(e) {
      const me = this;
      me.$emit("click", me.dataRow, e);
    },
    drilldownClick(col, dataRow, e) {
      let metaData = {
        col: col,
        dataRow: dataRow,
      };
      this.$emit("drilldownClick", metaData, e);
    },

    //(Click vào các cột có dạng số nhiều.(đại diện cho nhiều dòng chi tiết)
    //Created by TVLOI 22.05.2021
    viewMoreDetails(col, dataRow, e) {
      dataRow.moreDetails = true;
      let metaData = {
        col: col,
        dataRow: dataRow,
      };
      this.$emit("viewMoreDetails", metaData, e);
    },
    row_focus(e) {
      const me = this;
      me.$emit("focus", me.dataRow, e);
    },
    //Emit sự kiện dblclickRow ra ngoài grid
    //Created by LTDAT(13/06/2020)
    row_dblclick(e) {
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
    checkMultiple(checked) {
      const me = this;
      me.$emit("clickMultiple", me.dataRow, checked);
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
            let actionElOffset = null;
            let actionHeight = 0;

            if (actionEl) {
              actionElOffset = actionEl.getBoundingClientRect();
              actionWidth = actionElOffset.width;
              actionHeight = actionElOffset.height;
            }
            let trEl = event.target.closest("tr"),
              trOffset = trEl.getBoundingClientRect();
            let containerOffset = trEl
              .closest(".ms-content--table")
              .getBoundingClientRect();

            let scrollContainer = trEl.closest(".scroller"),
              scrollLeft = scrollContainer.scrollLeft;

            let actionLeft = containerOffset.width - actionWidth + scrollLeft;
            let topOffset = (trOffset.height - actionHeight) / 2;

            //set position display
            me.rowActionStyle = {
              // top: trOffset.top - containerOffset.top + topOffset + "px",
              left: actionLeft - 10 + "px",
              height: trOffset.height + "px",
            };
            let listElTD = trEl.querySelectorAll(".ms-td");
            if (listElTD && listElTD.length > 0) {
              let offsetLeft = 0;
              for (let i = 0; i < listElTD.length; i++) {
                let testTD = listElTD[i].getBoundingClientRect();
                offsetLeft += testTD.width;
                var check =
                  actionWidth -
                  (containerOffset.width + scrollLeft - offsetLeft);
                if (check > 0) {
                  if (listElTD[i].querySelector(".text-overflow.text-left")) {
                    listElTD[i].querySelector(
                      ".text-overflow.text-left"
                    ).style.width = testTD.width - check - 10 + "px";
                  }
                  break;
                } else {
                  if (listElTD[i].querySelector(".text-overflow.text-left")) {
                    listElTD[i].querySelector(
                      ".text-overflow.text-left"
                    ).style.width = testTD.width - 32 + "px"; // 32 là tổng padding left + right
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
      if (this.$refs.actionMenu) {
        this.$refs.actionMenu.close();
      }
    },
    rowActionClick(action, event) {
      const me = this;

      if (!action.disabled) {
        if (action.command === "MORE") {
          let menu = me.$refs.actionMenu;
          if (!menu.show) {
            setTimeout(() => {
              menu.open(event);
            }, 10);
          }
        } else if (action.command === "Ultility") {
          event.preventDefault();
          event.stopPropagation();
        } else {
          me.$emit("rowactionclick", action.command, me.dataRow, event);
        }
      }
    },
    rowActionSubClick(action, event) {
      const me = this;

      if (!action.disabled) {
        if (action.command === "Ultility") {
          let menu = me.$refs.actionSubMenu;
          if (!menu.show) {
            setTimeout(() => {
              menu.open(event);
            }, 10);
          }
        } else {
          me.$emit("rowactionclick", action.command, me.dataRow, event);
        }
      }
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
      } else if (col.formatType == me.$ms.enum.FormatType.Checkbox) {
        return null;
      } else {
        //Format dạng MOREDETAILS
        if (dataRow[col.dataField] === "MORE_DETAILS") {
          return me.$t("i18nCommon.command.ViewMoreDetails");
        }

        //pvduy 24/04/2021: xử lý riêng toolip giá trị khác trong báo cáo thống kê số lượng theo tình trạng.
        if (
          col.dataField === "AssetStatusName" &&
          dataRow[col.dataField] === "Khác"
        ) {
          return "Báo mất, báo hỏng, đề nghị thanh lý, đang điều chuyển";
        } else {
          return this.$options.filters.formatData(dataRow[col.dataField], {
            formatType: col.formatType,
            enumName: col.enum,
            dataRow: dataRow,
            optionFormat: col.optionFormat,
            formatString: col.formatString,
          });
        }
      }
    },
    /**
     * convert html code to text
     */
    stripHtml(source) {
      let output;
      source = source.toString();
      //get rid of HTML tags
      output = source.replace(/<[^>]*>/g, "");
      output = output.replace(/&nbsp;/g, " ");
      output = output.replace(/\n/g, "; ");
      return output;
    },
    showActionSub(action, event) {
      const me = this;
      if (action.subMenu) {
        let liPersent = event.toElement;
        if (liPersent) {
          while (!liPersent.className.contains("actionSub")) {
            liPersent = liPersent.offsetParent;
          }
          let liPosition = liPersent.getBoundingClientRect(); // Position của thẻ li (action cha)
          let [menuSub] = me.$refs.actionSubMenu; // Position menu sub
          let elSub = menuSub.$el; // element sub
          let elSubPosition = menuSub.$el.getBoundingClientRect(); // Position của menusub
          if (elSub) {
            // gán lại style cho  element sub, đang tạm gán thôi, chưa tính trường hợp dàn lên trên nếu top quá to hoặc dàn sang phải nếu left quá nhỏ
            elSub.style.top = liPosition.top + "px";
            elSub.style.left = liPosition.left - elSubPosition.width + "px";
          }
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msTrViewer.scss";
//tạo vách ngăn
.li-re-use {
  margin: 0 8px 8px 8px !important;
  border-bottom: 1px solid #e0e0e0;
  .menu-item.has-icon {
    margin-right: 0px !important;
    margin-left: 0px !important;
    margin-bottom: 8px;
  }
}
.f-right {
  position: absolute;
  right: 0;
  left: auto !important;
  transform: rotate(270deg);
}
.customStyleHtml {
  align-items: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
<style>
.custom-icon-popover {
  background-color: black;
  border-radius: 3px;
}
.custom-icon-popover.tooltip.popover .popover-inner {
  background-color: black;
}
.custom-icon-popover.tooltip.popover .popover-arrow {
  border-color: black;
}

.custom-icon-popover.tooltip .tooltip-inner {
  padding: 0;
}

.custom-icon-popover.tooltip .custom-text {
  width: auto;
  background-color: black;
  border-radius: 3px;
  color: white;
  padding: 10px;
}
</style>
