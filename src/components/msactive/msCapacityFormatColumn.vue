<!-- @AuThor TVLoi26.07.2021: Xử lý format định dạng số + text cho cột công suất bảo dưỡng lần đầu/lần sau -->
<template>
  <div>
    <div
      v-if="data['MaintainQuantityStart'] != 'MORE_DETAILS' && data['MaintainQuantityStep'] != 'MORE_DETAILS'"
      class="flex-row align-right"
    >
      <div class="text">
        {{ data[column.dataField] | formatData({formatType:$ms.enum.FormatType.Number,dataRow: data}) }}
        <span>
          {{ displayText }}
        </span>
      </div>
    </div>
    <div 
      v-if="(column.dataField == 'MaintainQuantityStart' && data['MaintainQuantityStart'] == 'MORE_DETAILS') || (column.dataField == 'MaintainQuantityStep' && data['MaintainQuantityStep'] == 'MORE_DETAILS')"
      :class="[`text-${column.align || 'left'}`, column.cssClass, 'text-overflow', 'icon24', 'more-rows']"
      :title="$t('i18nCommon.command.ViewMoreDetails')"
      data-animation="animated bounceInDown"
      data-toggle="tooltip"
    />
  </div>
</template>

<script>
export default {
    name: "CapacityFormatColumn",
    props: {
        data: {},
		column: {},
    },
    computed:{
        displayText: function()
        {
            if(this.data[this.column.dataField] && this.data["CapacityUnitName"])
            {
                return this.data["CapacityUnitName"];
            }

            return "";
        }
    }
}
</script>

<style lang="scss" scoped>
    .align-right{
        text-align: right !important;
    }

    .text{
        width: 100% !important;
    }
</style>
