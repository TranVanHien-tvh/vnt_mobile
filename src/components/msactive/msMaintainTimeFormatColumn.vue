<!-- @AuThor TVLoi26.07.2021: Xử lý format định dạng số + text cho cột công suất bảo dưỡng lần đầu/lần sau -->
<template>
  <div>
    <div
      v-show="data[column.dataField] != null"
      class="flex-row align-left"
    >
      <div
        v-show="data.StartType != $ms.enum.MaintainStartType.Any"
        class="text"
      >
        {{ data[column.dataField] | formatData({ dataRow: data, enumName: column.enum}) }}
        <span v-show="data.StartTypeAfterDay != null && data.StartTypeAfterDay != 0">
          {{ data.StartTypeAfterDay | formatData({formatType:$ms.enum.FormatType.Number,dataRow: data}) }}
        </span>
        <span v-show="data.StartTypeAfterDay != null && data.StartTypeAfterDay != 0">
          {{ this.$t("i18nMaintainRepair.SetupMaintainPolicy.DayLabel") }}
        </span>
      </div>
      <div v-show="data.StartType == $ms.enum.MaintainStartType.Any">
        {{ data.StartDate | formatData({formatType:$ms.enum.FormatType.Date,dataRow: data}) }}
      </div>
    </div>
    <div v-show="data[column.dataField] == null">
      -
    </div>
  </div>
</template>

<script>
export default {
    name: "MaintainTimeFormatColumn",
    props: {
        data: {},
		column: {},
    },
    methods:{

    }
}
</script>

<style lang="scss" scoped>
    .align-left{
        text-align: left !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        overflow: hidden !important;
    }
    

    .text{
        width: 100% !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        overflow: hidden !important;
    }
</style>
