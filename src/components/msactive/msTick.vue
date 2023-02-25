<template>
  <div>
    <div v-if="getData > 0" style="text-align: center">
      <div class="icon">
        <div class="icon24 check-blue mr-auto" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MsTick",
  props: {
    data: {},
    column: {},
  },
  computed: {
    getData() {
      const me = this;
      let list = [];

      if (this.column.parentCol) {
        list = this.data[this.column.parentCol].filter((item) => {
          return (
            this.column.dataField ==
            this.column.prefix + (item[me.column.idField] || item.id)
          );
        });
      } else {
        // Case theo từng màn hình
        switch (me.column.parentField) {
          case "EmulationTitleDetail":
            list = JSON.parse(me.data.EmulationTitleDetail).filter((item) => {
              return me.column.dataField.indexOf(item.EmulationTitleID) > -1;
            });
            break;
          case "RewardCategoryDetail":
            list = JSON.parse(me.data.RewardCategoryDetail).filter((item) => {
              return me.column.dataField.indexOf(item.RewardCategoryID) > -1;
            });
            break;
          default:
            // Tạm thời vẫn để lại cho các màn hình fake data
            if (this.column.title === "EmulationTitle") {
              list = this.data.EmulationTitle.filter((item) => {
                return this.column.dataField.indexOf(item.id) > -1;
              });
            } else {
              list = this.data.RewardForm.filter((item) => {
                return this.column.dataField.indexOf(item.id) > -1;
              });
            }
            break;
        }
      }

      return list.length;
    },
  },
};
</script>

<style lang="scss" scoped>
.mr-auto {
  margin: auto;
}
</style>
