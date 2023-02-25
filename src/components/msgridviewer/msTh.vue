<template>
  <th
    :style="[styleWidth]"
    :class="[col.cssCellClass, { empty: !col.caption, sticky: col.lock }]"
    :field="col.dataField"
    @mouseover="showMenuHeader()"
    @mouseleave="checkHideMenuHeader()"
  >
    <div class="ms-th-content flex-row">
      <div
        class="ms-th-title flex"
        :title="col.useHtml === true ? col.title : (col.tooltip || col.title || col.definition || col.caption)"
        @click="sort"
      >
        <!-- v-tooltip="col.tooltip " -->
        <p
          v-if="!col.useHtml"
          :class="[
            `text-${(col.headerAlign ? col.headerAlign : col.align) || 'left'}`,
            col.cssClass,
          ]"
        >
          {{ col.caption }}
        </p>
        <p
          v-if="col.useHtml"
          :class="[
            `text-${(col.headerAlign ? col.headerAlign : col.align) || 'left'}`,
            col.cssClass,
          ]"
          v-html="col.caption"
        >
        <div
          v-if="sortStatus != $ms.enum.SortStatus.none"
          class="icon24 mi-arrow-dropdown ml5 mr0"
          :class="[
            { 'sortdesc-20': sortStatus == $ms.enum.SortStatus.desc },
            { 'sortasc-20': sortStatus == $ms.enum.SortStatus.asc },
          ]"
          @click="sort"
        />
        <div
          v-show="(showOption || showAllIconFilter) && !col.notFilter"
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
import EventBusGlobal, { GlobalEventName } from "@/commons/eventBusGlobal";
import Vue from "vue";
import commonFn from "@/commons/commonFunction";
import i18n from "@/i18ns/i18n";
import filterHeaderUtil from "@/commons/filterHeaderUtil";

export default {
  name: "MsTh",
  props: {
    col: {
      type: Object,
      default: () => {},
    },
    data: {
      type: Object,
      default: () => {},
    },

    resizeCol: {
      default: true,
      type: Boolean,
    },
    filterable: {
      type: Boolean,
      default: false,
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
      sortStatus: this.$ms.enum.SortStatus.none,
      // autoResizex: false,
      showOption: false,
      showAllIconFilter: false,
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
    EventBusGlobal.$on(GlobalEventName.sortEvent, me.remoteSort);
  },
  methods: {
    remoteSort(col) {
      const me = this;
      if (me.col != col) {
        me.sortStatus = me.$ms.enum.SortStatus.none;
      }
    },
    sort(e) {
      const me = this;
      EventBusGlobal.$emit(GlobalEventName.sortEvent, me.col);
      me.sortStatus += 1;
      if (me.sortStatus > me.$ms.enum.SortStatus.asc) {
        // me.sortStatus = me.$ms.enum.SortStatus.none;
        // NMSINH: Nếu set none thì đối với các bảng có thiết lập sort lần đầu sẽ bị lỗi load lại 2 lần trạng thái asc
        me.sortStatus = me.$ms.enum.SortStatus.none;
      }
      me.$emit("sort", me.col, me.sortStatus);
    },
    testRender() {},
    //Bắt đầu co kéo cột
    resizeOn(event) {
      let me = this;
      this.$nextTick(() => {
        this.defaultwidth = this.$el.offsetWidth;
        // if (!this.minWidthx) {
        //   this.minWidthx = this.col._minWidth || this.col.width;
        // }
        this.minWidthx = 0;
      });
      this.resizeX = event.screenX;
      me.$emit("resizeOn", this.col);
      document.addEventListener("mousemove", this.mousemove);
    },
    //Di chuyển co kéo cột
    mousemove(e) {
      const me = this;
      me.cursorX = e.screenX;
      me.$emit("resizeMove", this.col);
      if (!me.isResizeActive) {
        me.isResizeActive = true;
        document.addEventListener("mouseup", me.resizeOff);
      }
    },
    //Ngừng co kéo cột
    resizeOff() {
      let me = this;
      me.$emit("resizeOff", me.col);
      document.removeEventListener("mousemove", me.mousemove);
      me.closeResizeOff();
      me.isResizeActive = false;
    },
    closeResizeOff() {
      document.removeEventListener("mouseup", this.resizeOff);
    },
    //Update lại động rộng của cột
    updateColWidth(autoResize) {
      const me = this;
      if (me.$el) {
        me.minWidth = me.col.width;
        me.$set(me.col, "_width", me.$el.offsetWidth);

        // me.widthx = me.$el.offsetWidth;
        me.$set(me.col, "autoResize", autoResize);
      }
    },
    /**
     * click vào icon option
     */
    optionClick(e) {
      e.preventDefault();
      filterHeaderUtil.showOption(this, this.col, this.isLock);
    },
    /**
     * Kiểm tra hiển thị menu lọc và cố định cột trên header grid
     * @author NVLAM 26.11.2020
     */
    showMenuHeader() {
      let me = this;
      //hiện cho cả trường hợp không cấu hình filterable
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
</style>