<template>
  <div
    v-show="active"
    :class="[
      { 'ms-popup-main': showModal, 'full-screen': fullScreen },
      'ams-popup',
    ]"
    :style="customOuterPopupStyle"
    @keydown="onKeydown"
  >
    <div v-if="showModal" class="popup-modal" />
    <span
      ref="shortkey"
      v-shortkey="shortkey || defaultShortKey"
      class="popup-shortkey"
      @shortkey="shortkeyAction"
    />
    <msDragable
      ref="dragable"
      :w="widthx"
      :h="heightx"
      :z="10"
      :x="posX"
      :y="posY"
      :is-resizable="false"
      :is-draggable="isDraggable"
      :class="{
        'full-main-view flex-column': fullMainView,
        'left-menu-collapse': leftMenuCollapse,
        'right-menu-view': isRight,
      }"
      @dragstop="offDraggable"
    >
      <div
        ref="popup"
        class="ms-popup"
        :class="{
          'none-pop-modal': !showModal,
          'flex-column': flex,
          full: rendered,
          flex: fullMainView,
        }"
        :style="{ height: height ? heightx + 'px' : 'auto' }"
        @mousedown="onDraggable"
      >
        <div class="buttons">
          <div
            v-if="showHelpIcon"
            v-tooltip="mapShortkeyTooltip('Help')"
            shortkey-target="Help"
            class="button help"
            @click="helpLink"
          />
          <div
            v-if="maximumable"
            v-tooltip="mapShortkeyTooltip('Maximum')"
            shortkey-target="Maximum"
            class="button maximum"
            :class="{ full: maximum }"
            @click="maximumClick"
          />
          <div
            v-if="showCloseIcon"
            v-tooltip="mapShortkeyTooltip('Close')"
            class="button"
            shortkey-target="Close"
            :class="[
              { 'close-red': focusIconClose, close: !focusIconClose },
              classClose,
            ]"
            @mouseover="focusIconClose = true"
            @mouseout="focusIconClose = false"
            @click="closePopup"
          />
        </div>

        <!-- <div class="popup-header" @mousedown="onDraggable"> -->
        <div class="popup-header">
          <slot name="header" />
        </div>
        <div
          class="popup-content"
          :class="[classListContent, { 'flex flex-column': flex }]"
        >
          <slot name="content" />

          <div v-if="loading" class="loading" />
        </div>
        <div v-if="showFooter" class="popup-footer">
          <slot name="footer" />
        </div>
      </div>
    </msDragable>
  </div>
