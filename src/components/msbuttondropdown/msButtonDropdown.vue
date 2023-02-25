<!-- =========================================================================================
	control button xòe xuống chọn như combo
  TDNGHIA 7/1/2021
========================================================================================== -->
<template>
  <div
    ref="buttonSplit"
    class="split-button button-dropdown d-inline-block"
    :class="[classCustom]"
  >
    <button
      v-tooltip="tooltipText"
      :value="internalValue"
      class="btn btn-dropdown"
      :class="[internalType || type]"
      :disabled="disabled"
      v-on="listeners"
      @click.prevent="toggleContext"
    >
      <div
        :class="[
          'icon-16 icon left',
          internalLeftIcon ? internalLeftIcon : leftIcon,
        ]"
      >
        &nbsp;
      </div>
      <div class="text" :class="[{ 'pl-0': internalLeftIcon || leftIcon }]">
        {{ internalText || text }}
      </div>

      <div
        :class="['icon-16 icon right', internalRightIcon || rightIcon]"
        @click.prevent="toggleContext"
      />
    </button>

    <vue-context
      ref="actionMenu"
      class="context-custom"
      :custom-position-menu="customPositionMenu"
      :custom-width="customWidth"
      :height-offset="heightOffset"
      :width-offset="widthOffset"
      @close="closeMenu"
    >
      <li
        v-for="(item, index) in currentMenuItems"
        :key="index"
        class="context-li"
      >
        <div
          class="context-item d-flex"
          @click.prevent="menuClick(item, $event)"
        >
          <div class="context-icon icon-16 icon" :class="item.icon"></div>
          <div class="context-text">{{ item.text }}</div>
        </div>
      </li>
    </vue-context>
  </div>
