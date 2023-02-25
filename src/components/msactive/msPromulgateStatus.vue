<template>
  <div
    class="flex-row flex-cc"
    :class="data[column.dataField] ? 'promulgate' : 'not-promulgate'"
  >
    <div class="icon mr-2"></div>
    <div class="text">
      {{ data[column.dataField] ? "Đã ban hành" : "Chưa ban hành" }}
    </div>
  </div>
</template>

<script>
export default {
  name: "msPromulgateStatus",
  props: {
    data: {},
    column: {},
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.flex-cc {
  align-items: center;
}

.icon {
  border-radius: 50%;
  min-width: 10px;
  min-height: 10px;
}

.text {
  line-height: 19px;
}

.promulgate {
  .icon {
    background-color: $blue;
  }
  .text {
    color: $blue;
  }
}

.not-promulgate {
  .icon {
    background-color: $orange;
  }
  .text {
    color: $orange;
  }
}
</style>