<template>
  <div v-if="activeLoading" class="ms-loading-main">
    <div class="loading-modal" />
    <div class="container">
      
      <div class="vertical-center">
        <div class="content-loading">Đang tải</div>
        <div class="loading" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "MsSyncLoading",
  props: {
    //Trạng thái của loading
    activeLoading: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/msPopup.scss";

.ms-loading-main {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1100;
}

.loading-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  // z-index: 1001;
  -moz-opacity: 0.25;
  opacity: 0.25;
}

.container {
  z-index: 1100;
  width: 120px;
  height: 80px;
  position: relative;
  top: calc(50% - 73px);
  left: 0;
  background-color: white;
  border-radius: 8px;
  
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.vertical-center {
  margin: 0;
  position: relative;
    top: 10px;
}

.content-loading {
  text-align: center;
  margin: 18px;
}

.loading {
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  border: 5px solid #f3f3f3;
  border-radius: 50%;
  border-top: 5px solid #6477BA;
  width: 30px;
  height: 30px;
  -webkit-animation: spin 1s linear infinite;
  position: absolute;
  left: 35%;
  top: 30px;
  /* Safari */
  animation: spin 1s linear infinite;
}

// .loading::before {
//   width: 48px;
//   height: 48px;
// }
</style>