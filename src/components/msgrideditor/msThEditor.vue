<template>
  <th
    :style="[styleWidth]"
    :class="[
      col.cssCellClass,
      col.dataField,
      { empty: !col.caption, sticky: col.lock },
    ]"
    @mouseover="showMenuHeader()"
    @mouseleave="checkHideMenuHeader()"
  >
    <div class="ms-th-content flex-row">
      <div
        v-if="col.columnType == $ms.enum.ColumnType.Checkbox && col.hasCheckAll"
        class="flex justify-center pb-1"
      >
        <ms-checkbox
          :icon="'check'"
          :value="isCheckedAll"
          :checked="isCheckedAll"
          :disabled="col.readOnly || !$parent.editable"
          check-only
          @click="changeCheckedAll"
        />
      </div>
      <div
        v-else
        :class="[
          'flex d-flex',
          col.quickAction ? 'flex-center' : 'ms-th-title',
        ]"
        :title="
          col.useHtml === true
            ? col.title
            : col.tooltip || col.title || col.definition || col.caption
        "
      >
        <p
          v-if="!col.useHtml && !col.quickAction"
          :class="[
            `text-${(col.headerAlign ? col.headerAlign : col.align) || 'left'}`,
            col.cssClass,
          ]"
        >
          {{ col.caption }}
        </p>
        <p
          v-else-if="col.useHtml && !col.quickAction"
          :class="[
            `text-${(col.headerAlign ? col.headerAlign : col.align) || 'left'}`,
            col.cssClass,
          ]"
          v-html="col.caption"
        />
        <div
          v-else
          class="flex-column flex-center quick-action"
          style="padding: 4px 16px; max-width: 100%"
          v-click-outside="hideQuickActionBox"
          @click.stop="quickActionToggle"
        >
          <div
            v-if="!col.useHtml"
            :class="[
              `text-${col.align || 'left'}`,
              col.cssClass,
              'm0',
              'p-text-truncate',
            ]"
            :style="{ color: isShowQuickAction ? '#2979ff' : '' }"
          >
            {{ col.caption }}
          </div>
          <div
            v-else
            :class="[
              `text-${col.align || 'left'}`,
              col.cssClass,
              'm0',
              'p-text-truncate',
            ]"
            :style="{ color: isShowQuickAction ? '#2979ff' : '' }"
            v-html="col.caption"
          ></div>
          <div class="icon24 chevron-down">
            <div v-if="isShowQuickAction" class="quick-action-box">
              <ul>
                <li title="Ch???n c??? c???t" @click.stop="quickActionOnClick(true)">
                  Ch???n c??? c???t
                </li>
                <li
                  title="B??? ch???n c??? c???t"
                  @click.stop="quickActionOnClick(false)"
                >
                  B??? ch???n c??? c???t
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          v-show="showOption && !col.notFilter"
          :title="$t('i18nCommon.command.filter')"
          class="icon24 filter-header-20"
          @click.stop="optionClick"
        />
      </div>

      <div
        v-if="resizeCol"
        class="ms-resize"
        @mouseup="resizeOff"
        @mousedown="resizeOn"
      />
    </div>
  </th>
