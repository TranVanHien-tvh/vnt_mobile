<template>
  <div
    v-show="active"
    class="tab-item-content"
  >
    <slot />
  </div>
</template>
<script>
export default {
  name: "MsTabItem",
  props: {
    /**
     * Tiêu đề
     */
    title: {
      type: String,
      default: ""
    },
    /**
     * tab có hiển thị không
     */
    show: {
			type: Boolean,
			default: true
    },
       /**
     * tab có disabled không
     * NTBAO 05.11.2021 Bổ sung thêm thuộc tính này
     */
    disabled: {
			type: Boolean,
			default: false
    },
    /**
     * Key phân biệt các tab với nhau
     */
    tabKey: {
      default: null,
      type: [String, Number]
    },
    /**
     * class style của tab trip
     */
    tabClass: {
      default: '',
      type: [String]
    }
  },
  data() {
    return {
      active: false,
    };
  },
  watch: {
    show(newVal, oldVal) {
      let tab = this.getTabItem();
      if (tab) {
        tab.show = newVal;
      }
    },
    /**
     * Theo dõi sự thay đổi tiêu đề tab. Nếu muốn build động
     * NTBAO 05.11.2021
     */
    title(){
      this.__tabItem.title = this.title
    }
  },
  created() {},
  mounted() {
    const me = this;

    let tabParent = me.getTabContainer(),
      fieldsNoneReactive = [
        // "id",
        "tabKey",
        // "gridType",
        // "useTabShared",
        // "__instance",
        // "isRender"
      ];

    if (tabParent) {
      //define tabItem
      let tabItem = {
          title: me.title,
          show: me.show,
          excludeLayout: me.excludeLayout,
          tabClass: me.tabClass,
          disabled: me.disabled,
          active: function(val) {
            me.active = val
          }
        },
        _privateTabItem = {
          // id: tabParent.listTabItem.length,
          tabKey: me.tabKey,
          // gridType: me.gridType,
          // useTabShared: me.useTabShared,
          // __instance: me.useTabShared ? null : me,
          // isRender: false,
          // isTabItem: true
        };

      fieldsNoneReactive.forEach(field => {
        Object.defineProperty(tabItem, field, {
          enumerable: false,
          configurable: false,
          get: function() {
            return _privateTabItem[field];
          },
          set: function(value) {
            _privateTabItem[field] = value;
          }
        });
      });

      tabParent.listTabItem.push(tabItem);
      me.__tabItem = tabItem;
    }
  },
  methods: {
    /**
     * Lấy ra đối tượng TabItem để làm việc với msTab
     * @author DNThang - 13.04.2020
     */
    getTabItem() {
      return this.__tabItem;
    },
    /**
     * Lấy ra control tabParent chứa tab hiện tại
     * (Chưa nghĩ ra cách nào khác để lấy tab cha nên dùng parent)
     */
    getTabContainer() {
      return this.$parent;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msTab.scss";
</style>
