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
    //Trạng thái đóng mở popup
    active: {
      default: true,
      type: Boolean,
    },
    //Độ rộng của popup
    width: {
      default: 0,
      type: Number,
    },
    //Độ cao của popup
    height: {
      default: 0,
      type: Number,
    },
    //Cấu hình popup hiện thị full màn hình
    fullScreen: {
      default: false,
      type: Boolean,
    },
    //Cấu hình popup hiện thị full che lấp vừa khít với thẻ .main-view
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
    //ĐVThi 21/01/2021: Cấu hình có show Modle hay không, dùng cho form chi tiết vai trò
    showModal: {
      default: true,
      type: Boolean,
    },
    // //ĐVThi 21/01/2021: Cấu hình động z-index: Do form popup lại gọi đến form popup khác dẫn đến cùng z-index dẫn đến bị ẩn về phía sau
    // zIndex: {
    //   default: 10,
    //   type: Number
    // },
    /**
     * Nếu bật cờ này thì nội dung sẽ flex theo popup
     */
    flex: {
      type: Boolean,
      default: false,
    },
    /**
     * Hiển thị footer
     */
    showFooter: {
      type: Boolean,
      default: true,
    },
    /**
     * Có icon maximum k
     */
    maximumable: {
      type: Boolean,
      default: false,
    },
    /**
     * Tự động đóng khi click vào nút đóng
     */
    autoClose: {
      type: Boolean,
      default: false,
    },
    /**
     * Trạng thái loading của cả popup
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Có icon help k
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
     * class ở mục content
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
     * Phục vụ custom style kích thước, vụ trí của popup
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
        Close: ["esc"], //Đóng
        Save: ["ctrl", "s"], //Cất
        SaveAndAdd: ["ctrl", "shift", "s"], //Cất và thêm
        Help: ["f1"], //Giúp
        Print: ["ctrl", "p"], //IN
        Maximum: ["ctrl", "space"], //phóng to thu nhỏ form
        QuickSelect: ["f3"], //chọn nhanh
      },
    };
  },
  //Tính toán lại độ rộng,độ cao,vị trí của popup và đưa element popup ra ngoài body
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
       * Focus control nhập liệu đầu tiên khi mở ra
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
     * Cập nhật lại độ rộng vào độ cao của grid khi kích cỡ màn hình thay đổi
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

      //đánh dấu là đã render để xử lý style
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
     * Lấy độ rộng của màn hình
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
     * Lấy độ cao của màn hình
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
     * Xử lý sự kiện keydown trên popup
     * Created by LTDAT 26.06.2020
     * NNLAM cmt vào ngày 12/06/2021: do dùng mixin phím tắt rồi nên bỏ cái này đi cho đỡ rối và đỡ ảnh hưởng
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
     * Sự kiện bắt đầu kéo di chuyển popup
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
     * ẩn picker đi
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
     * Sự kiện thả di chuyển popup
     */
    offDraggable() {
      const me = this;
      me.$nextTick(() => {
        me.$refs.dragable.active = false;
        me.isDraggable = false;

        me.setPickerDisplay(".datepicker-content", true);
      });
    },
    //SỰ kiện đóng popup
    closePopup(event) {
      const me = this,
        active = false;
      if (me.autoClose) {
        me.$emit("update:active", false);
      }
      me.$emit("close", active, event);
    },
    //SỰ kiện mở link help
    helpLink() {
      const me = this;
      let url = me.$ms.commonFn.helpAms(me.helpId);
      window.open(url, "_blank");
    },
    /**
     * click vào maximum
     */
    maximumClick() {
      const me = this;
      me.maximum = !me.maximum;
      me.updateSizePopup(false);
    },
    /**
     * emit event phím tắt
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