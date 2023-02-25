<template>
  <div>
    <div
      v-if="customTooltip.type == 'Text'"
      class="ms-tooltip ms-tooltip-text"
      :style="tooltipTextStyle"
    >
      <p>{{ customTooltip.content }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "MSTooltip",

  components: {},

  props: {
    customTooltip: {
      default: null,
      type: Object,
    },
    comboboxValue: {
      default: null,
      type: [String, Number, Boolean, Object],
    },
    comboboxStore: {
      default: null,
      type: Array,
    },
  },

  data() {
    return {
      tooltipText: "",
    };
  },

  computed: {
    tooltipTextStyle() {
      let style = {};
      let me = this;
      if (me.customTooltip) {
        if (me.customTooltip.width) {
          style.width = me.customTooltip.width + "px";
        }
        if (me.customTooltip.height) {
          style.height = me.customTooltip.height + "px";
        }
      }
      return style;
    },
  },

  watch: {
    comboboxValue: {
      handler() {
        let me = this;
      },
    },
  },

  created() {
    let me = this;
  },

  mounted() {
    let me = this;
  },

  beforeDestroy() {
    // this.dispose();
  },

  methods: {},
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msTooltip.scss";
</style>
