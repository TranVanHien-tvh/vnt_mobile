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
    //custom l???i h??m check selected
    customIsSelected: {
      type: Function,
      default: null,
    },
    /*
    Cho ph??p hi???n th??? header c???a l?????i hay kh??ng? m???c ?????nh c??
    */
    isShowHeader: {
      default: true,
      type: Boolean,
    },

    //Value th???c hi???n l??u gi?? tr??? c??c c???t ???????c ch???n
    value: {
      default: null,
    },

    //Data d??? li???u grid t??? ngo??i truy???n v??o
    data: {
      type: Array,
      return: () => [],
      default: null,
    },
    //C???u h??nh c??c c???t truy???n v??o
    columns: {
      type: Array,
      return: () => [],
      default: null,
    },

    /**
     * c?? filter c???t kh??ng
     */
    filterable: {
      type: Boolean,
      default: false,
    },
    /**
     * c?? show text filter khi l???c ra kh??ng
     */
    hasBindingFilterHeader: {
      default: false,
      type: Boolean,
    },

    /*
     * pvduy 19/03/2021
     * c??? x??c nh???n xem c?? cho hi???n ???nh tr???ng khi grid ko c?? d??? li???u hay kh??ng? ==> s??? d???ng trong grid detail d?? tr???ng v???n ???n ???nh ??i.
     */
    isShowImageGridEmpty: {
      default: true,
      type: Boolean,
    },

    /**
     * C???u h??nh cho c???t ch???c n??ng l?? 1 ?????i t?????ng g???m c??
     * title: t??n ti??u ????? c???t ch???c n??ng
     * components:'components import v??o'
     * width:????? r???ng c???a c???t
     */
    widgetOptions: {
      type: Object,
      default: null,
    },

    //Set ????? r???ng cho grid
    maxHeight: {
      default: "none",
      type: [Number, String],
    },
    //C???u h??nh c?? ph??n trang hay kh??ng
    pagination: {
      default: false,
      type: Boolean,
    },
    //Nh???n 2 gi?? tr??? remote/local ????? l???y gi?? tr??? ??? server ho???c local
    queryMode: {
      default: "remote",
      type: String,
    },
    summary: {
      default: () => {},
      type: Object,
    },
    //C???t cho ph??p t??ch ch???n nhi???u d??ng
    multiple: {
      default: false,
      type: Boolean,
    },

    //Parent Field
    idProperty: {
      default: null,
      type: String,
    },

    //Field ch???a parentID
    parentIdProperty: {
      default: "ParentID",
      type: String,
    },

    store: {},
    /*
     * th??m c???u h??nh nh???ng c???t lu??n l???y khi load grid
     * pvduy 19/01/2021
     */
    alwayTakeColumns: {
      default: null,
      type: Array,
    },
    /**
     * Action c???a row
     */
    rowActions: {
      default: null,
      type: [Object, Array],
    },
    /**
     * S??? l?????ng item hi???n th??? inline khi hover v??o d??ng
     * n???u v?????t qu?? s??? l?????ng n??y th?? s??? ?????t trong more ...
     */
    actionInlineCount: {
      default: 5,
      type: Number,
    },
    //Cho ph??p di chuy???n ????? r???ng c???a c???t hay kh??ng
    resizeCol: {
      default: true,
      type: Boolean,
    },
    // c?? cho width 100% kh??ng, c??i n??y ????p ???ng cho tr?????ng h???p tree c?? 1 column
    isWidthFull: {
      default: false,
      type: Boolean,
    },
    indexFlexRight: {
      default: 1,
      type: Number,
    },
    /**
     * S??? d??ng shimmer loading
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
     * D??? li???u t???ng
     * D??ng cho sum l???y t??? server truy???n v??o (kh??ng ph??? thu???c v??o trang ??ang hi???n th???)
     */
    isAutoFocusFirstRow: {
      type: Boolean,
      default: true,
    },

    /**
     * TDNGHIA bi???n ki???m tra xem c?? custom tree gi???ng m??n t??? chwucs c?? c???u hay kh??ng
     * TDNGHIA ?????p trai: 16/9/2021
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
      indexResize: null, // index c???a column ??ang resize
      /*
      Cho show t???t c??? icon filter header l??n
      Create: 20/05/2020
      Author: NNLAM
      */
      showAllIconFilter: false,
      /**
       * Filter tr??n ti??u ????? c???t
       */
      filterHeader: [],

      isGridTree: true,

      dataTemp: [],

      checkCustom: this.isCustom,
      /**
       * V??? tr?? hi???n th??? c???a box empty
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
     * ?????m s??? b???n ghi c???a tree
     */
    rowNumber() {
      const me = this;
      let count = 0;
      if (me.datax) {
        return me.datax.length;
      }
      return 0;
    },

    //S??? ki???n t??? 1 d??ng d??? li???u emit ra ngo??i
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
        //tvloi*(10/05/2021) - drilldown d??ng chi ti???t
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
     * Ki???m tra xem t???t c??? d??? li???u c?? ??ang ???????c check hay kh??ng
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
     * S??? l?????ng c???t shimmer
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
        // vvkiet - Copy t??? msGridViewer sang
        if (me.isAutoFocusFirstRow) {
          me.autoSelectedFirstRow(window.event);
        }

        //n???u kh??ng c?? d??? li???u t??nh to??n v??? tr?? hi???n th??? c???a box empty
        //control ch??a render th?? c??ng k x??? l??
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
     * H??m x??? l?? s??? ki???n khi click v??o ?? check multiple
     * @param dataRow d??? li???u c???a d??ng ???????c ch???n
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
     * Ki???m tra xem c???t ???????c check hay kh??ng ?
     * duy???t trong data n???u c?? ch??a d??? li???u c???a d??ng t????ng ???ng th?? return true ng?????c l???i false
     * @param dataRow d??? li???u c???a d??ng ???????c check
     *  */
    isSelected(dataRow) {
      const me = this;
      //nnlam cmt ??o???n n??y do n?? g??y l???i v?? kh??ng c???n thi???t, ai code ??o???n n??y vui l??ng confirm v???i em ????? dc h??? tr???
      // if (typeof me.customIsSelected === 'function') {
      //   return me.customIsSelected(dataRow);
      // }
      if (me.value && me.value.length > 0) {
        return me.value.includes(dataRow);
      }
      return false;
    },

    /**
     * H??m th???c hi???n x??? l?? binding d??? li???u cho c??c grid c?? checkbox cho ph??p ch???n row (v-model)
     * @param {[Object/String]} listItems Danh s??ch c??c item ??ang n???m tr??n grid ho???c danh s??ch ID c???a c??c Item c???n check
     * @param {String} idField Primary key c???a model/object trong store
     */
    setModelById(listItems, idField = null) {
      const me = this;
      listItems = listItems || [];
      //Trong tr?????ng h???p kh??ng ph???i grid allow check th?? kh??ng c???n l??m g??
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

    //S??? ki???n ???n v??o n??t ch???n t???t c??? b??n tr??n header
    changeCheckedMultiple() {
      const me = this;
      if (me.isCheckedMultiple) {
        me.$emit("input", []);
      } else {
        me.$emit("input", me.datax);
      }
    },
    /**
     * S??? ki???n scroll tr??n grid
     * Thay ?????i l???i t???a ????? scroll tr??n header
     */
    onScroll(e) {
      const me = this;
      if (e && me.$refs.header) {
        me.$refs.header.scrollLeft = e.target.scrollLeft;
      }
    },

    //X??? l?? s??? ki???n resize col tr??n grid
    //cmt by: nnlam 24/02/2021: b??? ??i v?? th???a g??y x???u khi m?? click v??o resize th?? l??m change width to??n b??? column lu??n
    resizeActive(col, indexCell) {
      this.indexResize = indexCell;
      //Kh??ng cho ph??p b??i ??en text
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
    //????ng s??? ki???n resize c???t tr??n grid
    resizeClose(col) {
      //Cho ph??p b??i ????n text
      this.selectedTextMode = false;
      col.newWidth = col.width;
      this.$emit("resizeCol", col);
    },
    /**
     * Set gi?? tr??? default cho c???u h??nh c???t
     * Created by LTDAT(17.07.2020)
     */
    setDefaultFieldColumn(columns) {
      //N???u kh??ng c???u h??nh field hi???n th??? th?? m???c ?????nh l?? true
      const me = this;
      columns.forEach((item) => {
        if (item.visible != false) {
          item.visible = true;
        }
        //set columnType
        if (typeof item.columnType !== "number") {
          me.setDefaultColumnType(item);
        }

        //n???u kh??ng ch???nh ?????nh th?? ????? align m???c d???nh theo format type
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
     * G??n gi?? tr??? m???c ?????nh cho columnType c???a c???u h??nh c???t
     * @param {Object} col: c???u h??nh c???t
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
     * G??n filter m???c ?????nh cho column
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

    /** L???y ra c??c column c?? thu???c t??nh visible = true
     * Created by LTDAT 17.07.2020
     * */
    getVisibleColumn(columns) {
      return columns.filter((item) => {
        return item.visible == true;
      });
    },

    /**
     * Kh???i t???o d??? li???u ban ?????u cho grid
     * columns truy???n v??o m???c ?????nh l?? columns trong props c?? th??? truy???n c???u h??nh kh??c t??? ngo??i v??o
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
    //X??a 1 ph???n t??? trong data grid
    removeItem(item) {
      const me = this;
      me.datax = _.remove(me.datax, (e) => {
        return e !== item;
      });
    },
    //G??n gi?? tr??? ????? render data
    initData(data = this.data) {
      const me = this;
      // pvduy 06/01/2021 lu??n clone d??? li???u data kh??ng t??c ?????ng ?????n d??? li???u ban ?????u
      me.datax = JSON.parse(JSON.stringify(me.data));
      commonFn.genVKeyValue(me.datax);
      let dataTree = commonFn.nomalizeDataTree(
        me.datax,
        me.idProperty,
        me.parentIdProperty
      );
      me.datax = commonFn.getBodyData(dataTree, true);
    },
    //L???y d??? li???u c???a d??ng ???????c ch???n
    getRowSelected() {
      const me = this;
      return me.rowSelected;
    },
    //X??? l?? s??? ki???n ???n ph??m tr??n row
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

    //L???y element scroll
    //Created by nnlam (21.06.2021)
    getScroller() {
      if (this && this.$el && typeof this.$el.querySelector === "function") {
        return this.$el.querySelector(".scroller");
      }
      return null;
    },
    /**
     * scroll theo ph??m up /down
     * @param {B???n ghi ??ang selected} typeAheadPointer
     * @param {d??ng focus tr?????c ????} trOld
     * @param {Scroll L??n hay xu???ng} scrollUp
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
     * ?????c ??i???u ki???n filter header
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

              //v???i c???t text s??? fix gi?? tr??? ????? l??n server s??? x??? l?? th??m ki???m tra v???i gi?? tr??? tr???ng ''
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

          //x??? l?? t??nh hu???ng enum c???a c???t kh??ng ch???a gi?? tr??? th?? kh???i filter
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
     * H??m ch???n d??ng ?????u ti??n
     * ischeckbox: c?? t??ch ch???n v??o ?? checkbox kh??ng, m???c ?????nh l?? kh??ng v?? ch??? ????n thu???n l?? click v??o d??ng ?????u ti??n
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
     * l??u t???t c??? c??c c???t ???? ????nh d???u l?? ??ang filter
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
     * h??m conver to??n t??? th??nh text: v?? d??? "Contants" -> "Ch???a"
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
     * h??m build value filter
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
     * h??m x??a 1 item filter
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
     * h??m b??? l???c
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
     * Show h???t icon filter l??n
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
