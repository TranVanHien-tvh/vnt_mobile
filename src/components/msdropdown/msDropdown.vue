<template>
  <div class="ms-dropdown-content">
    <div
      v-if="!$slots.content && !$slots.icon"
      class=" "
    >
      <div
        v-if="type == 'primary'"
        class="flex items-center"
      >
        <div
          class="btn-text pr-4"
          @click="clickText"
        >
          {{ title }}
        </div>
        <div
          ref="icon"
          class="ms-icon--dropdown"
          v-on="listenersIcon"
        >
          <div :class="['mi','mi-24','mi-arrow-dropdown','icon-show--dropdown']" />
        </div>
      </div>
      <div
        v-else
        class="flex items-center  "
      >
        <button
          class="ms-button-dropdown"
          :class="[btnType,{'active-animation':animation && !disabled}]"
          :disabled="disabled"
          @click="clickText"
          v-on="listeners"
        >
          <div class="flex-1">
            {{ title }}
          </div>
          <div
            v-if="errorProvider.isValid"
            v-tooltip="{ content:errorProvider.message,show:focused,classes:`error`}"
            class="icon-input"
          >
            <div class="mi mi-20 mi-icon-error" />
          </div>
        </button>
        <button
          ref="icon"
          class="ms-icon--dropdown"
          :class="[btnType,{'active-animation':animation && !disabled}]"
          :disabled="disabled"
          v-on="listenersIcon"
        >
          <div class="ms-icon-btn-dropdown">
            <div
              :class="['mi','mi-24',btnType!='secondary'?'mi-arrow-dropdown-white':'mi-arrow-dropdown','icon-show--dropdown']"
            />
          </div>
        </button>
      </div>
    </div>
    <div
      v-else
      class="flex"
    >
      <div
        v-if="$slots.content"
        class="pr-4"
        @click="clickText"
      >
        <slot name="content" />
      </div>
      <div
        ref="icon"
        class="icon-show--dropdown "
        v-on="listenersIcon"
      >
        <slot name="icon" />
      </div>
    </div>
    <div
      v-show="showDropdownMenu"
      ref="dropdownMenu"
      class="ms-dropdown ms-dropdown"
      :class="customCssMenu"
      :style="styleDropdown"
    >
      <!-- <div class="arrow-square--dropdown" ref="square"></div> -->
      <slot :closeDropdown="closeDropdownMenu" />
    </div>
  </div>
</template>
<script>
import EventBusGlobal, { GlobalEventName } from "@/commons/eventBusGlobal";
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";

