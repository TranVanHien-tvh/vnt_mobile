<template>
  <div v-html="tagsContent" class="custom-column-search"></div>
</template>

<script>
// Module
import { ModuleEmployee } from "@/stores/module-const";
export default {
  name: "msCustomColumnsSearchAdvanced",
  props: {
    data: {},
    column: {},
  },

  computed: {
    tagsContent() {
      const me = this;
      let datas = JSON.parse(me.data[me.column.dataField]),
        serial = 0,
        htmls = "";
      switch (me.column.dataField) {
        //Danh hiệu thi đua
        case "EmulationTitleDetail":
          datas.map((data) => {
            serial++;
            htmls =
              htmls +
              `<div>${data.Year ? `${serial}. ${data.Year}` : ""} - ${
                data.EmulationTitleName ? data.EmulationTitleName : ""
              }</div>`;
          });
          break;
        //Hình thức khen thưởng
        case "RewardCategoryDetail":
          datas.map((data) => {
            serial++;
            htmls =
              htmls +
              `<div>${data.Year ? `${serial}. ${data.Year}` : ""} - ${
                data.RewardCategoryName ? data.RewardCategoryName : ""
              }</div>`;
          });
          break;
        //Sáng kiến
        case "AchievementIdea":
          datas.map((data) => {
            serial++;
            //Lấy tên cấp sáng kiến
            //Nếu level dang string -> parseInt
            if (typeof data.Level == "string") {
              data.Level = parseInt(data.Level);
            }
            let levelName = me.$ms.commonFn.getEnumResource(
              data.Level,
              "InventApproveLevel"
            );
            htmls =
              htmls +
              `<div>${data.InventName ? `${serial}. ${data.InventName}` : ""} - ${
                data.Year ? data.Year : ""
              } - ${levelName ? levelName : ""}</div>`;
          });
          break;
        //Kỷ luật
        case "DisciplineDetail":
          let fromDateString, toDateString;
          datas.map((data) => {
            serial++;
            fromDateString = data.FromDate
              ? me.formatStringDate(data.FromDate)
              : "";
            toDateString = data.ToDate ? me.formatStringDate(data.ToDate) : "";
            htmls =
              htmls +
              `<div>${data.DisciplineContent ? `${serial}. ${data.DisciplineContent}` : ""} - Ngày hiệu lực: ${fromDateString} ${toDateString != "" ? `- Ngày hết hiệu lực: ${toDateString}` : ''}</div>`;
          });
          break;
             //Đánh giá
        case "EvaluationDetail":
          datas.map((data) => {
            serial++;
            //Lấy kết quả đánh giá
            //Nếu id dang string -> parseInt
            if (typeof data.EvaluationID == "string") {
              data.EvaluationID = parseInt(data.EvaluationID);
            }
            let evaluationName = me.$ms.commonFn.getEnumResource(
              data.EvaluationID,
              "EvaluationResult"
            );
            htmls =
              htmls +
              `<div>${
                data.Year ? `${serial}. ${data.Year}` : ""
              } - ${evaluationName ? evaluationName : ""}</div>`;
          });
          break;
      }
      return htmls;
    },
  },

  methods: {
    /**
     * format date yyy-mm-dd -> dd/mm/yyyy
     */
    formatStringDate(inputDate) {
      var date = new Date(inputDate);
      if (!isNaN(date.getTime())) {
        var day = date.getDate().toString();
        var month = (date.getMonth() + 1).toString();
        // Months use 0 index.

        return (
          (day[1] ? day : "0" + day[0]) +
          "/" +
          (month[1] ? month : "0" + month[0]) +
          "/" +
          date.getFullYear()
        );
      } else {
        return "";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-column-search {
  padding: 6px 0;
}
</style>
