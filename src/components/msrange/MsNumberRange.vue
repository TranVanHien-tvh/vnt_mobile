<template>
  <div class="ms-number-range flex-row">
    <ms-number
      v-model="from"
      name="Năm"
      :spin="true"
      :min="0"
      :max="3000"
      placeholder="yyyy"
      :allow-digit-group-separator="false"
      :validateOnBlur="false"
      rules="required"
      class="flex"
    />
    <div class="separate" style="width: 14px"></div>
    <ms-number
      v-model="to"
      name="Năm"
      :spin="true"
      :min="0"
      :max="3000"
      placeholder="yyyy"
      :allow-digit-group-separator="false"
      :validateOnBlur="false"
      rules="required"
      class="flex"
    />
  </div>
</template>

<script>
export default {
  name: "MsNumberRange",

  props: {
    from: {
      type: Number,
    },
    to: {
      type: Number,
    },
  },

  watch: {
    from: {
      handler(newVal) {
        this.$emit("update:from", newVal);
      },
    },
    to: {
      handler(newVal) {
        this.$emit("update:to", newVal);
      },
    },
  },
};
</script>