</template>
<script>
import msDragable from "@/components/msdragable/vue-drag-resize.vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
import commonFn from "@/commons/commonFunction";
import { shortkeyStatusbar } from "@/mixins/common/shortkeyStatusbar";
export default {
  name: "MsPopup",
  components: {
    msDragable,
  },
  mixins: [shortkeyStatusbar],
  props: {
    //Tr???ng th??i ????ng m??? popup
    active: {
      default: true,
      type: Boolean,
    },
    //????? r???ng c???a popup
    width: {
      default: 0,
      type: Number,
    },
    //????? cao c???a popup
    height: {
      default: 0,
      type: Number,
    },
    //C???u h??nh popup hi???n th??? full m??n h??nh
    fullScreen: {
      default: false,
      type: Boolean,
    },
    //C???u h??nh popup hi???n th??? full che l???p v???a kh??t v???i th??? .main-view
    fullMainView: {
      default: false,
      type: Boolean,
    },
    isRight: {
      default: false,
      type: Boolean,
    },
    showCloseIcon: {
      default: true,
      type: Boolean,
    },
    //??VThi 21/01/2021: C???u h??nh c?? show Modle hay kh??ng, d??ng cho form chi ti???t vai tr??
    showModal: {
      default: true,
      type: Boolean,
    },
    // //??VThi 21/01/2021: C???u h??nh ?????ng z-index: Do form popup l???i g???i ?????n form popup kh??c d???n ?????n c??ng z-index d???n ?????n b??? ???n v??? ph??a sau
    // zIndex: {
    //   default: 10,
    //   type: Number
    // },
    /**
     * N???u b???t c??? n??y th?? n???i dung s??? flex theo popup
     */
    flex: {
      type: Boolean,
      default: false,
    },
    /**
     * Hi???n th??? footer
     */
    showFooter: {
      type: Boolean,
      default: true,
    },
    /**
     * C?? icon maximum k
     */
    maximumable: {
      type: Boolean,
      default: false,
    },
    /**
     * T??? ?????ng ????ng khi click v??o n??t ????ng
     */
    autoClose: {
      type: Boolean,
      default: false,
    },
    /**
     * Tr???ng th??i loading c???a c??? popup
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * C?? icon help k
     */
    showHelpIcon: {
      type: Boolean,
      default: false,
    },
    /**
     * link help
     */
    helpId: {
      type: String,
      default: "",
    },
    /**
     * class ??? m???c content
     */
    classListContent: {
      default: null,
      type: String,
    },
    classClose: {
      default: null,
      type: String,
    },
    shortkey: {
      default: null,
      type: [String, Object],
    },
    /**
     * Ph???c v??? custom style k??ch th?????c, v??? tr?? c???a popup
     * NMTUAN2 03.12.2021
     */
    customOuterPopupStyle: {
      default: null,
      type: String,
    },
  },
  data() {
    return {
      isDraggable: false,
      widthx: 0,
      heightx: 0,
      maximum: false,
      rendered: false,
      focusIconClose: false,
      defaultShortKey: {
        Close: ["esc"], //????ng
        Save: ["ctrl", "s"], //C???t
        SaveAndAdd: ["ctrl", "shift", "s"], //C???t v?? th??m
        Help: ["f1"], //Gi??p
        Print: ["ctrl", "p"], //IN
        Maximum: ["ctrl", "space"], //ph??ng to thu nh??? form
        QuickSelect: ["f3"], //ch???n nhanh
      },
    };
  },
  //T??nh to??n l???i ????? r???ng,????? cao,v??? tr?? c???a popup v?? ????a element popup ra ngo??i body
  created() {
    let me = this;
    me.updateSizePopup(me.fullScreen);
    window.addEventListener("resize", me.updateSizePopup);
  },
  mounted() {
    const me = this;
    document.body.appendChild(me.$el);

    me.$nextTick(() => {
      me.updateSizePopup(me.fullScreen);

      /**
       * Focus control nh???p li???u ?????u ti??n khi m??? ra
       */
      me.$ms.commonFn.focusFirstControlInput(me.$el);
    });
  },
  computed: {
    // heightDefault() {
    //   const me = this;
    //   if (me.fullScreen || me.height) {
    //     return null;
    //   }
    //   return { height: "auto" };
    // },
    ...mapGetters({
      leftMenuCollapse: ModuleContext + "/LeftMenuCollapse",
    }),
  },
  watch: {
    posY(newVal, oldVal) {
      let x = 1;
    },
    active(value) {
      if (value) {
        this.$ms.commonFn.shortkeyPushView(this.$el);
        this.$nextTick(() => {
          this.$ms.commonFn.focusFirstControlInput(this.$el);
        });
      } else {
        this.$ms.commonFn.shortkeyPopView(this.$el);
      }
    },
  },
  beforeDestroy() {
    const me = this;
    window.removeEventListener("resize", me.updateSizePopup);
  },
  methods: {
    /**
     * C???p nh???t l???i ????? r???ng v??o ????? cao c???a grid khi k??ch c??? m??n h??nh thay ?????i
     * Created by LTDAT 26.06.2020
     */
    updateSizePopup(fullScreen) {
      let me = this,
        windowWidth = me.getWindowWidth(),
        windowHeight = me.getWindowHeight();
      if (fullScreen == true || me.maximum) {
        if (fullScreen == true) {
          me.lastHeight = me.height;
          me.lastWidth = me.width;
          me.maximum = true;
        } else {
          me.lastHeight = me.heightx;
          me.lastWidth = me.widthx;
        }

        me.widthx = windowWidth;
        me.heightx = windowHeight;
        me.posX = 0;
        me.posY = 0;
      } else {
        me.widthx = me.lastWidth || me.getPopupWidth() || windowWidth;
        me.heightx = me.lastHeight || me.getPopupHeight() || windowHeight;
        me.posX = Math.max((windowWidth - me.widthx) / 2, 0);
        me.posY = Math.max((windowHeight - me.heightx) / 2, 0);
      }

      //????nh d???u l?? ???? render ????? x??? l?? style
      if (me.maximum && me.$el) {
        me.rendered = true;
      }
    },

    /**
     * move popup ra center window
     */
    center() {
      const me = this,
        windowWidth = me.getWindowWidth(),
        windowHeight = me.getWindowHeight();

      me.widthx = me.lastWidth || me.getPopupWidth() || windowWidth;
      me.heightx = me.lastHeight || me.getPopupHeight() || windowHeight;

      me.posX = Math.max((windowWidth - me.widthx) / 2, 0);
      me.posY = Math.max((windowHeight - me.heightx) / 2, 0);
    },

    getPopupWidth() {
      let width = this.width;
      if (this.$refs.popup && this.$refs.popup.offsetWidth) {
        width = this.$refs.popup.offsetWidth;
      }

      return width;
    },

    getPopupHeight() {
      let height = this.height;
      if (this.$refs.popup && this.$refs.popup.offsetHeight) {
        height = this.$refs.popup.offsetHeight;
      }

      return height;
    },

    /**
     * L???y ????? r???ng c???a m??n h??nh
     * Created by LTDAT 26.06.2020
     */
    getWindowWidth() {
      let windowWidth =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
      return windowWidth;
    },
    /**
     * L???y ????? cao c???a m??n h??nh
     * Created by LTDAT 26.06.2020
     */
    getWindowHeight() {
      let windowHeight =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      return windowHeight;
    },

    /**
     * X??? l?? s??? ki???n keydown tr??n popup
     * Created by LTDAT 26.06.2020
     * NNLAM cmt v??o ng??y 12/06/2021: do d??ng mixin ph??m t???t r???i n??n b??? c??i n??y ??i cho ????? r???i v?? ????? ???nh h?????ng
     */
    onKeydown(e) {
      const me = this;
      // if (e.which == 27 && !e.cancel) {
      //   e.preventDefault();
      //   e.cancel = true;

      //   me.closePopup();
      // }
      me.$emit("keydown", e);
    },
    /**
     * S??? ki???n b???t ?????u k??o di chuy???n popup
     */
    onDraggable(event) {
      const me = this;
      if (
        !event.target.closest("input:not([disabled='disabled'])") &&
        !event.target.closest("input:not([readOnly='true'])") &&
        !event.target.closest("textarea:not([disabled='disabled'])") &&
        !event.target.closest("textarea:not([readOnly='true'])") &&
        !event.target.closest(".ms-dropdown") &&
        !event.target.closest(".ms-icon--dropdown") &&
        !event.target.closest(".icon-show--dropdown") &&
        !event.target.closest(".calendar") &&
        !event.target.closest(".ms-datepicker") &&
        !event.target.closest(".ms-mesage-box") &&
        !event.target.closest(".combo-dropdown-panel") &&
        !event.target.closest(".ms-dropdown") &&
        !event.target.closest(".ms-button") &&
        !event.target.closest("button") &&
        !event.target.closest(".button") &&
        !event.target.closest(".icon24") &&
        !event.target.closest(".scroller") &&
        !event.target.closest(".ms-resize") &&
        !event.target.closest(".range-slider-knob") &&
        !event.target.closest(".resizable-component")
      ) {
        if (!me.maximum) {
          me.isDraggable = true;
        }

        me.setPickerDisplay(".combo-dropdown-panel", false);
        me.setPickerDisplay(".datepicker-content", false);
      }
    },

    /**
     * ???n picker ??i
     */
    setPickerDisplay(selector, value) {
      let pickers = document.querySelectorAll(selector);
      if (pickers && pickers.length > 0) {
        for (let i = 0; i < pickers.length; i++) {
          pickers[i].hidden = !value;
        }
      }
    },

    /**
     * S??? ki???n th??? di chuy???n popup
     */
    offDraggable() {
      const me = this;
      me.$nextTick(() => {
        me.$refs.dragable.active = false;
        me.isDraggable = false;

        me.setPickerDisplay(".datepicker-content", true);
      });
    },
    //S??? ki???n ????ng popup
    closePopup(event) {
      const me = this,
        active = false;
      if (me.autoClose) {
        me.$emit("update:active", false);
      }
      me.$emit("close", active, event);
    },
    //S??? ki???n m??? link help
    helpLink() {
      const me = this;
      let url = me.$ms.commonFn.helpAms(me.helpId);
      window.open(url, "_blank");
    },
    /**
     * click v??o maximum
     */
    maximumClick() {
      const me = this;
      me.maximum = !me.maximum;
      me.updateSizePopup(false);
    },
    /**
     * emit event ph??m t???t
     */
    shortkeyAction(e) {
      let me = this;
      switch (e.srcKey) {
        // case 'Help':
        //   if(me.showHelpIcon){
        //     me.helpLink();
        //   }
        //   break;
        // case 'Close':
        //   me.closePopup();
        //   break;
        // case 'Maximum':
        //   if(me.maximumable){
        //     me.maximumClick();
        //   }
        //   break;
        default:
          this.$emit("shortkeyAction", e);
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/msPopup.scss";
</style>