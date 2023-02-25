// Add public path
import '@/public-path.js'

import Vue from "vue";
import App from "./App.vue";

import "vue-toast-notification/dist/theme-sugar.css";

// Add extension
import "./commons/prototype";

// Globally Registered Components
import "@/commons/globalComponents.js";

// Globally Registered Components
import '@/commons/globalPlugin.js';

// Vue Router
import router from "@/routers/router";

// Vuex Store
import store from "@/stores/store";

// i18n
import i18n from '@/i18ns/i18n';

// filter
import './filters/filters';

// context menu
import "@/assets/scss/layouts/vue-context.scss";

// Styles: SCSS
// import "@/assets/fonts/SFProDisplay/font.css";
import "@/assets/fonts/GoogleSans/font.css";
import "@/assets/css/flexbox.css";
import "@/assets/css/common.css";
import "@/assets/scss/scroller.scss";
import "@/assets/scss/override.scss";
import "@/assets/scss/icons.scss";
import "@/assets/scss/btn.scss";
import "@/assets/scss/form.scss";
import "@/assets/scss/app.scss";
 
Vue.config.productionTip = false;

// Chuyển Get context data lên đây để đảm bảo vào chương trình có thể sử dụng context ngay từ đầu
// store.dispatch("context/getContextData").then(() => {
  new Vue({
    router,
    store,
    i18n,
    render: (h) => h(App),
  }).$mount("#app");


  // 16/11/2021 Thay đổi page title
  document.title = 'VietNam Together';
// });

/**
 * directive xử lý style.visibility
 */
Vue.directive("visible", function (el, binding) {
  el.style.visibility = binding.value ? "visible" : "hidden";
});
