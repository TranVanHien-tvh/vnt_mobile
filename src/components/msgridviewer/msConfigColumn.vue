<template>
  <div class="config-box-ctn" :style="[{ width: width + 'px' }]">
    <div class="arrow"></div>
    <!-- title -->
    <div class="config-box-title d-flex">
      <span>{{ $t("i18nCommon.ConfigColumnTitle") }}</span>
      <div class="flex"></div>
      <i
        class="icon24 deleteX close-icon"
        style="cursor: pointer"
        @click="closeConfigBox"
      ></i>
    </div>

    <!-- content -->
    <!-- <div class="config-box-content"> -->
    <draggable
      v-model="items"
      handle=".icon-drag"
      tag="div"
      class="config-box-content"
      @change="dragOnChange"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="config-item d-flex"
      >
        <div class="icon-drag"></div>
        <div class="column-name">{{ item.caption }}</div>
        <div class="flex"></div>
        <ms-switch
          v-model="item.visible"
          :disabled="item.alwaysShow"
          @change="switchOnClick"
        />
      </div>
    </draggable>
    <!-- </div> -->

    <!-- footer -->
    <div class="config-box-footer">
      <div class="btn-get-default" @click="getConfigDefault">
        {{ $t("i18nCommon.GetDefaultConfig") }}
      </div>
    </div>
  </div>
</template>
<script>
import BaseDetailPopup from "@/views/base/BaseDetailPopup";
import { mapState, mapActions, mapGetters } from "vuex";
// import msGridEditor from "@/components/msgrideditor/msGridEditor.vue";
import api from "@/apis/system/layoutTemplateAPI";
import msJson from "@/commons/json";
import { ModuleLayoutTemplate } from "@/stores/module-const";
import { shortkeyStatusbar } from "@/mixins/common/shortkeyStatusbar";
import MsCollapse from "@/components/ms-collapse/MsCollapse.vue";
import MsCollapseItem from "@/components/ms-collapse/MsCollapseItem.vue";
import customFieldApi from "@/apis/system/customFieldAPI";
import draggable from "vuedraggable";
import MsSwitch from "../msswitch/MsSwitch.vue";

export default {
  name: "msConfigBox",
  components: {
    draggable,
    MsSwitch,
  },

  computed() {},

  props: {
    //????? r???ng c???a popup
    width: {
      default: 320,
      type: Number,
    },
  },
  data() {
    const me = this;
    return {
      items: [],
    };
  },
  computed: {},

  watch: {},

  //G??n s??? ki???n t???t cononfig box
  created() {
    this.setEscapeEvent();
    document.addEventListener("click", this.closeOut);
  },

  //H???y form r???i th?? x??a s??? ki???n ??i cho ????? ???nh h?????ng
  beforeDestroy() {
    const me = this;
    document.removeEventListener("click", me.closeOut);
    document.removeEventListener("keydown", me.eventEscape);
  },

  methods: {
    //update l???i data column c???a grid m??? v??o box
    updateData(configColumnsData) {
      this.items = configColumnsData;
    },

    /***
     * Click v??o n??t switch ???n hi???n c???t
     * TDNGHIA 1/10/2021
     */
    switchOnClick() {
      this.doSetLayoutGrid();
    },

    /**
     * H??m thay ?????i drag v??? tr?? c??c c???t
     * TDNGHIA 2/10/2021
     */
    dragOnChange() {
      this.doSetLayoutGrid();
    },

    /**
     * H??m chung set l???i layout cho grid
     * TDNGHIA 2/10/2021
     */
    doSetLayoutGrid() {
      const me = this;

      me.items.forEach((item, index) => {
        item.sort_order = index;
      });

      /**
       * emit ra ngo??i l?? th??? t??? d??? li???u b??? thay ?????i
       */
      me.$emit("settinglayout", me.items);
    },

    /**
     * B???t s??? ki???n ???n escape t???t config box
     * TDNGHIA 10/3/2021
     */
    setEscapeEvent() {
      const me = this;

      document.addEventListener("keydown", me.eventEscape);
    },

    /**
     * S??? ki???n tho??t kh???i config box
     * TDNGHIA 10/3/2021
     */
    eventEscape(event) {
      const me = this;
      if (event.keyCode == 27 || event.key == "Escape" || event.key == "Tab") {
        event.cancel = true;

        me.closeConfigBox();
      }
    },

    /**
     * ????ng filter box khi click ra ngo??i
     */
    closeOut(e) {
      const me = this;
      if (
        !e.target.closest(".config-box-ctn") &&
        !e.target.closest(".config-column-cell")
      ) {
        me.closeConfigBox();
      }
    },

    /***
     * H??m emis ra ngo??i th??ng b??o ????ng c??nigbox
     * TDNGHIA 10/3/2021
     */
    closeConfigBox() {
      this.$emit("closeConfigBox");
    },

    /**
     * H??m l???y config default grid
     * TDNGHIA 10/4/2021
     */
    getConfigDefault() {
      this.$emit("getConfigDefault");
    },
  },
};
</script>

<style lang="scss" scoped>
</style>