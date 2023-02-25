<template>
  <div
    class="ms-grid-viewer ms-editor flex"
    :class="{
      selectedTextMode: selectedTextMode,
      'h-auto': maxHeight,
      'flex-column': flex,
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
        <div class="clear-all-filter" @click="clearAllFilter">
          {{ $t("i18nComponent.i18nHeaderOption.ResetBtn") }}
        </div>
      </div>
    </div>
    <!-- <input class="input-invisiabled" @focus="focusFisrtControl" /> -->
    <input
      v-if="!disabled"
      ref="inputTop"
      class="input-invisiabled"
      @focus="focusFisrtControl"
    />

    <div
      ref="content"
      :class="[
        'ms-content--table',
        stickeyCountClass,
        { 'flex scroller': flex },
        scrollSelector,
      ]"
      :style="[gridViewStyle]"
      @scroll="onScroll"
    >
      <table class="ms-table" cellpadding="0" cellspacing="0">
        <thead class="ms-thead" :class="{ multi: headers.length > 1 }">
          <tr
            v-for="(headerItem, i1) in headers"
            :key="i1"
            class="ms-tr"
            :class="`tr-${i1 + 1}`"
          >
            <th
              v-if="serial && i1 === 0"
              class="ms-th serial-title"
              :rowspan="headers.length"
            >
              STT
            </th>
            <th
              v-if="multiple && i1 === 0"
              class="ms-th multiple-cell"
              :rowspan="headers.length"
            >
              <ms-checkbox
                :value="isCheckedMultiple"
                class="justify-center"
                check-only
                :disabled="disabledCheckboxThead"
                @click="changeCheckedMultiple"
              />
            </th>
            <th
              v-if="dataDragable && i1 === 0"
              class="ms-th drag-data"
              :rowspan="headers.length"
            />

            <template v-for="(col, i2) in headerItem">
              <th v-if="col.isGroup" :key="i2" :colspan="col.colspan">
                {{ col.caption }}
              </th>
              <ms-th-editor
                v-else
                ref="th"
                :key="col.dataField"
                class="ms-th"
                :col="col"
                :is-checked-all="isCheckedAll"
                :resize-col="resizeCol"
                :rowspan="i1"
                :filteable="filterable"
                :module-autocomplete="moduleAutocomplete"
                @resizeOn="resizeActive"
                @resizeOff="resizeClose"
                @buildFilter="buildFilterHeader"
                @quickAction="quickActionOnColumn"
              />
            </template>

            <th
              v-if="widgetOptions && i1 === 0"
              :rowspan="headers.length"
              class="ms-th widget-title"
              :class="[
                `text-${widgetOptions.align ? widgetOptions.align : 'right'}`,
              ]"
              :style="[
                {
                  width: `${widgetOptions.width}px`,
                  'min-width': `${widgetOptions.width}px`,
                },
              ]"
            >
              <span>{{ widgetOptions.title }}</span>
            </th>
          </tr>
        </thead>

        <!-- <transition
          name="trans-content-table"
          mode="out-in"
          v-on:before-enter="beforeRenderContent"
        > -->
        <draggable
          v-if="dataDragable"
          v-model="datax"
          handle=".drag-data"
          tag="tbody"
          class="ms-tbody data"
          @change="dataDragChanged"
        >
          <ms-tr-editor
            v-for="(dataRow, indexRow) in datax"
            :key="dataRow['__vKeyValue']"
            :ref="`tr-${indexRow}`"
            :columns="columnx"
            :data-row="dataRow"
            :row-index="indexRow"
            :is-selected="isSelected(dataRow, indexRow)"
            :widget-options="widgetOptions"
            :row-selected="rowSelected"
            :multiple="multiple"
            :serial="serial"
            :editable="editable"
            :grow-to-height="growToHeight"
            :data-dragable="true"
            :row-actions="rowActions"
            :action-inline-count="actionInlineCount"
            :custom-read-only="customReadOnly"
            :class="[
              { 'row-editor': dataRow == rowSelected },
              {
                'row-selected':
                  indexOfRowFocused == indexRow || indexOfRowEditor == indexRow,
              },
            ]"
            v-on="listeners"
          />
        </draggable>
        <tbody v-else class="ms-tbody data">
          <template v-if="groupData.length > 0">
            <template v-for="(group, groupIndex) in groupData">
              <tr
                v-if="group.isGroup"
                ref="trGroup"
                :key="groupIndex"
                class="tr-group"
                :class="{ expand: groupExpand.indexOf(group.value) > -1 }"
              >
                <td
                  :colspan="group.colspan"
                  :class="[
                    { 'sticky left-0 ms-th': hasLockColumn },
                    group.customGroup ? 'custom-td-group' : 'td-group',
                  ]"
                >
                  <div class="flex-row">
                    <div
                      class="group-icon pointer"
                      @click="toggleGroup(group)"
                    />
                    <div class="flex group-text" :title="group.text">
                      {{ group.text }}
                    </div>
                  </div>
                </td>

                <td
                  v-for="(sum, sumIndex) in group.columnx"
                  :key="sumIndex"
                  :colspan="sum ? sum.colspan : 1"
                  :style="sum ? sum.style : ''"
                  :class="[
                    { sticky: sum && sum.lock },
                    sum.customGroupColumn ? 'text-center' : 'text-right',
                  ]"
                  class="group-sum"
                >
                  <template v-if="sum.customGroupColumn">
                    <ms-checkbox
                      v-model="sum.value"
                      size="small"
                      :disabled="readOnly || !editable"
                      @change="groupRowOnChange(group, sum)"
                    />
                  </template>
                  <template v-else>
                    <span v-if="sum && !sum.empty">
                      {{
                        sum.value | formatData({ formatType: sum.formatType })
                      }}
                    </span>
                  </template>
                </td>
              </tr>
              <template v-if="groupExpand.indexOf(group.value) > -1">
                <ms-tr-editor
                  v-for="dataRow in group.datax"
                  :key="dataRow['__vKeyValue']"
                  :ref="`tr-${dataRow.rowIndex}`"
                  :columns="columnx"
                  :data-row="dataRow"
                  :row-index="dataRow.rowIndex"
                  :is-selected="isSelected(dataRow, dataRow.rowIndex)"
                  :widget-options="widgetOptions"
                  :row-selected="rowSelected"
                  :multiple="multiple"
                  :grow-to-height="growToHeight"
                  :serial="serial"
                  :row-actions="rowActions"
                  :action-inline-count="actionInlineCount"
                  :editable="editable"
                  :custom-read-only="customReadOnly"
                  :custom-validate-rules="customValidateRules"
                  :disabled-checked-multiple-tbody="
                    funDisabledCheckedMultipleTbody(dataRow)
                  "
                  :class="[
                    { 'row-editor': dataRow == rowSelected },
                    {
                      'row-selected':
                        indexOfRowFocused == dataRow.rowIndex ||
                        indexOfRowEditor == dataRow.rowIndex,
                    },
                  ]"
                  :has-lock-column="hasLockColumn"
                  v-on="listeners"
                />
              </template>
            </template>
          </template>
          <template v-else>
            <ms-tr-editor
              v-for="(dataRow, indexRow) in datax"
              :key="dataRow['__vKeyValue']"
              :ref="`tr-${indexRow}`"
              :columns="columnx"
              :data-row="dataRow"
              :row-index="indexRow"
              :is-selected="isSelected(dataRow, indexRow)"
              :widget-options="widgetOptions"
              :row-selected="rowSelected"
              :multiple="multiple"
              :serial="serial"
              :grow-to-height="growToHeight"
              :row-actions="rowActions"
              :action-inline-count="actionInlineCount"
              :editable="editable"
              :custom-read-only="customReadOnly"
              :custom-validate-rules="customValidateRules"
              :disabled-checked-multiple-tbody="
                funDisabledCheckedMultipleTbody(dataRow)
              "
              :class="[
                { 'row-editor': dataRow == rowSelected },
                {
                  'row-selected':
                    indexOfRowFocused == indexRow ||
                    indexOfRowEditor == indexRow,
                },
              ]"
              :has-lock-column="hasLockColumn"
              v-on="listeners"
            />
            <tr v-if="allowInsertNewRecord" @click="insertNewRecordFn">
              <td
                :colspan="
                  columnx.length +
                  (multiple ? 1 : 0 + serial ? 1 : 0 + widgetOptions ? 1 : 0)
                "
                class="insert-new-record"
              >
                <div class="d-flex" style="align-items: center">
                  <div class="add-icon" />
                  <div class="add-text">
                    {{ insertNewRecordText }}
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
        <div
          v-if="isShowEmptyText && groupData.length <= 0 && datax.length <= 0"
          style="min-height: 40px"
        >
          <div class="empty-text">
            <div class="empty-text-content">
              {{ emptyText == null ? $t("i18nCommon.noData") : emptyText }}
            </div>
          </div>
        </div>
        <tfoot v-if="footer" class="ms-footer data xx custom-footer">
          <template v-for="(footerItem, i1) in footers">
            <tr :key="i1" class="ms-tr">
              <template v-for="(col, i2) in footerItem">
                <th
                  v-if="col.isGroup"
                  :key="i2"
                  :colspan="col.colspan"
                  :class="{ 'sticky left-0': i2 == 0 && hasLockColumn }"
                >
                  {{ col.caption }}
                </th>

                <th
                  v-else
                  :key="i2"
                  :colspan="col.colspan"
                  :class="[
                    { sticky: col.lock },
                    { 'footer-left-0': i2 == 0 && col.lock },
                    col.dataField,
                    String(col.colspan),
                  ]"
                  :style="[{ left: (col.stickyOffset || 0) + 'px' }]"
                  class="ms-th-viewer static-col"
                >
                  <div
                    class="flex"
                    :class="[`text-${col.align ? col.align : 'center'}`]"
                  >
                    <span
                      v-if="typeof col.footerText == 'string'"
                      v-html="col.footerText"
                    />
                    <span
                      v-else-if="summaryData"
                      :class="[`text-${col.align ? col.align : 'center'}`]"
                      v-html="getSummaryDisplay(col)"
                    />
                    <span
                      v-else
                      :class="[`text-${col.align ? col.align : 'center'}`]"
                      v-html="getSummaryDisplay(col)"
                    />
                  </div>
                </th>
              </template>

              <th
                v-if="widgetOptions && i1 === 0"
                class="ms-th widget-title"
                :rowspan="footers.length"
                :class="[
                  `text-${widgetOptions.align ? widgetOptions.align : 'right'}`,
                ]"
                :style="[
                  { 'min-width': `${widgetOptions.width}px` },
                  columnx.length > 0
                    ? { width: `${widgetOptions.width}px` }
                    : null,
                ]"
              />
            </tr>
          </template>
        </tfoot>
        <!-- </transition> -->
      </table>
    </div>

    <div
      v-if="!pagination && isOnlyShowPageTotal"
      class="flex-row only-total-record"
    >
      <div class="flex-normal" style="padding-right: 12px">
        Tổng số:
        <span style="font-weight: 700">{{ datax.length }}</span> bản ghi
      </div>
    </div>

    <ms-pagination
      v-if="pagination"
      :page-size="pageSize"
      :data-render="datax.length"
      :page-index="currentPage"
      :summary="summary"
      :page-total="pageTotal"
      :is-show-page-size-combox="isShowPageSizeCombox"
      :is-only-show-page-total="
        isOnlyShowPageTotal || (isGridInViewDetail && pageTotal <= 10)
      "
      :page-total-caption="pageTotalCaptionData"
      :loading="loadingSummary"
      @loadData="listenersLoadData"
      @changepagesize="changePageSize"
    />
    <!-- <input class="input-invisiabled" @focus="focusLastControl" /> -->
    <input
      v-if="!disabled"
      ref="inputBottom"
      class="input-invisiabled"
      @focus="focusLastControl"
    />
    <div v-if="disabled" class="disabled" />
  </div>
