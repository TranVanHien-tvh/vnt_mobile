<!-- =========================================================================================
    Render control custom field người dùng thiết lập để nhập liệu trên form chi tiết
========================================================================================== -->

<template>
  <div class="custom-field-container">
    <ms-datepicker
      v-if="config.type === $ms.enum.CustomFieldType.Date || config.type === $ms.enum.CustomFieldType.Time"
      v-model="internalValue"
      :read-only="readOnly"
    />
    <ms-number
      v-else-if="config.type === $ms.enum.CustomFieldType.Number"
      v-model="internalValue"
      :read-only="readOnly"
    />
    <ms-checkbox
      v-else-if="config.type === $ms.enum.CustomFieldType.Bool"
      v-model="internalValue"
      :read-only="readOnly"
    />
    <ms-combobox
      v-else-if="config.type === $ms.enum.CustomFieldType.List"
      v-model="internalValue"
      :data="comboboxData"
      value-field="value"
      display-field="text"
      :read-only="readOnly"
    />
    <ms-input
      v-else
      v-model="internalValue"
      :read-only="readOnly"
    />
  </div>
</template>

<script>
export default {
  name: "MsCustomField",
  components: {},
  props: {
    value: {
      default: null
    },
    config: {

    },
    /*
     * pvduy 12/04/2021 thêm thuộc tính set readonly      
     */
    readOnly: {
      type: Boolean,
      default: false
    }

  },
  data() {
    return {
      internalValue: null,
      data: [] //danh sách dữ liệu dùng cho dạng list
    };
  },
  computed: {
    comboboxData() {
      const me = this,
        rs = [];

        if (Array.isArray(me.config.data)) {
          me.config.data.forEach(item => {
            rs.push({
              value: item,
              text: item,
            });
          });
        }

        return rs;
    }
  },
  watch: {
    internalValue: {
      handler(newVal, oldVal) {
        const me = this;
        me.$emit("input", newVal);
      }
    },
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;
        me.internalValue = newVal;
      }
    },
  },
  created() {
    const me = this;
  },
  mounted() {
    const me = this;
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/MsCustomField.scss";
</style>
