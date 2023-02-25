<template>
  <div class="ms-number-with-unit-range flex-row">
    <ms-number
      v-model="value.from"
      class="flex"
      :spin="true"
      :min="0"
      style="min-width: 70px"
      :allow-digit-group-separator="false"
      rules="required"
      :name="name"
    />
    <div class="separate" style="width: 14px"></div>
    <ms-number
      v-model="value.to"
      class="flex"
      :spin="true"
      :min="0"
      style="min-width: 70px"
      :allow-digit-group-separator="false"
      rules="required"
      :name="name"
    />
    <div class="separate" style="width: 14px"></div>
    <ms-combobox
      v-model="value.unit"
      class="flex"
      :data="unitData"
      valueField="enumValue"
      displayField="enumText"
      style="max-width: 80px; min-width: 60px"
    />
  </div>
</template>

<script>
export default {
  name: "MsNumberWithUnitRange",

  props: {
    value: {
      type: Object,
    },
    name: {
      type: String
    },
  },

  created() {
    this.value.unit = this.$ms.commonFn.getEnumSource("TimeUnit",[0]);
  },

  watch: {
    "value.from": {
      handler() {
        this.$emit("input", this.value);
      },
    },

    "value.to": {
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
            from: null,
            to: null,
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
};
</script>