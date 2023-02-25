<template>
  <div class="ms-range">
    <ms-date-range
      v-if="dataType == $ms.enum.AdvanceSearchDataType.DATE"
      name="Ngày sinh"
      rules="required"
      :fromDate.sync="value.from"
      :toDate.sync="value.to"
    />
    <ms-number-range
      v-else-if="dataType == $ms.enum.AdvanceSearchDataType.NUMBER"
      :from.sync="value.from"
      :to.sync="value.to"
    />
    <ms-number-with-unit-range
      v-else-if="dataType == $ms.enum.AdvanceSearchDataType.NUMBER_WITH_UNIT"
      rules="required"
      v-model="value"
      :name="name"
    />
  </div>
</template>
<script>
import MsDateRange from "../msdaterange/MsDateRange.vue";
import MsNumberRange from "./MsNumberRange.vue";
import MsNumberWithUnitRange from "./MsNumberWithUnitRange.vue";
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
export default {
  name: "MsRange",
  components: { MsDateRange, MsNumberRange, MsNumberWithUnitRange },
  extends: msBaseComponent,
  props: {
    dataType: {
      type: String,
    },

    value: {
      type: Object,
    },

    name: {
      type: String
    },
  },

  watch: {
    "value.from": {
      handler() {
        this.$emit("input", this.value);

        // if (!value.from && !value.to) {
        //   this.reset();
        // }
      },
    },

    "value.to": {
      handler() {
        this.$emit("input", this.value);

        // if (!value.from && !value.to) {
        //   this.reset();
        // }
      },
    },

    value: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal == null) {
          this.value = {
            from: null,
            to: null,
          };
        }
      },
    },
  },

  methods: {
    reset() {
      switch (this.dataType) {
        case $ms.enum.AdvanceSearchDataType.DATE:
          this.$refs.dteRange.reset();
          break;
        default:
          this.value.from = null;
          this.value.to = null;
          break;
      }
    },

    /**
     * @override
     */
    validateRule(rule, value, editor) {
      const me = this;
      let res = true;

      switch (rule) {
        case "required":
          res = me.value.from && me.value.to;
          break;
      }

      return res;
    },
  },
};
</script>
