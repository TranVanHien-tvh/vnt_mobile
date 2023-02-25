<template>
  <div class="ms-pagination flex-row">
    <div class="flex-normal h-20 pr-12">
      <!-- Số bản ghi -->
      <div class="min-page-caption">
        {{ pageTotalCaption }}
      </div>
      <div class="total">
        <div v-if="loading" class="loading" />
        <span v-else>{{
          pageTotal | formatData({ formatType: $ms.enum.FormatType.Number })
        }}</span>
      </div>
      <div class="min-page-caption">
        {{ $t("i18nComponent.Paging.Records") }}
      </div>
    </div>
    <!-- Tổng SL -->
    <div v-if="isShowQuantity" class="flex-normal pr-12">
      <div
        v-tooltip="getTooltipCaption(quantityProp)"
        class="min-asset-quantity"
      >
        {{ getTotalQuantityCaption() }}
      </div>
      <div class="total">
        <div v-if="loading" class="loading" />
        <span v-else>{{
          summary.TotalQuantity
            | formatData({ formatType: $ms.enum.FormatType.Number })
        }}</span>
      </div>
    </div>
    <!-- Tổng giá trị -->
    <div v-if="isShowAmount" class="flex-normal pr-12">
      <div v-tooltip="getTooltipCaption(amountProp)" class="min-asset-amount">
        {{ getTotalAmountCaption() }}
      </div>
      <div class="total">
        <div v-if="loading" class="loading" />
        <span v-else>{{
          summary.TotalAmount
            | formatData({ formatType: $ms.enum.FormatType.Number })
        }}</span>
      </div>
    </div>
    <!-- Tình trạng -->
    <v-popover
      v-if="isShowDetailAmount"
      placement="top"
      class="min-page-status"
      @show="showDetailStatus"
    >
      <span class="show-detail-status">
        {{ $t("i18nComponent.Paging.Status") }}
      </span>
      <template slot="popover">
        <msDetailSummary ref="msDetailSummary" :summary-info="summary" />
      </template>
    </v-popover>

    <!-- Combo số trang và next-prev trang -->
    <div v-show="!isOnlyShowPageTotal" class="flex" />

    <div class="flex-normal h-40">
      <!-- Paging chưa có text 'Số bản ghi/trang' như thiết kế
       ---- NMTUAN3 3/11/2021
       ------------------------------------------------------>
      <span v-show="!isOnlyShowPageTotal" class="min-page-caption">
        {{ $t("i18nComponent.Paging.RecordPerPage") }}
      </span>

      <div v-show="isShowPageSizeCombox" class="page-size">
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

      <div class="from-to flex-normal h-16">
        <!-- <div v-show="!isOnlyShowPageTotal">
          {{ $t("i18nComponent.Paging.From") }}
        </div> -->
        <div v-show="!isOnlyShowPageTotal" class="from">
          {{ fromIndex }}
        </div>
        <div v-show="!isOnlyShowPageTotal">
          {{ $t("i18nComponent.Paging.Line") }}
        </div>
        <div v-show="!isOnlyShowPageTotal" class="to">
          {{ toIndex }}
        </div>
        <div v-show="!isOnlyShowPageTotal">
          {{
            pagingFromToCaption != null
              ? pagingFromToCaption
              : $t("i18nComponent.Paging.Records")
          }}
        </div>
      </div>

      <div class="flex-normal">
        <div
          v-show="!isOnlyShowPageTotal"
          class="move prev"
          :class="{
            disabled: disablePrevPage,
            'not-magin': pagingFromToCaption == '',
          }"
          @click="previousPage"
        />
        <div
          v-show="!isOnlyShowPageTotal"
          class="move next"
          :class="{ disabled: disableNextPage }"
          @click="nextPage"
        />
      </div>
    </div>
  </div>
