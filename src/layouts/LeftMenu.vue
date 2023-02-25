<template>
  <div class="container">
    <div class="left-container">
      <div class="menu-container">
        <div class="menu-item-container">
          <a
            v-for="(item, index) in menuItems"
            :key="index"
            :href="item.path"
            :class="[
              'menu-item-admin',
              item.icon,
              { active: index === activeIndex },
            ]"
            @click.prevent="menuClick(item, index)"
          >
            <div class="menu-item-admin-container">
              <div class="menu-item-title">{{ item.text }}</div>
              <div
                v-if="item.hasChild == true"
                class="arrow-right"
                :class="[!collapse ? '' : 'hide']"
              />
              <div class="menu-item-tooltip" :class="[!collapse ? '' : 'show']">
                {{ item.text }}
              </div>
            </div>
          </a>
        </div>
      </div>

      <div
        v-if="childMenuShow"
        ref="childMenu"
        v-click-outside="hidenMenuChild"
        class="menuchild-container"
      >
        <div>
          <div v-for="(item, index) in groupChildMenuItem" :key="index">
            <span class="child-menu-label">
              {{ item.groupName }}
            </span>
            <div class="menu-item-container">
              <a
                v-for="(item, index) in item.childMenu"
                :key="index"
                :href="item.path"
                :class="[
                  'menu-item-child',
                  { active: item.name === activeChildItem },
                ]"
                @click.prevent="menuClick(item, index)"
                >{{ item.text }}</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="toggle-button pointer"
      :class="[!collapse ? 'show' : 'hiden']"
      @click="toogleClick"
    >
      <span v-if="!collapse" class="toggle-title">Thu gọn</span>
    </div>
  </div>
</template>

