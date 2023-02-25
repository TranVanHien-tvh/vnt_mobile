<template>
  <div>
    <div class="flex-row">
      <div
        v-for="(item) in buildData"
        :class="{'div-multi-value' : countVal > 1}"
      >
        {{ item }}
      </div>
    </div>    
  </div>    
</template>

<script>
export default {
    name: 'IsActiveTemplate',
    props: {
      data: {},
		  column: {},
    },
    data() {
        let me = this;
        let buildData = [], countVal = 0;
        let listOrg = me.data.OrganizationName || "";
        buildData = listOrg.split(',');
        countVal = buildData ? buildData.length : 0;
        return {
            buildData: buildData,
            countVal: countVal
        }
    }    
}
</script>

<style lang="scss" scoped>
.div-multi-value{
    padding: 5px 10px;
    background: #EBEBEB;
    border-radius: 5px;
    margin-right: 6px;
}
</style>


