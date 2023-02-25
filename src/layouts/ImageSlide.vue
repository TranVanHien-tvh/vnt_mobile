<template>
  <div class="image-slide-container container-fluid">
    <VueSlickCarousel :arrows="true" :dots="true">
      <div
        v-for="(item, index) in dataSource"
        :key="index"
        style="max-height: 502px"
      >
        <img :src="item" :alt="index" />
      </div>
      <div v-if="dataSource && dataSource.length <= 0">
        <img src="~@/assets/images/activities/slide_image.png" alt="" />
      </div>
      <div v-if="dataSource && dataSource.length <= 0">
        <img src="~@/assets/images/activities/slide_image.png" alt="" />
      </div>
      <div v-if="dataSource && dataSource.length <= 0">
        <img src="~@/assets/images/activities/slide_image.png" alt="" />
      </div>
    </VueSlickCarousel>
  </div>
</template>
<script>
// import component
import VueSlickCarousel from "vue-slick-carousel";
import "vue-slick-carousel/dist/vue-slick-carousel.css";
// optional style for arrows & dots
import "vue-slick-carousel/dist/vue-slick-carousel-theme.css";
export default {
  components: { VueSlickCarousel },
  props: {
    dataSource: {
      default: () => [],
    },
  },

  data() {
    return {};
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
.image-slide-container {
  padding: 0;
}
img {
  margin: 0 auto;
  height: 502px;
  // height: 420px;

  width: 100%;
}

::v-deep {
  .slick-list {
    max-height: 502px;
  }
}
</style>