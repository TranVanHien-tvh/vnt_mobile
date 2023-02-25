<template>
  <div
    class="ms-grid-viewer flex"
    :class="{
      selectedTextMode: selectedTextMode,
      'flex-column': flex,
      'has-filter': filterHeader.length > 0 && hasBindingFilterHeader,
    }"
  >
    <!-- TDNGHIA 8/10/2021 -->
    <!-- Phần này là phần tag bộ lọc filter -->
    <div
      v-if="filterHeader.length > 0 && hasBindingFilterHeader"
      class="container-filter-text"
    >
      <div class="mr-2">Lọc:</div>
      <div class="container-filter">
        <div
          v-for="item in filterHeader"
          :key="item.dataField"
          class="item-filter d-flex"
        >
          <div class="content d-flex">
            <div class="data-field">
              {{ item.caption }}
            </div>
            <!-- <div class="operator">
              {{ buildOperatorText(item.filter.operator) }}
            </div> -->
            <div class="value">
              {{ buildValue(item) }}
            </div>
          </div>
          <div
            class="action-delete-filter icon24 deleteX"
            @click="removeFilterItem(item)"
          />
        </div>
        <div class="clear-all-filter" @click="clearAllFilter">
          <div class="clear-all-filter-text">
            {{ $t("i18nComponent.i18nHeaderOption.ResetBtn") }}
          </div>
        </div>
      </div>
    </div>
    <div
      ref="content"
      :class="[
        'ms-content--table',
        stickeyCountClass,
        { 'flex scroller': flex },
      ]"
      :style="[gridViewStyle]"
      @scroll="onScroll"
    >
      <table class="ms-table" cellpadding="0" cellspacing="0">
        <thead
          v-show="isShowHeader"
          class="ms-thead"
          :class="{ multi: headers.length > 1 }"
        >
          <template v-for="(headerItem, i1) in headers">
            <draggable
              v-if="dataDragable"
              :key="i1"
              v-model="headers[0]"
              tag="tr"
              class="ms-tr"
            >
              <!-- TDNGHIA 1/10/2021-->
              <!-- hiển thị cột configcolumn -->
              <th
                v-if="isShowConfigColumn && i1 === 0"
                :key="0"
                class="ms-th config-column-cell sticky"
                :rowspan="i1"
                scope="col"
              >
                <div class="icon" @click="openConfigColumBox" />
              </th>

              <!-- Hiển thị header checkbox -->
              <th
                v-if="multiple && i1 === 0"
                :key="0"
                class="ms-th multiple-cell sticky"
                :style="{ left: multipleOffsetLeft }"
                :rowspan="i1"
                scope="col"
              >
                <ms-checkbox
                  :value="isCheckedMultiple && !isTempState"
                  class="justify-center"
                  :class="{
                    'checkmark-temp': !isCheckedMultiple && isTempState,
                  }"
                  check-only
                  @click="changeCheckedMultiple"
                />
              </th>

              <!-- hiển thị header stt -->
              <th
                v-if="serial && i1 === 0"
                class="ms-th serial text-center"
                :style="{ left: serialOffsetLeft }"
                :class="{ sticky: hasLockColumn }"
                :rowspan="headers.length"
              >
                {{ $t("i18nComponent.i18nHeaderOption.SortOrderColumn") }}
              </th>

              <template v-for="(col, i2) in headers[0]">
                <th v-if="col.isGroup" :key="i2" :colspan="col.colspan">
                  {{ col.caption }}
                </th>
                <ms-th
                  v-else
                  ref="th"
                  :key="col.dataField"
                  :class="['ms-th', '' + col.dataField]"
                  :rowspan="i1"
                  :col="col"
                  :resize-col="resizeCol"
                  :filteable="filterable"
                  :module-autocomplete="moduleAutocomplete"
                  :show-all-icon-filter="showAllIconFilter"
                  scope="col"
                  @resizeOn="resizeActive"
                  @resizeOff="resizeClose"
                  @sort="sort"
                  @buildFilter="buildFilterHeader"
                />
              </template>

              <th
                v-if="widgetOptions && i1 === 0"
                :key="100"
                class="ms-th widget-title"
                :rowspan="headers.length"
                :class="[
                  `text-${widgetOptions.align ? widgetOptions.align : 'right'}`,
                ]"
                :style="[
                  { 'min-width': `${widgetOptions.width}px` },
                  columnx.length > 0
                    ? { width: `${widgetOptions.width}px` }
                    : null,
                ]"
                scope="col"
              >
                <span>{{ widgetOptions.title }}</span>
              </th>
            </draggable>
            <tr v-else :key="i1" class="ms-tr" :class="`tr-${i1 + 1}`">
              <!-- hiển thị cột configcolumn -->
              <th
                v-if="isShowConfigColumn && i1 === 0"
                :key="0"
                class="ms-th config-column-cell sticky"
                :rowspan="i1"
                scope="col"
              >
                <div class="icon" @click="openConfigColumBox" />
              </th>
              <!-- Vẽ checkbox column -->
              <th
                v-if="multiple && i1 === 0"
                class="ms-th multiple-cell sticky"
                :style="{ left: multipleOffsetLeft }"
                :rowspan="i1"
              >
                <ms-checkbox
                  :value="isCheckedMultiple && !isTempState"
                  class="justify-center"
                  :class="{
                    'checkmark-temp': !isCheckedMultiple && isTempState,
                  }"
                  check-only
                  @click="changeCheckedMultiple"
                />
              </th>
              <!-- vẽ stt -->
              <th
                v-if="serial && i1 === 0"
                :style="{ left: serialOffsetLeft }"
                class="ms-th serial text-center"
                :class="{ sticky: hasLockColumn }"
                :rowspan="headers.length"
              >
                {{ $t("i18nComponent.i18nHeaderOption.SortOrderColumn") }}
              </th>

              <template v-for="(col, i2) in headerItem">
                <th v-if="col.isGroup" :key="i2" :colspan="col.colspan">
                  {{ col.caption }}
                </th>
                <ms-th
                  v-else
                  ref="th"
                  :key="col.dataField"
                  class="ms-th"
                  :rowspan="i1"
                  :col="col"
                  :resize-col="resizeCol"
                  :filteable="filterable"
                  :module-autocomplete="moduleAutocomplete"
                  :show-all-icon-filter="showAllIconFilter"
                  @resizeOn="resizeActive"
                  @resizeOff="resizeClose"
                  @buildFilter="buildFilterHeader"
                  @sort="sort"
                />
              </template>
              <!-- vẽ cột thường -->
              <th
                v-if="widgetOptions && i1 === 0"
                class="ms-th widget-title"
                :rowspan="i1"
                :class="[
                  `text-${widgetOptions.align ? widgetOptions.align : 'right'}`,
                ]"
                :style="[
                  { 'min-width': `${widgetOptions.width}px` },
                  columnx.length > 0
                    ? { width: `${widgetOptions.width}px` }
                    : null,
                ]"
              >
                <span>{{ widgetOptions.title }}</span>
              </th>
            </tr>
          </template>
        </thead>
        <transition
          name="trans-content-table"
          mode="out-in"
          @before-enter="beforeRenderContent"
        >
          <tbody v-if="loading" :key="loading" class="ms-tbody grid-loading">
            <template>
              <tr v-for="n in shimmerRow" :key="n" :index="n">
                <td
                  v-for="(sc, i) in shimmerColumn"
                  :key="i"
                  :class="{ sticky: sc.lock }"
                  :style="{
                    left:
                      typeof sc.offset == 'number' ? sc.offset + 'px' : 'unset',
                  }"
                >
                  <div class="shimmer" />
                </td>
              </tr>
            </template>
          </tbody>

          <tbody
            v-else-if="!dataEmpty"
            :key="loading"
            class="ms-tbody data"
            @click="quickSelected"
            @keyup="destroyQuickSelected"
          >
            <template v-if="groupData.length > 0">
              <template v-for="(group, groupIndex) in groupData">
                <tr
                  ref="trGroup"
                  :key="groupIndex"
                  class="tr-group"
                  :class="{ expand: groupExpand.indexOf(group.value) > -1 }"
                >
                  <td
                    class="td-group"
                    :colspan="group.colspan"
                    :class="{ 'sticky left-0 ms-th': hasLockColumn }"
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
                    :class="[{ sticky: sum && sum.lock }, sum ? sum.field : '']"
                    class="group-sum text-right"
                  >
                    <span v-if="sum && !sum.empty">
                      {{
                        sum.value | formatData({ formatType: sum.formatType })
                      }}
                    </span>
                  </td>
                </tr>
                <template v-if="groupExpand.indexOf(group.value) > -1">
                  <ms-tr
                    v-for="(dataRow, indexRow) in group.datax"
                    ref="tr"
                    :key="dataRow[idField]"
                    :is-selected="isSelected(dataRow)"
                    :columns="columnx"
                    :index="indexRow"
                    :data-row="dataRow"
                    :is-show-config-column="isShowConfigColumn"
                    :widget-options="widgetOptions"
                    :serial="serial"
                    :page-size="pageSize"
                    :grow-to-height="growToHeight"
                    :current-page="currentPage"
                    :multiple="multiple"
                    :row-selected="rowSelected.data"
                    :row-actions="rowActions"
                    :height-offset="heightOffset"
                    :has-icon="hasIcon"
                    :action-inline-count="actionInlineCount"
                    :disabled-checked-multiple-tbody="
                      funDisabledCheckedMultipleTbody(dataRow)
                    "
                    :class="[
                      {
                        'row-selected':
                          dataRow == rowSelected.data &&
                          !shortKeyForQuickSelect,
                      },
                      {
                        'multi-row-selected': shortkeyQuickSelectedData.includes(
                          dataRow
                        ),
                      },
                      { 'action-pointer': checkListenerDbClick },
                      typeof customClassRow == 'function'
                        ? customClassRow(dataRow)
                        : customClassRow,
                    ]"
                    :has-lock-column="hasLockColumn"
                    :multiple-offset-left="multipleOffsetLeft"
                    :serial-offset-left="serialOffsetLeft"
                    v-on="listeners"
                    @styleColumn="styleColumn"
                  />
                </template>
              </template>
            </template>
            <template v-else>
              <ms-tr
                v-for="(dataRow, indexRow) in datax"
                ref="tr"
                :key="dataRow[idField]"
                :is-selected="isSelected(dataRow)"
                :columns="columnx"
                :index="indexRow"
                :data-row="dataRow"
                :widget-options="widgetOptions"
                :grow-to-height="growToHeight"
                :serial="serial"
                :page-size="pageSize"
                :is-show-config-column="isShowConfigColumn"
                :current-page="currentPage"
                :multiple="multiple"
                :row-selected="rowSelected.data"
                :row-actions="rowActions"
                :action-inline-count="actionInlineCount"
                :height-offset="heightOffset"
                :has-icon="hasIcon"
                :disabled-checked-multiple-tbody="
                  funDisabledCheckedMultipleTbody(dataRow)
                "
                :class="[
                  {
                    'row-selected':
                      dataRow == rowSelected.data && !shortKeyForQuickSelect,
                  },
                  {
                    'multi-row-selected': shortkeyQuickSelectedData.includes(
                      dataRow
                    ),
                  },
                  { 'action-pointer': checkListenerDbClick },
                  typeof customClassRow == 'function'
                    ? customClassRow(dataRow)
                    : customClassRow,
                ]"
                :has-lock-column="hasLockColumn"
                :multiple-offset-left="multipleOffsetLeft"
                :serial-offset-left="serialOffsetLeft"
                v-on="listeners"
                @styleColumn="styleColumn"
              />
            </template>
          </tbody>

          <div v-else-if="isShowEmptyText" style="min-height: 40px">
            <div class="empty-text">
              <div class="empty-text-content">
                {{ emptyText == null ? $t("i18nCommon.noData") : emptyText }}
              </div>
            </div>
          </div>

          <div
            v-else-if="isShowImageGridEmpty"
            class="grid-no-data"
            :style="emptyStyle"
          >
            <!-- <img src="@/assets/images/empty/grid-empty.svg" class="img-bg" /> -->
            <div style="position: absolute; width: 100%">
              <div class="img-content">
                <div class="img-nodata" />
              </div>
              <div
                v-if="filterHeader.length == 0 && parentSearchText.length == 0"
                class="empty-des"
              >
                {{ $t("i18nCommon.noData") }}
              </div>
              <div v-else class="empty-des">
                {{ $t("i18nCommon.noRecord") }}
              </div>
            </div>
          </div>

          <component
            :is="customGridEmptyTemplate"
            v-else-if="customGridEmptyTemplate"
          />
        </transition>
        <tfoot v-if="footer" :key="loading" class="ms-footer data xx">
          <template v-for="(footerItem, i1) in footers">
            <tr :key="i1" class="ms-tr">
              <!-- <th class="ms-th multiple-cell sticky"
                v-if="multiple && i1 === 0" :rowspan="footers.length"
                style="left: 0">
                <ms-checkbox
                  :value="isCheckedMultiple"
                  @click="changeCheckedMultiple"
                  class="justify-center"
                  checkOnly
                />
              </th> -->

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
      </table>
    </div>

    <ms-pagination
      v-if="pagination"
      :page-size="pageSize"
      :data-render="datax.length"
      :page-index="currentPage"
      :summary="summary"
      :page-total="pageTotalFn == null ? pageTotal : pageTotalFn"
      :is-show-page-size-combox="isShowPageSizeCombox"
      :is-only-show-page-total="
        isOnlyShowPageTotal || (isGridInViewDetail && pageTotal <= 10)
      "
      :page-total-caption="pageTotalCaptionData"
      :paging-from-to-caption="pagingFromToCaption"
      :page-from-to-caption="pageFromToCaption"
      :loading="loadingSummary"
      @loadData="listenersLoadData"
      @changepagesize="changePageSize"
    />

    <div v-if="disabled" class="disabled" />

    <!-- Cofnig column box -->
    <ms-config-column
      v-show="showingConfigColumnBox"
      ref="configBox"
      :items="columnx"
      @settinglayout="layoutOnChange"
      @closeConfigBox="closeConfigBox"
      @getConfigDefault="getConfigDefault"
    />
  </div>
