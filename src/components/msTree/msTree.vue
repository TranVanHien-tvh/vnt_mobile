<!-- Grid tree -->
<template>
  <div
    class="ms-grid-viewer h-auto flex-column"
    :class="{
      selectedTextMode: selectedTextMode,
      'has-filter': filterHeader.length > 0 && hasBindingFilterHeader,
    }"
  >
    <div
      v-if="filterHeader.length > 0 && hasBindingFilterHeader"
      class="container-filter-text"
    >
      <div class="container-filter">
        <div
          v-for="item in filterHeader"
          :key="item.dataField"
          class="item-filter d-flex"
        >
          <div class="content d-flex">
            <div class="data-field bold">
              {{ item.caption }}
            </div>
            <div class="operator">
              {{ buildOperatorText(item.filter.operator) }}
            </div>
            <div class="value bold">
              {{ buildValue(item) }}
            </div>
          </div>
          <div
            class="action-delete-filter icon24 deleteX"
            @click="removeFilterItem(item)"
          />
        </div>
      </div>
      <div
        class="clear-all-filter"
        @click="clearAllFilter"
      >
        {{ $t("i18nComponent.i18nHeaderOption.ResetBtn") }}
      </div>
    </div>
    <div
      ref="content"
      :class="['ms-content--table scroller flex', stickeyCountClass]"
      :style="[gridViewStyle]"
      @scroll="onScroll"
    >
      <div class="col-sp" />
      <table
        ref="tableHeader"
        class="ms-table ms-table-tree"
      >
        <thead
          v-show="isShowHeader"
          class="ms-thead"
        >
          <tr
            ref="trHeader"
            class="ms-tr"
          >
            <th
              v-if="multiple && isCustom"
              slot="check-box"
              class="ms-th multiple-cell sticky"
              style="width: 26px; margin-right: 13px"
              :rowspan="0"
              scope="col"
            >
              <ms-checkbox
                :value="isCheckedMultiple"
                class="justify-center"
                check-only
                @click="changeCheckedMultiple"
              />
            </th>
            <ms-th
              v-for="(col, colIndex) in columnx"
              ref="th"
              :key="col.dataField"
              class="ms-th sticky"
              :col="col"
              :col-index="colIndex"
              :filteable="filterable"
              :is-custom="isCustom"
              :resize-col="resizeCol"
              :show-all-icon-filter="showAllIconFilter"
              :multiple="multiple"
              :is-checked-multiple="isCheckedMultiple"
              :change-checked-multiple="changeCheckedMultiple"
              @resizeOn="resizeActive"
              @resizeOff="resizeClose"
              @resizeMove="mouseMoveResize"
              @buildFilter="buildFilterHeader"
            >
              <!-- <div
                v-if="multiple && colIndex == 0 && !isCustom"
                slot="check-box"
                style="width: 26px; margin-right: 13px"
              >
                <ms-checkbox
                  :value="isCheckedMultiple"
                  class="justify-center"
                  check-only
                  @click="changeCheckedMultiple"
                />
              </div> -->
            </ms-th>
            <th
              v-if="widgetOptions"
              class="ms-th widget-title"
              :style="[
                {
                  'max-width': `${widgetOptions.width}px`,
                  'min-width': `${widgetOptions.width}px`,
                },
              ]"
            >
              <span>{{ widgetOptions.title }}</span>
            </th>
          </tr>
        </thead>
        <tbody
          v-if="loading"
          class="ms-tbody grid-loading"
        >
          <template>
            <tr
              v-for="n in shimmerRow"
              :key="n"
            >
              <td
                v-for="t in shimmerColumn"
                :key="t"
              >
                <div class="shimmer" />
              </td>
            </tr>
          </template>
        </tbody>

        <tbody
          v-else-if="!dataEmpty"
          class="ms-tbody"
        >
          <ms-tr
            v-for="(item, index) in dataRender"
            :key="item['__vKeyValue']"
            :ref="`tr-${index}`"
            :columns="columnx"
            :data-row="item"
            :row-index="index"
            :is-selected="isSelected(item)"
            :widget-options="widgetOptions"
            :multiple="multiple"
            :is-custom="isCustom"
            :class="{ 'row-selected': item == rowSelected.data }"
            :row-actions="rowActions"
            :action-inline-count="actionInlineCount"
            :is-width-full="isWidthFull"
            v-on="listeners"
          />
        </tbody>

        <div
          v-else-if="isShowImageGridEmpty"
          class="grid-no-data"
          :style="emptyStyle"
        >
          <img
            src="@/assets/images/empty/grid-empty.svg"
            class="img-bg"
          >
          <div class="empty-des">
            {{ $t("i18nCommon.noData") }}
          </div>
        </div>
      </table>
      <!-- <div class="ms-content--table flex" v-show="!loading">
        <msDynamicScroll
          :items="dataRender"
          :min-item-size="32"
          class="scroller"
          :style="gridViewStyle"
          keyField="__vKeyValue"
          :minWidth="widthx"
          @scroll="onScroll"
          ref="dynamicScroll"
        >
          <template v-slot="{ item, index, active }">
            <msDynamicScrollerItem :item="item" :active="active" :data-index="index">
              <table class="mw-full border-collapse body">
                <ms-tr
                  :key="item['__vKeyValue']"
                  :ref="`tr-${index}`"
                  :columns="columnx"
                  :dataRow="item"
                  :rowIndex="index"
                  :isSelected="isSelected(item)"
                  :widgetOptions="widgetOptions"
                  :multiple="multiple"
                  v-on="listeners"
                  :class="{'row-selected':item == rowSelected.data}"
                  :rowActions="rowActions"
                  :actionInlineCount="actionInlineCount"
                  :isWidthFull="isWidthFull"
                ></ms-tr>
              </table>
            </msDynamicScrollerItem>
          </template>
        </msDynamicScroll>
      </div> -->
    </div>

    <!-- <div class="flex-row ms-pagination"> -->
    <!-- <div>{{$t("i18nComponent.Paging.Total")}}</div>
      <div class="total">{{rowNumber}}</div> -->

    <!-- :pageSize="rowNumber" -->
    <ms-pagination
      :summary="summary"
      :page-total="rowNumber"
      :is-show-page-size-combox="false"
      :is-only-show-page-total="true"
      :page-total-caption="$t('i18nComponent.Paging.Total')"
    />
    <!-- </div> -->
  </div>
