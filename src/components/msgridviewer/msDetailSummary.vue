<template>
  <div class="list-detail">
    <table>
      <!-- header -->
      <tr class="tbl-header">
        <td class="status">
&nbsp;
        </td>
        <td class="tbl-padding text-left">
          {{ $t("i18nComponent.DetailSummary.Status") }}
        </td>
        <td
          v-if="listDetailSummary[0] && listDetailSummary[0].hasOwnProperty('quantity')"
          class="tbl-padding text-right"
        >
          {{ $t("i18nComponent.DetailSummary.Quantity") }}
        </td>
        <td
          v-if="listDetailSummary[0] && listDetailSummary[0].hasOwnProperty('amount')"
          class="tbl-padding text-right"
        >
          {{ $t("i18nComponent.DetailSummary.Amount") }}
        </td>
      </tr>
      <!-- row -->
      <tr
        v-for="item in listDetailSummary"
        :key="item.title"
        class="tbl-row"
      >
        <!-- màu sắc -->
        <td class="status">
          <span :class="['icon', item.iconColor]" />
        </td>
        <!-- Tiêu đề -->
        <td class="tbl-padding text-left">
          {{ item.title }}
        </td>
        <!-- Số lượng -->
        <td
          v-if="listDetailSummary[0] && listDetailSummary[0].hasOwnProperty('quantity')"
          class="tbl-padding text-right"
        >
          {{ item.quantity | formatData({ formatType: $ms.enum.FormatType.Number }) }}
        </td>
        <!-- Giá trị -->
        <td
          v-if="listDetailSummary[0] && listDetailSummary[0].hasOwnProperty('amount')"
          class="tbl-padding text-right"
        >
          {{ item.amount | formatData({ formatType: $ms.enum.FormatType.Number }) }}
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
import EventBusGlobal from "@/commons/eventBusGlobal";
import { mapState, mapActions, mapGetters } from "vuex";
// import { ModuleAsset } from "@/stores/module-const";
export default {
  name: "MsDetailSummary",
  props: {
    summaryInfo: {
      default: null,
      type: Object
    }
  },
  computed: {
    listDetailSummary() {
      let me = this;
      let  arrKey = Object.keys(me.summaryInfo);
      // Lấy số liệu danh sách tình trạng
      // Cấu trúc trả về dạng enum và bind lên giao diện
      // Ex: AssetStatus_Quantity_1 => lấy được enum là AssetStatus và giá trị của enum là 1 với trường lấy lên là Quantity
      let listSummary = [],
        listSortByTitle = me.listSortByTitle,
        isListAsset =  me.summaryInfo.Type && me.summaryInfo.Type.includes("Asset")
      arrKey.map(key => {
        if (typeof me.summaryInfo[key] !== "boolean") {
          let arrEnum = key.split("_"),
            detailTitle = me.$ms.commonFn.getEnumSource(arrEnum[0], arrEnum[2]).find(x => x.enumValue == arrEnum[2])?.enumText,
            oldItem = listSummary.filter(x => x.title === detailTitle);

          // Kiểm tra có item trong list rồi thì chỉ cần gán thêm thôi
          let item = {};
          if (arrEnum[1]) {
            if (oldItem.length > 0) {
              oldItem[0][arrEnum[1].toLowerCase()] = me.summaryInfo[key];
            } else {
              item.title = detailTitle;
              item[arrEnum[1].toLowerCase()] = me.summaryInfo[key];
              // Bảng nào chứa tài sản mới cần lấy lên màu
              if (isListAsset) {
                item.iconColor = me.getColor(arrEnum[2])
                // gặp fom bảo dưỡng loại bỏ số liệu sửa chữa
                if(me.summaryInfo.Type === 'AssetOnMaintainPaging' && detailTitle ===listSortByTitle[2])
                {
                  // không làm gì cả
                }
                else
                // gặp form sửa chữa loại bỏ số liệu bảo dưỡng
                if(me.summaryInfo.Type === 'AssetOnRepairPaging' && detailTitle ===listSortByTitle[3])
                {
                  // không làm gì cả
                }
                // không thì lấy cả
                else
                {
                  listSummary[listSortByTitle.indexOf(detailTitle)] = item;
                }
              } else {
                // sort theo thứ tự định sẵn
                listSummary.push(item);
              }
            }
          }
        }
      });
      // Nếu gán màu thì phải gán theo thư tự nên cần distinct lại array để xóa đi nhưng giá trị trống
      return isListAsset ? listSummary.filter(x=>x) : listSummary;
    }
  },
  created() {
    let me = this,
      arTitle = Object.values(me.$t('i18nEnum.AssetStatus'))
    // danh sách tiêu đề được sắp xếp trước từ enum
    me.listSortByTitle = [
      ...arTitle
    ]
    // danh sách màu chính
    me.listColors = {
      "99": "green-icon", // Chưa sử dụng
      "1": "blue-icon", //Đang sử dụng
      "4": "orange-icon", //Sửa chữa
      "5": "red-icon", //Bảo dưỡng
    }
    // Lắng nghe sự kiện để thực hiện load lại danh sách dòng tổng trạng thái
    EventBusGlobal.$on("UpdateDetailSummary", me.reloadLstDetailSummary);
  },
  methods: {
    // Lấy màu theo tình trạng tài sản
    getColor(status) {
      return this.listColors[status]
    },
     removeItemOnce(arr, value) {
      var index = arr.indexOf(value);
      if (index > -1) {
        arr.splice(index, 1);
      }
      return arr;
    },
    // Show form danh sách
    show() {
      let me = this,
        payload = me.summaryInfo.payload,
        type = me.summaryInfo.Type;
      // Nếu Form là danh sách tài sản thì mới cần load lại
      if (type
        && type == "AssetPaging"
        && (me.latestPayload != payload || me.listDetailSummary.length === 0)) {
        me.getStatusAssetDetail(payload).then(res => {
          me.latestPayload = me.summaryInfo.payload
          let sum = res.SummaryData;
          me.setSummary({...me.summaryInfo, ...sum})
        })
      }
    },

    // Xóa danh sách chi tiết trạng thái để load lại
    reloadLstDetailSummary() {
      this.listDetailSummary.length = 0
    },

    // Map với hàm setSummaryData ở module asset gọi vào crud-base để commit hàm setSummary với payload truyền vào
    ...mapActions({
      // setSummary: ModuleAsset + "/setSummaryData",
      // getStatusAssetDetail: ModuleAsset + "/getStatusAssetDetail",
    }),
  },
};
</script>
<style scoped lang="scss">
@import "@/assets/scss/components/msDetailSummary.scss";
</style>