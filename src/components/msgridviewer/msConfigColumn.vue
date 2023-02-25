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
    //Độ rộng của popup
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

  //Gán sự kiện tắt cononfig box
  created() {
    this.setEscapeEvent();
    document.addEventListener("click", this.closeOut);
  },

  //Hủy form rồi thì xóa sự kiện đi cho đỡ ảnh hưởng
  beforeDestroy() {
    const me = this;
    document.removeEventListener("click", me.closeOut);
    document.removeEventListener("keydown", me.eventEscape);
  },

  methods: {
    //update lại data column của grid mẹ vào box
    updateData(configColumnsData) {
      this.items = configColumnsData;
    },

    /***
     * Click vào nút switch ẩn hiện cột
     * TDNGHIA 1/10/2021
     */
    switchOnClick() {
      this.doSetLayoutGrid();
    },

    /**
     * Hàm thay đổi drag vị trí các cột
     * TDNGHIA 2/10/2021
     */
    dragOnChange() {
      this.doSetLayoutGrid();
    },

    /**
     * Hàm chung set lại layout cho grid
     * TDNGHIA 2/10/2021
     */
    doSetLayoutGrid() {
      const me = this;

      me.items.forEach((item, index) => {
        item.sort_order = index;
      });

      /**
       * emit ra ngoài là thứ tự dữ liệu bị thay đổi
       */
      me.$emit("settinglayout", me.items);
    },

    /**
     * Bắt sự kiện ấn escape tắt config box
     * TDNGHIA 10/3/2021
     */
    setEscapeEvent() {
      const me = this;

      document.addEventListener("keydown", me.eventEscape);
    },

    /**
     * Sự kiện thoát khỏi config box
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
     * Đóng filter box khi click ra ngoài
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
     * Hàm emis ra ngoài thông báo đóng cònigbox
     * TDNGHIA 10/3/2021
     */
    closeConfigBox() {
      this.$emit("closeConfigBox");
    },

    /**
     * Hàm lấy config default grid
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