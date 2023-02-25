<template>
  <div
    ref="dropdownContainer"
    class="combo-dropdown-panel"
    :style="dropdownStyles"
  >
    <!-- Phần header của menu khi có grid-->
    <div
      ref="menuBodyCon"
      class="dropdown-body-container scroller"
      :style="dropdownBodyStyle"
      @scroll.stop="onDropdownMenuScroll"
    >
      <table
        v-if="columnx && columnx.length > 0"
        class="dropdown-table"
        :style="headerStyle"
      >
        <thead class="dropdown-header">
          <tr>
            <th
              v-for="(column, index) in columnx"
              :key="index"
              class="dropdown-header__th"
              :title="column.tooltip"
              :style="getThStyle(column)"
            >
              <span>{{ column.title }}</span>
            </th>
            <th class="dropdown-header__th" />
          </tr>
        </thead>
        <tbody
          ref="dropdownItems"
          class="dropdown-items"
        >
          <slot />
        </tbody>
      </table>
      <!-- Phần nội dung grid combo không có column -->
      <ul
        v-else-if="comboType === 1"
        ref="dropdownItems"
        class="dropdown-items"
      >
        <slot />
      </ul>
      <!-- Phần nội dung grid combo có columns và combo tree -->
      <table
        v-else
        class="dropdown-table"
      >
        <tbody
          ref="dropdownItems"
          class="dropdown-items"
        >
          <slot />
        </tbody>
      </table>
    </div>

    <!-- Hiển thị loading khi chưa có dữ liệu -->
    <div
      v-if="loading"
      class="dropdown--loading"
    >
      <div class="loading">
        <div class="effect-1 effects" />
      </div>
    </div>
    <!--  -->

    <!-- Show thông báo khi không có dữ liệu hiển thị -->
    <div
      v-else-if="showEmptyText"
      class="no-data-display"
      @click="addNewClick"
    >
      <div class="no-data-display__text">
        {{ $t("i18nComponent.Combobox.EmptyText") }}
      </div>
    </div>
    <!--  -->
  </div>
</template>

