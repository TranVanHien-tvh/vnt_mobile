<template>
  <div class="ms-pagination flex-row">
    <div>
      {{ pageTotalCaption }}
    </div>
    <div class="total">
      <div
        v-if="loading"
        class="loading"
      />
      <span v-else>{{
        pageTotal | formatData({ formatType: $ms.enum.FormatType.Number })
      }}</span>
    </div>
    {{ $t("i18nComponent.Paging.Records") }}
    <div
      v-show="!isOnlyShowPageTotal"
      class="flex"
    />
    <div v-show="!isOnlyShowPageTotal">
      {{ $t("i18nComponent.Paging.RecordPerPage") }}
    </div>
    <div
      v-show="isShowPageSizeCombox"
      class="page-size"
    >
      <ms-combobox
        v-model="pageSizeValue"
        key-field="value"
        value-field="value"
        display-field="text"
        :data="pageSizeSource"
        :select-only="true"
        @change="changePageSize"
      />
    </div>

    <!-- <div v-show="!isOnlyShowPageTotal">
      {{ $t('i18nComponent.Paging.From') }}
    </div> -->
    <div
      v-show="!isOnlyShowPageTotal"
      class="from"
    >
      {{ fromIndex }}
    </div>
    <div v-show="!isOnlyShowPageTotal">
      -
    </div>
    <div
      v-show="!isOnlyShowPageTotal"
      class="to"
    >
      {{ toIndex }}
    </div>

    <div v-show="!isOnlyShowPageTotal">
      {{ $t("i18nComponent.Paging.Records") }}
    </div>

    <!-- <div v-show="isShowPageSizeCombox">
      {{$t('i18nComponent.Paging.Records')}}
    </div> -->

    <div
      v-show="!isOnlyShowPageTotal"
      class="move prev"
      :class="{ disabled: disablePrevPage }"
      @click="previousPage"
    />
    <div
      v-show="!isOnlyShowPageTotal"
      class="move next"
      :class="{ disabled: disableNextPage }"
      @click="nextPage"
    />
  </div>
</template>
<script>
import MSStore from "@/stores/msstore";
export default {
  name: "MsPagination",
  props: {
    pageSize: {
      default: 0,
      type: Number,
    },
    dataRender: {
      default: 0,
      type: Number,
    },
    /**
     * Tổng số bản ghi của dữ liệu
     */
    pageTotal: {
      default: 0,
      type: Number,
    },

    /*
    Cho phép hiển thị combox số dòng trên một trang hay không?
    Create: 14/01/2020
    Author: ĐVThi
    */
    pageTotalCaption: {
      type: String,
      default: "",
    },

    /*
    Cho phép hiển thị combox số dòng trên một trang hay không? mặc định có
    Create: 14/01/2020
    Author: ĐVThi
    */
    isShowPageSizeCombox: {
      default: true,
      type: Boolean,
    },

    pageIndex: {
      default: 1,
      type: Number,
    },

    pagingTemplate: {},

    data: {},
    /*
     * cờ chỉ hiển thị tổng số trang
     * pvduy 03/01/2021
     */
    isOnlyShowPageTotal: {
      default: false,
      type: Boolean,
    },
    /**
     * loading dữ liệu
     */
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    let me = this,
      grd = me.$parent,
      store = grd.store;
    return {
      viewPage: this.pageIndex,
      currentPage: this.pageIndex,
      pageSizeValue: this.pageSize,
    };
  },
  computed: {
    //Kiểm tra hiện thị ... đầu tiên
    //Created by LTDAT (01/04/2020)

    checkFirstDotted() {
      let me = this,
        listFirst = [1, 2];
      return (
        this.totalPages > 4 &&
        listFirst.indexOf(this.viewPage) < 0 &&
        this.viewPage > 2
      );
    },
    //Kiểm tra hiện thị dấu ... thứ 2
    //Created by LTDAT (01/04/2020)

    checkSecondDotted() {
      return this.totalPages > 4 && this.viewPage <= this.totalPages - 3;
    },
    /**
     * index của bản ghi cuối cùng trong trang trên tập dữ liệu trong DB
     */
    toNumberRecord() {
      return (this.pageIndex - 1) * this.pageSizeValue + this.dataRender;
    },

    /**
     * Tổng số trang theo pageSize hiện tại của grid
     */
    totalPages() {
      return Math.ceil(this.pageTotal / this.pageSizeValue);
    },

    /**
     * Bản ghi bắt đầu
     */
    fromIndex() {
      return this.dataRender == 0
        ? 0
        : (this.pageIndex - 1) * this.pageSizeValue + 1;
    },
    /**
     * Bản ghi bắt đầu
     */
    toIndex() {
      let value = (this.pageIndex - 1) * this.pageSizeValue + this.dataRender;
      return Math.min(value, this.pageTotal);
    },

    disableNextPage() {
      if (this.pageIndex >= this.totalPages && !this.useServerSide) {
        return true;
      }
      return false;
    },
    disablePrevPage() {
      if (this.pageIndex <= 1) {
        return true;
      }
      return false;
    },
  },
  watch: {
    pageIndex(newVal, oldVal) {
      let x = 1;
    },
  },
  watch: {
    pageSizeValue: {
      handler(newVal, oldVal) {
        this.$emit("changepagesize", newVal);
      },
    },
  },
  created() {
    const me = this;

    me.initPageSize();
  },
  mounted() {},
  methods: {
    initPageSize() {
      let sizes = [10, 20, 50, 100],
        arr = [];
      for (let i = 0; i < sizes.length; i++) {
        let value = sizes[i];
        arr.push({
          value: value,
          text: String(value),
        });
      }
      this.pageSizeSource = arr;
    },

    //Load lại page theo số trang.
    loadPageIndex(index) {
      let me = this;
      let payload = {
        skip: (index - 1) * me.pageSizeValue,
        take: me.pageSizeValue,
      };
      me.$emit("loadData", payload);
    },
    nextPage() {
      let me = this;
      if (!me.disableNextPage) {
        me.loadPageIndex(this.pageIndex + 1);
      }
    },

    firstPage() {
      let me = this;
      if (!me.disablePrevPage) {
        me.loadPageIndex(1);
      }

      // this.$parent.store.loadPage(1);
    },

    lastPage() {
      let me = this;
      if (!me.disableNextPage) {
        me.loadPageIndex(me.totalPages);
      }

      // this.$parent.store.loadPage(this.pageIndex);
    },

    previousPage() {
      let me = this;
      if (!me.disablePrevPage) {
        me.loadPageIndex(this.pageIndex - 1);
      }
    },
    changePageSize() {
      this.loadPageIndex(1);
    },
  },
};
</script>
<style scoped lang="scss">
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msPagination.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msPagination.scss';
// }

@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msPagination.scss";
</style>