</template>
<script>
import msTrEditor from "./msTrEditor";
import msThEditor from "./msThEditor";
import msPagination from "./msPagination";
import commonFn from "@/commons/commonFunction.js";
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
import draggable from "vuedraggable";
import { gridGroupData } from "@/mixins/component/gridGroupData";
import MsCheckbox from "../mscheckbox/msCheckbox.vue";

export default {
  name: "MsGridEditor",
  components: {
    msTrEditor,
    msThEditor,
    msPagination,
    draggable,
    MsCheckbox,
  },
  extends: msBaseComponent,
  mixins: [gridGroupData],
  props: {
    //Value thực hiện lưu giá trị các cột được chọn
    values: {
      type: [Array, Object],
      default() {
        return [];
      },
    },

    /**
     * có show text filter khi lọc ra không
     */
    hasBindingFilterHeader: {
      default: false,
      type: Boolean,
    },

    /**
     * TVLoi(12/05/2021)
     * Disable control
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * NNLAM(23/08/2021)
     * grid có chức năng thêm dòng k
     */
    hasAddRow: {
      type: Boolean,
      default: false,
    },

    //Data dữ liệu grid từ ngoài truyền vào
    data: {
      type: Array,
      return: () => [],
      default: () => [],
    },
    //Cấu hình các cột truyền vào
    /**
		 * Các thuộc tính trong columns
		 * @params dataField Field dữ liệu dùng để nhận giá trị thay đổi và hiện thị.
		 * @params title:Tiêu đề của cột
		 * @params width:độ rộng của cột
		 * @params autoResize:Cột tự động to ra khi màn hình lớn
		 * @params formatType:Dữ liệu dùng để format lấy từ trong file enumeration.js FormatType
		 * @params columnType bao gồm các loại combobox,input,number,checkbox,datepicker,dropdown,template mặc định là input dùng để định nghĩa loại control editor
		 * @params editorProperty thông tin chuyền vào control editor thường có cấu trúc :
		 * editorProperty: {
							propsData: {
								(Dữ liệu truyền vào control)
							}
						}
			@params rules:"Trường dùng để validate trong grid các rule được phân cách nhau bởi ký hiệu | VD: required|email"
			@params template:Sử dụng 1 file khác ở ngoài truyền vào để render
    * @params lock:true(freeze cột)
		 */
    columns: {},
    /**
     * Cấu hình cho cột chức năng là 1 đối tượng gồm có
     * title: tên tiêu đề cột chức năng
     * components:'components import vào'
     * width:Độ rộng của cột
     */
    widgetOptions: {},
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
    //Số bản ghi trên mới trang trường hợp phân trang local
    pageSize: {
      default: 20,
      type: Number,
    },
    //Cột cho phép tích chọn nhiều dòng
    multiple: {
      default: false,
      type: Boolean,
    },
    //Store xử lý dữ liệu trên liên quan đến data trong grid
    store: {
      default: null,
    },
    serial: {
      default: false,
      type: Boolean,
    },
    useVirtualScroll: {
      default: false,
      type: Boolean,
    },
    //Thuộc tính để cấu hình cho phép sửa trên grid hay không
    editable: {
      default: true,
      type: Boolean,
    },
    //Dữ liệu default
    defaultData: {
      default: null,
    },
    flex: {
      default: true,
      type: Boolean,
    },
    /**
     * Cho phép sắp xếp lại dữ liệu
     */
    dataDragable: {
      default: false,
      type: Boolean,
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
    /**
     * Cho phép resize col hay k
     */
    resizeCol: {
      default: false,
      type: Boolean,
    },
    // function Custom ReadOnly
    customReadOnly: {
      type: Function,
      default: null,
    },
    /**
     * NNLAM 22/03/2021
     * prop kiểu hàm custom validate trên cell grid
     */
    customValidateRules: {
      type: [Function, Boolean],
      default: null,
    },
    //Có footer hay không ?
    footer: {
      default: false,
      type: Boolean,
    },
    /**
     * @author vvkiet - 31.03.2021
     * Thêm tag để xử lý scroll trong grid
     */
    scrollSelector: {
      type: String,
      default: null,
    },
    isShowPageSizeCombox: {
      default: true,
      type: Boolean,
    },
    isGridInViewDetail: {
      type: Boolean,
      default: false,
    },
    isOnlyShowPageTotal: {
      type: Boolean,
      default: false,
    },

    //module để thực hiện autocomplete khi lọc trên th
    moduleAutocomplete: {
      type: String,
      default: null,
    },

    loadingSummary: {
      default: false,
    },
    summary: {},
    /**
     * Dữ liệu tổng
     * Dùng cho sum lấy từ server truyền vào (không phụ thuộc vào trang đang hiển thị)
     */
    summaryData: {
      type: Object,
      default: null,
    },
    //Tổng số bản ghi
    pageTotal: {
      default: 0,
      type: Number,
    },
    /**
     * có filter cột không
     */
    filterable: {
      type: Boolean,
      default: false,
    },
    /**
     * tự orverite hàm end editor, không autoend theo base
     */
    overiteEndEditor: {
      type: Boolean,
      default: false,
    },

    /**
     * Hàm custom data khi thêm mới dòng mặc định
     */
    initDataBeforeAddRow: {
      type: [Function, Object],
      default: null,
    },

    /**
     * Hàm insert dòng tự custom theo màn hình
     */
    insertNewRecord: {
      type: [Function, Object],
      default: null,
    },

    /**
     * cờ hiển thị dòng thêm mới trên grid
     * NMTUAN2 07.10.2021
     */
    allowInsertNewRecord: {
      default: false,
      type: Boolean,
    },

    /**
     * Text hiển thị ở dòng thêm mới
     * NMTUAN2 07.10.2021
     */
    insertNewRecordText: {
      default: "Thêm dòng",
      type: String,
    },

    /**
     * Mã code để mở màn detail phục vụ thêm/ sửa dữ liệu grid
     * DHPhi 08/11/2021
     */
    subSystemCode: {
      default: null,
      type: String,
    },

    /**
     * true: build cả group có 1 phần tử
     * false: không build group có 1 phần tử
     * NMTUAN3 17/11/2021
     */
    isAlwaysGroup: {
      type: Boolean,
      default: false,
    },

    /**
     * biến đánh dấu grid có thể cho to row
     * DHPhi 17/11/2021
     */
    growToHeight: {
      default: false,
      type: Boolean,
    },

    /**
     * Tên trường khóa chính
     */
    idField: {
      type: String,
    },

    /*
     * thêm cấu hình những cột luôn lấy khi load grid
     * NMTUAN2 18.11.2021
     */
    alwayTakeColumns: {
      default: null,
      type: Array,
    },

    /**
     * Cờ cho phép hiển thị dòng dữ liệu trống
     * NTDIEM 29.11.2021
     */
    isShowEmptyText: {
      type: Boolean,
      default: true,
    },

    /**
     * Nội dung tuỳ chọn cho dòng dữ liệu trống
     * NTDIEM 29.11.2021
     */
    emptyText: {
      default: null,
      type: String,
    },

    /*
     * cho phép check disable ô checkbox ở row
     * addby: NTTHANH1
     */
    disabledCheckedMultipleTbody: {
      default: false,
      type: [Boolean, Function],
    },

    /**
     * Ẩn checkbox thead
     * NTTHANH1
     */
    disabledCheckboxThead: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      //Lưu dữ liệu các dòng trong grid
      datax: null,
      // Lưu dữ liệu cuối cùng trước khi chỉnh sửa
      originalData: null,
      //Lưu dữ liệu cấu hình cột trong grid
      columnx: null,
      //Cho sao chép/bôi đen dữ liệu hay không
      selectedTextMode: false,
      //Trang hiện tại
      currentPage: 1,
      //Dòng được chọn
      rowSelected: {},
      //Độ rộng của table
      widthx: 0,
      hasScroll: false,

      /**
       * Filter trên tiêu đề cột
       */
      filterHeader: [],
      /**
       * header render
       */
      headers: [],

      /**
       * footer render
       */
      footers: [],

      listRowSelected: [],
      pageTotalCaptionData: this.$t("i18nComponent.Paging.Total"),

      /**
       * header render
       */
      firstLoad: true,

      /**
       * index của row đang focus
       */
      indexOfRowFocused: 0,

      /**
       * index của row đang được editor
       */
      indexOfRowEditor: -1,
      /**
       * Có cột lock
       */
      hasLockColumn: false,
      /**
       * danh sách columns bị lock
       */
      columnLocks: [],
    };
  },
  computed: {
    //Sự kiện từ 1 dòng dữ liệu emit ra ngoài
    listeners() {
      const me = this;
      return {
        click: (metaData) => {
          me.cellSelected(metaData);
          //me.editAllCellOnRow(metaData)
          me.$emit("click", metaData, me.rowSelected);
        },
        dblclick: (dataRow, event) => {
          me.$emit("dblclick", dataRow, event);
        },
        keydown: (dataRow, event) => {
          me.row_keydown(dataRow, event);
          me.$emit("keydown", dataRow, event);
        },
        keyup: (dataRow, event) => {
          me.$emit("keyup", dataRow, event);
        },
        widgetEvent: (data, event) => {
          me.$emit("widgetEvent", data, event);
        },
        selected: (metaData) => {
          me.$emit("selected", metaData, me.rowSelected);
        },
        change: (metaData) => {
          me.$emit(
            "change",
            metaData,
            me.rowSelected || metaData ? metaData.dataRow : {}
          );
        },
        rowSelected: (data) => {
          me.updateRowSelected(data);
        },
        loadDataCombo: (metaData) => {
          me.$emit("loadDataCombo", metaData);
        },
        rowactionclick: (command, dataRow, event) => {
          //DHPhi 08/11/2021: bổ sung để phục vụ truyền kèm 1 số thông tin tuỳ chỉnh
          let options = {
            SubSystemCode: me.subSystemCode,
          };
          me.$emit("rowactionclick", command, dataRow, event, options);
        },
        mouseover: (dataRow) => {
          me.$emit("rowmouseover", dataRow);
        },
        clickMultiple: (dataRow, checked) => {
          me.clickMultiple(dataRow, checked);
          me.$emit("clickMultiple", dataRow);
        },
        next: () => {
          me.next();
        },
        input: (event) => {
          me.$emit("input", !me.value);
        },
      };
    },
    scrollVisiable() {
      if (this.hasScroll) {
        return true;
      }
      return false;
    },
    /**
     * Kiểm tra xem tất cả dữ liệu có đang được check hay không
     * created by LTDAT 25.06.2020
     */
    isCheckedMultiple() {
      if (this.listRowSelected) {
        if (this.datax.length != 0) {
          return (
            this.listRowSelected.length >= this.datax.length &&
            this.datax.every((item, index) => {
              return this.listRowSelected.includes(item);
            })
          );
        } else {
          return false;
        }
      }
      return false;
    },
    isCheckedAll() {
      let me = this,
        lengthx = me.datax.length;
      let lengthSelected = me.datax.filter((item) => {
        return item.visible;
      }).length;
      let selectedx = lengthx - lengthSelected;
      if (selectedx == 0) {
        return true;
      } else {
        return false;
      }
    },

    gridViewStyle() {
      if (this.maxHeight) {
        return {
          "max-height": this.maxHeight,
          height: "auto",
        };
      }
      return null;
    },
    //Style tính lại tọa độ cho footer khi có pagination
    bottomFooter() {
      const me = this;
      if (me.pagination && me.footer) {
        return {
          bottom: "46px",
        };
      } else {
        return {
          bottom: "0px",
        };
      }
    },
  },
  watch: {
    data: {
      immediate: true,
      handler(newVal, oldVal) {
        let me = this;
        this.checkHasScroll();

        if (me.datax != newVal) {
          if (me.groupField) {
            me.$nextTick(() => {
              me.defaultExpand();
            });
          }
        }

        if (newVal && me.datax != me.data) {
          me.initData(newVal);
          this.isCheckedAll;
          if (me.firstLoad && newVal.length > 0) {
            me.autoSelectedFirstRow(true);
          }
        }
      },
    },
  },
  created() {
    const me = this;
    me.initColumns();
    me.initData();
    document.addEventListener("mousedown", me.endEditor);
  },
  mounted() {
    if (this.$refs.tableHeader) {
      this.widthx = this.$refs.tableHeader.offsetWidth;
    }
  },
  updated() {
    let me = this;
    if (me.$refs.tableHeader) {
      me.widthx = me.$refs.tableHeader.offsetWidth;
    }
    if (me.datax.length == 0 && me.defaultData) {
      me.datax.append(me.defaultData);
    }
    if (me.$refs.trGroup) {
      me.$refs.trGroup.forEach((item, index) => {
        let tdGroup = item.querySelector(".td-group");
        if (tdGroup) {
          let colspan = tdGroup.getAttribute("colspan");
          let tdGroupWidth = 0;
          if (me.$refs.th && colspan) {
            let i = me.multiple ? 1 : 0;
            for (i; i < colspan; i++) {
              tdGroupWidth += me.$refs.th[i].$el.offsetWidth;
            }
          }
          tdGroup.style.width = tdGroupWidth + "px";
          tdGroup.style.maxWidth = tdGroupWidth + "px";
        }
      });
    }
    this.checkHasScroll();
  },
  methods: {
    /**
     * Chuyển về trang chỉ định
     */
    setPage(page) {
      this.currentPage = page;
    },

    getSummaryDisplay(col) {
      const me = this;
      let dataRender = "";
      if (me.summaryData) {
        dataRender = me.summaryData[col.dataField];
      } else {
        dataRender = col.footerCommand
          ? me.doFunction(col.footerCommand, col.dataField, col.dataFormat)
          : col.footerText;
      }
      let value = me.$options.filters.formatData(dataRender, {
        formatType: col.dataFormat || col.formatType,
        isReport: me.isReportViewer,
        optionFormat: col.optionFormat,
      });
      return value == "--" || value == "-" ? null : value;
    },
    /**
     * Thực hiện theo công thức được cấu hình tại cấu hình cột
     * @param {String} command: công thức
     * @param {String} field: cột
     * @param {Number} dataFormat: kiểu dữ liệu của cột
     * @author NVLAM 24.09.2020
     */
    doFunction(command, field, dataFormat) {
      let me = this,
        result;
      switch (command) {
        case MSEnum.FooterCommand.Sum:
          result = me.sumField(field, dataFormat);
          break;
        case MSEnum.FooterCommand.SumAll:
          result = me.sumAllField(field, dataFormat);
          break;
        default:
          break;
      }
      return result;
    },
    // Tinhs tong tren field
    sumField(field, dataFormat) {
      let me = this,
        sum = 0;
      me.datax.forEach((item) => {
        if (item[field]) {
          sum += parseFloat(item[field]); //.toFixed(FormatUtil.getDecimalDigitByFormatType(dataFormat))
        }
      });
      return sum;
    },

    /**
     * Tính tổng tất cả các dữ liệu theo field
     * @param {String} field: cột
     * @param {Number} dataFormat: kiểu dữ liệu của cột
     * @author NVLAM 24.09.2020
     */
    sumAllField(field, dataFormat) {
      let sum = 0,
        data = me.datax;
      if (data && data.length > 0) {
        data.forEach((item) => {
          if (item[field]) {
            sum += parseFloat(item[field]); //.toFixed(FormatUtil.getDecimalDigitByFormatType(dataFormat))
          }
        });
        return sum;
      }
    },
    //Kiểm tra xem grid có scroll hay không?
    checkHasScroll() {
      if (this.$refs.content) {
        if (
          this.$refs.content.getBoundingClientRect().height + 2 <
          this.$refs.content.scrollHeight
        ) {
          this.hasScroll = true;
        } else {
          this.hasScroll = false;
        }
      }
    },
    //Cập nhật lại row được chọn để css
    updateRowSelected(data) {
      this.rowSelected = data;
    },
    //Kết thúc edit khi ấn ra ngoài grid
    endEditor(e) {
      const me = this;
      if (
        !e.target.closest(".ms-grid-viewer .ms-tr.row-editor") &&
        !e.target.closest(".ms-grid-viewer .ms-tr.row-editor .row-actions") &&
        !e.target.closest(".ms-dropdown") &&
        !e.target.closest("#message-box") &&
        !e.target.closest(".combobox-item-td--text")
      ) {
        if (e.target.closest(".scroller") && !e.target.closest("table")) {
          //Nếu click vào vùng scroll của bảng thì ko show
        } else {
          if (me.newEditor && this.datax.length > 0) {
            let rowIndex = me.newEditor.rowIndex;
            let row = me.$refs[`tr-${rowIndex}`];
            if (Array.isArray(row)) {
              row = row[0];
            }
            me.$emit("endEditor", row, this.datax[rowIndex], rowIndex);
            if (!me.overiteEndEditor) {
              me.endEditorAllRow(rowIndex);
            }
          }
          //me.rowSelected = null;
        }
      }
      if (me.newEditor && !me.newEditor.$el.contains(e.target)) {
        //me.newEditor.validateCell();
        //if(me.newEditor.errorProvider && !me.newEditor.errorProvider.isValid){
        //me.newEditor.isSelected = false;
        //}
      }
    },
    //Lấy độ rộng của table theo header
    //Created by LTDAT 01.07.2020
    tableResize() {},
    /**
     * Sự kiện scroll trên grid
     * Thay đổi lại tọa độ scroll trên header
     * Created by LTDAT(25.06.2020)
     */
    onScroll(e) {
      const me = this;
      //   if (e && me.$refs.header) {
      //     me.$refs.header.scrollLeft = e.target.scrollLeft;
      //   }
      if (me.rowSelected) {
        let row = me.$refs[`tr-${me.rowSelected.rowIndex}`];
        if (row && Array.isArray(row) && row.length > 0) {
          row = row[0];
          row.eventScrollGrid(row.$el);
        }
      }
      me.$emit("scroll", e);
    },
    /**
     * Kiểm tra xem cột được check hay không ?
     * duyệt trong data nếu có chưa dữ liệu của dòng tương ứng thì return true ngược lại false
     * @param dataRow dữ liệu của dòng được check
     * Created by LTDAT 24.06.2020
     *  */
    isSelected(dataRow, rowIndex) {
      let me = this,
        check = false;
      if (me.listRowSelected && me.listRowSelected.length > 0) {
        check = me.listRowSelected.includes(dataRow) ? true : false;
      }
      dataRow.IsSelected = check;
      return check;
    },
    //Sự kiện ấn vào nút chọn tất cả bên trên header
    changeCheckedMultiple() {
      const me = this;
      if (me.isCheckedMultiple) {
        me.listRowSelected = [];
        me.$emit("input", []);
      } else {
        me.listRowSelected = me.datax;
        me.$emit("input", me.datax);
      }
      let metaData = {
        column: {
          dataField: "IsSelected",
        },
        isCheckedAll: me.isCheckedMultiple,
      };
      me.$emit("selectedAll", metaData);
    },

    //Sự kiện chọn cell
    /**
     * @params:editor control chứa edtior
     * @modify by nnlam 01/03/2021
     */
    cellSelected(editor) {
      const me = this;
      me.indexOfRowFocused = editor.rowIndex;
      if (editor && !editor.readOnly) {
        me.oldEditor = me.newEditor;
        me.newEditor = editor;
        let row = me.newEditor.rowIndex,
          col = me.newEditor.colIndex,
          nextEdit;

        if (me.newEditor && !me.newEditor.isSelected) {
          // endEditor dòng cũ
          if (me.oldEditor && me.oldRowEditorIndex != me.newEditor.rowIndex) {
            me.endEditorAllRow(me.oldRowEditorIndex);
          }
          me.oldRowEditorIndex = row;
          me.indexOfRowEditor = row;
          // me.newRowEditorIndex = row;

          // start editor tất cả cell của dòng đang dc focus
          for (let i = 0; i < me.columnx.length; i++) {
            nextEdit = me.findEditorByIndex(row, i);
            if (nextEdit && !nextEdit.readOnly) {
              if (
                nextEdit &&
                nextEdit.isSelected == false &&
                typeof nextEdit.cellSelected == "function"
              ) {
                nextEdit.cellSelected(editor);
              }
            }
          }
          // me.$nextTick(()=>{
          //   editor.validate(editor)
          // })
        }
        //gán rowSelected
        if (me.editable) {
          me.rowSelected = me.newEditor.dataRow;
          me.rowSelected.rowIndex = me.newEditor.rowIndex;
        }
      } else if (editor && editor.readOnly) {
        // endEditor dòng cũ
        if (editor.rowIndex != me.oldRowEditorIndex) {
          me.endEditorAllRow(me.oldRowEditorIndex);
          me.oldRowEditorIndex = editor.rowIndex;
        }
        // start editor tất cả cell của dòng đang dc focus
        for (let i = 0; i < me.columnx.length; i++) {
          let nextEdit = me.findEditorByIndex(editor.rowIndex, i);
          if (nextEdit && !nextEdit.readOnly) {
            if (
              nextEdit &&
              nextEdit.isSelected == false &&
              typeof nextEdit.cellSelected == "function"
            ) {
              nextEdit.cellSelected(editor);
            }
          }
        }
      }
      me.$nextTick(() => {
        if (typeof editor.focusEditor == "function") {
          editor.focusEditor(editor);
        }
      });
    },
    //Tìm cell theo index
    /**
     * @params rowIndex:vị trí Dòng
     * @params colIndex:ví trí Cột
     */
    findEditorByIndex(rowIndex, colIndex) {
      const me = this;
      let row = me.$refs[`tr-${rowIndex}`];
      let editor = null;
      if (Array.isArray(row)) {
        row = row[0];
      }
      if (row && row.$refs[`editor-${colIndex}`]) {
        editor = row.$refs[`editor-${colIndex}`][0];
      }
      return editor;
    },
    //Tìm cell theo index
    /**
     * @params rowIndex:vị trí Dòng
     * @params colIndex:ví trí Cột
     */
    updateCustomReadOnlyBeforeEditRow(rowIndex) {
      const me = this;
      let row = me.$refs[`tr-${rowIndex}`];
      let editor = null;
      if (Array.isArray(row)) {
        row = row[0];
      }
      for (let index = 0; index < me.columnx.length; index++) {
        if (row && row.$refs[`editor-${index}`]) {
          editor = row.$refs[`editor-${index}`][0];
          me.$emit("overiteCustomReadOnly", row, editor, me.datax[rowIndex]);
        }
      }
    },

    //End editor tất cả cell của row theo index
    /**
     * @params rowIndex:vị trí Dòng
     */
    endEditorAllRow(rowIndex) {
      const me = this;
      let row = me.$refs[`tr-${rowIndex}`];
      let editor = null;
      me.indexOfRowEditor = -1; // reset biến vị trí dòng đang dc sửa
      if (Array.isArray(row)) {
        row = row[0];
      }
      if (row) {
        for (let i = 0; i < me.columnx.length; i++) {
          if (row.$refs[`editor-${i}`]) {
            editor = row.$refs[`editor-${i}`][0];
            if (editor) {
              //editor.validateCell();
              editor.isSelected = false;
            }
          }
        }
      }
      me.rowSelected = null;
    },

    //Xử lý sự kiện resize col trên grid
    //created by LTDAT(29.05.2020)
    //cmt by: nnlam 24/02/2021: bỏ đi vì thừa gây xấu khi mà click vào resize thì làm change width toàn bộ column luôn, resize đã có ở msth rồi
    resizeActive() {
      //Không cho phép bôi đen text
      // this.selectedTextMode = true;
      // if (this.$refs.th) {
      //   let listTh = this.$refs.th;
      //   listTh.forEach(item => {
      //     item.updateColWidth();
      //     if (item == listTh[listTh.length - 1]) {
      //       item.autoResizex = true;
      //     }
      //   });
      // }
    },
    //Đóng sự kiện resize cột trên grid
    //created by LTDAT(29.05.2020)

    resizeClose() {
      //Cho phép bôi đên text
      this.selectedTextMode = false;
    },
    /**
     * Khởi tạo dữ liệu ban đầu cho grid
     * columns truyền vào mặc định là columns trong props có thể truyền cấu hình khác từ ngoài vào
     */
    initColumns(columns = this.columns) {
      const me = this;
      me.columnx = columns ? columns : me.columns;
      me.setDefaultFieldColumn(me.columnx);
      if (!me.columnx) {
        me.columnx = [];
      }
      me.columnx = me.getVisiableColumn(me.columnx);
      let hasFlex = me.columnx.some((item) => {
        return item.autoResize;
      });
      if (hasFlex == false && me.columnx.length > 0) {
        me.$set(me.columnx[me.columnx.length - 1], "autoResize", true);
      }

      //xử lý group header
      me.initHeader(me.columnx);

      //nếu có footer thì sử lý
      if (me.footer) {
        me.initFooter(me.columnx);
      }

      //gán stickty left cho các cột sticky
      me.$nextTick(() => {
        me.updateStickyOffset();
      });
    },
    /**
     * Xử lý tiêu đề cột
     */
    initHeader(columns) {
      const me = this,
        headers = [],
        sub = [];
      let group;
      columns.forEach((item, i) => {
        if (item.group) {
          if (!group || group.caption !== item.group) {
            group = {
              isGroup: true,
              colspan: 1,
              caption: item.group,
              childs: [],
            };
            headers.push(group);
          } else {
            group.colspan++;
          }
          group.childs.push(item);
          sub.push(item);
        } else {
          headers.push(item);
        }
      });

      /**
       * case để check luôn build group
       * NMTUAN3 17/11/2021
       */
      if (!me.isAlwaysGroup) {
        for (let i = 0; i < headers.length; i++) {
          let col = headers[i];
          if (col.childs) {
            if (col.childs.length === 1) {
              let child = col.childs[0];
              headers[i] = child;
              sub.remove(child);
            }
            delete col.childs;
          }
        }
      }

      if (sub.length > 0) {
        me.headers = [headers, sub];
      } else {
        me.headers = [headers];
      }
    },
    /**
     * Xử lý tiêu đề cột
     */
    initFooter(columns) {
      const me = this,
        footers = [],
        sub = [];
      let group;

      let columx = [];
      Object.assign(columx, columns);
      // if (me.multiple) {
      //   columx.unshift({});
      // }
      columx.forEach((col, i) => {
        let item = {
          dataField: col.dataField,
          align: col.align,
          formatType: col.formatType,
          footerText: col.footerText,
          lock: col.lock ? col.lock : false,
        };

        if (item.groupFooter || i < me.lockCount) {
          if (
            !group ||
            group.caption !== item.groupFooter ||
            i === me.lockCount
          ) {
            group = {
              isGroup: true,
              colspan: 1,
              caption: item.groupFooter,
              childs: [],
            };
            footers.push(group);
          } else {
            group.colspan++;
          }
          group.childs.push(item);
          //sub.push(item);
        } else {
          footers.push(item);
        }
      });

      //duyệt xử lý các nhóm cột chỉ có 1 phần từ -> bỏ nhóm đi
      for (let i = 0; i < footers.length; i++) {
        let col = footers[i];
        if (col.childs) {
          if (col.childs.length === 1) {
            let child = col.childs[0];
            child["colspan"] = child["colspan"]
              ? child["colspan"]
              : col.colspan;
            footers[i] = child;
            sub.remove(child);
          }
          delete col.childs;
        }
      }

      if (footers[0]) {
        let first = footers[0];

        if (me.serial) {
          first.colspan = (first.colspan || 1) + 1;
        }
        if (me.multiple) {
          first.colspan = (first.colspan || 1) + 1;
        }
        if (typeof first.caption === "undefined") {
          first.caption = me.$t("i18nComponent.Footer.Summary");
        }
        if (typeof first.footerText === "undefined") {
          first.footerText = me.$t("i18nComponent.Footer.Summary");
        }
      }

      if (sub.length > 0) {
        me.footers = [footers, sub];
      } else {
        me.footers = [footers];
      }
    },

    /** Lấy ra các column có thuộc tính visible = true
     * Created by LTDAT 17.07.2020
     * */
    getVisiableColumn(columns) {
      return columns.filter((item) => {
        return item.visible == true;
      });
    },
    /**
     * Cập nhật left cho các cột stickey
     */
    updateStickyOffset() {
      const me = this,
        ths = me.$el.querySelectorAll(".ms-th"),
        columns = me.columnx;
      let usingColumnSetting = false;

      let offset = 0;
      let f = 0;
      let width = 0;
      if (me.multiple) {
        width = ths[f].getBoundingClientRect().width || 0;
        // trường hợp grid bị ẩn đi -> offset của ô checkbox bị = 0; (lưu ý trên form có 2 grid trên 2 ms-tap-item khác nhau thì grid ở tab không actice sẽ bị lỗi left sticky)
        if (width === 0) {
          usingColumnSetting = true;
          width = me.$ms.enum.StyleCheckBoxMulti.Width;
        }
        offset += width;
        f++;
      }

      if (me.serial) {
        me.serialOffsetLeft = offset ? [offset, "px"].join() : "0";

        width = ths[f].getBoundingClientRect().width || 0;
        // trường hợp grid bị ẩn đi -> offset của ô checkbox bị = 0; (lưu ý trên form có 2 grid trên 2 ms-tap-item khác nhau thì grid ở tab không actice sẽ bị lỗi left sticky)
        if (width === 0) {
          width = 60;
        }
        usingColumnSetting = true;
        offset += width;
        f++;
      }
      me.hasLockColumn = false;
      me.columnLocks = me.columnx.filter((i) => i.lock == true);
      for (let i = 0; i < me.columnLocks.length; i++) {
        let col = me.columnLocks[i];
        // if (!col.lock) {
        //   break;
        // }

        me.hasLockColumn = true;
        me.$set(col, "stickyOffset", offset);

        /**
         * Gán thêm offset cho footer để lock cột
         * NTBAO 18.01.2022
         */
        for (let j = 0; j < me.footers.length; j++) {
          const footerItem = me.footers[j];

          let item = footerItem.find(function (x) {
            return x.dataField == col.dataField;
          });
          if (item) {
            me.$set(item, "stickyOffset", offset);
          }
        }

        // Tính offset tiếp theo
        let pos = 0;
        if (!usingColumnSetting) {
          pos = { width: ths[i + f].offsetWidth }; //ths[i + f].getBoundingClientRect();
        } else {
          pos = { width: columns[i + f - 1].width };
        }

        offset += pos.width;
      }
    },

    lockCount() {
      let count = 0;
      if (this.columnx) {
        for (let i = 0; i < this.columnx.length; i++) {
          let col = this.columnx[i];
          if (!col.lock) {
            break;
          }
          count++;
        }
      }
      return count;
    },
    stickeyCountClass() {
      let count = this.lockCount;
      if (count > 0) {
        if (this.serial) {
          count++;
        }

        return ["sticky", count].join("-");
      }
      return null;
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
        if (item.formatType == me.$ms.enum.FormatType.Number) {
          item.align = "right";
        } else if (
          item.formatType == me.$ms.enum.FormatType.Date ||
          item.formatType == me.$ms.enum.FormatType.DateTime
        ) {
          item.align = "center";
        }

        //tvloi(17/05/2021) - Gán width mặc định
        me.$set(item, "_width", item.width);
      });
    },

    //Xóa 1 phần tử trong data grid
    removeItem(item) {
      const me = this;
      me.datax = _.remove(me.datax, (e) => {
        return e !== item;
      });
    },

    //Gán giá trị để render data có thể truyền từ ngoài vào
    initData(data = this.data) {
      const me = this;
      let dataSource = null;
      if (data) {
        dataSource = data;
      }
      //nếu muốn mặc định selected những dòng nào thì truyền qua biến này
      if (me.values) {
        me.listRowSelected = me.values;
      }

      //Nếu thực hiện lấy data dưới local thì thức hiện lưu dữ liệu vào internalDataSource và phân trang local
      if (me.queryMode == "local" && me.pagination) {
        me.internalDataSource = dataSource;
        commonFn.genVKeyValue(me.internalDataSource);
        me.datax = me.getItemPagination();

        me.originalData = me.internalDataSource.map((x) => ({ ...x }));
      } else {
        //Lấy dữ liệu từ server
        //Tạm gán = props data sau gán = gì khác tính sau
        me.datax = dataSource;
        commonFn.genVKeyValue(me.datax);

        me.originalData = me.datax.map((x) => ({ ...x }));
      }

      // me.$nextTick(() => {
      // 	this.checkHasScroll();
      // });
    },
    //Lấy dữ liệu của dòng được chọn
    getRowSelected() {
      const me = this;
      return me.rowSelected;
    },
    //Xử lý sự kiện ấn phím trên row
    //Created by LTDAT(15.06.2020)
    row_keydown(dataRow, e) {
      const me = this;
      switch (e.which) {
        case 9:
          if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            me.pre();
          } else {
            e.preventDefault();
            e.stopPropagation();
            me.next();
          }
          break;
        case 13:
          e.preventDefault();
          e.stopPropagation();
          me.next();
          break;
        case 40: //down
          if (me.indexOfRowFocused < me.datax.length - 1) {
            me.indexOfRowFocused++;
            me.startEditRow(me.indexOfRowFocused);
          }
          break;
        case 38: //up
          if (me.indexOfRowFocused > 0) {
            me.indexOfRowFocused--;
            me.startEditRow(me.indexOfRowFocused);
          }
          break;
        case 32: //space
          e.target.focus();
          me.clickCheckBoxByIndex(e, me.indexOfRowFocused);
          break;
      }
    },

    clickCheckBoxByIndex(e, indexOfRowFocused) {
      let me = this;
      if (me.multiple) {
        let trs = me.$el.querySelectorAll(".ms-tbody.data tr");
        if (trs && trs.length > 0) {
          let row = me.$refs[`tr-${me.indexOfRowFocused}`];
          let checkbox = null;
          if (Array.isArray(row)) {
            row = row[0];
          }
          checkbox = row.$refs[`multiple`];
          if (checkbox) {
            checkbox.$el.click();
          }
          e.preventDefault();
        }
      }
    },

    focusLastControl(event) {
      const me = this;
      // if (me.newEditor && me.newEditor.isSelected) {
      //   me.newEditor.isSelected = false;
      //   me.$ms.commonFn.focusNextControl(event.target);
      // } else {
      let row = me.datax.length - 1,
        preEdit;

      event.preventDefault();
      event.stopPropagation();
      me.$nextTick(() => {
        for (let i = me.columnx.length; i > 0; i--) {
          preEdit = me.findEditorByIndex(row, i - 1);
          if (preEdit && !preEdit.readOnly) {
            break;
          }
        }
        if (preEdit) {
          me.cellSelected(preEdit);
        }
      });
      // }
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
            me.rowSelected = me.datax[0];
            me.indexOfRowFocused = 0;
          }
          let trFirst = me.$el.querySelector(".ms-tbody.data tr");
          if (trFirst) {
            if (
              typeof trFirst.getVueInstance == "function" &&
              trFirst.getVueInstance()
            ) {
              trFirst.getVueInstance()._events.click;
            }
            me.$emit("focus", me.datax[0]);
          }
          me.$emit("firstLoad", me.datax[0]);
        }
      });
    },

    //focus vào editor đầu tiên trong grid
    focusFisrtControl(ischeckbox) {
      const me = this;
      let row = 0,
        col = -1,
        nextEdit;
      me.$nextTick(() => {
        for (let i = col; i < me.columnx.length; i++) {
          nextEdit = me.findEditorByIndex(row, i + 1);
          if (nextEdit && !nextEdit.readOnly) {
            break;
          }
        }
        if (nextEdit) {
          me.cellSelected(nextEdit);
        }
      });
    },
    //Focus vào editor đầu tiên ở dòng cuối cùng
    focusLastRow() {
      const me = this;

      me.$nextTick(() => {
        me.startEditRow(me.datax.length - 1);
      });
    },
    //Chuyển editor sang ô tiếp theo
    next() {
      const me = this;
      if (me.newEditor) {
        let row = me.newEditor.rowIndex,
          col = me.newEditor.colIndex,
          nextEdit;
        for (let i = col; i < me.columnx.length; i++) {
          nextEdit = me.findEditorByIndex(row, i + 1);
          if (nextEdit && !nextEdit.readOnly) {
            break;
          }
        }
        if (nextEdit) {
          me.cellSelected(nextEdit);
          //nextEdit.focusEditor(nextEdit);
        } else {
          //Trường hợp là dòng cuối cùng
          if (row == me.datax.length - 1) {
            // me.newEditor.isSelected = false;
            me.$ms.commonFn.focusNextControl(me.$refs.inputBottom);
            return;
          } else {
            for (let i = 0; i < me.columnx.length; i++) {
              //bỏ qua nếu nó là checkbox
              if (me.columnx[i].columnType) {
                i =
                  me.columnx[i].columnType == me.$ms.enum.ColumnType.Checkbox
                    ? i + 1
                    : i;
              }
              nextEdit = me.findEditorByIndex(row + 1, i);
              if (nextEdit && !nextEdit.readOnly) {
                break;
              }
            }
            me.cellSelected(nextEdit);
            //nextEdit.focusEditor(nextEdit);
          }
        }
      }
    },
    //Di chuyển editor và trước
    pre() {
      const me = this;
      if (me.newEditor) {
        let row = me.newEditor.rowIndex,
          col = me.newEditor.colIndex,
          preEdit;
        for (let i = col; i >= 0; i--) {
          preEdit = me.findEditorByIndex(row, i - 1);
          if (preEdit && !preEdit.readOnly) {
            break;
          }
        }
        if (preEdit) {
          me.cellSelected(preEdit);
        } else {
          //Trường hợp là dòng cuối cùng
          if (row == 0) {
            me.$ms.commonFn.focusPreviewControl(me.$refs.inputTop);
            return;
          } else {
            for (let i = me.columnx.length - 1; i >= 0; i--) {
              //bỏ qua nếu nó là checkbox
              if (me.columnx[i].columnType) {
                i =
                  me.columnx[i].columnType == me.$ms.enum.ColumnType.Checkbox
                    ? i - 1
                    : i;
              }
              preEdit = me.findEditorByIndex(row - 1, i);
              if (preEdit && !preEdit.readOnly) {
                break;
              }
            }
            me.cellSelected(preEdit);
          }
        }
      }
    },
    /**
     * Sự kiện dữ liệu được sắp xếp lại
     */
    dataDragChanged() {
      const me = this;
      me.datax.forEach((item, index) => {
        item.sort_order = index;
      });
      /**
       * emit ra ngoài là thứ tự dữ liệu bị thay đổi
       */
      me.$emit("datasorted", me.datax);
    },
    /**
     * edit 1 cell theo vị trí dòng, cột
     */
    editCell(rowIndex, colIndex) {
      const me = this,
        editor = me.findEditorByIndex(rowIndex, colIndex);
      if (editor && !editor.readOnly) {
        me.cellSelected(editor);
        return true;
      }
      return false;
    },
    /**
     * edit 1 cell theo vị trí dòng, cột
     */
    startEdit(rowIndex, colIndex) {
      const me = this;
      me.$nextTick(() => {
        me.editCell(rowIndex, colIndex);
      });
    },
    /**
     * duyệt từng cell của row để xem cell nào edit dc thì start
     */
    startEditRow(rowIndex) {
      const me = this;
      //me.$nextTick(() => {
      for (let i = 0; i < me.columnx.length; i++) {
        let checkediter = me.editCell(rowIndex, i);
        if (checkediter) {
          break;
        }
      }
      //});
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
          if (item.dataField == col.dataField) {
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
          if (item && column.enumName) {
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

    setDataForCombox() {
      var nextLocationEdit = me.findEditorByIndex(metadata);
      if (nextLocationEdit) {
        //Nếu chưa tạo editor thì gắn dữ liệu ban đầu
        nextLocationEdit.col.editorProperty.propsData.data =
          me.listLocationCombox;
        //Nếu tạo rồi thì gắn lại dữ liệu cho combox
        if (nextLocationEdit.col.__editor) {
          nextLocationEdit.col.__editor.data = me.listLocationCombox;
        }
      }
    },

    /**
     * Hàm xử lý sự kiện khi click vào ô check multiple
     * @param dataRow dữ liệu của dòng được chọn
     * Created by LTDAT (30.05.2020)
     */
    clickMultiple(dataRow, rowIndex, isSelected, event) {
      const me = this;
      dataRow = dataRow || me.rowSelected;
      me.listRowSelected = me.listRowSelected ? [...me.listRowSelected] : [];
      if (me.listRowSelected.includes(dataRow)) {
        me.listRowSelected.remove(dataRow);
      } else {
        me.listRowSelected.push(dataRow);
      }
      me.$emit("input", me.listRowSelected);
      let metaData = {
        column: {
          dataField: "IsSelected",
        },
      };
      me.$emit("change", metaData, dataRow);
      me.$nextTick(() => {
        if (dataRow.IsSelected) {
          me.startEditRow(rowIndex);
        } else {
          me.endEditorAllRow(rowIndex);
        }
      });
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
      if (item.filter.value == 0) {
        return "0";
      }
      let value = this.$options.filters.formatData(item.filter.value, {
        formatType: item.formatType,
        enumName: item.enum,
        dataRow: {},
      });
      return '"' + value + '"';
    },

    changePageSize(value) {
      let me = this;
      //Nếu thực hiện lấy data dưới local thì thức hiện lưu dữ liệu vào internalDataSource và phân trang local
      if (me.queryMode == "local" && me.pagination) {
        // commonFn.genVKeyValue(me.internalDataSource);
        me.pageSize = value;
        me.datax = me.getItemPagination();
      }
      this.$emit("changepagesize", value);
    },
    listenersLoadData(payload) {
      const me = this;
      if (me.pagination) {
        me.currentPage = payload.skip / payload.take + 1;
        //Nếu thực hiện lấy data dưới local thì thức hiện lưu dữ liệu vào internalDataSource và phân trang local
        if (me.queryMode == "local" && me.pagination) {
          // commonFn.genVKeyValue(me.internalDataSource);
          me.datax = me.getItemPagination();
        }
      }
      me.$refs.content.scrollTop = 0;
      me.$emit("loadData", payload);
    },

    /**
     * Lấy dữ liệu của 1 trang khi phân trang local
     */
    getItemPagination() {
      let me = this,
        pageSize = me.pageSize ? me.pageSize : 20,
        min = Math.ceil((me.currentPage - 1) * pageSize),
        max = min + pageSize;
      let dataFilter = null;
      if (me.queryMode == "local" && typeof me.filterFn == "function") {
        dataFilter = me.filterFn();
      } else {
        dataFilter = me.internalDataSource;
      }
      dataFilter = dataFilter ? dataFilter : [];
      let dataPagination = dataFilter.filter((item, index) => {
        return index >= min && index < max;
      });
      return dataPagination;
    },

    /**
     * Xác nhận sự thay đổi
     * NDHUY 30.09.2021
     */
    commitChanges() {
      let me = this;
      if (me.queryMode == "local") {
        me.datax.forEach((index, data) => {
          let check = me.isRecordChange(data);

          if (check) {
            let curIndex = me.originalData.indexOf(
              me.originalData.find(
                (x) => x["__vKeyValue"] == data["__vKeyValue"]
              )
            );
            me.originalData[curIndex] = Object.assign(data);
          }
        });
      } else {
        me.originalData = [...me.datax];
      }
    },

    /**
     * Huỷ thay đổi
     * NDHUY 30.09.2021
     */
    rejectChange() {
      let me = this;
      if (me.queryMode == "local") {
        me.datax.forEach((index, data) => {
          let curIndex = me.originalData.indexOf(
            me.originalData.find((x) => x["__vKeyValue"] == data["__vKeyValue"])
          );
          data = Object.assign(me.originalData[curIndex]);
        });
      } else {
        me.datax = [...me.originalData];
      }
    },

    /**
     * Kiểm tra record có thay đổi hay không
     * NDHUY 30.09.2021
     */
    isRecordChange(record) {
      let me = this,
        recKey = record["__vKeyValue"],
        originRec = me.originalData.find((x) => x["__vKeyValue"] == recKey),
        change = false;

      for (let i = 0; i < me.columnx.length; i++) {
        let col = me.columnx[i];
        if (originRec[col.dataField] || record[col.dataField]) {
          if (originRec[col.dataField] != record[col.dataField]) {
            change = true;
            break;
          }
        }
      }

      return change;
    },

    /**
     * Lấy danh sách dữ liệu bị thay đổi
     */
    getChangedData() {
      let me = this,
        dataChanged = [];

      me.datax.forEach((data) => {
        if (me.isRecordChange(data)) {
          dataChanged.push(data);
        }
      });

      return dataChanged;
    },

    /**
     * Emit sự kiện thêm dòng dữ liệu mới
     * NTBAO 12.11.2021
     */
    insertNewRecordFn() {
      const me = this;

      // Khởi tạo sự kiện custom nếu cần
      if (typeof me.insertNewRecord == "function") {
        me.insertNewRecord(me);
      } else {
        let item = {};
        item =
          typeof me.initDataBeforeAddRow == "function"
            ? me.initDataBeforeAddRow()
            : {};
        me.datax.push(item);
      }
      me.$nextTick(() => {
        //sau khi thêm dòng thì autofocus vào editor đầu tiên của dòng đó
        let length = me.datax.length;
        me.startEditRow(length - 1);
      });
    },

    /**
     * Kiểm tra xem row có disable checkbox k
     * @param dataRow dữ liệu của dòng được check
     * Created by nnlam 24.06.2020
     *  */
    funDisabledCheckedMultipleTbody(dataRow) {
      let me = this;
      if (typeof me.disabledCheckedMultipleTbody == "function") {
        return me.disabledCheckedMultipleTbody(dataRow);
      }
      return me.disabledCheckedMultipleTbody;
    },

    /**
     * Xử lý sự kiện click trên tiêu đề cột
     * NMTUAN2 13.04.2022
     */
    quickActionOnColumn(value) {
      const me = this;

      me.$emit("quickAction", value);
    },
  },
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// @import '@/assets/scss/components/msGridViewer.scss';
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// @import '@/assets/scss/components/msGridViewer.scss';
// }

@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msGridViewer.scss";
.input-invisiabled {
  background: rgba(255, 255, 255, 0);
  overflow: hidden;
  position: fixed;
  width: 1px;
  height: 1px;
  z-index: -1;
  opacity: 0;
}

.ms-th.drag-data {
  width: 56px;
  padding: 0;
}
::v-deepdiv.ms-editor {
  margin: 0;
}

.expand .custom-td-group .group-icon::v-deep::before {
  background-image: url($ms-image-ic_collapse_group_blue);
}

.custom-td-group .group-icon::v-deep::before {
  background-image: url($ms-image-ic_expand_group_blue);
  background-position: center;
  background-repeat: no-repeat;
}

.insert-new-record {
  height: 48px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  padding-left: 12px;

  .add-icon {
    background-image: url($ms-image-ic_add_blue);
    background-position: center;
    height: 19px;
    width: 16px;
  }

  .add-text {
    color: $blue;
    height: 19px;
    line-height: 19px;
    padding-left: 4px;
  }
}

.only-total-record {
  padding: 0 16px;
  line-height: 56px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}
</style>