export default {
  name: "MsDropdown",
  extends: msBaseComponent,
  props: {
    //Title hi???n th???
    title: {
      default: null,
      type: String
    },
    //????? r???ng c???a dropdown menu
    width: {
      default: null,
      type: [Number, String]
    },
    /**
     * Lo???i drop down primary/button
     */
    type: {
      default: "primary",
      type: String
    },
    //Dropdown lo???i hi???n th??? button
    btnType: {
      default: "primary",
      type: String
    },
    //C???u h??nh ????? d??i t???i ??a cho dropdown
    height: {
      default: null,
      type: [Number, String]
    },
    //C???u h??nh scroll cho dropdown
    overflow: {
      default: "auto",
      type: String
    },
    //Thu???c t??nh disabled kh??ng cho th???c hi???n s??? ki???n m??? dropdown
    disabled: {
      default: false,
      type: Boolean
    },
    animation: {
      default: true,
      type: Boolean
    },
    placement: {
      default: null,
      type: String
    },
    eventActive: {
      default: "click",
      type: String
    },
    customCssMenu: {
      default: null,
      type: String
    }
  },
  data() {
    return {
      //Tr???ng th??i show dropdown hay kh??ng
      showDropdownMenu: false,
      focused: false
    };
  },
  computed: {
    listeners() {
      const me = this;
      return {
        focus: () => {
          me.focused = true;
        },
        blur: () => {
          me.focused = false;
        }
      };
    },
    listenersIcon() {
      const me = this;
      let event = {};
      if (me.eventActive == "mouseover") {
        event[me.eventActive] = () => {
          me.clickIcon(true);
        };
      } else {
        event[me.eventActive] = () => {
          me.clickIcon();
        };
      }
      return {
        ...event
      };
    },
    /**
     * set ????? d???ng cho dropdown menu
     */
    styleDropdown() {
      return {
        minWidth: `${this.width}px`,
        maxHeight: `${this.height}px`,
        overflow: this.overflow,
        height: "auto"
      };
    }
  },
  created() {
    const me = this;
    EventBusGlobal.$on(GlobalEventName.scrollEvent, me.scrollEvent);
    EventBusGlobal.$on(GlobalEventName.closeAllDropdown, me.closeDropdownMenu);
    window.addEventListener("resize", me.closeDropdownMenu);
  },
  beforeDestroy() {
    const me = this;
    me.closeDropdown();
    if (me.$refs.dropdownMenu) {
      me.$refs.dropdownMenu.remove();
    }
    EventBusGlobal.$off(GlobalEventName.scrollEvent, me.scrollEvent);
    EventBusGlobal.$off(GlobalEventName.closeAllDropdown, me.closeDropdownMenu);
    window.removeEventListener("resize", me.closeDropdownMenu);

    me.removeEventCloseDropdown();
  },
  methods: {
    scrollEvent(e) {
      if (this.showDropdownMenu) {
        this.closeDropdownMenu();
      }
    },
    //S??? ki???n click v??o ti??u ????? c???a dropdown
    //Created by LTDAT(13.06.2020)
    clickText(event) {
      const me = this;
      if (!me.disabled) {
        me.$emit("click", event);
      }
    },
    //S??? ki???n khi ???n v??o icon ????? m??? dropdownmenu
    //Created by LTDAT(13.06.2020)
    clickIcon(isShow) {
      const me = this;
      if (!me.disabled) {
        me.showDropdownMenu = isShow || !me.showDropdownMenu;
        me.$nextTick(() => {
          if (me.showDropdownMenu && me.$refs.dropdownMenu) {
            setTimeout(() => {
              me.updatePositionDropdownMenu();
              me.addEventCloseDropdown();
            }, 20);
            document.body.appendChild(me.$refs.dropdownMenu);
          }
        });
        me.$emit("clickIcon", me.showDropdownMenu);
      }
    },
    addEventCloseDropdown() {
      const me = this;
      switch (me.eventActive) {
        case "click":
          {
            document.addEventListener("mousedown", me.clickOff);
          }
          break;
        case "mouseover":
          {
            document.addEventListener("mousemove", me.clickOff);
          }
          break;
      }
    },
    removeEventCloseDropdown() {
      const me = this;
      switch (me.eventActive) {
        case "click":
          {
            document.removeEventListener("mousedown", me.clickOff);
          }
          break;
        case "mouseover":
          {
            document.removeEventListener("mouseleave", me.clickOff);
          }
          break;
      }
    },
    /**
     * ????ng dropdown menu
     */
    closeDropdownMenu() {
      const me = this;
      me.closeDropdown();
      me.removeEventCloseDropdown();
      // document.removeEventListener('mousedown', this.clickOff);
    },
    //C???p nh???t l???i t???a ????? c???a dropdown menu
    //Created by LTDAT(13.06.2020)
    updatePositionDropdownMenu() {
      const me = this;
      let rectDropdownMenu = me.$refs.dropdownMenu.getBoundingClientRect(),
        rectIcon = me.$el.getBoundingClientRect(),
        windowWidth =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth,
        windowHeight =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight;
      if (rectIcon.left + rectDropdownMenu.width > windowWidth) {
        me.$refs.dropdownMenu.style.left =
          rectIcon.right - rectDropdownMenu.width + "px";
        // me.$refs.square.style.right = '5px';
      } else {
        if (me.placement == "right") {
          me.$refs.dropdownMenu.style.left =
            rectIcon.right - rectDropdownMenu.width + "px";
        } else if (me.placement == "center") {
          me.$refs.dropdownMenu.style.left =
            rectIcon.left - rectDropdownMenu.width / 2 + "px";
        } else {
          me.$refs.dropdownMenu.style.left = rectIcon.left + "px";
        }
      }
      if (rectIcon.bottom + rectDropdownMenu.height > windowHeight) {
        me.$refs.dropdownMenu.style.top =
          rectIcon.top - rectDropdownMenu.height + "px";
      } else {
        me.$refs.dropdownMenu.style.top = rectIcon.bottom + 2 + "px";
      }
    },
    //S??? ki???n ????ng dropdown menu khi click ra ngo??i dropdownmenu
    clickOff(event) {
      const me = this;
      if (
        !event.target.closest(".ms-dropdown") &&
        !event.target.closest(".ms-icon--dropdown") &&
        !event.target.closest(".icon-show--dropdown") &&
        !event.target.closest(".calendar") &&
        !event.target.closest(".ms-mesage-box") &&
        !event.target.closest(".combo-dropdown-panel") &&
        !event.target.closest(".ms-dropdown") &&
        !event.target.closest("#loading-bg") &&
        !event.target.closest("#loading-filler")
      ) {
        me.closeDropdown(true);
        document.removeEventListener("mousedown", me.clickOff);
      }
      if (
        (event.target.closest(".icon-show--dropdown") &&
          event.target.closest(".icon-show--dropdown") != me.$refs.icon) ||
        (event.target.closest(".ms-icon--dropdown") &&
          event.target.closest(".icon-show--dropdown") != me.$refs.icon)
      ) {
        me.closeDropdown(true);
        me.removeEventCloseDropdown();
        // document.removeEventListener('mousedown', me.clickOff);
      }
    },
    closeDropdown(outSize = false) {
      const me = this;
      me.showDropdownMenu = false;
      me.$emit("close", outSize);
    }
  }
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msDropdown.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msDropdown.scss';
// }
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msDropdown.scss";
</style>