</template>
<script>
import filterHeaderUtil from "@/commons/filterHeaderUtil";
export default {
  name: "MsThEditor",
  props: {
    col: {},
    data: {},
    resizeCol: {
      default: true,
      type: Boolean,
    },
    isCheckedAll: {
      default: false,
      type: Boolean,
    },
    /**
     * c?? filter c???t kh??ng
     */
    filterable: {
      type: Boolean,
      default: true,
    },
    moduleAutocomplete: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      cursorX: 0,
      widthx: 0,
      showOption: false,
      isShowQuickAction: false,
    };
  },
  computed: {
    styleWidth() {
      const me = this;
      let minWidth = me.col._minWidth || me.col._width;
      let rs = {};

      if (me.col.autoResize) {
        rs = {
          "min-width": minWidth + "px",
          "max-width": me.col._width + "px",
        };
      } else {
        rs = {
          width: me.col._width + "px",
          "max-width": me.col._width + "px",
          "min-width": minWidth + "px",
        };
      }

      if (me.col.lock) {
        rs.left = (me.col.stickyOffset || 0) + "px";
      }

      return rs;
    },
  },
  watch: {
    cursorX() {
      const me = this;
      let offsetX = this.resizeX - this.cursorX;
      if (this.defaultwidth - offsetX >= this.minWidthx) {
        this.widthx = this.defaultwidth - offsetX;
      } else {
        this.widthx = this.minWidthx;
      }
      me.$set(me.col, "_width", this.widthx);
      me.$set(me.col, "_minWidth", this.widthx);
    },
  },
  created() {
    const me = this;
    me.widthx = me.col._width;
  },
  methods: {
    //B???t ?????u co k??o c???t
    resizeOn(event) {
      let me = this;
      this.$nextTick(() => {
        this.defaultwidth = this.$el.offsetWidth;
        if (!this.minWidthx) {
          this.minWidthx = this.col._minWidth || this.col.width;
        }
      });
      this.resizeX = event.screenX;
      me.$emit("resizeOn", this.col);
      document.addEventListener("mouseup", me.resizeOff);
      document.addEventListener("mousemove", this.mousemove);
    },
    //Di chuy???n co k??o c???t
    mousemove(e) {
      const me = this;
      me.cursorX = e.screenX;
      me.$parent.updateStickyOffset();
      me.$emit("resizeMove", this.col);
      if (!me.isResizeActive) {
        me.isResizeActive = true;
        //document.addEventListener("mouseup", me.resizeOff);
      }
      document.addEventListener("mouseup", me.resizeOff);
    },
    //Ng???ng co k??o c???t
    resizeOff() {
      let me = this;
      me.$parent.updateStickyOffset();
      me.$emit("resizeOff", me.col);
      document.removeEventListener("mousemove", me.mousemove);
      me.closeResizeOff();
      me.isResizeActive = false;
    },
    closeResizeOff() {
      document.removeEventListener("mouseup", this.resizeOff);
    },
    //Update l???i ?????ng r???ng c???a c???t
    updateColWidth(autoResize) {
      const me = this;
      if (me.$el) {
        me.minWidth = me.col.width;
        me.$set(me.col, "_width", me.$el.offsetWidth);

        // me.widthx = me.$el.offsetWidth;
        me.$set(me.col, "autoResize", autoResize);
      }
    },

    changeCheckedAll() {
      let me = this,
        lengthx = me.$parent.datax.length;
      let lengthSelected = me.$parent.datax.filter((item) => {
        if (item[me.col ? me.col.dataField : null]) {
          return true;
        }
      }).length;
      let isCheckedAll = false;
      let selectedx = lengthx - lengthSelected;
      if (selectedx == 0) {
        me.$parent.datax.forEach((item) => {
          item[me.col ? me.col.dataField : null] = false;
        });
        isCheckedAll = false;
      } else {
        me.$parent.datax.forEach((item) => {
          item[me.col ? me.col.dataField : null] = true;
        });
        isCheckedAll = true;
      }

      let metaData = {
        column: me.column,
        isCheckedAll: isCheckedAll,
      };

      me.$parent.$emit("selectedAll", metaData);
    },

    /**
     * Ki???m tra hi???n th??? menu l???c v?? c??? ?????nh c???t tr??n header grid
     * @author NVLAM 26.11.2020
     */
    showMenuHeader() {
      let me = this;

      //hi???n cho c??? tr?????ng h???p kh??ng c???u h??nh filterable
      if (
        (me.col.filterable != false && me.$parent.filterable) ||
        me.col.lockable !== false
      ) {
        if (me.$parent.filterable) {
          me.showOption = true;
        } else {
          me.showOption = false;
        }
      }
    },
    checkHideMenuHeader() {
      if (this.col.hasActionFilter) {
        this.showOption = true;
      } else {
        this.showOption = false;
      }
    },
    /**
     * click v??o icon option
     */
    optionClick() {
      if (!this.col.filter) {
        this.col.filter = {};
      }
      filterHeaderUtil.showOption(this, this.col, this.isLock);
    },

    /**
     * click v??o icon ch???n nhanh
     */
    quickActionToggle() {
      const me = this;

      me.isShowQuickAction = !me.isShowQuickAction;
    },

    /**
     * ???n quick action box
     */
    hideQuickActionBox() {
      const me = this;

      me.isShowQuickAction = false;
    },

    /**
     * L???a ch???n h??ng lo???t
     * NDHUY 30.11.2021
     */
    quickActionOnClick(value) {
      const me = this;

      me.hideQuickActionBox();

      me.$emit("quickAction", {
        column: me.col,
        newValue: value,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msGridViewer.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msGridViewer.scss';
// }

@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msGridViewer.scss";
.m0 {
  width: 100%;
}
.quick-action:hover {
  .m0 {
    color: #2979ff;
  }
}

::v-deep .icon24.chevron-down {
  width: 16px;
  height: 12px;

  &:before {
    background-position: -148px -54px;
    width: 16px;
    height: 12px;
  }

  .quick-action-box {
    top: 16px;
  }
}
</style>