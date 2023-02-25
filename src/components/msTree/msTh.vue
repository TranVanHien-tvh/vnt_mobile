<template>
  <th
    :style="[styleWidth]"
    @mouseover="showMenuHeader()"
    @mouseleave="checkHideMenuHeader()"
  >
    <div class="flex-row">
      <!-- <slot name="check-box"></slot> -->
      <div
        class="ms-th-title flex"
        :title="col.tooltip || col.title || col.definition || col.caption"
        @click="sort"
      >
        <div
          v-if="multiple && colIndex == 0 && !isCustom"
          slot="check-box"
          style="width: 26px; margin-right: 13px"
        >
          <ms-checkbox
            :value="isCheckedMultiple"
            class="justify-center"
            check-only
            @click="changeCheckedMultiple"
          />
        </div>
        <!-- v-tooltip="col.tooltip" -->
        <p :class="[`text-${col.align || 'left'}`, col.cssClass]">
          {{ col.caption }}
        </p>
        <div
          v-show="
            (showOption || (filterable && showAllIconFilter)) && !col.notFilter
          "
          :title="$t('i18nCommon.command.filter')"
          class="icon24 filter-header-20"
          @click.stop="optionClick"
        />
      </div>

      <div
        class="ms-resize"
        @mouseup="resizeOff"
        @mousedown="resizeOn"
        @mouseover="hoverOn"
        @mouseleave="hoverOff"
      />
    </div>
  </th>
</template>
<script>
import EventBusGlobal, { GlobalEventName } from "@/commons/eventBusGlobal";
import filterHeaderUtil from "@/commons/filterHeaderUtil";
export default {
  name: "MsTh",
  props: {
    col: {},
    data: {},
    colIndex: {
      default: 0,
      type: Number,
    },
    multiple: {
      default: false,
      type: Boolean,
    },
    isCheckedMultiple: {
      default: null,
      type: [Function, Boolean],
    },
    changeCheckedMultiple: {
      default: null,
      type: Function,
    },
    /**
     * có filter cột không
     */
    filterable: {
      type: Boolean,
      default: true,
    },
    resizeCol: {
      default: true,
      type: Boolean,
    },
    /**
     * TDNGHIA biến kiểm tra xem có custom tree giống màn tổ chwucs cơ cấu hay không
     * TDNGHIA đẹp trai: 16/9/2021
     */
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cursorX: 0,
      widthx: 0,
      // autoResizex: false,
      showOption: false,
      sortStatus: this.$ms.enum.SortStatus.none,
      showAllIconFilter: false,
    };
  },
  computed: {
    styleWidth() {
      const me = this;
      if (me.autoResizex) {
        return {
          "min-width": me.widthx + "px",
        };
      }
      return {
        width: me.widthx + "px",
        "min-width": me.widthx + "px",
      };
    },
  },
  watch: {
    cursorX() {
      let offsetX = this.resizeX - this.cursorX;
      this.widthx = this.defaultwidth - offsetX;
    },
  },
  created() {
    const me = this;
    me.widthx = me.col.width;
    me.autoResizex = me.col.autoResize;
  },
  methods: {
    sort(e) {
      const me = this;
      EventBusGlobal.$emit(GlobalEventName.sortEvent, me.col);
      me.sortStatus += 1;
      if (me.sortStatus > me.$ms.enum.SortStatus.asc) {
        // me.sortStatus = me.$ms.enum.SortStatus.none;
        // NMSINH: Nếu set none thì đối với các bảng có thiết lập sort lần đầu sẽ bị lỗi load lại 2 lần trạng thái asc
        me.sortStatus = me.$ms.enum.SortStatus.desc;
      }
      me.$emit("sort", me.col, me.sortStatus);
    },

    //Bắt đầu co kéo cột
    resizeOn(event) {
      let me = this;
      this.$nextTick(() => {
        // Show border
        this.showBorder(event);
        this.defaultwidth = this.$el.offsetWidth;
      });
      let indexColumn = event.toElement.offsetParent.cellIndex;
      this.resizeX = event.screenX;
      me.$emit("resizeOn", this.col, indexColumn);
      document.addEventListener("mousemove", this.mousemove);
    },
    //Di chuyển co kéo cột
    mousemove(e) {
      const me = this;
      // Show border
      me.showBorder(e);
      me.cursorX = e.screenX;
      me.$emit("resizeMove", this.col);
      if (!me.isResizeActive) {
        me.isResizeActive = true;
        document.addEventListener("mouseup", me.resizeOff);
      }
    },
    //Ngừng co kéo cột
    resizeOff(event) {
      let me = this;
      // Hide border
      me.hideBorder(event);
      me.col.width = me.$el.offsetWidth;
      me.$emit("resizeOff", me.col);
      document.removeEventListener("mousemove", me.mousemove);
      me.closeResizeOff();
      me.isResizeActive = false;
    },
    closeResizeOff() {
      document.removeEventListener("mouseup", this.resizeOff);
    },
    //Update lại động rộng của cột
    updateColWidth() {
      const me = this;
      if (me.$el) {
        me.widthx = me.$el.offsetWidth;
        me.autoResizex = false;
      }
    },
    /**
     * click vào icon option
     */
    optionClick() {
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
      if (this.col.hasActionFilter | this.showAllIconFilter) {
        this.showOption = true;
      } else {
        this.showOption = false;
      }
    },
    /**
     * Sự kiện hover vào
     */
    hoverOn(event) {
      this.showBorder(event);
    },
    /**
     * Sự kiện hover ra
     */
    hoverOff(event) {
      const me = this;
      this.hideBorder(event);
      document.removeEventListener("mouseover", me.hoverOn);
      document.removeEventListener("mouseleave", me.hoverOff);
    },
    /**
     * Hiển thị border khi hover ra
     */
    showBorder(event) {
      let x = document
        .getElementsByClassName("ms-grid-viewer")[0]
        .offsetParent.getBoundingClientRect().left;
      document.getElementsByClassName("col-sp")[0].style.display = "block";
      document.getElementsByClassName("col-sp")[0].style.left =
        document
          .getElementsByClassName("ms-resize")
          [this.colIndex].offsetParent.getBoundingClientRect().right -
        x +
        "px";
    },
    /**
     * Ẩn border khi hover ra
     */
    hideBorder(event) {
      document.getElementsByClassName("col-sp")[0].style.display = "none";
      document.getElementsByClassName("col-sp")[0].style.left = "0px";
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msTree.scss";
</style>