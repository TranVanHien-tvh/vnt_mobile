<template>
  <div class="filter-group">
    <div class="flex-row">
      <ms-button
        type="secondary "
        :text="$t('i18nCommon.command.filterGroup')"
        :left-icon="isShowRemoveFilter && isFilter ? 'filter-active' : 'filter'"
        class="btn-filter mr-2"
        @click="showFilterBox"
      />
      <ms-button
        v-if="isShowRemoveFilter && isFilter"
        type="text"
        class="custom-remove-filter mr-2"
        :text="$t('i18nCommon.command.removeFilter')"
        @click="removeFilterGrid"
      />
    </div>

    <div
      v-show="isShowFilter"
      ref="filterbox"
      class="filter-box"
      :style="[
        { right: distanceRight + 'px' },
        { width: filterBoxWidth + 'px' },
      ]"
    >
      <span
        class="custom-arrow"
        :class="{ 'right-box': toTheRight }"
        :style="{ right: arrowFilterBoxAlign + 'px' }"
      />

      <!-- header -->
      <div class="box-header">
        <span class="title">
          <slot name="header" />
        </span>
        <i class="icon24 deleteX close-icon" @click="hiddenFilterBox" />
      </div>

      <!-- content -->
      <div class="box-content flex-column" :class="[classListContent]">
        <slot name="content" />
      </div>

      <!-- footer -->
      <div class="box-footer">
        <div class="right-content">
          <ms-button
            type="secondary"
            :text="$t('i18nCommon.command.cancel')"
            class="mr-2"
            @click="hiddenFilterBox"
          />
          <ms-button
            type="primary"
            :text="$t('i18nCommon.command.apply')"
            @click="filterGrid"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
import commonFn from "@/commons/commonFunction";
import { shortkeyStatusbar } from "@/mixins/common/shortkeyStatusbar";