</template>
<script>
import VueContext from "@/components/vue-context/vue-context";
export default {
  name: "MsButtonDropdown",
  components: {
    VueContext,
  },
  props: {
    //Text hiển thị
    text: {
      default: "Chưa hoàn thành",
      type: String,
    },
    //Icon trái
    leftIcon: {
      default: "icon-inactive",
      type: String,
    },
    //Icon phải
    rightIcon: {
      default: "chevron-down",
      type: String,
    },
    //Loại button gồm 3 loại primary/secondary/third/four để hiện thị style tương ứng
    type: {
      default: "secondary",
      type: String,
    },
    /**
     * Trạng thái button disabled
     */
    disabled: {
      default: false,
      type: Boolean,
    },
    /**
     * Danh sách các item của context menu
     */
    menuItems: {
      type: Array,
      default: () => [],
    },
    /**
     * muốn đặt thêm stype cho lớp mục đích có cách để trên form tìm được đến control
     */
    classCustom: {
      default: "",
      type: String,
    },
    /**
     * có cho phép tự custom vị trí dropdown menu hay không
     */
    customPositionMenu: {
      type: Boolean,
      default: false,
    },
    /**
     * Set lại chiều dài menu dropdown
     */
    customWidth: {
      type: Number,
      default: 0,
    },
    /**
     * khoảng cách của button so với lề trên/dưới
     */
    heightOffset: {
      type: Number,
      default: 5, //25
    },
    /**
     * khoảng cách của button so với lề trái/phải
     */
    widthOffset: {
      type: Number,
      default: 25,
    },
    /**
     * Có show menu khi click vào icon right của button không, mặc định có
     */
    hasShowMenu: {
      type: Boolean,
      default: true,
    },
    /**
     * Có tooltip cho btt không
     */
    tooltipText: {
      type: [String, Object],
      default: null,
    },

    /**
     * value bindding dữ liệu
     */
    value: {},

    /**
     * Kiểm tra xem có phải validate trước khi thay đổi không
     */
    validateBeforeChange: {
      type: Boolean,
      default: false,
    },

    /**
     * dữ liệu cần tác động
     */
    dataItem: {},
  },
  data() {
    return {
      active: false,
      internalSelectedItem: null,
      internalText: null,
      internalLeftIcon: null,
      internalRightIcon: null,
      internalType: null,
      internalValue: 0, //Chưa thẩm định - ngừng theo dõi ....
      currentMenuItems: null,
    };
  },
  computed: {
    //Sự kiện từ 1 dòng dữ liệu emit ra ngoài
    listeners() {
      const me = this;
      return {
        click: (event) => {
          if (me.suppendClick) {
            delete me.suppendClick;
            return;
          }
          me.$emit("click", event);
        },
        mousedown: (event) => {
          event.preventDefault();
        },
        keydown: (event) => {
          me.$emit("keydown", event);
        },
        focus: (event) => {
          me.$emit("focus", event);
        },
      };
    },
  },

  watch: {
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;
        if (newVal != oldVal && newVal != null) {
          let selected = me.menuItems.find(function (item) {
            return item.value == newVal;
          });
          me.internalLeftIcon = selected.icon;
          me.internalRightIcon = selected.rightIcon;
          me.internalText = selected.text;
          me.internalType = selected.type;
          me.internalValue = selected.value;
          me.internalSelectedItem = selected;

          me.currentMenuItems = me.menuItems.filter(function (item) {
            return item.value != me.internalValue;
          });
        }
      },
    },

    menuItems: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;
        me.currentMenuItems = newVal.filter(function (item) {
          return item.value != me.internalValue;
        });
      },
    },

    internalValue: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;
        me.currentMenuItems = me.menuItems.filter(function (item) {
          return item.value != newVal;
        });
        me.$emit("input", newVal);
      },
    },
  },

  created() {},
  methods: {
    /**
     * click vào icon toggle menu
     */
    toggleContext(event) {
      const me = this;

      if (me.disabled) {
        return;
      }

      me.suppendClick = true;
      me.active = false;
      if (me.hasShowMenu) {
        let menu = me.$refs.actionMenu;
        if (!menu.show) {
          setTimeout(() => {
            me.active = true;
            menu.open(event);
          }, 10);
        }
      }
      me.$emit("toggleContext", event);
    },
    /**
     * click vào context menu item
     */
    menuClick(item, event) {
      const me = this;

      if (me.validateBeforeChange) {
        me.$emit(
          "beforeselect",
          item,
          event,
          me.dataItem,
          me.onChangeItem.bind(me, item, event)
        );
      } else {
        // me.internalLeftIcon = item.icon;
        // me.internalRightIcon = item.rightIcon;
        // me.internalText = item.text;
        // me.internalType = item.type;
        // me.internalValue = item.value;
        // me.internalSelectedItem = item;
        me.onChangeItem(item, event);
        me.$emit("menuclick", item, event);
      }
    },

    closeMenu() {
      this.active = false;
    },

    /**
     * thực hiện cập nhật giá trị cho button
     */
    onChangeItem(item, event) {
      const me = this;

      me.internalLeftIcon = item.icon;
      me.internalRightIcon = item.rightIcon;
      me.internalText = item.text;
      me.internalType = item.type;
      me.internalValue = item.value;
      me.internalSelectedItem = item;
      me.$emit("afterchange", item, event);
    },

    closeContext() {
      if (this.$refs.actionMenu.show) {
        this.$refs.actionMenu.close();
      }
    },
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msButton.scss";

.button-dropdown {
  .btn {
    background: #ffff !important;
    &:not(:disabled):hover {
      background: #ffff;
    }
    &:hover {
      cursor: pointer;
    }
    .text {
      padding-right: 0px;
      padding-left: 5px;
      min-width: 110px;
      text-align: left;
    }
    &.primary {
      color: #00c853;
      width: unset;
      border: 1px solid #00c853;
    }
    .right {
      margin: -7px 9px;
    }
  }

  .icon-16 {
    width: 16px;
    height: 16px;
    overflow: hidden;
    background: url($ms-image-CeGo_Sprites) no-repeat;
    &.icon-inactive {
      background-position: -80px -144px;
      height: 20px;
    }
    &.icon-active {
      background-position: -112px -144px;
      height: 20px;
    }
    &.chevron-down {
      background-position: -173px -51px;
      height: 20px;
    }
    &.chevron-active-down {
      background-position: -365px -51px;
      height: 20px;
    }
  }

  .context-custom {
    padding: 0px;
    .context-li {
      height: 36px;
      padding-top: 10px;
      &:hover {
        background-color: #f0f0f0;
        cursor: pointer;
      }
      .context-item {
        align-items: center;
        border-radius: 4px;
        padding: 0 30px 0 9px;
        &:hover {
          cursor: pointer;
          background-color: #f0f0f0;
        }
        .context-icon {
          margin-right: 5px;
        }
        .context-text {
          white-space: nowrap;
          height: 20px;
          font-size: 14px;
          font-weight: 100;
        }
      }
    }
  }
}
</style>
