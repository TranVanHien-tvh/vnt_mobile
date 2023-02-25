<template>
  <div class="tab-contaner" :class="classTabContaner">
    <ul class="tab-nav" :class="tabClass">
      <li
        v-for="item in listTabShow"
        :key="item.tabKey"
        :title="item.title"
        class="tab"
        :class="[
          { active: activeTabKey && activeTabKey == item.tabKey },
          item.tabClass,
        ]"
        @click="activeTab(item)"
      >
        {{ item.title }}
      </li>
    </ul>
    <div ref="tabContent" class="tab-view" :class="viewClass">
      <slot />
    </div>
  </div>
</template>
<script>
export default {
  name: "MsTab",
  props: {
    /**
     * Custom style tab
     */
    tabClass: {
      type: String,
      default: "",
    },
    /**
     * Custom style view
     */
    viewClass: {
      type: String,
      default: "",
    },
    /**
     * Key tab active mặc định
     */
    activeKey: {
      type: String,
      default: "",
    },
    /**
     * Custom style cho tab-contaner
     */
    classTabContaner: {
      type: String,
      default: "",
    },

    beforeActiveTab: null,
  },
  data() {
    return {
      /**
       * Danh sách các tab
       */
      listTabItem: [],
      /**
       * tabKey của tab đang active
       */
      activeTabKey: null,

      oldTabActive: null,
    };
  },
  computed: {
    /**
     * Lấy ra danh sách các tab show để loại bỏ for lồng cùng if
     * @author DNThang - 27.03.2020
     */
    listTabShow() {
      const me = this;

      if (me.listTabItem && me.listTabItem.length > 0) {
        let ret = me.listTabItem.filter((tab) => {
          return tab.show;
        });

        return ret;
      }

      return null;
    },
  },
  watch: {
    /**
     * Bổ sung theo dõi thay đổi thuộc tính activekey default
     * Dùng cho việc ẩn hiện tab sau khi đã render
     * NTBAO: 18.11.2021
     */
    activeKey() {
      this.defaultActive();
    },
  },

  created() {
    const me = this;

    // Tạo thuộc tính <show> cho các item tab
    me.createPropertyShow(me.listTabItem);

    me.$nextTick(() => {
      //mặc định active tab
      me.defaultActive();
    });
  },
  methods: {
    /**
     * Mặc định tab dc active
     */
    defaultActive() {
      const me = this;

      //active theo khai báo
      if (me.activeKey) {
        for (let i = 0; i < me.listTabShow.length; i++) {
          let item = me.listTabShow[i];

          if (item.tabKey === me.activeKey) {
            if (item.show) {
              me.activeTabKey = me.activeKey;
              me.oldTabActive = me.activeTabKey;
            }
            break;
          }
        }
      }

      //nếu không khai báo hoặc tab khai báo không hiển thị -> active tab đầu tiên hiển thị
      if (!me.activeTabKey) {
        for (let i = 0; i < me.listTabShow.length; i++) {
          let item = me.listTabShow[i];

          if (item.show) {
            me.activeTabKey = item.tabKey;
            me.oldTabActive = me.activeTabKey;
            break;
          }
        }
      }

      //hiển thị nội dung theo tab active
      me.showContent();
      // ntbao - 21.11.2021: Thêm emit sự kiện khi active default
      me.$emit("activeDefaultTab");
    },

    /**
     * Tạo thuộc tính show cho tab item
     */
    createPropertyShow(list) {
      for (var i = 0; i < list.length; i++) {
        if (typeof list[i].show !== "boolean") {
          list[i].show = true;
        }
      }
    },

    /**
     * TTHuyen _2/10/2019
     * Render toàn bộ tab ở chế độ
     */
    renderAll() {
      return;
      const me = this;

      me.listTabItem.forEach(function (tabItem) {
        if (tabItem.__instance === undefined) {
          tabItem.__instance = me.createInstance(
            tabItem.tabContent,
            tabItem.tabKey
          );
        }
      });
    },

    /**
     * Thực hiện active tabItem
     * @param {String} tabKey Thông tin tabKey của tab cần active
     * @private
     */
    async activeTab(tab) {
      const me = this;

      /**
       * Nếu tab tùy chọn disabled thì active không làm gì cả
       * NTBAO 05.11.2021 Bổ sung thêm thuộc tính này
       */
      if (!tab.disabled) {
        let beforeActive = true;
        if (typeof me.beforeActiveTab == "function") {
          beforeActive = await me.beforeActiveTab(tab, me.oldTabActive);
        }

        if (beforeActive) {
          me.activeTabKey = tab.tabKey;
          me.showContent();
          me.oldTabActive = tab.tabKey;
          // nnlam - 21.06.2021: Thêm emit sự kiện khi active tab
          me.$emit("activeTab", tab);
        }
      }
    },

    /**
     * Hiển thị content theo tab active
     */
    showContent() {
      const me = this;

      me.listTabShow.forEach(function (item) {
        item.active(item.tabKey === me.activeTabKey);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msTab.scss';
// }
//@media screen and (min-width: 1367px) {
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msTab.scss";
//}
</style>