<script>
import popupUtil from "@/commons/popupUtil";
import { permission } from "@/mixins/common/permission";
import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
import commonFunction from "@/commons/commonFunction";
import EventBusGlobal, { GlobalEventName } from "@/commons/eventBusGlobal";
import Firebase from "@/firebase/firebase";
export default {
  components: {},
  mixins: [permission],
  props: {
    collapse: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      activeIndex: null,
      childMenuShow: false,
      activeChildItem: null,
      notification: 0,
      sumToDoList: 0,
      showAdvertisement: false,
      packageName: "",
      endDate: "",
      collapseWait: false,
      isShowSubMenu: false,
    };
  },
  computed: {
    ...mapGetters({
      leftMenuCollapse: ModuleContext + "/LeftMenuCollapse",
    }),

    ...mapGetters(ModuleContext, ["Context"]),

    context() {
      return this.$store.state[ModuleContext];
    },

    toggle() {
      return this.collapse ? ">>" : "<<";
    },
  },

  watch: {
    $route(to, from) {
      if (this.suppendActive) {
        delete this.suppendActive;
        return;
      }

      this.activeMenu();
    },
  },
  created() {
    const me = this;

    me.menuItems = me.getMenuItems(); // Lấy danh sách menu chính
    me.allChildMenuItem = me.configAllChildMenuItems("getchild"); // Lấy danh sách các menu con thực hiện router
    me.allGroupChildMenuItem = me.configAllChildMenuItems("getgroup"); // Lấy danh sách các group menu con để build UI
    //Cập nhật path cho item theo name
    me.updateMenuPath(me.menuItems);
    me.updateMenuPath(me.allChildMenuItem);

    //Cập nhật active menu
    me.activeMenu();
    // Emit global sự kiện cập nhật notification leftmenu
    EventBusGlobal.$on(
      GlobalEventName.updateNotification,
      me.updateNotification
    );
    // Emit global sự kiện collapse/expand leftmenu
    EventBusGlobal.$on(GlobalEventName.collapseLeftMenu, me.toogleClick);
  },

  async mounted() {
    const me = this;
    me.setLeftMenuCollapse(me.collapse);

    me.updateNotification();
    me.collapseWait = me.collapse;
  },
  methods: {
    ...mapActions({
      updatedLeftMenuCollapse: ModuleContext + "/getLeftMenuCollapse",
    }),

    setLeftMenuCollapse(collapse) {
      const me = this;
      me.updatedLeftMenuCollapse(collapse);
    },

    /**
     * show form thong tin thue bao
     */
    showInfoLicense() {
      const me = this;

      let path = "LicenseInfo";
      var license = commonFunction.getLocalStorage("License");
      if (license != "") {
        license = JSON.parse(license);
      }
      let param = {
        data: { licenseInfo: license },
        mode: me.$ms.enum.FormState.Add,
      };
      popupUtil.show(me, path, param);
    },

    /**
     * Cập nhật path cho item theo name
     */
    updateMenuPath(items) {
      const me = this,
        routers = me.$router.options.routes;

      for (let i = 0; i < items.length; i++) {
        let item = items[i];

        if (typeof item.name === "string") {
          let routerItem = me.getRouter(
            item.name.toLowerCase(),
            me.$router.options.routes
          );
          if (routerItem && typeof routerItem.path === "string") {
            item.path =
              routerItem.path.toLowerCase().indexOf("/cegov/") === -1
                ? routerItem.path
                : ["/cegov", routerItem.path].join("");
          }
        }
      }
    },

    /**
     * map từ name  ra router
     */
    getRouter(nameLower, routers) {
      const me = this;

      for (let i = 0; i < routers.length; i++) {
        let item = routers[i];
        if (
          typeof item.name === "string" &&
          nameLower === item.name.toLowerCase()
        ) {
          return item;
        }

        if (Array.isArray(item.children)) {
          let child = me.getRouter(nameLower, item.children);
          if (child) {
            return child;
          }
        }
      }

      return null;
    },

    /**
     * collapse/expand menu
     */
    toogleClick() {
      this.$emit("toogle", this.collapse);
      this.setLeftMenuCollapse(!this.collapse);

      setTimeout(() => {
        this.collapseWait = this.collapse;
      }, 50);
    },

    /**
     * Lấy danh sách menu theo phân quyền
     */
    getMenuItems() {
      const me = this;

      let menuItems = [
        //Tổng quan
        {
          name: "dashboard",
          icon: "dashboard",
          text: me.$t("i18nMain.LeftMenu.Dashboard"),
        },
        //Thi đua
        {
          name: "movement",
          icon: "movement",
          text: me.$t("i18nMain.LeftMenu.Movement"),
          child: "movement",
          hasChild: true,
        },
        //Khen thưởng
        {
          name: "commendation",
          icon: "reward",
          text: me.$t("i18nMain.LeftMenu.Reward"),
          child: "commendation",
          hasChild: true,
        },
        //Hồ sơ
        {
          name: "profile",
          icon: "profile",
          text: me.$t("i18nMain.LeftMenu.Profile"),
          hasChild: true,
          child: "profile",
        },
        //Tra cứu
        {
          //name: "searchAdvanced",
          icon: "search",
          isPopupshow: true,
          isShowMaskOnClick: true,
          path: "SearchAdvancedList",
          text: me.$t("i18nMain.LeftMenu.SearchAdvanced"),
        },
        //Báo cáo
        {
          name: "report",
          icon: "report",
          text: me.$t("i18nMain.LeftMenu.Report"),
        },
        //Danh mục
        {
          name: "category",
          icon: "category",
          text: me.$t("i18nMain.LeftMenu.Category"),
          child: "category",
          hasChild: true,
        },
        //Hệ thống
        {
          icon: "system",
          text: me.$t("i18nMain.LeftMenu.System"),
          child: "system",
          hasChild: true,
        },
        // Hướng dẫn
        {
          name: "gettingStarted",
          icon: "guide",
          text: "Hướng dẫn",
          // child: "guide",
          // hasChild: false,
        },
      ];

      let result = [];

      for (let i = 0; i < menuItems.length; i++) {
        let item = menuItems[i];

        if (!me.checkPermission(item)) {
          continue;
        }

        result.push(item);
      }

      //Lưu localStorage dùng cho log firebase 
      //commonFunction.setLocalStorage("menuItems", JSON.stringify(result));
      window.menuItems = result;
      return result;
    },

    /*
     * Lấy danh sách các menu item con theo menu cha
     */
    getChildMenuItemByParentKey(parentMenuKey) {
      return this.allGroupChildMenuItem.filter(
        (items) => items.parent === parentMenuKey
      );
    },

    /**
     * Cấu hình toàn bộ các menu item con
     * NTBAO: 15/09/2021 sửa lại cấu trúc để build động menu con
     */
    configAllChildMenuItems(key) {
      const me = this;

      let childMenuItems = [
        {
          parent: "movement",
          groupName: me.$t("i18nMain.LeftMenu.Movement"),
          childMenu: [
            //Phong trào thi đua
            {
              parent: "movement",
              name: "motiveMovement",
              text: me.$t("i18nMain.LeftMenu.MovementChild.EmulationMovement"),
            },
            //Đăng ký thi đua
            // {
            //   parent: "movement",
            //   name: "registerEmulation",
            //   text: me.$t("i18nMain.LeftMenu.MovementChild.RegisterEmulation"),
            // },
            //Phê duyệt, tổng hợp đăng ký thi đua
            {
              parent: "movement",
              name: "registerEmulation", // để tên tab đầu mặc định luôn vào tab này
              text: me.$t("i18nMain.LeftMenu.MovementChild.RegisterEmulation"),
            },
            //Hồ sơ bình xét
            {
              parent: "movement",
              name: "votationProfile",
              text: me.$t("i18nMain.LeftMenu.MovementChild.VotationProfile"),
              path: "/votation-profile/own",
            },
          ],
        },
        {
          parent: "commendation",
          groupName: me.$t("i18nMain.LeftMenu.Reward"),
          childMenu: [
            // Hồ sơ bình xét khen thưởng
            {
              parent: "commendation",
              name: "commendationProfile",
              text: me.$t(
                "i18nMain.LeftMenu.CommendationChild.CommendationProfile"
              ),
            },
            //Quyết định khen thưởng
            {
              parent: "commendation",
              name: "commendationDecision",
              text: me.$t(
                "i18nMain.LeftMenu.CommendationChild.CommendationDecision"
              ),
            },
          ],
        },
        {
          parent: "profile",
          groupName: me.$t("i18nMain.LeftMenu.ProfileChild.Profile"),
          childMenu: [
            // Hồ sơ cá nhân
            {
              parent: "profile",
              name: "employee",
              text: me.$t("i18nMain.LeftMenu.ProfileChild.Employee"),
            },
            // Hồ sơ tập thể
            {
              parent: "profile",
              name: "groupEmployee",
              text: me.$t("i18nMain.LeftMenu.ProfileChild.GroupEmployee"),
            },
          ],
        },
        {
          parent: "category",
          groupName: me.$t("i18nMain.LeftMenu.CategoryChild.Dictionary"),
          childMenu: [
            //Danh hiệu thi đua
            {
              parent: "category",
              name: "emulationTitle",
              text: me.$t("i18nMain.LeftMenu.CategoryChild.EmulationTitle"),
            },
            //Hình thức khen thưởng
            {
              parent: "category",
              name: "rewardCategory",
              text: me.$t("i18nMain.LeftMenu.CategoryChild.RewardCategory"),
            },
            //Chức vụ, chức danh
            {
              parent: "category",
              name: "userJobPostion",
              text: me.$t("i18nMain.LeftMenu.CategoryChild.JobPosition"),
            },
          ],
        },
        //Thiết lập
        {
          parent: "system",
          groupName: me.$t("i18nMain.LeftMenu.System"),
          childMenu: [
            //Cụm thi đua
            {
              parent: "system",
              name: "emulationGroup",
              text: me.$t("i18nMain.LeftMenu.SystemChild.EmulationGroup"),
            },
            //Tùy chỉnh mẫu
            {
              path: "/Developing",
              parent: "system",
              name: "customTemplate",
              text: me.$t("i18nMain.LeftMenu.SystemChild.CustomTemplate"),
            },
          ],
        },
        // Hướng dẫn
        // {
        //   parent: "guide",
        //   groupName: me.$t("i18nMain.LeftMenu.Guide"),
        //   childMenu: [
        //     {
        //       parent: "guide",
        //       name: "gettingStarted",
        //       text: me.$t("i18nMain.LeftMenu.GuideChild.GettingStarted"),
        //     },
        //     {
        //       parent: "guide",
        //       name: "userManual",
        //       text: me.$t("i18nMain.LeftMenu.GuideChild.UserManual"),
        //     },
        //   ],
        // },
      ];

      // NTBAO: 15/09/2021 Trả về danh sách menu tùy theo key
      let allChildMenu = [];
      let allGroupMenu = [];
      for (let i = 0; i < childMenuItems.length; i++) {
        let group = childMenuItems[i];
        let groupChildMenu = [];
        for (let index = 0; index < group.childMenu.length; index++) {
          let item = group.childMenu[index];
          if (!me.checkPermission(item)) {
            continue;
          }
          groupChildMenu.push(item);
          allChildMenu.push(item);
        }
        group.childMenu = groupChildMenu;
        allGroupMenu.push(group);
      }

      //Lưu localStorage dùng cho log firebase 
      commonFunction.setLocalStorage("allChildMenu", JSON.stringify(allChildMenu));
      window.allChildMenu = allChildMenu;

      switch (key) {
        case "getchild":
          return allChildMenu;
          break;

        case "getgroup":
          return allGroupMenu;
          break;
      }
    },

    /**
     * Active menu tương ứng với router hiện tại
     */
    activeMenu() {
      const me = this;

      //Chỗ menuItems chỉ có những item cha mà không có item con
      //Xử lý nếu click vô item con thì set active item là item cha và item con bên trong cũng được active
      //Kiểm tra nếu item hiện tại ở trong mục hệ thống thì active menu hệ thống
      let activePath = null,
        currentPath = location.pathname.toLowerCase();
      let existChild = me.allChildMenuItem.filter((item) =>
        currentPath.includes(item.path)
      );

      if (!existChild || existChild.length === 0) {
        existChild = me.menuItems.filter((item) =>
          currentPath.includes(item.path)
        );
      }
      me.setActiveIndex(existChild[0]);
    },

    /**
     * Kiểm tra có quyền không
     */
    checkPermission(item) {
      let me = this;

      switch (item.name) {
        default:
          return true;
          break;
      }

      return true;
    },

    /**
     * Click chọn menu
     * NTBAO: 15/09/2021 Sửa lại để build động menu
     */
    menuClick(item, index) {
      const me = this;
      // Active menu cha
      me.setActiveIndex(item);

      if (item.child) {
        me.childMenuShow = !me.childMenuShow;

        if (me.childMenuShow) {
          let cur = location.pathname.toLowerCase();
          // NTBAO: 15/09/2021 Lấy danh sách các group menu con theo parent key
          me.groupChildMenuItem = me.getChildMenuItemByParentKey(item.child);
          me.activeChildItem = null;
          //Active menu con theo url hiện tại
          for (let i = 0; i < me.allChildMenuItem.length; i++) {
            let menuitem = me.allChildMenuItem[i];
            if (cur.indexOf(menuitem.path) > -1) {
              me.activeChildItem = menuitem.name;
              break;
            }
          }
        }
      } else {
        me.childMenuShow = false;

        //Nếu có cấu hình show popup thì show popup, nếu không thì nhảy vào router
        if (item.isPopupshow) {
          if(item.isShowMaskOnClick) {
            me.$ms.commonFn.mask();
          }
          me.showPopup(item.path);
        } else {
          if (item.path == "/Developing") {
            me.$ms.msgBox.showInfo(me.$t("i18nCommon.FeaturesIsDeveloping"));
          } else if (me.$route.path != item.path) {
            me.suppendActive = true;

            /**
             * Nếu click vào menu trùng với router hiện tại -> ẩn all popup đi
             * else nếu item có name router name
             * else nếu item có path router path
             * else router root
             */

            let lowerPath = me.$route.path.toLowerCase(),
              itemPathLower = item.path ? item.path.toLowerCase() : "";
            if (
              lowerPath === itemPathLower ||
              "/cegov" + lowerPath === itemPathLower
            ) {
              popupUtil.hideAll();
            } else if (typeof item.name === "string") {
              popupUtil.hideAll();

              me.$router
                .push({
                  name: item.name,
                })
                .catch(() => {});
            } else if (typeof item.path === "string") {
              me.$router.push(item.path);
            } else {
              me.$router.push("/");
            }
          }
        }
      }

      // me.logDataFireBase(item);
    },

    /**
     * Lấy thông tin từ menu log firebase
     * NTTHANH1
     */
    logDataFireBase(item) {
      const me = this;
      let groupType = null,
        businessType = null;
      try {
        //Lấy thông tin groupType, BusinessType từ menu
        if (item.hasChild) {
          return;
        } else {
          businessType = item.text;
          if (item.parent) {
            groupType = me.allGroupChildMenuItem.find((itemMenu) => {
              return itemMenu.parent == item.parent;
            }).groupName;
          } else {
            groupType = businessType;
          }
        }

        if (groupType && businessType) {
          Firebase.logDataFireBase(
            groupType,
            businessType,
            me.$ms.enum.FireBaseActionType.View,
            me.context
          );
        }
      } catch (ex) {
        console.log(ex);
      }
    },

    /**
     * Set ActiveIndex
     */
    setActiveIndex: function (currentItem) {
      const me = this;
      let activeIndex = 0;

      if (currentItem) {
        for (let i = 0; i < me.menuItems.length; i++) {
          let item = me.menuItems[i];
          if (item.path === "/Developing") {
            continue;
          } else if (item.child && item.child === currentItem.parent) {
            activeIndex = i;
            break;
          } else if (
            item.child &&
            currentItem.child &&
            item.child === currentItem.child
          ) {
            activeIndex = i;
            break;
          } else if (item.path && item.path == currentItem.path) {
            activeIndex = i;
            break;
          }
        }
      }
      me.activeIndex = activeIndex;
    },

    //cập nhật lại số lượng tên tab
    async updateNotification() {
      let me = this;
    },

    /**
     * Hiển thị Pop từ menu luôn, dùng cho form popup
     */
    showPopup(path) {
      const me = this;
      let param = {
        data: {},
        mode: me.$ms.enum.FormState.Edit,
      };

      popupUtil.show(me, path, param);
    },

    /**
     * Ẩn menu child
     */
    hidenMenuChild(event) {
      let me = this;

      if (
        !event.target.className.contains("menuchild-container") &&
        !event.target.className.contains("menu-item-admin") &&
        !event.target.className.contains("menu-item-notification") &&
        !event.target.className.contains("menu-item-title") &&
        !event.target.className.contains("arrow-right")
      ) {
        me.childMenuShow = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/leftMenu.scss";

.notification {
  position: absolute;
  top: 15px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  color: white;
  border-radius: 10px;
  background-color: #ee4611;
  font-size: 12px;
  padding: 0 5px;
}
</style>