</template>
<script>
/* eslint-disable */
import msTr from "./msTr";
import msTh from "./msTh";
import msPagination from "./msPagination";
import commonFn from "@/commons/commonFunction.js";
import { MSEventName } from "@/commons/eventName";
import EventBusGlobal, { GlobalEventName } from "@/commons/eventBusGlobal";
import { gridGroupData } from "@/mixins/component/gridGroupData";
import draggable from "vuedraggable";
import { MSEnum } from "@/commons/enumeration";
import msConfigColumn from "./msConfigColumn";

export default {
  name: "MsGridViewer",
  components: {
    msTr,
    msTh,
    msPagination,
    draggable,
    msConfigColumn,
  },
  mixins: [gridGroupData],
  props: {
    flex: {
      default: true,
      type: Boolean,
    },
    /**
     * có show text filter khi lọc ra không
     */
    hasBindingFilterHeader: {
      default: false,
      type: Boolean,
    },
    //Value thực hiện lưu giá trị các cột được chọn
    value: {
      type: Array,
      return: () => [],
    },
    //Data dữ liệu grid từ ngoài truyền vào
    data: {
      type: Array,
      return: () => [],
    },
    /**
     * Tên trường khóa chính
     */
    idField: {
      type: String,
    },
    /**
     * nnlam 13/03/2021
     * cấu hình các trường cần sort mặc định khi load trang
     * Kiểu dữ liệu Array chứa danh sách các object, cấu trúc object có ít nhất 2 trường là sortField(tên property cần sort) và sortType (là desc hay asc)
     * ví dụ : [{sortField: 'AssetCode', sortType : this.$ms.enum.SortStatus.asc}]
     */
    defaultSort: {
      type: Array,
      return: () => [],
    },
    //Cấu hình các cột truyền vào
    /**
     * Các thuộc tính trong columns
     * @params dataField Field dữ liệu dùng để nhận giá trị thay đổi và hiện thị.
     * @params title:Tiêu đề của cột
     * @params width:độ rộng của cột
     * @params autoResize:Cột tự động to ra khi màn hình lớn
     * @params formatType:Dữ liệu dùng để format lấy từ trong file enumeration.js FormatType
     * @params template:Sử dụng 1 file khác ở ngoài truyền vào để render
     */
    columns: {
      type: Array,
      return: () => [],
    },
    /**
     * Cấu hình cho cột chức năng là 1 đối tượng gồm có
     * title: tên tiêu đề cột chức năng
     * components:'components import vào'
     * width:Độ rộng của cột
     */
    widgetOptions: {},
    //Set độ rộng cho grid
    maxHeight: {
      default: null,
      type: [Number, String],
    },
    //Cấu hình có phân trang hay không
    pagination: {
      default: false,
      type: Boolean,
    },
    /*
    Cho phép hiển thị header của lưới hay không? mặc định có
    Create: 14/01/2020
    Author: ĐVThi    
    */
    isShowHeader: {
      default: true,
      type: Boolean,
    },

    /*
    Cho phép hiển thị combox số dòng trên một trang hay không? mặc định có
    Create: 14/01/2020
    Author: ĐVThi    
    */
    isShowPageSizeCombox: {
      default: true,
      type: Boolean,
    },

    /*
    Cho phép hiển thị combox số dòng trên một trang hay không?
    Create: 14/01/2020
    Author: ĐVThi    
    */
    pageTotalCaption: {
      default: null,
      type: String,
    },

    /**
     * Text hiển thị bản ghi
     */
    pageFromToCaption: {
      default: null,
      type: String,
    },

    //Nhận 2 giá trị remote/local để lấy giá trị ở server hoặc local
    queryMode: {
      default: "remote",
      type: String,
    },
    //Số bản ghi trên mới trang trường hợp phân trang local
    pageSize: {
      default: 50,
      type: Number,
    },
    //Cột cho phép tích chọn nhiều dòng
    multiple: {
      default: false,
      type: Boolean,
    },
    indexFlexRight: {
      default: 1,
      type: Number,
    },
    //Tổng số bản ghi
    pageTotal: {
      default: 0,
      type: Number,
    },
    /**
     * thông tin summary
     * trong này sẽ có total luôn
     */
    summary: {},
    //Hiện thị cột số thứ tự
    serial: {
      default: false,
      type: Boolean,
    },
    //Cho phép di chuyển độ rộng của cột hay không
    resizeCol: {
      default: false,
      type: Boolean,
    },
    //Trường để kiểm tra sort dưới client hay trên sever
    //Local/Serve
    remoteSort: {
      default: "remote",
      type: String,
    },
    //Data là dạng Master/Detail
    isMasterDetail: {
      default: false,
      type: Boolean,
    },
    detailField: {
      default: "Details",
      type: String,
    },
    hasFilterEmpty: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: false,
    },
    loadingSummary: {
      default: false,
    },
    customClassRow: {
      default: null,
    },
    loadChildrenData: {
      default: null,
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
     * Disable control
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Số dòng shimmer loading
     */
    shimmerRow: {
      type: Number,
      default: 5,
    },
    /*
     * thêm cấu hình những cột luôn lấy khi load grid
     * pvduy 19/01/2021
     */
    alwayTakeColumns: {
      default: null,
      type: Array,
    },
    /**
     * có filter cột không
     */
    filterable: {
      type: Boolean,
      default: true,
    },
    /*
     * cờ đánh dấu là grid sử dụng trong form chi tiết -- dùng để ẩn hiện phân trang
     * pvduy 03/01/2021
     */
    isGridInViewDetail: {
      type: Boolean,
      default: false,
    },
    /**
     * Cho phép sắp xếp lại dữ liệu
     */
    dataDragable: {
      default: false,
      type: Boolean,
    },
    /*
     * pvduy 19/03/2021
     * cờ xác nhận xem có cho hiện ảnh trống khi grid ko có dữ liệu hay không? ==> sử dụng trong grid detail dù trống vẫn ẩn ảnh đi.
     */
    isShowImageGridEmpty: {
      default: false,
      type: Boolean,
    },

    //Có footer hay không ?
    footer: {
      default: false,
      type: Boolean,
    },
    /*
     * nnlam 14/04/2021
     * có cache cấu hình cột không, hiện tại nếu lưu cache sẽ lưu khi resize cột
     */
    hasCacheCol: {
      default: false,
      type: Boolean,
    },
    /*
     * nnlam 14/04/2021
     * khi queryMode = 'local' thì dùng cái này để filter
     */
    filterFn: {
      default: false,
      type: [Boolean, Function],
    },
    /*
     * nnlam 14/04/2021
     * cho phép check disable ô checkbox ở row
     */
    disabledCheckedMultipleTbody: {
      default: false,
      type: [Boolean, Function],
    },

    //module để thực hiện autocomplete khi lọc trên th
    moduleAutocomplete: {
      type: String,
      default: null,
    },
    /**
     * Dữ liệu tổng
     * Dùng cho sum lấy từ server truyền vào (không phụ thuộc vào trang đang hiển thị)
     */
    summaryData: {
      type: Object,
      default: null,
    },
    /**
     * cờ tự động chọn dòng đầu grid
     */
    isAutoFocusFirstRow: {
      type: Boolean,
      default: true,
    },
    idProperty: {
      default: null,
      type: String,
    },

    /*
     * cờ chỉ hiển thị tổng số trang
     * NMTUAN2 01.10.2021
     */
    isOnlyShowPageTotal: {
      default: false,
      type: Boolean,
    },

    pagingFromToCaption: {
      default: null,
      type: String,
    },

    /**
     * biến đánh dấu grid có thể cho to row
     * TDNGHIA 8/10/2021
     */
    growToHeight: {
      default: false,
      type: Boolean,
    },

    /**
     * Cờ cho phép hiển thị dòng dữ liệu trống
     * NMTUAN2 23.09.2021
     */
    isShowEmptyText: {
      type: Boolean,
      default: true,
    },

    /**
     * Nội dung tuỳ chọn cho dòng dữ liệu trống
     * NMTUAN2 23.09.2021
     */
    emptyText: {
      default: null,
      type: String,
    },

    /**
     * Custom grid empty
     * NTBAO 05.10.2021
     */
    customGridEmptyTemplate: {
      default: null,
    },

    /**
     * Mã code để mở màn detail phục vụ thêm/ sửa dữ liệu grid
     * NMTUAN2 23.09.2021
     */
    subSystemCode: {
      default: null,
      type: String,
    },

    /**
     * grid có cho config columns không
     * TDNGHIA 1/10/2021
     */
    isShowConfigColumn: {
      default: false,
      type: Boolean,
    },

    /**
     * Khoảng cách từ context menu đến mép trên của row
     * NMTUAN3 26/10/2021
     */
    heightOffset: {
      type: Number,
      default: -2,
    },

    /**
     * Hiển thị icon trong context menu
     * NMTUAN3 26/10/2021
     */
    hasIcon: {
      type: Boolean,
      default: true,
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
     * Hàm custom dòng được focus đầu tiên
     */
    getRowAutoFocus: {
      type: [Function, Object],
      default: null,
    },
  },
  data() {
    return {
      //Data trong grid dùng để render
      datax: null,
      //Columns trong grid dùng để render
      columnx: [],
      //Mode cho phép copy dữ liệu hay không thực hiện với các event kéo thả cột,độ rộng,...
      selectedTextMode: false,
      //Trang hiện tại
      currentPage: 1,

      //Dòng đang được chọn
      rowSelected: {},
      //Kiểm tra data đã được load hay chưa
      dataLoaded: false,
      hasScroll: false,
      /**
       * Vị trí hiển thị của box empty
       */
      emptyStyle: {
        top: 0,
        left: 0,
        display: "none",
      },
      pageTotalCaptionData:
        this.pageTotalCaption || this.$t("i18nComponent.Paging.Total"),
      /**
       * Filter trên tiêu đề cột
       */
      filterHeader: [],
      /**
       * ô search text từ form bên ngoài
       */
      parentSearchText: "",
      /**
       * header render
       */
      headers: [],

      /*
      Cho show tất cả icon filter header lên
      Create: 20/05/2020
      Author: NNLAM    
      */
      showAllIconFilter: false,

      /**
       * footer render
       */
      footers: [],

      /**
       * header render
       */
      firstLoad: true,

      //tổng số bản ghi ( trường hợp query local)
      pageTotalFn: null,
      /**
       * giá trị style left của cột serial
       */
      serialOffsetLeft: "0",
      /**
       * Có cột lock
       */
      hasLockColumn: false,
      /**
       * Có đang sử dụng phím tắt để chọn nhanh các bản ghi hay không
       */
      shortKeyForQuickSelect: false,
      /**
       * Những bản ghi dc chọn nhanh từ shortkey
       */
      shortkeyQuickSelectedData: [],

      /**
       * Đánh dấu hiển thị config column box
       * TDNGHIA 1/10/2021
       */
      showingConfigColumnBox: false,

      /**
       * Cache config column ban đầu cho grid
       * TDNGHIA 10/4/2021
       */
      configColumnOriginal: [],

      /**
       * Đánh dấu checkboxall trên header đang trạng thái trung gian
       * TDNGHIA 8/10/2021
       */
      isTempState: false,

      /**
       * giá trị style left của cột checkbox
       * NMTUAN2 22.03.2022
       */
      multipleOffsetLeft: "0",
    };
  },
  computed: {
    /**
     * Số lượng cột shimmer
     */
    shimmerColumn() {
      const me = this;
      let res = [];

      if (me.multiple) {
        res.push({
          offset: 0,
          lock: me.hasLockColumn,
        });
      }

      if (me.serial) {
        res.push({
          offset: me.multiple ? 60 : 0,
          lock: me.hasLockColumn,
        });
      }

      if (Array.isArray(me.columnx)) {
        me.columnx.forEach((item) => {
          res.push({
            offset: item.stickyOffset,
            lock: item.lock,
          });
        });
      }

      return res;
    },
    //Kiểm tra có lắng nghe xử lý sự kiện dblick hay không? nếu có thì đổi icon thành pointer
    checkListenerDbClick() {
      if (this._events.dblclick && this._events.dblclick.length > 0) {
        return true;
      }
      return false;
    },
    //Hàm kiểm tra xem có scroll hay không?
    scrollVisiable() {
      if (this.hasScroll) {
        return true;
      }
      return false;
    },
    //Sự kiện từ 1 dòng dữ liệu emit ra ngoài
    //Created by LTDAT(18.06.2020)
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
            if (event && !me.shortKeyForQuickSelect) {
              me.oldIndexOfRowFocused = me.indexOfRowFocused;
              me.indexOfRowFocused = me.datax.findIndex(
                (item) => item == dataRow
              );
              event.target.focus();
            }
            if (!me.multiple) {
              me.selected = dataRow;
              me.rowSelected.data = dataRow;
              me.rowSelected.index = me.datax.findIndex(
                (item) => item == dataRow
              );
            }
          }
          me.$emit("click", dataRow);
        },
        drilldownClick: (metaData, event) => {
          if (event) {
            event.target.focus();
          }
          this.$emit("drilldownClick", metaData);
        },

        //TVLOI 22.05.2021 Event Click vào cộtđại diện cho nhiều dòng chi tiết
        viewMoreDetails: (metaData, event) => {
          if (event) {
            event.target.focus();
          }
          this.$emit("viewMoreDetails", metaData);
        },

        focus: (dataRow, event) => {
          if (
            me.rowSelected &&
            me.rowSelected.data != dataRow &&
            !me.shortKeyForQuickSelect
          ) {
            let indexRow = me.datax.findIndex((item) => item == dataRow);
            me.rowSelected = {
              data: dataRow,
              index: indexRow,
            };
            event.target.focus();
          }
          me.$emit("focus", dataRow);
        },
        mouseover: (dataRow, event) => {
          me.$emit("rowmouseover", dataRow, event);
        },
        rowactionclick: (command, dataRow, event) => {
          // NMTUAN2 23.09.2021: bổ sung để phục vụ truyền kèm 1 số thông tin tuỳ chỉnh
          let options = {
            SubSystemCode: me.subSystemCode,
          };

          me.$emit("rowactionclick", command, dataRow, event, options);
        },
        dblclick: (dataRow, event) => {
          me.$emit("dblclick", dataRow, event);
        },
        keydown: (dataRow, event) => {
          me.row_keydown(dataRow, event);
          me.$emit("keydown", dataRow, event);
        },
        widgetEvent: (data, event) => {
          me.$emit("widgetEvent", data, event);
        },
        clickMultiple: (dataRow, checked) => {
          me.clickMultiple(dataRow, checked);
        },
      };
    },
    // //Set style cho grid độ rộng,...
    gridViewStyle() {
      if (this.maxHeight) {
        return { "max-height": this.maxHeight };
      } else {
        return null;
      }
    },
    dataEmpty() {
      // return false;
      if (this.datax && this.datax.length > 0) {
        return false;
      } else return true;
    },

    /**
     * Kiểm tra xem tất cả dữ liệu có đang được check hay không
     * Gọi đến mỗi khi tick chọn checkbox
     * TDNGHIA 8/10/2021: Thêm luồng check nếu mà chưa tick đủ thì sẽ add class temp
     * trạng thái checkbox hiện tại sẽ là trung gian sử dụng để bỏ chọn
     */
    isCheckedMultiple() {
      if (this.value) {
        let data = this.datax.filter((i) => !i.isDisabledCheckBox); //tìm tất cả bản ghi trên page mà ô checkbox k bị disabled
        //ĐVThi 19/01/2021: sửa lỗi TA khi me.datax null thì đoạn code này văng lỗi TA
        if (data && data.length != 0) {
          //Trường hợp chọn hết thì tick vào checkboxall
          if (
            this.value.length >= data.length &&
            data.every((item, index) => {
              return this.value.includes(item);
            })
          ) {
            this.isTempState = false; //tắt trạng thái trung gian đi
            return true;
          } else {
            //Nếu chưa chọn hết thì check xem có đang tick dòng nào không
            //Nếu có tick thì trạng thái là trung gian
            if (this.value.length < data.length && this.value.length > 0) {
              this.isTempState = true;
              return false;
            } else {
              this.isTempState = false;
              return false;
            }
          }
        } else {
          return false;
        }
      }
    },

    lockCount() {
      // let count = this.multiple ? 1 : 0;
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
  /**
   *
   */
  watch: {
    data: {
      immediate: true,
      handler(newVal, oldVal) {
        let me = this;
        this.checkHasScroll();
        if (me.datax != me.data) {
          me.initData(newVal);
          if (me.firstLoad && newVal.length > 0) {
            me.firstLoad = false;
          }
          if (me.groupField) {
            me.$nextTick(() => {
              me.defaultExpand();
            });
          }
          // check selected các bản ghi khi mà load lại trang hoặc search làm thay đổi data grid
          if (me.value) {
            me.$nextTick(() => {
              let VModel = [...me.value];
              VModel.forEach((dataRow) => {
                let map = me.datax.find(
                  (data) => data[me.idField] == dataRow[me.idField]
                );
                if (map) {
                  me.value.remove(dataRow);
                  me.value.push(map);
                }
              });
              me.$emit("input", me.value);
            });
          }
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
    loading(isLoading) {
      if (!isLoading) {
        this.autoSelectedFirstRow(false);
      }
    },
    pageSize: {
      immediate: true,
      handler(newVal, oldVal) {
        this.$emit("pageSize", newVal);
      },
    },

    rowSelected: {
      immediate: true,
      handler(newVal, oldVal) {},
    },
  },
  //Nếu dữ liệu thay đổi thì check scroll
  updated() {
    const me = this;
    me.updateSize();
  },
  /**
   * Hàm khởi tạo grid khởi tạo column vào data
   * Created by LTDAT 16.06.2020
   */
  created() {
    const me = this;
    me.initColumns();
    me.initData();
    document.addEventListener("click", me.clickOutGrid);
    window.addEventListener("resize", me.updateSize);
  },
  mounted() {},
  beforeDestroy() {
    const me = this;
    document.removeEventListener("click", me.clickOutGrid);
    window.removeEventListener("resize", me.updateSize);
  },
  methods: {
    /**
     * Chuyển về trang chỉ định
     */
    setPage(page) {
      this.currentPage = page;
    },
    /**
     * Hiển thị text tính tổng theo định dạng format
     * @param {Object} col cấu hình cột
     * @author NVLAM 10.12.2020
     */
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
    /**
     * Hàm chọn dòng đầu tiên
     * ischeckbox: có tích chọn vào ô checkbox không, mặc định là không và chỉ đơn thuần là click vào dòng đầu tiên
     * created by nnlam 06.03.2021
     * TDNGHIA 2/12/2021: isCheckbox đang truyền event vào nên lúc nào cũng chọn dc không rõ lý do => isCheckbox  = false
     */
    autoSelectedFirstRow(ischeckbox) {
      let me = this;
      me.$nextTick(() => {
        if (me.datax.length > 0) {
          if (ischeckbox) {
            //TDNGHIA 2/12/2021: không bao giờ vào đây nữa
            me.indexOfRowFocused = 0;
            me.rowSelected = { data: me.datax[0], index: 0 };
          }
          setTimeout(() => {
            let trFirst = me.$el.querySelector(".ms-tbody.data tr");
            //NTBAO: 26.11.2021 Tạo thêm hàm lấy dòng seletect đầu tiên tự chọn
            if (typeof me.getRowAutoFocus == "function") {
              trFirst = me.getRowAutoFocus();
            }
            if (trFirst) {
              if (
                typeof trFirst.getVueInstance == "function" &&
                trFirst.getVueInstance()
              ) {
                trFirst.getVueInstance()._events.click;
              }
              me.$emit("focus", me.datax[0]);
              if (me.isAutoFocusFirstRow) {
                trFirst.focus();
              }
            }
            me.$emit("firstLoad", me.datax[0]);
          }, 200);
        }
      });
    },

    /**
     * Hàm Cập nhật lại giao diện khi có scroll hay khi độ rộng của data dài hơn độ rộng mặc định của cột
     * Created by LTDAT
     */
    updateSize() {
      const me = this;
      me.$nextTick(() => {
        // me.checkHasScroll();
        if (me.$refs.tr && me.$refs.tr.length > 0) {
          me.columnx.forEach((col, index) => {
            let changeMinWidth = false;
            me.$refs.tr.forEach((item) => {
              if (
                item.$refs[`text-${col.dataField}`] &&
                item.$refs[`text-${col.dataField}`].length > 0
              ) {
                let textSpan =
                  item.$refs[`text-${col.dataField}`][0].offsetWidth;
                if (col._width < textSpan + 20) {
                  changeMinWidth = true;
                  if (
                    me.$refs.th[index].$el.offsetWidth !=
                    item.$refs[`td-${col.dataField}`][0].offsetWidth
                  ) {
                    me.$set(
                      col,
                      "_minWidth",
                      item.$refs[`td-${col.dataField}`][0].offsetWidth
                    );
                    me.$set(
                      col,
                      "_width",
                      item.$refs[`td-${col.dataField}`][0].offsetWidth
                    );
                  }
                }
              }
            });
            if (changeMinWidth == false) {
              me.$set(col, "_minWidth", col._width);
            }
          });
          if (me.$refs.trGroup) {
            me.$refs.trGroup.forEach((item, index) => {
              let tdGroup = item.querySelector(".td-group");
              if (tdGroup) {
                let colspan = tdGroup.getAttribute("colspan");
                let tdGroupWidth = 0;
                if (me.$refs.th && colspan) {
                  let i = me.multiple ? 0 : 1;
                  for (i; i <= colspan; i++) {
                    let thCurrentElement = me.$refs.th[i];
                    if (thCurrentElement) {
                      tdGroupWidth += thCurrentElement.$el.offsetWidth;
                    }
                  }
                }
                tdGroup.style.width = tdGroupWidth + "px";
                tdGroup.style.maxWidth = tdGroupWidth + "px";
              }
            });
          }
        }
      });
    },
    /**
     * Hàm trước thực hiện transition bắt đầu render.
     * Created by LTDAT
     */
    beforeRenderContent() {
      const me = this;
      me.updateSize();
    },
    /**
     * Thực hiện khi ấn vào ngoài grid loại bỏ row đang chọn
     * Created by LTDAT
     *  */

    clickOutGrid(event) {
      const me = this;
      if (event.target.closest(".ms-grid-viewer") != me.$el) {
        //me.rowSelected = {};  nnlam bỏ đi vì khi click ra ngoài thì những dòng được chọn mong muốn vẫn giữ nguyên focus
      }
    },
    /**
     * Hàm thực hiện việc sort trên grid
     * @params col cột được thực hiện sắp sếp
     * @params mode gồm null,DESC,ASC
     * created by LTDAT
     */

    sort(col, mode) {
      const me = this;
      if (me.datax && me.datax.length > 0) {
        if (me.remoteSort == "remote") {
          let payload = {
            skip: (me.currentPage - 1) * me.pageSize,
            take: me.pageSize,
          };
          if (mode != me.$ms.enum.SortStatus.none) {
            payload.Sort = `${
              col.isExtData
                ? `JSON_UNQUOTE(JSON_EXTRACT(ExtData, '$.${col.dataField}'))`
                : col.dataField
            } ${mode == me.$ms.enum.SortStatus.desc ? "DESC" : "ASC"}`;
          }
          me.listenersLoadData(payload);
        } else {
          let data = null;
          if (me.queryMode == "local" && typeof me.filterFn == "function") {
            data = me.filterFn();
            me.pageTotalFn = data ? data.length : 0;
          } else {
            data = [...me.internalDataSource];
          }
          //hàm sort
          function compare(a, b) {
            if (a[col.dataField] < b[col.dataField])
              return mode == me.$ms.enum.SortStatus.desc ? 1 : -1;
            if (a[col.dataField] > b[col.dataField])
              return mode == me.$ms.enum.SortStatus.asc ? 1 : -1;
            return 0;
          }

          //thực hiện sort
          if (mode != me.$ms.enum.SortStatus.none) {
            data = data.sort(compare);
          }

          //nếu có phân trang thì phân trang
          if (me.pagination) {
            let pageSize = me.pageSize ? me.pageSize : 20,
              min = Math.ceil((me.currentPage - 1) * pageSize),
              max = min + pageSize;
            me.datax = data.filter((item, index) => {
              return index >= min && index < max;
            });
          } else {
            me.datax = data;
          }
        }
      }
    },
    //Kiểm tra xem grid có scroll hay không để chỉnh lại size của grid cho đúng
    //Created by LTDAT (29.07.2020)
    checkHasScroll() {
      this.$nextTick(() => {
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
      });
    },
    /**
     * Hàm lắng nghe sự kiến thay đổi trang nếu thay đổi thì emit sự kiện load data mới ra ngoài
     * @param payload dữ liệu thông tin trang gửi ra ngoài
     *  */
    //Created by LTDAT(27.07.2020)
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
     * Sự kiện scroll trên grid
     * Created by LTDAT(25.06.2020)
     */
    onScroll(e) {
      const me = this;
      me.$emit("scroll", e);
      //me.$refs.gridContent.
    },

    /**
     * Kiểm tra xem cột được check hay không ?
     * duyệt trong data nếu có chưa dữ liệu của dòng tương ứng thì return true ngược lại false
     * @param dataRow dữ liệu của dòng được check
     * Created by LTDAT 24.06.2020
     *  */
    isSelected(dataRow) {
      const me = this;
      if (me.value && me.value.length > 0) {
        return me.value.includes(dataRow);
      }
      return false;
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
     * Hàm xử lý sự kiện khi click vào ô check multiple
     * @param dataRow dữ liệu của dòng được chọn
     * Created by LTDAT (30.05.2020)
     */
    clickMultiple(dataRow, checked) {
      const me = this;

      if (!Array.isArray(me.value)) {
        me.value = [];
      }

      if (me.value.includes(dataRow)) {
        me.value.remove(dataRow);
      } else {
        me.value.push(dataRow);
      }

      me.$emit("input", me.value);
    },
    /**
     * Hàm xử lý sự kiện khi click vào ô check multiple dùng phím tắt
     * @param dataRow dữ liệu của dòng được chọn
     * Created by NNLAM (30.05.2020)
     */
    clickMultipleByShorKey(list) {},

    //Lấy dữ liệu của 1 trang khi phân trang local
    //Created by LTDAT(18.06.2020)
    getItemPagination() {
      let me = this,
        pageSize = me.pageSize ? me.pageSize : 20,
        min = Math.ceil((me.currentPage - 1) * pageSize),
        max = min + pageSize;
      let dataFilter = null;
      if (me.queryMode == "local" && typeof me.filterFn == "function") {
        dataFilter = me.filterFn();
        me.pageTotalFn = dataFilter ? dataFilter.length : 0;
      } else {
        dataFilter = me.internalDataSource;
      }
      dataFilter = dataFilter ? dataFilter : [];

      // NMTUAN3 21/12/2021: Case nếu chỉ hiển thị tổng số trang thì trả về luôn
      if (me.isOnlyShowPageTotal) {
        return me.data;
      }

      let dataPagination = dataFilter.filter((item, index) => {
        return index >= min && index < max;
      });

      return dataPagination;
    },
    //Xử lý sự kiện resize col trên grid
    //created by LTDAT(29.05.2020)
    //cmt by: nnlam 24/02/2021: bỏ đi vì thừa gây xấu khi mà click vào resize thì làm change width toàn bộ column luôn
    resizeActive() {
      //Không cho phép bôi đen text
      // this.selectedTextMode = true;
      // if (this.$refs.th) {
      //   let listTh = this.$refs.th;
      //   if (listTh && listTh.length > 0) {
      //     listTh.forEach(item => {
      //       if (item == listTh[listTh.length - this.indexFlexRight]) {
      //         item.updateColWidth(true);
      //       } else {
      //         item.updateColWidth(false);
      //       }
      //     });
      //   }
      // }
    },
    //Đóng sự kiện resize cột trên grid
    //created by LTDAT(29.05.2020)

    resizeClose(col) {
      //Cho phép bôi đên text
      this.selectedTextMode = false;
      col.newWidth = col._width;
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
    initColumns(columns) {
      const me = this;
      me.columnx = [];
      me.$nextTick(() => {
        me.columnx = columns || me.columns || [];

        //Gán columns cho config-box
        if (
          me.$refs.configBox &&
          typeof me.$refs.configBox.updateData == "function"
        ) {
          me.$refs.configBox.updateData(me.columnx);
        }

        me.setDefaultFieldColumn(me.columnx);
        me.columnx = me.getVisibleColumn(me.columnx);
        if (!me.columnx) {
          me.columnx = [];
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
        // me.$nextTick(() => {
        //   let header = me.$refs.header;
        //   {
        //     if (header) {
        //       header.style.minHeight =
        //         header.firstElementChild.offsetHeight + 1 + "px";
        //     }
        //   }
        // });

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
      let columx = JSON.parse(JSON.stringify(columns));
      // NTBAO: Tạm thời bỏ đi tránh build ra dòng footer khi có cột check chọn nhiều
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
          let child = col.childs[0];
          child["colspan"] = child["colspan"] ? child["colspan"] : col.colspan;
          footers[i] = child;
          sub.remove(child);
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

      if (me.isShowConfigColumn) {
        width = ths[f].getBoundingClientRect().width || 0;
        offset += width;
        f++;
      }

      if (me.multiple) {
        me.multipleOffsetLeft = offset + "px";

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
        me.serialOffsetLeft = offset + "px";

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
      for (let i = 0; i < me.columnx.length; i++) {
        let col = me.columnx[i];
        if (!col.lock) {
          break;
        }

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
          pos = ths[i + f].getBoundingClientRect();
        } else {
          pos = { width: columns[i + f - 1].width };
        }

        offset += pos.width;
      }
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
      const me = this,
        updateScroll =
          !data != !me.datax ||
          (data && me.datax && data.length != me.datax.length);

      if (me.$parent.searchText && me.$parent.searchText.length > 0) {
        me.parentSearchText = me.$parent.searchText;
      }

      me.internalDataSource = null;
      if (data) {
        me.internalDataSource = [...data];
      }
      //Nếu thực hiện lấy data dưới local thì thức hiện lưu dữ liệu vào internalDataSource và phân trang local
      if (me.queryMode == "local" && me.pagination) {
        // commonFn.genVKeyValue(me.internalDataSource);
        me.datax = me.getItemPagination();
      } else {
        //Lấy dữ liệu từ server
        //Tạm gán = props data sau gán = gì khác tính sau
        //ĐVThi 19/01/2021: sửa lỗi TA khi me.datax null thì đoạn code này văng lỗi TA
        if (me.internalDataSource) {
          me.datax = [...me.internalDataSource];
        }
        // commonFn.genVKeyValue(me.datax);
      }
      if (me.isMasterDetail) {
        me.datax = me.$ms.commonFn.getBodyData(
          me.datax,
          true,
          1,
          me.detailField
        );
      }

      if (updateScroll) {
        me.$nextTick(() => {
          this.checkHasScroll();
        });
      }
    },
    //Lấy dữ liệu của dòng được chọn
    //Created by LTDAT(16.06.2020)
    getRowSelected() {
      const me = this;
      return me.rowSelected;
    },
    //Xử lý sự kiện ấn phím trên row
    //Created by LTDAT(15.06.2020)
    row_keydown(dataRow, e) {
      let me = this;
      let currentIndex = me.rowSelected.index;
      let tr = null;
      e = e || window.event;
      if (e.ctrlKey || e.shiftKey) {
        switch (e.which) {
          case 40: //down
            if (currentIndex < me.datax.length - 1 && !e.altKey) {
              me.shortKeyForQuickSelect = true;
              tr = this.$el.querySelector(
                `.ms-tbody.data tr[indexRow='${currentIndex}']`
              );
              // if(!me.shortkeyQuickSelectedData.includes(me.datax[me.rowSelected.index]) && tr.classList && tr.classList.contains('row-selected') && !tr.classList.contains('multi-row-selected')){
              //   me.shortkeyQuickSelectedData.push(me.datax[me.rowSelected.index]);
              // }
              currentIndex++;
              me.indexOfRowFocused = currentIndex;
              //event.target.focus();
              if (
                !me.shortkeyQuickSelectedData.includes(me.datax[currentIndex])
              ) {
                me.shortkeyQuickSelectedData.push(me.datax[currentIndex]);
              } else {
                me.shortkeyQuickSelectedData.remove(me.datax[currentIndex]);
              }
              me.rowSelected.data = me.datax[currentIndex];
              me.rowSelected.index = currentIndex;
              me.adjustScroll(currentIndex, tr, false);
              e.preventDefault();
            }
            break;
          case 38: //up
            if (currentIndex > 0 && !e.altKey) {
              me.shortKeyForQuickSelect = true;
              tr = this.$el.querySelector(
                `.ms-tbody.data tr[indexRow='${currentIndex}']`
              );
              // if(!me.shortkeyQuickSelectedData.includes(me.datax[me.rowSelected.index]) && tr.classList && tr.classList.contains('row-selected') && !tr.classList.contains('multi-row-selected')){
              //   me.shortkeyQuickSelectedData.push(me.datax[me.rowSelected.index]);
              // }
              currentIndex--;
              me.indexOfRowFocused = currentIndex;
              //event.target.focus();

              if (
                !me.shortkeyQuickSelectedData.includes(me.datax[currentIndex])
              ) {
                me.shortkeyQuickSelectedData.push(me.datax[currentIndex]);
              } else {
                me.shortkeyQuickSelectedData.remove(me.datax[currentIndex]);
              }

              me.rowSelected.data = me.datax[currentIndex];
              me.rowSelected.index = currentIndex;
              me.adjustScroll(currentIndex, tr, true);
              e.preventDefault();
            }
            break;
          case 32: //space
            event.target.focus();
            if (
              me.shortkeyQuickSelectedData &&
              me.shortkeyQuickSelectedData.length > 0
            ) {
              me.shortkeyQuickSelectedData.forEach((item) => {
                me.clickMultiple(item);
              });
            } else {
              me.clickMultiple(me.datax[currentIndex]);
            }
            e.preventDefault();
            break;
        }
      } else {
        switch (e.which) {
          case 40: //down
            if (currentIndex < me.datax.length - 1 && !e.altKey) {
              me.shortkeyQuickSelectedData = [];
              tr = this.$el.querySelector(
                `.ms-tbody.data tr[indexRow='${currentIndex}']`
              );
              tr.nextElementSibling.querySelector("td").click();
              currentIndex++;
              me.indexOfRowFocused = currentIndex;
              event.target.focus();
              me.rowSelected.data = me.datax[currentIndex];
              me.rowSelected.index = currentIndex;
              me.adjustScroll(currentIndex, tr, false);
              e.preventDefault();
            }
            break;
          case 38: //up
            if (currentIndex > 0 && !e.altKey) {
              me.shortkeyQuickSelectedData = [];
              tr = this.$el.querySelector(
                `.ms-tbody.data tr[indexRow='${currentIndex}']`
              );
              tr.previousElementSibling.querySelector("td").click();
              currentIndex--;
              me.indexOfRowFocused = currentIndex;
              event.target.focus();
              me.rowSelected.data = me.datax[currentIndex];
              me.rowSelected.index = currentIndex;
              me.adjustScroll(currentIndex, tr, true);
              e.preventDefault();
            }
            break;
          case 32: //space
            event.target.focus();
            if (
              me.shortkeyQuickSelectedData &&
              me.shortkeyQuickSelectedData.length > 0
            ) {
              let checkbox = me.$el.querySelectorAll(
                '.ms-tr.multi-row-selected .multiple-cell input[type="checkbox"]'
              );
              let checked = me.$el.querySelectorAll(
                '.ms-tr.multi-row-selected .multiple-cell input[type="checkbox"]:checked'
              );
              if (checked.length == 0 || checked.length == checkbox.length) {
                checkbox.forEach((item) => {
                  item.click();
                });
              } else {
                checkbox.forEach((item) => {
                  if (!item.checked) {
                    item.click();
                  }
                });
              }
            } else {
              me.clickMultiple(me.datax[currentIndex]);
            }
            e.preventDefault();
            break;
        }
      }
    },
    quickSelected(e) {
      let me = this;
      let oldIndex = me.oldIndexOfRowFocused || 0;
      if (e.shiftKey) {
        me.shortKeyForQuickSelect = true;
        let trEvent = e.target.closest(".ms-tr");
        let newIndex = trEvent.getAttribute("indexrow");
        let start = oldIndex >= newIndex ? newIndex : oldIndex;
        let end = oldIndex >= newIndex ? oldIndex : newIndex;
        me.shortkeyQuickSelectedData = [];
        for (start; start <= end; start++) {
          me.shortkeyQuickSelectedData.push(me.datax[start]);
        }
      }
      if (e.ctrlKey) {
        me.shortKeyForQuickSelect = true;
        let trEvent = e.target.closest(".ms-tr");
        let newIndex = trEvent.getAttribute("indexrow");
        if (!me.shortkeyQuickSelectedData.includes(me.datax[oldIndex])) {
          me.shortkeyQuickSelectedData.push(me.datax[oldIndex]);
        }
        if (me.shortkeyQuickSelectedData.includes(me.datax[newIndex])) {
          me.shortkeyQuickSelectedData.remove(me.datax[newIndex]);
        } else {
          me.shortkeyQuickSelectedData.push(me.datax[newIndex]);
        }
      }

      document.onkeydown = function () {
        me.$el.classList.add("user-selected-none");
      };
      document.onkeyup = function () {
        me.shortKeyForQuickSelect = false;
        me.$el.classList.remove("user-selected-none");
      };
      document.onmouseup = function () {
        if (!me.shortKeyForQuickSelect) {
          me.shortkeyQuickSelectedData = [];
        }
      };
    },
    destroyQuickSelected(e) {
      let me = this;
      if (me.shortKeyForQuickSelect) {
        me.shortKeyForQuickSelect = false;
      }
    },

    //Sự kiện ấn vào nút chọn tất cả bên trên header
    //TDNGHIA 8/10/2021 click vào multi box
    //Nếu đang là temp thì bỏ tick hết, nếu đang là tick thì cũng bỏ tick hết, nếu đang trống thì tick hết
    changeCheckedMultiple() {
      const me = this;

      let VModel = me.value == null ? [] : [...me.value];
      //Nếu đang check thì bỏ tick hết
      if (me.isCheckedMultiple || me.isTempState) {
        let data = me.datax.filter((i) => !i.isDisabledCheckBox);
        data.forEach((dataRow) => {
          if (VModel.includes(dataRow)) {
            VModel.remove(dataRow);
          }
        });
      } else {
        //Nếu đang rỗng thì được tick hết
        let data = me.datax.filter((i) => !i.isDisabledCheckBox);
        data.forEach((dataRow) => {
          if (!VModel.includes(dataRow)) {
            VModel.push(dataRow);
          }
        });
      }

      //Hàm này là bắn ra baselistpopup để ẩn hiện tick chọn,...(selectionChange)
      me.$emit("input", VModel);

      //Nếu đang là trạng thái trung gian thì prevent để không bị tick vào input
      if (me.isTempState) {
        event.preventDefault();
      }
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
    /**
     * Gán filter mặc định cho tất cả các cột column
     */
    setDefaultFilterAllColumn() {
      const me = this;
      let columns = me.columnx;
      for (let i = 0; i < columns.length; i++) {
        me.setDefaultFilter(columns[i]);
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
        case FormatType.Progress:
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
                property: column.isExtData
                  ? `JSON_UNQUOTE(JSON_EXTRACT(ExtData, '$.${column.dataField}'))`
                  : column.dataField,
                operator: me.$ms.enum.FilterHeader.GreaterThanEquals,
                value: column.filter.from,
                operand: "and",
                childrens: [
                  {
                    property: column.isExtData
                      ? `JSON_UNQUOTE(JSON_EXTRACT(ExtData, '$.${column.dataField}'))`
                      : column.dataField,
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
                property: column.isExtData
                  ? `JSON_UNQUOTE(JSON_EXTRACT(ExtData, '$.${column.dataField}'))`
                  : column.dataField,
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
                  property: column.isExtData
                    ? `JSON_UNQUOTE(JSON_EXTRACT(ExtData, '$.${column.dataField}'))`
                    : column.dataField,
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
                      property: column.isExtData
                        ? `JSON_UNQUOTE(JSON_EXTRACT(ExtData, '$.${column.dataField}'))`
                        : column.dataField,
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
                      property: column.isExtData
                        ? `JSON_UNQUOTE(JSON_EXTRACT(ExtData, '$.${column.dataField}'))`
                        : column.dataField,
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

    styleColumn(col, dataRow, styleObject) {
      this.$emit("styleColumn", col, dataRow, styleObject);
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
        item.formatType != this.$ms.enum.FormatType.Enum &&
        item.formatType != this.$ms.enum.FormatType.FilterStateGrid //TDNGHIA case thêm trường hợp này để vẽ filter trạng thái grid
      ) {
        return "0";
      }
      if (item.filter.operator == this.$ms.enum.FilterHeader.Between) {
        let valueFrom = this.$options.filters.formatData(item.filter.from, {
          formatType: item.formatType,
          enumName: item.enum,
          dataRow: {},
        });
        let valueTo = this.$options.filters.formatData(item.filter.to, {
          formatType: item.formatType,
          enumName: item.enum,
          dataRow: {},
        });
        return this.$t("i18nBaseForm.Filter.OperatorBetween").format(
          valueFrom,
          valueTo
        );
      }
      let value = this.$options.filters.formatData(item.filter.value, {
        formatType: item.formatType,
        enumName: item.enum,
        dataRow: {},
      });
      return ": " + value;
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

    /**
     * thêm hàm thiết lập cột ẩn hiện cột trên grid để có thể gọi từ component sử dụng  grid
     * pvduy 02/04/2021
     */
    setColumnVisible(field, visible) {
      const me = this;
      let column = null;
      for (let i = 0; i < me.columns.length; i++) {
        let col = me.columns[i];
        if (col.dataField === field) {
          column = col;
          column.visible = visible;
          break;
        }
      }
      me.initColumns(me.columns);
    },
    //Lấy element scroll
    //Created by LTDAT (16.06.2020)
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
        `.ms-tbody.data tr[indexRow='${typeAheadPointer}']`
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
      }

      if (idProperty) {
        let arrModel = [];

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

        me.$emit("input", arrModel);
      }
    },

    /*
     * Hàm mở popup configcolumn
     * TDNGHIA 1/10/2021
     */
    openConfigColumBox() {
      const me = this;

      me.showingConfigColumnBox = !me.showingConfigColumnBox;
    },

    /***
     * Init lại column grid
     * TDNGHIA 10/3/2021
     */
    layoutOnChange(newLayout) {
      const me = this;

      me.initColumns(newLayout);
    },

    /**
     * Đóng configbox (bắt sự kiện từ ms-config-column)
     * TDNGHIA 10/3/2021
     */
    closeConfigBox() {
      const me = this;

      me.showingConfigColumnBox = false;
    },

    getConfigDefault() {
      const me = this;

      me.$emit("getConfigDefault");
    },
  },
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msGridViewer.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msGridViewer.scss';
// }

@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msGridViewer.scss";
</style>
