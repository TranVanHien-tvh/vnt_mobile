<!-- =========================================================================================
	Cột custom hiển thị nội dung có sub title ở dưới trong cell grid
    Template chỉ có 2 dòng, về sau có thể switch case để sửa thêm hoặc css lại
    TDNGHIA 10/10/2021
========================================================================================== -->

<template>
  <div :title="mainContent">
    <div class="main-content">
      <div class="d-flex">
        <!-- Thêm phần hiện icon khi có tệp đính kèm NTDIEM 08.02.2022-->
        <div
          class="icon-16 mr-2"
          v-if="data.AttachmentDetail && column.iconCls"
          :class="column.iconCls"
        ></div>
        <div class="p-text-truncate" :class="column.clsCustom || ''">
          {{ mainContent }}
        </div>
      </div>
    </div>
    <div class="sub-content p-text-truncate">
      {{ subContent }}
    </div>
  </div>
</template>

<script>
import commonFn from "@/commons/commonFunction";

export default {
  name: "MsCustomContentGrid",
  props: {
    data: {},
    column: {},
  },

  computed: {
    /**
     * Hiển thị dòng nội dung chính in đậm
     */
    mainContent() {
      const me = this;

      return me.data[me.column.dataField];
    },

    /**
     * Hiển thị dòng sub màu xám
     */
    subContent() {
      const me = this;
      let subTitle = "";

      switch (me.column.dataField) {
        case "EmulationMovementName":
        case "VotationName":
          if (me.data.hasOwnProperty(me.column.dataSubField)) {
            subTitle = commonFn.getEnumResource(
              me.data[me.column.dataSubField],
              "EnumEmulationTypeColumn"
            );

            if (me.column.prefixSubContent) {
              subTitle =
                me.column.prefixSubContent.trim() +
                " " +
                subTitle.toLowerCase();
            }
          }
          break;

        case "RewardProfileName":
          subTitle = commonFn.getEnumResource(
            me.data[me.column.dataSubField],
            "CommendationType"
          );
          break;

        case "FullName":
        case "EmployeeRegisterName":
          let groupMotive, gender, dateOfBirth;

          if (typeof me.data.DateOfBirth !== "undefined") {
            dateOfBirth =
              (typeof me.data.DateOfBirth === "string"
                ? "- Sinh ngày: " + me.data.DateOfBirth
                : "- Sinh ngày: " +
                  me.$ms.commonFn.convertDateToString(me.data.DateOfBirth)) ||
              null;
          }

          switch (me.data.Gender) {
            case 0:
              gender = "Nữ ";
              break;
            case 1:
              gender = "Nam ";
              break;
            default:
              gender = "";
              break;
          }

          subTitle = gender + dateOfBirth;
          break;
        case "TeamName":
          subTitle = me.data[me.column.dataSubField];
          break;

        case "EmulationName":
          let commendationType = "";

          switch (me.data.CommendationType) {
            case 0:
              commendationType = "Phong trào thường xuyên";
              break;
            case 1:
              commendationType = "Phong trào theo đợt";
              break;
            case 2:
              commendationType = "Quá trình cống hiến";
              break;
            case 3:
              commendationType = "Đột xuất";
              break;
            default:
              break;
          }

          subTitle = commendationType;
          break;
        case "RewardTitleName":
          subTitle = me.data[me.column.dataSubField];
          break;
        default:
          break;
      }

      return subTitle;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
::v-deep .sub-content {
  color: #616161;
  font-size: 13px;
}

.icon-16 {
  width: 16px;
  height: 16px;
  overflow: hidden;
  background: url($ms-image-CeGo_Sprites) no-repeat;
}
.icon-attachment {
  background-position: -63px -208px;
}
</style>
