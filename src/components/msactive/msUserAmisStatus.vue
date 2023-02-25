<template>
  <div>
    <div
      v-if="data[column.dataField] == $ms.enum.UserAmisStatus.Working"
      class="flex-row"
    >
      <div class="icon">
        <div class="icon-image icon-active" />
      </div>
      <div class="text">
        {{ data[column.dataField] | formatData({formatType:column.formatType,enumName:column.enum,dataRow:data}) }}
      </div>
    </div>    
    <div
      v-else
      class="flex-row"
    >
      <div class="icon">
        <div class="icon-image icon-not-active" />
      </div>
      <div>{{ data[column.dataField] | formatData({formatType:column.formatType,enumName:column.enum,dataRow:data}) }}</div>
    </div>
  </div>    
</template>

<script>
export default {
    name: 'UserAmisStatus',
    props: {
        data: {},
		column: {},
    }    
}
</script>

<style lang="scss" scoped>
.icon{
    background-color: rgba(31, 31, 31, 0);
    width: 16px;
    height: 16px;
    position: relative;
    margin-right: 3px;
    .icon-image{
        border-radius: 50%;
        width: 8px;
        height: 8px;
        overflow: hidden;
        position: absolute;
        top: 5px;
        left: 1px;
    }
    .icon-active {
        background-color: #50b83c;
    }
    .icon-not-active {
        background-color: #9e9e9e;        
    }
}
</style>


