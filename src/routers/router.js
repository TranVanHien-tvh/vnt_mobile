import Vue from "vue";
import VueRouter from "vue-router";
import i18n from "@/i18ns/i18n";
import commonFn from "@/commons/commonFunction";
import popupUtil from "@/commons/popupUtil";
import messageBox from "@/commons/messageBox";

Vue.use(VueRouter);

const baseUrl =
  process.env.NODE_ENV !== "development" ? window._appConfig.base_router : "/";

const router = new VueRouter({
  mode: "history",
  base: baseUrl,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
  routes: [
    {
      /**
       * Trang xử lý login của dev
       */
      path: "/login",
      name: "login",
      component: () => import("@/views/login/Login.vue"),
      meta: {
        anonymous: true,
      },
      beforeEnter: (to,from,next)=>{
        if(localStorage.currentUser===undefined){
          next()
        }else{
          next("/")
        }
      }
    },
    {
      path: "",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: {
        anonymous: false,
      },
      beforeEnter:(to,from,next)=>{
        if(localStorage.currentUser!==undefined){
          next()
        }else{
          // next("/login")
          next()
        }
      },
      children: [
        {
          //Màn chi tiết của 1 hoạt động
          path: "/activity-detail",
          name: "activity-detail",
          component: () => import("@/views/activities/ActivityDetail.vue"),
          meta: {},
          params: {},
          children: [
          ]
        },
      ]
    },
    // {
    //   path: "",
    //   component: () => import("@/layouts/MainLayout.vue"),
    //   meta: {
    //     anonymous: true,
    //   },
    //   children: [
    //     {
    //       //Trang default
    //       path: "/",
    //       redirect: "/dashboard",
    //       meta: {},
    //     },

    //     //Trang tổng quan
    //     {
    //       path: "/dashboard",
    //       name: "dashboard",
    //       component: () => import("@/views/dashboard/Dashboard.vue"),
    //       meta: {},
    //     },
    //   ],
    // },

    {
      path: "/500",
      name: "500",
      component: () =>
        import(
          /*webpackChunkName:'pages'*/
          "@/pages/500.vue"
        ),
      meta: {
        anonymous: true,
      },
    },

    {
      path: "/403",
      name: "403",
      component: () =>
        import(
          /*webpackChunkName:'pages'*/
          "@/pages/403.vue"
        ),
      meta: {
        anonymous: true,
      },
    },

    {
      // Redirect to 404 page, if no match found
      path: "*",
      component: () =>
        import(
          /*webpackChunkName:'pages'*/
          "@/pages/404.vue"
        ),
      meta: {
        anonymous: true,
      },
    },
  ],
});

try {
  //Lưu thông tin router để log firebase
  window.inforRouters = router.options.routes[0].children;
}
catch (ex) {
  coconsole.log(ex);
}

router.onError((error) => {
  const pattern = /Loading chunk (\S)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);

  if (isChunkLoadFailed && window._appConfig.showLoadChunkFail) {
    messageBox.showError(i18n.t("i18nSY.LoadChuckFail")).then((res) => {
      window.location.reload();
    });
  }
});

let routerOnReady = function () { };
let routerOnError = function (error) { };
router.onReady(routerOnReady, routerOnError);

router.beforeEach((to, from, next) => {
  //hide all popup
  popupUtil.hideAll();
  next();

  //Xử lý load resource trước rồi mới chuyển router
  loadLanguageAsync(next);
});

router.afterEach(() => {
  commonFn.unmask();
});

const loadedLanguages = {
  vi: true,
};

function loadLanguageAsync(callback) {
  const lz = i18n,
    lang = lz.locale;

  let loaded = loadedLanguages[lang];
  if (loaded) {
    callback();
    return;
  }

  // Hiện tại chưa có nhu cầu load ngôn ngữ khác ngoài vi,
  // cần thì mở ra sau
  // commonFn.mask();
  // resourceAPI
  //   .pull(lang)
  //   .then(res => {
  //     let rs = {};
  //     for (let i in res) {
  //       rs[i] = JSON.parse(res[i]);
  //     }

  //     loadedLanguages[lang] = true;
  //     lz.mergeLocaleMessage(lang, rs);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   })
  //   .finally(() => {
  //     commonFn.unmask();
  //     callback();
  //   });
}

export default router;
