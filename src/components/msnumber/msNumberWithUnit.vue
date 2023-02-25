<!-- =========================================================================================
    number input với combo đơn vị
========================================================================================== -->
<template>
  <div class="flex-row ms-number-with-unit">
    <ms-number rules="required" :min="0" v-model="value.quantity" :spin="true" class="flex" :name="title" :allow-digit-group-separator="false"/>

    <div class="separate" style="width: 14px"></div>

    <ms-combobox
      :data="unitData"
      v-model="value.unit"
      valueField="enumValue"
      displayField="enumText"
      :selectOnly="true"
      class="flex"
      style="max-width: 80px"
    />
  </div>
</template>
<script>
import MsCombobox from "../mscombobox/msCombobox.vue";
import msNumber from "./msNumber.vue";
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
export default {
  components: { msNumber, MsCombobox },

  extends: msBaseComponent,
  props: {
    value: {
      type: Object,
    },
    title: {
      type: String
    },
  },
  created() {
    this.value.unit = this.$ms.commonFn.getEnumSource("TimeUnit",[0]);
    delete this.value.from;
    delete this.value.to;
  },

  watch: {
    "value.quantity": {
      handler() {
        this.$emit("input", this.value);
      },
    },

    "value.unit": {
      handler() {
        this.$emit("input", this.value);
      },
    },

    value: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal == null) {
          this.value = {
            quantity: null,
            unit: null,
          };
        }
      },
    },
  },

  computed: {
    unitData() {
      return this.$ms.commonFn.getEnumSource("TimeUnit");
    },
  },

  methods: {
    /**
     * @override
     */
    validateRule(rule, value, editor) {
      const me = this;
      let res = true;

      switch (rule) {
        case "required":
          res = me.value.quantity && me.value.unit;
          break;
      }

      return res;
    },
  },
};
</script>
<style lang="scss" scoped>
</style>