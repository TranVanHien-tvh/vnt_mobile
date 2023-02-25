<template>
  <div>
    <div
      v-if="data[column.dataField] == $ms.enum.EmployeeStatus.Working"
      class="flex-row"
    >
      <div class="text working">
        {{ data[column.dataField] | formatData({formatType:column.formatType,enumName:column.enum,dataRow:data}) }}
      </div>
    </div>
    <div
      v-else-if="data[column.dataField] == $ms.enum.EmployeeStatus.Quit"
      class="flex-row"
    >
      <div class="text notworking">
        {{ data[column.dataField] | formatData({formatType:column.formatType,enumName:column.enum,dataRow:data}) }}
      </div>
    </div>
    <div
      v-else
      class="flex-row"
    >
      <div class="text">
        {{ data[column.dataField] | formatData({formatType:column.formatType,enumName:column.enum,dataRow:data}) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: "EmployeeStatus",
    props: {
        data: {},
		column: {},
    },
}
</script>

<style lang="scss" scoped>
    .working{
        color: #00B44B;
    }

    .notworking{
        color: #E61D1D;
    }
</style>
