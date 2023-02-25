<template>
  <div
    ref="buttonSplit"
    class="split-button d-inline-block"
    :class="[classCustom]"
  >
    <button
      v-tooltip="tooltipText"
      class="btn"
      :class="[type]"
      :disabled="disabled"
      v-on="listeners"
    >
      <div v-if="leftIcon" :class="['icon24 icon left', leftIcon]">&nbsp;</div>
      <div v-if="text" class="text" :class="[{ 'pl-0': leftIcon }]">
        {{ text }}
      </div>
      <div v-if="showSplitLine" class="button-line" />
      <div
        :class="['split-icon icon', { active: active }]"
        @click.prevent="toggleContext"
      >
        <div :class="['icon24 icon right', rightIcon]" />
      </div>
    </button>
    <!-- <div class="button-line"></div> -->

    <vue-context
      ref="actionMenu"
      :custom-position-menu="customPositionMenu"
      :custom-width="customWidth"
      :height-offset="heightOffset"
      :width-offset="widthOffset"
      @close="closeMenu"
    >
      <li v-for="(item, index) in menuItems" :key="index">
        <div
          href="javascript:void(0)"
          :class="['context-item has-icon flex-row', item.cls]"
          @click.prevent="menuClick(item, $event)"
        >
          <div v-if="item.icon" :class="['icon24 context-icon', item.icon]" />
          <div class="context-text flex">
            {{ item.text }}
          </div>
        </div>
      </li>
    </vue-context>
  </div>
</template>
<script>
import VueContext from "@/components/vue-context/vue-context";
export default {
  name: "MsSplitButton",
  components: {
    VueContext,
  },
  props: {
    //Text hiển thị
    text: {
      default: null,
      type: String,
    },
    //Icon trái
    leftIcon: {
      default: null,
      type: String,
    },
    //Icon phải
    rightIcon: {
      default: "chevron-down-white",
      type: String,
    },
    //Loại button gồm 3 loại primary/secondary/third/four để hiện thị style tương ứng
    type: {
      default: "primary",
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
     * ĐVThi 18/02/2020
     * muốn đặt thêm stype cho lớp mục đích có cách để trên form tìm được đến control
     */
    classCustom: {
      default: "",
      type: String,
    },
    /**
     * NNLAM 26/02/2020
     * có cho phép tự custom vị trí dropdown menu hay không
     */
    customPositionMenu: {
      type: Boolean,
      default: false,
    },
    /**
     * NNLAM 26/02/2020
     * Set lại chiều dài menu dropdown
     */
    customWidth: {
      type: Number,
      default: 0,
    },
    /**
     * NNLAM 26/02/2020
     * khoảng cách của button so với lề trên/dưới
     */
    heightOffset: {
      type: Number,
      default: 5, //25
    },
    /**
     * NNLAM 26/02/2021
     * khoảng cách của button so với lề trái/phải
     */
    widthOffset: {
      type: Number,
      default: 25,
    },
    /**
     * NNLAM 26/02/2021
     * Có show menu khi click vào icon right của button không, mặc định có
     */
    hasShowMenu: {
      type: Boolean,
      default: true,
    },
    /**
     * NNLAM 26/02/2021
     * Có tooltip cho btt không
     */
    tooltipText: {
      type: [String, Object],
      default: null,
    },

    /**
     * Hiển thị dấu phân cách ở button
     * NMTUAN2 23.09.2021
     */
    showSplitLine: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      active: false,
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
        // this.$refs.actionMenu.close();
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
      this.$emit("menuclick", item, event);
    },

    closeMenu() {
      this.active = false;
    },
  },
};
</script>
<style scoped lang="scss">
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msButton.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msButton.scss';
// }

@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msButton.scss";

.btn {
  padding-right: 26px !important;
  .text {
    padding-right: 0px;
  }
}

.split-icon {
  padding: 6px 0;
  margin:0px 0px 0px 6px !important;
  position: absolute;
  top: 0px;
  width: 24px;
  height: 24px;
  .icon {
    margin: 0;
    cursor: pointer;
  }
}

.context-item {
  line-height: 26px;
  margin: 0px 8px 4px 8px;
  height: 36px;
  padding: 2px 8px;
  line-height: 36px;
  border-radius: 4px;
  .context-text {
    padding: 0 8px;
    white-space: nowrap;
  }
  &:hover {
    cursor: pointer;
    background: #eff1f6;
  }
}
.context-icon {
  margin-right: 0px;
  margin-top: 4px;
}
.color-red {
  color: #ff0000;
}
</style>