<script>
export default {
  name: "MsComboBoxDropdown",
  props: {
    /**
     * Loại combo sử dụng để style cột
     */
    comboType: {
      type: Number,
      default: 1,
    },
    /**
     * Số lượng item hiển thị ở dropdown
     */
    maxItemsDisplay: {
      type: Number,
      default: 5,
    },

    /**
     * Các cột của dropdown
     */
    columnx: {
      type: Array,
      default() {
        return [];
      },
    },

    /**
     * Có hiển thị empty text không
     */
    showEmptyText: {
      type: Boolean,
      default: false,
    },

    /**
     * Trạng thái `loading`
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Độ rộng phần dropdown, nếu bằng <=0 hoặc Auto sẽ tự động tính toán
     * CreatedBy PDKIEN 09/12/2019
     */
    dropdownWidth: {
      type: [Number, String],
      default: 0,
    },
    /**
     * Có dữ liệu  hay  không
     * CreatedBy PDKIEN 10/112/2019
     */
    hasData: {
      type: Boolean,
      default: true,
    },
    topx: {
      type: Number,
      default: null,
    },
    leftx: {
      type: Number,
      default: null,
    },
    maxWidthx: {
      type: Number,
      default: null,
    },
    minWidthx: {
      type: Number,
      default: null,
    },
    /**
     * vị trí bản ghi được chọn trước đó
     */
    highlighIndex: {
      type: Number,
      default: null,
    },
    /**
     * vị trí scroll cũ
     */
    scrollTop: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      containerWidth: 0,
    };
  },
  computed: {
    headerStyle() {
      return {
        // width: this.headerWidth + "px"
      };
    },

    headerWidth() {
      let width = 0;

      if (this.containerWidth) {
        width = this.containerWidth;
      } else if (this.columnx && this.columnx.length > 0) {
        for (let index = 0; index < this.columnx.length; index++) {
          const element = this.columnx[index];
          if (element.width) {
            width = width + element.width;
          }
        }
      }

      return width;
    },
    /**
     * Style cho dropdown
     */
    dropdownStyles() {
      let width = this.headerWidth,
        docWidth = document.body.clientWidth,
        left = this.leftx;
      if (left + width + this.dropdownWidth > docWidth) {
        left = left - (width + left + this.dropdownWidth - docWidth);
      }

      let res = {
        top: this.topx + "px",
        // left: left + "px",
        minWidth: this.minWidthx + "px",
        maxWidth: this.forceMaxWidth ? this.maxWidthx + "px" : null,
      };

      if (left + width >= docWidth) {
        res.right = "10px";
      } else {
        res.left = left + "px";
      }

      return res;
    },

    /**
     * Set lại chiều cao tối đa của dropdown nếu số lượng item hiển thị khác default
     */
    dropdownBodyStyle() {
      let me = this;
      if (me.maxItemsDisplay !== 5) {
        return {
          maxHeight: `${me.maxItemsDisplay * 36 + 16}px`,
        };
      } else {
        return {
          maxHeight: `125px`,
        };
      }
    }
  },
  mounted() {
    let me = this;

    // Append menu vào thẻ body
    me.insertBody();
    // Thêm event click vào document
    // document.addEventListener('click', me.onDocumentClick);

    // document.addEventListener('scroll', me.onDocumentScroll, true);

    // window.addEventListener('resize', me.onWindowResize);

    //highlight
    if (me.scrollTop > 0) {
      me.$refs["menuBodyCon"].scrollTop = me.scrollTop;
    } else if (me.highlighIndex > -1) {
      let top = me.highlighIndex * 36;
      me.$refs["menuBodyCon"].scrollTop = top;
    }

    me.$nextTick(() => {
      if (me.$refs.dropdownContainer) {
        me.containerWidth = me.$refs.dropdownContainer.clientWidth;
      }
    });
  },
  beforeDestroy() {
    let me = this;

    // me.$el.parentNode.removeChild(me.$el);

    // document.removeEventListener('click', me.onDocumentClick);

    // document.removeEventListener('scroll', me.onDocumentScroll, true);

    // window.removeEventListener('resize', me.onWindowResize);
    this.$emit("update:scrollTop", this._scrollTop);
  },

  methods: {
    /**
     * Hàm lấy style cho th trong table
     * dữ liệu động theo config của dev
     */
    getThStyle(column) {
      return {
        width: column.isResize ? null : `${column.width}px`,
        textAlign: column.titleAlign,
      };
    },

    /**
     * Xử lý sự kiện click bất kỳ đâu trên document
     */
    onDocumentClick(event) {
      let me = this,
        targetCombo = event.target.closest(".ms-combo"),
        comboEl = me.$parent.$el;

      if (targetCombo !== comboEl) {
        me.$parent.collapse();
      }
    },

    /**
     * Sự kiện khi scroll dropdown menu
     */
    onDropdownMenuScroll(e) {
      let target = e.target;
      // kiểm tra nếu scroll to bottom -> emit để combobox load thêm dữ liệu
      if (target.scrollTop >= target.scrollHeight - target.offsetHeight) {
        this.$emit("scrollend");
      }

      this._scrollTop = target.scrollTop;
    },

    /**
     * Xử lý sự kiện scroll document
     * - Đóng menu
     */
    onDocumentScroll(event) {
      let me = this,
        comboMenu = event.target.closest(".combo-dropdown-panel");
      if (!comboMenu || comboMenu !== me.$el) {
        me.$parent.collapse();
      }
    },

    onWindowResize() {
      let me = this;
      me.$parent.collapse();
    },

    /**
     * Hàm append dropdown menu vào thẻ body
     * append vào trước phần tử đầu tiên trong thẻ body
     */
    insertBody() {
      let me = this,
        elm = me.$el;
      document.body.insertBefore(elm, document.body.firstChild);
    },
    /**
     * Thêm mới
     */
    addNewClick() {
      this.$emit("addNew");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msComboboxDropdown.scss";
</style>

