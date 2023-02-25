<template>
  <div
    v-if="records.length >= 1"
    class="action-multi flex-row"
  >
    <div class="selected-count">
      {{ $t("i18nBaseForm.List.ActionMulti.SelectCount") }}
      <strong>{{
        allPage
          ? totalCount
          : 10 > records.length
            ? `0${records.length}`
            : records.length
      }}</strong>
    </div>
    <!-- Trường hợp bỏ chọn những bản ghi ở  trang hiện tại -->
    <div
      v-if="!allPage"
      class="selected-all pointer de-selected mrl-20"
      @click="uncheckClick"
    >
      {{ $t("i18nBaseForm.List.ActionMulti.UnSelect") }}
    </div>
    <!-- Trường hợp bỏ chọn tất cả ở tất cả các trang -->
    <div
      v-if="allPage"
      class="selected-all pointer de-selected"
      @click="allClick"
    >
      {{ $t("i18nBaseForm.List.ActionMulti.UnSelectAll") }}
    </div>
    <!-- Trường hợp chọn tất cả bản ghi ở tất cả các trang -->
    <div
      v-if="!allPage && isShowSelectAll"
      class="selected-all pointer text-primary"
      @click="allClick"
    >
      {{ $t("i18nBaseForm.List.ActionMulti.SelectAll") }}
    </div>

    <div class="action-container d-flex">
      <div
        v-for="action in actionInline"
        v-tooltip="action.isShowTooltip ? action.tooltip : ''"
        :key="action.command"
        :class="[
          'btn action flex-row',
          action.cls,
          action.buttonType == 'undefined'
            ? 'secondary-outline'
            : action.buttonType,
          action.text ? '' : 'only-icon',
          action.text && action.icon ? 'text-pl-0' : '',
          disableButton === false ? '' : 'disable-button'
        ]"
        @click.prevent="actionClick(action, $event)"
      >
        <div
          v-if="action.icon"
          :class="['icon icon24', action.icon]"
        />
        <div
          v-if="action.text"
          :class="[action.text && action.icon ? 'text-pl-0' : '']"
          class="text"
        >
          {{ action.text }}
        </div>
      </div>

      <vue-context
        ref="actionMenu"
        :custom-width="200"
      >
        <li
          v-for="action in actionContext"
          :key="action.command"
        >
          <div
            href="javascript:void(0)"
            :class="['menu-item has-icon', action.cls ]"
            @click.prevent="actionClick(action, $event)"
          >
            <div :class="[ action.icon]" />
            {{ action.text }}
          </div>
        </li>
      </vue-context>
    </div>
  </div>
</template>
<script>
import { setTimeout } from "timers";
import VueContext from "@/components/vue-context/vue-context";
export default {
  name: "MsActionMulti",
  components: {
    VueContext,
  },
  props: {
    /**
     * Danh sách các bản ghi đang chọn
     */
    records: {
      type: Array,
      default: () => [],
    },
    /**
     * Chọn tất cả các trang
     */
    allPage: {
      type: Boolean,
      default: false,
    },
    /**
     * Danh sách action
     */
    actions: {
      type: Array,
      default: () => [],
    },
    /**
     * Số lượng action hiển thị inline, vượt qua số này sẽ vào more
     */
    actionInlineCount: {
      type: Number,
      default: 6,
    },
    /**
     * Số bản ghi 1 trang
     */
    pageSize: {
      type: Number,
      default: 20,
    },
    /**
     * Tổng số bản ghi
     */
    totalCount: {
      type: Number,
      default: 0,
    },

    /**
     * Có hiển thị Chọn tất cả không
     */
    isShowSelectAll: {
      type: Boolean,
      default: true,
    },
    disableButton: {
      type: Boolean,
      default: false,
    },
    
    /**
     * Có muốn có tooltip hay không - DLHuy 23.03.2022
     */
    isShowTooltip:{
      type:Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  computed: {
    /**
     * Hiển thị action thao tác với all page
     */
    showAllPage() {
      if (
        this.records.length >= this.pageSize ||
        this.records.length == this.totalCount
      ) {
        return true;
      }
      return false;
    },
    /**
     * Action hiển thị trên dòng chọn ngay
     */
    actionInline() {
      let result = [],
        actions = this.actions;

      if (actions) {
        if (actions.length > this.actionInlineCount) {
          for (let i = 0; i < this.actionInlineCount ; i++) {
            result.push(actions[i]);
          }

          result.push({
            command: "MORE",
            icon: "more",
            text: this.moreText,
          });
        } else {
          for (let i = 0; i < actions.length; i++) {
            result.push(actions[i]);
          }
        }
      }

      return result;
    },
    /**
     * Action hiển trong more context
     * Modified by: NMSINH - 25/02/2021 : xử lý lấy đủ action trong more do mảng bắt đầu từ 0 nên bị miss 1 giá trị
     */
    actionContext() {
      let result = [],
        actions = this.actions;
        
      if (actions && actions.length > this.actionInlineCount) {
        for (let i = this.actionInlineCount; i < actions.length; i++) {
          result.push(actions[i]);
        }
      }

      return result;
    },
  },
  created() {
    const me = this;
  },
  mounted() {
    const me = this;
  },
  methods: {
    /**
     * click chọn action
     */
    actionClick(action, event) {
      const me = this;
      if(me.disableButton === false) {
        if (action.command === "MORE") {
        let menu = me.$refs.actionMenu;
        if (!menu.show) {
          setTimeout(() => {
            menu.open(event);
          }, 10);
        }
      } else {
        me.$emit("actionclick", action.command, me.records, me.allPage, event);
      }
      }
    },
    /**
     * Click vào chọn tất cả
     */
    allClick() {
      this.$emit("selectall");
    },
    /**
     * Bỏ chọn
     */
    uncheckClick() {
      this.$emit("uncheck");
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/layouts/vue-context.scss";
@import "@/assets/scss/components/msActionMulti.scss";
::v-deep .disable-button{
   opacity: 0.56;
}
</style>

