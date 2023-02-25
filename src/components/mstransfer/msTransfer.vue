<template>
  <div>
    <!-- Đang điều chuyển -->
    <div
      v-if="data[column.dataField]==0"
      class="center"
    >
      <div class="icon">
        <div class="icon-image icon-inactive" />
      </div>
      <div class="text">
        {{ $t('i18nTransfer.Management.Transfering') }}
      </div>
      <div class="transfering-image" />
    </div>    
    <!-- Đã nhận -->
    <div
      v-if="data[column.dataField]==1"
      class="center"
    >
      <div class="icon">
        <div class="icon-image icon-active" />
      </div>
      <div>{{ $t('i18nTransfer.Management.Received') }}</div>
    </div>
    <!-- Từ chối -->
    <div
      v-if="data[column.dataField]==2"
      class="center"
    >
      <div class="icon">
        <div class="icon-image icon-refuse" />
      </div>
      <div>{{ $t('i18nTransfer.Management.Cancelled') }}</div>
    </div>
  </div>    
</template>

<script>
export default {
    name: 'TransferTemplate',
    props: {
        data: {},
		column: {},
    }    
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
.center{
    display: flex;
    align-items: center;
}
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
    .icon-inactive {
        background-color: #9e9e9e;        
    }
    .icon-refuse {
        background-color: #e65d5d;        
    }
}

.transfering-image{
    margin-left: 10px;
    height: 24px;
    width: 24px;
    background:transparent url($ms-image-sprites) no-repeat;
    background-position: -336px -256px;
}
</style>