export default {
  name: "MsFilterBox",
  components: {},
  mixins: [shortkeyStatusbar],

  props: {
    /**
     * class ??? m???c content
     */
    classListContent: {
      default: null,
      type: String,
    },

    /**
     * ????? r???ng c???a filterbox
     * NMTUAN2 24.09.2021
     */
    filterBoxWidth: {
      default: 360,
      type: [Number, String],
    },

    /**
     * c??? quy???t ?????nh c?? hi???n th??? n??t B??? l???c kh??ng
     * NMTUAN2 24.09.2021
     */
    isShowRemoveFilter: {
      default: true,
      type: Boolean,
    },

    /**
     * C??? ????nh d???u d??ng ??? m??n n??o
     * true: List, false: popup
     * NMTUAN2 03.11.2021
     */
    isMainView: {
      default: true,
      type: Boolean,
    },
    // /**
    //  * Kho???ng c??ch c???a m??i t??n b??n tr??n c???a boxFilter
    //  * DHPHI 27/09/2021
    //  */
    // arrowFilterBoxAlign: {
    //   default: 20,
    //   type: Number,
    // },
  },

  data() {
    return {
      widthx: 0,
      heightx: 0,
      isShowFilter: false,
      isFilter: false,
      // Kho???ng c??ch filter box
      distanceRight: 0,
      // Kho???ng c??ch c???a m??i t??n b??n tr??n c???a boxFilter
      arrowFilterBoxAlign: 20,
      toTheRight: false,
    };
  },

  computed: {},

  watch: {},

  created() {
    this.setEscapeEvent();
    document.addEventListener("click", this.closeOut);
  },
  beforeDestroy() {
    const me = this;
    document.removeEventListener("click", me.closeOut);
    document.removeEventListener("keydown", me.eventEscape);
  },

  mounted() {
    const me = this;
    me.$nextTick(() => {
      me.updateSizePopup();
    });
  },

  methods: {
    updateSizePopup() {
      let me = this,
        width = me.filterBoxWidth,
        filterButtonWidth = me.$el.offsetWidth, // ????? r???ng n??t filter
        leftToolbarWidth =
          filterButtonWidth +
          (me.$el.offsetLeft -
            (me.isMainView ? me.$el.closest(".main-view").offsetLeft + 16 : 0)); //16:padding main-view, k/c t??? n??t filter t???i left menu

      me.distanceRight = 0;
      if (width == leftToolbarWidth) {
        // ????? d??i leftToolbar = ????? d??i popup filter
        me.distanceRight = 0;
      } else if (filterButtonWidth == leftToolbarWidth) {
        // ????? d??i leftToolbar = ????? d??i button filter
        me.distanceRight = -(width - filterButtonWidth);
      } else if (width > leftToolbarWidth) {
        // ????? d??i left toolbar < ????? d??i filterbox
        me.distanceRight = -(width - leftToolbarWidth);
      } else {
        me.distanceRight = leftToolbarWidth - width;
      }

      me.arrowFilterBoxAlign = -me.distanceRight + 25; // 20: align g???c c???a n??
    },

    /**
     * show filter popup
     */
    showFilterBox() {
      if (this.isShowFilter == true) {
        this.isShowFilter = false;
      } else {
        this.isShowFilter = true;
      }
      /**
       * Focus control nh???p li???u ?????u ti??n khi m??? ra
       */
      this.$ms.commonFn.focusFirstControlInput(this.$refs.filterbox);
      this.updateSizePopup();
    },

    /**
     * hide filter popup
     */
    hiddenFilterBox(event) {
      this.isShowFilter = false;
    },
    /**
     * Th???c hi???n l???c theo c??c combobox
     * NMTUAN3 15/4/2022: Tr?????ng h???p combo th?????ng th?? check th??m gi?? tr??? text "T???t c???"
     */
    filterGrid() {
      const me = this;

      let listFilterBox = [];
      let listInput = me.$el.querySelectorAll(".ms-editor"); //listInput

      if (listInput && listInput.length > 0) {
        listInput.forEach((item) => {
          if (item.getVueInstance && typeof item.getVueInstance == "function") {
            let vueObj = item.getVueInstance();

            if (
              vueObj.valueAllSelected !== vueObj.internalValue &&
              vueObj.internalValue !== null &&
              vueObj.internalValue !== "T???t c???"
            ) {
              if (vueObj.nameEnum !== null) {
                // Ki???m tra xem l?? combobox enum hay combobox th?????ng
                // t???i ????y ki???m tra n???u gi?? tr??? l?? t???t c??? th?? s??? kh??ng th???c hi???n th??m
                listFilterBox.push({
                  name: vueObj.filterName,
                  value: vueObj.internalValue,
                  text: vueObj.internalText,
                  nameEnum: vueObj.nameEnum,
                });
                if (!me.isFilter) {
                  me.isFilter = vueObj.internalValue > -1 ? true : false;
                }
              } else {
                listFilterBox.push({
                  name: vueObj.filterName,
                  value: vueObj.internalValue,
                  text: vueObj.internalText,
                  nameEnum: null,
                });
                if (!me.isFilter) {
                  me.isFilter =
                    vueObj.internalValue > -1 ||
                    vueObj.internalValue !== "T???t c???"
                      ? true
                      : false;
                }
              }
            } else if (item.className.indexOf("ms-combobox") === -1) {
              listFilterBox.push({
                name: vueObj.extraData,
                value: vueObj.value,
                text: vueObj.text,
                nameEnum: null,
              });
              if (!me.isFilter) {
                me.isFilter = vueObj.value > -1 ? true : false;
              }
            }
          }
        });
      }

      me.hiddenFilterBox();
      me.$emit("filterGrid", listFilterBox);
    },
    /**
     * x??a l???c theo combobox
     */
    removeFilterGrid() {
      const me = this;
      let listFilterBox = []; // danh s??ch filter c??c combo th???c hi???n reset gi?? tr???
      me.isFilter = false;
      let listInput = me.$el.querySelectorAll(".ms-editor"); //listInput

      if (listInput && listInput.length > 0) {
        listInput.forEach((item) => {
          if (item.getVueInstance && typeof item.getVueInstance == "function") {
            let vueObj = item.getVueInstance();
            vueObj.internalText = "T???t c???"; // th???c hi???n reset c??c combobox
            vueObj.initText = "T???t c???";
            vueObj.internalValue = vueObj.valueAllSelected;
          }
        });
      }
      me.$emit("removeFilter", listFilterBox);
    },

    /**
     * L???y ????? r???ng c???a m??n h??nh
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
     */
    getWindowHeight() {
      let windowHeight =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      return windowHeight;
    },

    /**
     * ????ng l???ch khi c??c n??t Esc hay Tab ???????c nh???n
     */
    setEscapeEvent() {
      const me = this;
      document.addEventListener("keydown", me.eventEscape);
    },

    eventEscape(event) {
      const me = this;
      if (event.keyCode == 27 || event.key == "Escape" || event.key == "Tab") {
        event.cancel = true;
        me.hiddenFilterBox();
      }
    },

    /**
     * ????ng filter box khi click ra ngo??i
     */
    closeOut(e) {
      const me = this;
      if (
        !e.target.closest(".btn-filter") &&
        !e.target.closest(".filter-box") &&
        !e.target.closest(".combobox-item")
      ) {
        me.hiddenFilterBox();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// .filter-group {
//   &::after {
//     content: "";
//     position: absolute;
//     bottom: 100%;
//     left: 50%;
//     margin-left: -5px;
//     border-width: 5px;
//     border-style: solid;
//     border-color: #555 transparent transparent transparent;
//   }
// }

::v-deep .custom-remove-filter {
  background-color: transparent;

  &.btn {
    min-width: 32px;
  }

  .text {
    padding: 0px 4px;
  }
}

::v-deep .control-label {
  color: #707070;
  padding-bottom: 8px;
}

.btn-filter:hover {
  cursor: pointer;
}

.custom-arrow {
  position: absolute;
  top: 0;
  right: 20px;
  border-left: 8px solid #0000;
  border-right: 8px solid #0000;
  border-bottom: 8px solid var(--primary);
  transform: translateY(-100%);
  transition: border-color 0.2s linear;
  box-shadow: 0px -20px 20px 0px rgb(0 0 0 / 8%);
  &.right-box {
    right: unset !important;
    left: 20px;
  }
}
</style>
