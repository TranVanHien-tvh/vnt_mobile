<template>
  <div :class="['main-container', { collapse: collapse }]">
    <div class="main-nav">
      <top-nav :collapse="collapse" />
    </div>
    <div class="main-right flex-column">
      <div class="main-view flex flex-column container-fluid">
        <router-view />
      </div>
    </div>

    <div class="main-float">
      <float-action />
    </div>
    <div class="footer">
      <vnt-footer />
    </div>
  </div>
</template>

<script>
import TopNav from "./TopNav.vue";
import FloatAction from "./FloatAction.vue";
import Footer from "./Footer.vue";

export default {
  components: {
    TopNav,
    FloatAction,
    "vnt-footer": Footer,
  },

  data() {
    return {
      collapse: false,
    };
  },
  computed: {},

  watch: {},

  mounted() {
    const me = this;
  },

  created() {
    // let collapseCache = sessionStorage.getItem("menu-collapse");
    // if (collapseCache) {
    //   this.collapse = JSON.parse(collapseCache);
    // }
  },

  methods: {
    menuToogle() {
      this.collapse = !this.collapse;
      sessionStorage.setItem("menu-collapse", this.collapse);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/layouts/mainLayout.scss";
</style>