<template>
  <div>
    <div class="flex-row center">
      <div class="full-process">
        <div
          class="process"
          :style="{ width: processWidth + '%' }"
        />
      </div>
      <div class="text">
        <span>(</span>
        {{ processWidth }}
        <span>%)</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProcessTemplate",
  props: {
    data: {},
    column: {}
  },
  data() {
    return {
      dataField: null
    };
  },
  computed: {
    processWidth() {
      if(this.dataField != null)
        return this.data[this.dataField];
      else{
        return this.data["Progress"]; //nnphong: sửa để sử dụng ngoài grid, truyền vào 1 object data.Progess
      }
    }
  },
  created(){
    let me = this;
    if(me.column != undefined){
      me.dataField = me.column.dataField;
    }
  }
};
</script>

<style lang="scss" scoped>
.center {
  display: flex;
  align-items: center;
}
.full-process {
  width: 100px;
  height: 6px;
  border-radius: 3px;
  background-color: #d5d5d5;
  margin-right: 10px;
  .process {
    height: 100%;
    border-radius: 3px;
    background-color: rgb(20, 170, 138);
  }
}
</style>