</template>
<script>
import msDetailSummary from "./msDetailSummary";
export default {
  name: "MsPagination",
  components: { msDetailSummary },
  props: {
    pageSize: {
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
    },

    /*
    Cho phép xem tổng số
    Create: DVQUAN 21/05/2020 
    */
    summary: {
      default: null,
      type: Object,
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

    pagingFromToCaption: {
      type: String,
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
    let me = this;
    return {
      viewPage: me.pageIndex,
      currentPage: me.pageIndex,
      pageSizeValue: me.pageSize,
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
    isShowQuantity() {
      return (
        this.summary &&
        this.summary.hasOwnProperty(this.quantityProp) &&
        !this.summary.isHideQuantity
      );
    },
    isShowAmount() {
      return (
        this.summary &&
        this.summary.hasOwnProperty(this.amountProp) &&
        !this.summary.isHideAmount
      );
    },
    isShowDetailAmount() {
      return this.summary && this.summary.isShowDetailAmount;
    },
  },
  watch: {
    pageSizeValue: {
      handler(newVal, oldVal) {
        this.$emit("changepagesize", newVal);
      },
    },
    // Sau khi gán pagesize cần gán lại value cho pageSizeValue (đang không nhận giá trị thay đổi truyền xuống)
    pageSize: {
      handler(newVal, oldVal) {
        this.pageSizeValue = newVal;
      },
    },
  },

  created() {
    const me = this;
    me.initStaticData();
    me.initPageSize();
  },
  beforeDestroy() {
    const me = this;
    if (me.summary) {
      Object.clear.call(null, me.summary);
    }
  },

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

    showDetailStatus() {
      if (this.$refs.msDetailSummary) {
        this.$refs.msDetailSummary.show();
      }
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

    // gán cache pagesize
    setCachePageSize() {
      let me = this;
      let grd = me.$parent,
        cacheKey = me.$route?.name;
      if (cacheKey) {
        me.$ms.indexedDB.set(cacheKey, me.pageSizeValue);
      }
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
    },

    lastPage() {
      let me = this;
      if (!me.disableNextPage) {
        me.loadPageIndex(me.totalPages);
      }
    },

    previousPage() {
      let me = this;
      if (!me.disablePrevPage) {
        me.loadPageIndex(this.pageIndex - 1);
      }
    },

    changePageSize() {
      this.loadPageIndex(1);

      // NMTuan3 22/11/2021: không gán cache pagesize nữa
      // this.setCachePageSize();
    },

    initStaticData() {
      let me = this;
      me.quantityProp = "TotalQuantity";
      me.amountProp = "TotalAmount";
      me.defaultSumQuantityCaption = me.$t(
        "i18nComponent.Paging.TotalQuantity"
      );
      me.defaultSumAmountCaption = me.$t("i18nComponent.Paging.TotalAmount");
    },

    // Lấy dữ liệu của tooltip
    getTooltipCaption(type) {
      let me = this;
      let fn = me[`get${type}Caption`];
      return fn
        .call()
        .replace(me.$t("i18nAsset.InShort"), me.$t("i18nAsset.InDetail"));
    },

    // Lấy caption dòng tổng sl ts
    getTotalQuantityCaption() {
      let me = this;

      if (me.summary) {
        let diffCaptions = {
          AllocationReduceEmployeePaging: me.$t("i18nAsset.TotalUsingAsset"),
          AssetReportBrokenPaging: me.$t("i18nAsset.QuantityAsset"),
        };
        return diffCaptions[me.summary.Type] || me.defaultSumQuantityCaption;
      }
    },

    // Lấy caption dòng tổng giá trị ts
    getTotalAmountCaption() {
      let me = this;
      if (me.summary) {
        let diffCaptions = {
          AllocationReduceEmployeePaging: me.$t("i18nAsset.TotalAssetReceived"),
          AssetOnMaintainPaging: me.$t("i18nAsset.TotalEstimatedCost"),
          AssetLostPaging: me.$t("i18nAsset.TotalCompensationValue"),
          Schedule: me.$t("i18nAsset.TotalEstimatedCost"),
        };
        if (me.summary.Type === "AssetOnRepairPaging") {
          return diffCaptions.Schedule || me.defaultSumAmountCaption;
        }
        return diffCaptions[me.summary.Type] || me.defaultSumAmountCaption;
      }
    },
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msPagination.scss";
</style>
