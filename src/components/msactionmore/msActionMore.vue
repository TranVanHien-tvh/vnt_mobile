<template>
  <div class="flex action-container">
    <div
      v-for="(action) in actionDefault"
      :key="action.command"
      :class="['btn action flex-row', action.cls, action.buttonType == 'undefined' ? 'secondary-outline': action.buttonType, action.text?'':'only-icon']"
      @click.prevent="actionClick(action, $event)"
    >
      <div
        v-if="action.icon"
        :class="['icon icon24', action.icon]"
      />
      <div
        v-if="action.text"
        class="text"
      >
        {{ action.text }}
      </div>
    </div>
    <vue-context
      ref="actionMenu"
      :custom-width="customWidth"
    >
      <li
        v-for="(action) in actionContext"
        :key="action.command"
        :class="['li-' + action.command]"
      >
        <div
          href="javascript:void(0)"
          :class="['menu-item has-icon', action.cls]"
          @click.prevent="actionClick(action, $event)"
        >
          <div :class="['icon24 menu-icon', action.icon]" />
          {{ action.text }}
        </div>
      </li>
    </vue-context>
  </div>
</template>
<script>
import { setTimeout } from "timers";
import VueContext from "@/components/vue-context/vue-context";
export default {
  name: "MsActionMulti",
  components: {
    VueContext
  },
  props: {
    /**
     * Danh sách action
     */
    actionContext: {
      type: Array
    },

    /**
     * Chỉnh lại độ rộng
     */
    customWidth: {
      default: 200,
      type: Number
    }
  },
  data() {
    return {};
  },
  computed: {},
  watch: {
    actionContext: {
      deep: true,
      handler(newVal, oldVal) {
        const me = this;
        me.actionContext = newVal;
      }
    }
  },
  created() {
    const me = this;
    // Action hiển thị dấu 3 chấm
    me.actionDefault = [
      {
        command: "MORE",
        icon: "more",
        buttonType: "secondary-outline",
        text: this.moreText
      }
    ];
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
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/layouts/vue-context.scss";
@import "@/assets/scss/components/msActionMore.scss";
</style>

