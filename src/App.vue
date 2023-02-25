<template>
  <div id="app">
    <router-view />
    <div id="message-box" />
    <div id="mloading" class="loading" />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
export default {
  components: {
  },
  data() {
    return { isShowSurvey: false };app
  },
  computed: {},
  watch: {},

  // NMTUAN3 5/1/2022: Đang phải thực hiện case theo url để ở local có thể đăng nhập
  created() {

  },

  mounted() {
    const me = this;

    me.initEnterSameTab();
    me.initBroadcastChannel();
  },

  methods: {
    // ...mapActions(ModuleContext, ["getContextData"]),

    /**
     * Next control khi ấn Enter
     */
    initEnterSameTab() {
      const me = this;

      window.addEventListener("keydown", function (e) {
        if (e.which === 13 && !e.shiftKey) {
          let tag = e.target.tagName.toLowerCase();
          if (["button", "a"].indexOf(tag) > -1) {
            return;
          }
          //Sửa e.shiftKey -> !e.shiftKey để textarea ấn enter xuống dòng
          if ("textarea" == tag && !e.shiftKey) {
            return;
          }
          //Nếu sự kiện xảy ra ở grid thì không bắt sự kiện ở hàm này nữa. Trong grid đã xử lý.
          //Thêm kiểm tra phải là control nhập liệu trong bođy thì mới bỏ qua
          if (
            e.target.closest(".ms-grid-viewer") &&
            e.target.closest("tbody")
          ) {
            return;
          }
          //Với control có class remain-focus-when-enter thì không focus sang control tiếp theo khi ấn enter
          if (e.target.closest(".remain-focus-when-enter")) {
            return;
          }
          let focusable = me.$ms.commonFn.focusNextControl(e.target);
          if (focusable) {
            e.preventDefault();
          }
        }
      });
    },

    /**
     * Init lắng nghe thông báo từ các tab khác
     */
    initBroadcastChannel() {
      const me = this,
        bc = me.$ms.commonFn.getBroadcastChannel();

      if (bc) {
        bc.onmessage = function (e) {
          try {
            console.log(e);

            if (e.data === "logout") {
              me.$ms.msgBox
                .showWarning(me.$t("i18nCommon.LogoutMessage"), null, null, {
                  close: false,
                })
                .then(() => {
                  location.reload();
                });
            }
          } catch (ex) {
            console.error(ex);
          }
        };
      }
    },
  },
};
</script>