</template>
<script>
import msTr from "./msTrTree";
import msTh from "./msTh";
import commonFn from "@/commons/commonFunction.js";
import msPagination from "@/components/msgridviewer/msPagination";
// import msDynamicScroll from "@/components/msvirtualscroller/MsDynamicScroller.vue";
// import msDynamicScrollerItem from "@/components/msvirtualscroller/MsDynamicScrollerItem.vue";

export default {
  name: "MsTree",
  components: {
    msTr,
    msTh,
    msPagination,
    // msDynamicScroll,
    // msDynamicScrollerItem
  },
  props: {
    //custom lại hàm check selected
    customIsSelected: {
      type: Function,
      default: null,
    },
    /*
    Cho phép hiển thị header của lưới hay không? mặc định có
    */
    isShowHeader: {
      default: true,
      type: Boolean,
    },

    //Value thực hiện lưu giá trị các cột được chọn
    value: {
      default: null,
    },

    //Data dữ liệu grid từ ngoài truyền vào
    data: {
      type: Array,
      return: () => [],
      default: null,
    },
    //Cấu hình các cột truyền vào
    columns: {
      type: Array,
      return: () => [],
      default: null,
    },

    /**
     * có filter cột không
     */
    filterable: {
      type: Boolean,
      default: false,
    },
    /**
     * có show text filter khi lọc ra không
     */
    hasBindingFilterHeader: {
      default: false,
      type: Boolean,
    },

    /*
     * pvduy 19/03/2021
     * cờ xác nhận xem có cho hiện ảnh trống khi grid ko có dữ liệu hay không? ==> sử dụng trong grid detail dù trống vẫn ẩn ảnh đi.
     */
    isShowImageGridEmpty: {
      default: true,
      type: Boolean,
    },

    /**
     * Cấu hình cho cột chức năng là 1 đối tượng gồm có
     * title: tên tiêu đề cột chức năng
     * components:'components import vào'
     * width:Độ rộng của cột
     */
    widgetOptions: {
      type: Object,
      default: null,
    },

    //Set độ rộng cho grid
    maxHeight: {
      default: "none",
      type: [Number, String],
    },
    //Cấu hình có phân trang hay không
    pagination: {
      default: false,
      type: Boolean,
    },
    //Nhận 2 giá trị remote/local để lấy giá trị ở server hoặc local
    queryMode: {
      default: "remote",
      type: String,
    },
    summary: {
      default: () => {},
      type: Object,
    },
    //Cột cho phép tích chọn nhiều dòng
    multiple: {
      default: false,
      type: Boolean,
    },

    //Parent Field
    idProperty: {
      default: null,
      type: String,
    },

    //Field chứa parentID
    parentIdProperty: {
      default: "ParentID",
      type: String,
    },

    store: {},
    /*
     * thêm cấu hình những cột luôn lấy khi load grid
     * pvduy 19/01/2021
     */
    alwayTakeColumns: {
      default: null,
      type: Array,
    },
    /**
     * Action của row
     */
    rowActions: {
      default: null,
      type: [Object, Array],
    },
    /**
     * Số lượng item hiển thị inline khi hover vào dòng
     * nếu vượt quá số lượng này thì sẽ đặt trong more ...
     */
    actionInlineCount: {
      default: 5,
      type: Number,
    },
    //Cho phép di chuyển độ rộng của cột hay không
    resizeCol: {
      default: true,
      type: Boolean,
    },
    // có cho width 100% không, cái này đáp ứng cho trường hợp tree có 1 column
    isWidthFull: {
      default: false,
      type: Boolean,
    },
    indexFlexRight: {
      default: 1,
      type: Number,
    },
    /**
     * Số dòng shimmer loading
     */
    shimmerRow: {
      type: Number,
      default: 5,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Dữ liệu tổng
     * Dùng cho sum lấy từ server truyền vào (không phụ thuộc vào trang đang hiển thị)
     */
    isAutoFocusFirstRow: {
      type: Boolean,
      default: true,
    },

    /**
     * TDNGHIA biến kiểm tra xem có custom tree giống màn tổ chwucs cơ cấu hay không
     * TDNGHIA đẹp trai: 16/9/2021
     */
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      datax: null,
      columnx: null,
      selectedTextMode: false,
      widthx: 0,
      rowSelected: {},
      indexResize: null, // index của column đang resize
      /*
      Cho show tất cả icon filter header lên
      Create: 20/05/2020
      Author: NNLAM
      */
      showAllIconFilter: false,
      /**
       * Filter trên tiêu đề cột
       */
      filterHeader: [],

      isGridTree: true,

      dataTemp: [],

      checkCustom: this.isCustom,
      /**
       * Vị trí hiển thị của box empty
       */
      emptyStyle: {
        top: 0,
        left: 0,
        display: "none",
      },
    };
  },
  computed: {
    stickeyCountClass() {
      if (this.columnx) {
        let count = this.multiple ? 1 : 0;
        for (let i = 0; i < this.columnx.length; i++) {
          let col = this.columnx[i];
          if (!col.lock) {
            break;
          }
          count++;
        }

        if (count > 0) {
          return ["sticky", count].join("-");
        }
      }
      return null;
    },
    /**
     * Đếm số bản ghi của tree
     */
    rowNumber() {
      const me = this;
      let count = 0;
      if (me.datax) {
        return me.datax.length;
      }
      return 0;
    },

    //Sự kiện từ 1 dòng dữ liệu emit ra ngoài
    listeners() {
      const me = this;
      return {
        click: (dataRow, event) => {
          if (me.rowSelected && me.rowSelected.data != dataRow) {
            let indexRow = me.datax.findIndex((item) => item == dataRow);
            me.rowSelected = {
              data: dataRow,
              index: indexRow,
            };
            if (event) {
              event.target.focus();
            }
          }
          me.$emit("click", dataRow);
        },
        dblclick: (dataRow, event) => {
          me.$emit("dblclick", dataRow, event);
        },
        //tvloi*(10/05/2021) - drilldown dòng chi tiết
        drilldownClick: (metaData, event) => {
          if (event) {
            event.target.focus();
          }
          this.$emit("drilldownClick", metaData);
        },
        mouseover: (dataRow, event) => {
          me.$emit("rowmouseover", dataRow, event);
        },
        rowactionclick: (command, dataRow, event) => {
          me.$emit("rowactionclick", command, dataRow, event);
        },
        keydown: (dataRow, event) => {
          me.row_keydown(dataRow, event);
          me.$emit("keydown", dataRow, event);
        },
        widgetEvent: (data, event) => {
          me.$emit("widgetEvent", data, event);
        },
        clickMultiple: (dataRow) => {
          me.clickMultiple(dataRow);
        },
      };
    },

    /**
     * Kiểm tra xem tất cả dữ liệu có đang được check hay không
     */
    isCheckedMultiple() {
      if (this.value) {
        if (this.datax.length != 0) {
          return (
            this.value.length >= this.dataRender.length &&
            this.dataRender.every((item, index) => {
              return this.value.includes(item);
            })
          );
        } else {
          return false;
        }
      }

      return false;
    },

    gridViewStyle() {
      if (this.maxHeight) {
        return {
          "max-height": this.maxHeight,
          height: "100%",
          overflow: "overlay",
        };
      }
      return null;
    },
    dataRender() {
      return this.datax.filter((item) => {
        return item.isHide == false;
      });
    },
    /**
     * Số lượng cột shimmer
     */
    shimmerColumn() {
      let res = 0;
      if (this.columnx && this.columnx.length > 0) {
        res = this.columnx.length;
      }

      if (this.multiple) {
        res += 1;
      }

      return res;
    },
    dataEmpty() {
      // return false;
      if (this.datax && this.datax.length > 0) {
        return false;
      } else return true;
    },
  },
  // updated() {
  //   this.widthx = this.$refs.tableHeader.offsetWidth;
  //   if(!this.$refs.trHeader.$el){
  //     this.$refs.trHeader.style.width = this.$refs.dynamicScroll.$el.offsetWidth + 'px';
  //   }else{
  //     this.$refs.trHeader.$el.style.width = this.$refs.dynamicScroll.$el.offsetWidth + 'px';
  //   }
  // },
  watch: {
    data: {
      immediate: true,
      handler(newVal, oldVal) {
        let me = this;
        me.initData(newVal);
        // vvkiet - Copy từ msGridViewer sang
        if (me.isAutoFocusFirstRow) {
          me.autoSelectedFirstRow(window.event);
        }

        //nếu không có dữ liệu tính toán vị trí hiển thị của box empty
        //control chưa render thì cũng k xử lý
        if ((!newVal || newVal.length === 0) && me.$el) {
          me.$nextTick(() => {
            let scroll = me.$refs.content;
            if (scroll) {
              let scrollPos = scroll.getBoundingClientRect();
              me.emptyStyle = {
                top: [scrollPos.top + scrollPos.height / 2 - 95, "px"].join(""),
                left: [scrollPos.left + scrollPos.width / 2 - 125, "px"].join(
                  ""
                ),
              };
            }
          });
        }
      },
    },
  },
  created() {
    const me = this;
    me.initColumns();
    me.initData();
  },
  mounted() {
    // this.widthx = this.$refs.tableHeader.offsetWidth;
  },

  methods: {
    /**
     * Hàm xử lý sự kiện khi click vào ô check multiple
     * @param dataRow dữ liệu của dòng được chọn
     */
    clickMultiple(dataRow) {
      const me = this;
      let VModel = [...me.value];
      if (VModel.includes(dataRow)) {
        VModel.remove(dataRow);
      } else {
        VModel.push(dataRow);
      }
      me.$emit("input", VModel);
    },

    /**
     * Kiểm tra xem cột được check hay không ?
     * duyệt trong data nếu có chưa dữ liệu của dòng tương ứng thì return true ngược lại false
     * @param dataRow dữ liệu của dòng được check
     *  */
    isSelected(dataRow) {
      const me = this;
      //nnlam cmt đoạn này do nó gây lỗi và không cần thiết, ai code đoạn này vui lòng confirm với em để dc hỗ trợ
      // if (typeof me.customIsSelected === 'function') {
      //   return me.customIsSelected(dataRow);
      // }
      if (me.value && me.value.length > 0) {
        return me.value.includes(dataRow);
      }
      return false;
    },

    /**
     * Hàm thực hiện xử lý binding dữ liệu cho các grid có checkbox cho phép chọn row (v-model)
     * @param {[Object/String]} listItems Danh sách các item đang nằm trên grid hoặc danh sách ID của các Item cần check
     * @param {String} idField Primary key của model/object trong store
     */
    setModelById(listItems, idField = null) {
      const me = this;
      listItems = listItems || [];
      //Trong trường hợp không phải grid allow check thì không cần làm gì
      if (!me.multiple) {
        return;
      }

      let idProperty = null;
      if (idField) {
        idProperty = idField;
      } else if (me.idProperty) {
        idProperty = me.idProperty;
      } else if (me.store.model) {
        idProperty = me.store.getIdProperty();
      }

      if (idProperty) {
        let arrModel = [];
        // let cacheModel = [];
        // if (me.isCacheMultiple) {
        // 	cacheModel = [...me.value];
        // }

        listItems.forEach((id) => {
          me.datax.forEach((item) => {
            if (typeof id == "object") {
              if (item[idProperty] == id[idProperty]) {
                arrModel.push(item);
              }
            } else {
              if (item[idProperty] == id) {
                arrModel.push(item);
              }
            }
          });
        });

        // if (cacheModel && cacheModel.length > 0) {
        // 	cacheModel.forEach(itemCache => {
        // 		if (!arrModel.some(item => item[idProperty] == itemCache[idProperty])) {
        // 			arrModel.push(itemCache);
        // 		}
        // 	});
        // }

        me.$emit("input", arrModel);
      }
    },

    //Sự kiện ấn vào nút chọn tất cả bên trên header
    changeCheckedMultiple() {
      const me = this;
      if (me.isCheckedMultiple) {
        me.$emit("input", []);
      } else {
        me.$emit("input", me.datax);
      }
    },
    /**
     * Sự kiện scroll trên grid
     * Thay đổi lại tọa độ scroll trên header
     */
    onScroll(e) {
      const me = this;
      if (e && me.$refs.header) {
        me.$refs.header.scrollLeft = e.target.scrollLeft;
      }
    },

    //Xử lý sự kiện resize col trên grid
    //cmt by: nnlam 24/02/2021: bỏ đi vì thừa gây xấu khi mà click vào resize thì làm change width toàn bộ column luôn
    resizeActive(col, indexCell) {
      this.indexResize = indexCell;
      //Không cho phép bôi đen text
      // this.selectedTextMode = true;
      // if (this.$refs.th) {
      //   let listTh = this.$refs.th;
      //   listTh.forEach(item => {
      //     let width = item.updateColWidth();
      //     if (item == listTh[listTh.length - 1]) {
      //       item.autoResizex = true;
      //     }
      //   });
      // }
    },
    mouseMoveResize(col) {
      let me = this;

      if (me.indexResize != null && me.indexResize != "undefined") {
        let thResize = me.$refs.th[me.indexResize];
        let widthCustom = "";
        if (thResize) {
          widthCustom = thResize.$el.offsetWidth;
        }
        me.datax.forEach((item, index) => {
          let tr = me.$refs[`tr-${index}`];
          if (tr) {
            if (tr.$refs && tr.$refs.td) {
              let td = tr.$refs.td[me.indexResize];
              if (td) {
                if (widthCustom) {
                  td.style.maxWidth = widthCustom + "px";
                  td.style.minWidth = widthCustom + "px";
                  td.style.width = widthCustom + "px";
                }
              }
            }
          }
        });
      }
    },
    //Đóng sự kiện resize cột trên grid
    resizeClose(col) {
      //Cho phép bôi đên text
      this.selectedTextMode = false;
      col.newWidth = col.width;
      this.$emit("resizeCol", col);
    },
    /**
     * Set giá trị default cho cấu hình cột
     * Created by LTDAT(17.07.2020)
     */
    setDefaultFieldColumn(columns) {
      //Nếu không cấu hình field hiện thị thì mặc định là true
      const me = this;
      columns.forEach((item) => {
        if (item.visible != false) {
          item.visible = true;
        }
        //set columnType
        if (typeof item.columnType !== "number") {
          me.setDefaultColumnType(item);
        }

        //nếu không chỉnh định thì để align mặc dịnh theo format type
        if (!item.align) {
          switch (item.columnType) {
            case "ColumnNumber":
              item.align = "right";
              break;
            case "ColumnBoolean":
              item.align = "center";
              break;
          }
        }

        me.$set(item, "_width", item.width);

        //default filter
        if (!item.filter) {
          me.setDefaultFilter(item);
        }
      });
    },
    /**
     * Gán giá trị mặc định cho columnType của cấu hình cột
     * @param {Object} col: cấu hình cột
     * @author NVLAM 18.12.2020
     */
    setDefaultColumnType(col) {
      const me = this,
        FormatType = me.$ms.enum.FormatType;
      switch (col.formatType) {
        case FormatType.List:
          col.columnType = "ColumnDropdown";
          break;
        case FormatType.Checkbox:
          col.columnType = "ColumnBoolean";
          break;
        case FormatType.Text:
          if (col.columnType != "ColumnDropdown") {
            col.columnType = "ColumnText";
          }
          break;
        case FormatType.Number:
        case FormatType.Quantity:
        case FormatType.Rate:
          col.columnType = "ColumnNumber";
          break;
        case FormatType.Date:
          col.columnType = "ColumnDateTime";
          break;
        case FormatType.DateTime:
        case FormatType.Time:
          col.columnType = "ColumnDateTime";
          break;
        default:
          col.columnType = "ColumnText";
          break;
      }
    },

    /**
     * Gán filter mặc định cho column
     */
    setDefaultFilter(column) {
      const me = this;

      column.filter = {
        value: null,
        operator: me.$ms.enum.FilterHeader.Equals,
      };

      switch (column.columnType) {
        case "ColumnText":
        case "ColumnDrilldown":
          if (!column.enumName || column.enum) {
            column.filter.operator = me.$ms.enum.FilterHeader.Contains;
          }
          break;
      }
    },

    /** Lấy ra các column có thuộc tính visible = true
     * Created by LTDAT 17.07.2020
     * */
    getVisibleColumn(columns) {
      return columns.filter((item) => {
        return item.visible == true;
      });
    },

    /**
     * Khởi tạo dữ liệu ban đầu cho grid
     * columns truyền vào mặc định là columns trong props có thể truyền cấu hình khác từ ngoài vào
     */
    initColumns(columns = this.columns) {
      const me = this;
      me.$nextTick(() => {
        me.columnx = columns ? columns : me.columns;
        if (!me.columnx) {
          me.columnx = [];
        } else {
          me.setDefaultFieldColumn(me.columnx);
          me.columnx = me.getVisibleColumn(me.columnx);
        }

        let hasFlex = me.columnx.some((item) => {
          return item.autoResize;
        });
        if (
          hasFlex == false &&
          me.columnx[me.columnx.length - me.indexFlexRight]
        ) {
          // me.resizeActive();
          me.$set(
            me.columnx[me.columnx.length - me.indexFlexRight],
            "autoResize",
            true
          );
        } else if (hasFlex == false && me.columnx.length == 1) {
          me.$set(me.columnx[0], "autoResize", true);
        }
        // if (hasFlex == false && me.columnx.length == 1) {
        //   me.$set(me.columnx[me.columnx.length - 1], "autoResize", true);
        // }
      });
    },
    //Xóa 1 phần tử trong data grid
    removeItem(item) {
      const me = this;
      me.datax = _.remove(me.datax, (e) => {
        return e !== item;
      });
    },
    //Gán giá trị để render data
    initData(data = this.data) {
      const me = this;
      // pvduy 06/01/2021 luôn clone dữ liệu data không tác động đến dữ liệu ban đầu
      me.datax = JSON.parse(JSON.stringify(me.data));
      commonFn.genVKeyValue(me.datax);
      let dataTree = commonFn.nomalizeDataTree(
        me.datax,
        me.idProperty,
        me.parentIdProperty
      );
      me.datax = commonFn.getBodyData(dataTree, true);
    },
    //Lấy dữ liệu của dòng được chọn
    getRowSelected() {
      const me = this;
      return me.rowSelected;
    },
    //Xử lý sự kiện ấn phím trên row
    row_keydown(dataRow, e) {
      const me = this;
      let currentIndex = me.rowSelected.index;
      switch (e.which) {
        case 40: //down
          if (currentIndex < me.datax.length - 1 && !e.altKey) {
            let tr = this.$el.querySelector(
              `.ms-table-tree tbody tr[indexRow='${currentIndex}']`
            );
            tr.nextElementSibling.querySelector("td").click();
            currentIndex++;
            event.target.focus();
            me.rowSelected.data = me.datax[currentIndex];
            me.rowSelected.index = currentIndex;
            me.adjustScroll(currentIndex, tr, false);
            e.preventDefault();
          }
          break;
        case 38: //up
          if (currentIndex > 0 && !e.altKey) {
            let tr = this.$el.querySelector(
              `.ms-table-tree tbody tr[indexRow='${currentIndex}']`
            );
            tr.previousElementSibling.querySelector("td").click();
            currentIndex--;
            event.target.focus();
            me.rowSelected.data = me.datax[currentIndex];
            me.rowSelected.index = currentIndex;
            me.adjustScroll(currentIndex, tr, true);
            e.preventDefault();
          }
          break;
        case 32: //space
          event.target.focus();
          if (me.$refs.content) {
            let listCheckbox = me.$refs.content.querySelectorAll(
              'input[type="checkbox"]'
            );
            if (
              listCheckbox &&
              listCheckbox.length > 0 &&
              listCheckbox[currentIndex]
            ) {
              listCheckbox[currentIndex].click();
            }
          }
          //me.clickMultiple(me.datax[currentIndex])
          e.preventDefault();
          break;
      }
    },

    //Lấy element scroll
    //Created by nnlam (21.06.2021)
    getScroller() {
      if (this && this.$el && typeof this.$el.querySelector === "function") {
        return this.$el.querySelector(".scroller");
      }
      return null;
    },
    /**
     * scroll theo phím up /down
     * @param {Bản ghi đang selected} typeAheadPointer
     * @param {dòng focus trước đó} trOld
     * @param {Scroll Lên hay xuống} scrollUp
     * CreatedBy NNLAM 16.06.2020
     */
    adjustScroll(typeAheadPointer = this.typeAheadPointer, trOld, scrollUp) {
      let scroller = this.getScroller();
      let tdHeight = this.$el.querySelector("td").offsetHeight;
      let tr = this.$el.querySelector(
        `.ms-table-tree tbody tr[indexRow='${typeAheadPointer}']`
      );
      let th = this.$el.querySelector(".ms-thead th");
      if (scroller && tr && th) {
        if (!scrollUp) {
          if (
            tr.getBoundingClientRect().top - th.getBoundingClientRect().top >=
            scroller.offsetHeight - th.offsetHeight
          ) {
            scroller.scrollTop += tr.offsetTop - trOld.offsetTop;
          }
        } else {
          if (tr.offsetTop <= th.offsetTop + tdHeight / 2) {
            scroller.scrollTop -= trOld.offsetTop - tr.offsetTop;
          }
        }
      }
    },

    /**
     * Đọc điều kiện filter header
     */
    getFilterHeader(hasColumn) {
      let me = this,
        result = [],
        enumFilterHeader = me.$ms.enum.FilterHeader,
        columns = me.filterHeader; //me.columnx;

      for (let i = 0; i < columns.length; i++) {
        let column = columns[i];
        if (column.filter && column.filter.value !== column.filterIgnoreValue) {
          let item = null,
            filterValue = column.filter.value,
            operator = column.filter.operator;
          switch (operator) {
            case enumFilterHeader.Between:
              item = {
                property: column.dataField,
                operator: me.$ms.enum.FilterHeader.GreaterThanEquals,
                value: column.filter.from,
                operand: "and",
                childrens: [
                  {
                    property: column.dataField,
                    operator: me.$ms.enum.FilterHeader.LessThanEquals,
                    value: column.filter.to,
                    operand: "and",
                  },
                ],
              };
              break;
            case enumFilterHeader.Null:
            case enumFilterHeader.NotNull:
              item = {
                property: column.dataField,
                operator: operator,
                operand: "and",
              };

              //với cột text sẽ fix giá trị để lên server sẽ xử lý thêm kiểm tra với giá trị trống ''
              switch (column.columnType) {
                case "ColumnText":
                case "ColumnDrilldown":
                  item.value = "text";
                  break;
              }
              break;
            case enumFilterHeader.Contains:
            case enumFilterHeader.Notcontains:
            case enumFilterHeader.StartsWith:
            case enumFilterHeader.EndsWith:
              if (
                typeof filterValue !== "undefined" &&
                filterValue !== null &&
                filterValue !== ""
              ) {
                // let words = me.$ms.commonFn.splitKeyWord(filterValue);
                // var addColumnFilter = function(filter) {
                //   if (!item) {
                //     item = filter;
                //     item.childrens = [];
                //   } else {
                //     if (
                //       operator === enumFilterHeader.StartsWith ||
                //       operator === enumFilterHeader.EndsWith
                //     ) {
                //       item.operand = "or";
                //     } else {
                //       item.operand = "and";
                //     }
                //     item.childrens.push(filter);
                //   }
                // };
                // if (words.length > 0) {
                //   for (let i = 0; i < words.length; ++i) {
                //     let filterItem = {
                //       property: column.dataField,
                //       value: words[i],
                //       operator: operator,
                //       operand:
                //         operator === enumFilterHeader.StartsWith ||
                //         operator === enumFilterHeader.EndsWith
                //           ? "or"
                //           : "and"
                //     };
                //     addColumnFilter(filterItem);
                //   }
                // }
                item = {
                  property: column.dataField,
                  operator: operator,
                  value: filterValue,
                  operand: "and",
                };
              }
              break;
            default:
              switch (column.columnType) {
                case "ColumnDateTime":
                  if (filterValue) {
                    item = {
                      property: column.dataField,
                      value: filterValue, //moment(filterValue).format('YYYY-MM-DD'),
                      operator: operator,
                      operand: "and",
                    };
                  }
                  break;
                default:
                  if (
                    typeof filterValue !== "undefined" &&
                    filterValue !== null &&
                    filterValue !== ""
                  ) {
                    item = {
                      property: column.dataField,
                      value: filterValue,
                      operator: operator,
                      operand: "and",
                    };
                  }
                  break;
              }
              break;
          }

          //xử lý tình huống enum của cột không chứa giá trị thì khỏi filter
          if (item && (column.enumName || column.enum)) {
            let enumObj = me.$ms.enum[column.enumName || column.enum],
              hasValue = false;
            for (let i in enumObj) {
              if (enumObj[i] === item.value) {
                hasValue = true;
                break;
              }
            }

            if (!hasValue) {
              item = null;
            }
          }

          if (item) {
            if (hasColumn) {
              item.column = column;
            }
            if (column.nullToFail) {
              item.nullToFail = column.nullToFail;
            }

            result.push(item);
          }
        }
      }

      return result;
    },

    /**
     * Hàm chọn dòng đầu tiên
     * ischeckbox: có tích chọn vào ô checkbox không, mặc định là không và chỉ đơn thuần là click vào dòng đầu tiên
     * created by nnlam 06.03.2021
     */
    autoSelectedFirstRow(ischeckbox) {
      let me = this;
      me.$nextTick(() => {
        if (me.datax.length > 0) {
          if (ischeckbox) {
            me.rowSelected = { data: me.datax[0], index: 0 };
          }
          let trFirst = me.$el.querySelector(".ms-tbody.data tr");
          if (trFirst) {
            if (trFirst.getVueInstance()) {
              trFirst.getVueInstance()._events.click;
            }
            me.$emit("click", me.datax[0]);
          }
          me.$emit("firstLoad", me.datax[0]);
        }
      });
    },
    /**
     * lưu tất cả các cột đã đánh dấu là đang filter
     */
    buildFilterHeader(col) {
      let me = this;
      let check = me.filterHeader.filter((i) => i.dataField == col.dataField);
      if (check.length == 0) {
        me.filterHeader.push(col);
      } else {
        me.filterHeader.forEach((item) => {
          if ((item.dataField = col.dataField)) {
            item = col;
            return;
          }
        });
      }
      let th = me.$refs.th.filter((x) => x.col.dataField == col.dataField);
      if (th && th.length > 0) {
        th[0].checkHideMenuHeader();
      }
    },

    /**
     * hàm conver toán tử thành text: ví dụ "Contants" -> "Chứa"
     */
    buildOperatorText(operator) {
      let operatorText = this.$ms.commonFn.getEnumResource(
        operator,
        "FilterHeader"
      );
      if (operatorText) {
        operatorText = operatorText.toLocaleLowerCase();
      }
      return operatorText;
    },

    /**
     * hàm build value filter
     */
    buildValue(item) {
      if (
        item.filter &&
        (item.filter.operator == this.$ms.enum.FilterHeader.Null ||
          item.filter.operator == this.$ms.enum.FilterHeader.NotNull)
      ) {
        return "";
      }
      if (
        item.filter.value == 0 &&
        item.formatType != this.$ms.enum.FormatType.Enum
      ) {
        return "0";
      }
      let value = this.$options.filters.formatData(item.filter.value, {
        formatType: item.formatType,
        enumName: item.enum,
        dataRow: {},
      });
      return '"' + value + '"';
    },

    /**
     * hàm xóa 1 item filter
     */
    removeFilterItem(item) {
      let me = this;
      me.filterHeader.remove(item);
      if (
        !item.formatType ||
        item.formatType == me.$ms.enum.FormatType.Text ||
        item.formatType == me.$ms.enum.FormatType.None
      ) {
        item.filter.operator = me.$ms.enum.FilterHeader.Contains;
      } else {
        item.filter.operator = me.$ms.enum.FilterHeader.Equals;
      }
      item.filter.value = null;
      item.hasActionFilter = false;
      let th = me.$refs.th.filter((x) => x.col.dataField == item.dataField);
      if (th && th.length > 0) {
        th[0].checkHideMenuHeader();
      }
      me.$emit("filter", item);
    },
    /**
     * hàm bỏ lọc
     */
    clearAllFilter() {
      let me = this;
      //me.filterHeader.removeAll();
      me.filterHeader.forEach((item) => {
        if (
          !item.formatType ||
          item.formatType == me.$ms.enum.FormatType.Text ||
          item.formatType == me.$ms.enum.FormatType.None
        ) {
          item.filter.operator = me.$ms.enum.FilterHeader.Contains;
        } else {
          item.filter.operator = me.$ms.enum.FilterHeader.Equals;
        }
        item.filter.value = null;
        item.hasActionFilter = false;
        let th = me.$refs.th.filter((x) => x.col.dataField == item.dataField);
        if (th && th.length > 0) {
          th[0].checkHideMenuHeader();
        }
      });
      me.$emit("filter", {});
      me.filterHeader = [];
    },
    /**
     * Show hết icon filter lên
     */
    funShowAllIconFilter(value) {
      let me = this;
      me.columnx.forEach((item) => {
        let th = me.$refs.th.filter((x) => x.col.dataField == item.dataField);
        if (th && th.length > 0) {
          th[0].showAllIconFilter = value;
          //th[0].checkHideMenuHeader();
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msTree.scss";
</style>
