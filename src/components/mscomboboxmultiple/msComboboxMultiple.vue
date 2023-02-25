<template>
  <div class="ms-combobox ms-editor">
    <div v-if="title && showTitle" class="combo-title flex">
      <div class="combo-title__text">
        {{ title }}
      </div>
    </div>
    <div
      class="ms-combobox flex-row border ms-combobox-input"
      :class="{ error: errorProvider.isValid, disabled: disabled }"
    >
      <div
        ref="container"
        class="selected-options flex"
        :style="{ 'max-height': maxSelectedHeight + 'px' }"
        @click="controlClick"
      >
        <div
          v-for="(item, index) in value"
          :key="index"
          class="selected-item flex-row"
        >
          <div class="item-text mr-2">
            {{ item[displayField] }}
          </div>
          <div
            class="item-icon mi mi-16 mi-close--small mr-2"
            @click.stop="deSelect(item)"
          />
        </div>
        <input
          ref="input"
          v-model="internalText"
          class="ms-input"
          :disabled="disabled"
          :placeholder="value && value.length < 1 ? placeholder : ''"
          :readonly="readonly"
          :class="{
            readOnly: readonly,
            hide: (disabled || readonly) && value && value.length > 0,
          }"
          :style="inputStyle"
          v-on="listeners"
          @keydown.esc="onEsc"
          @keydown.enter="onEnter"
          @keydown.f3="quickSearchClick"
          @keydown.f9="showQuickAdd"
        />
        <!-- @keydown.f3="showQuickAdd" -->
      </div>
      <div v-if="errorProvider.isValid" class="icon24 error error-icon" />
      <div
        class="icon-combo--dropdown multiple"
        :class="{ disabled: disabled }"
        @click="triggerClick"
      />
      <div
        v-if="quickSearch"
        class="quickSearch"
        :class="{ hide: disabled || readOnly }"
        @click="quickSearchClick"
        @keydown.enter="quickSearchClick"
      />
    </div>
    <div v-if="errorProvider.isValid" class="error-text">
      {{ errorProvider.message }}
    </div>
    <div>
      <ms-combo-box-dropdown
        v-if="expanded"
        ref="dropdownPanel"
        :topx="dropdownTopx"
        :leftx="dropdownLeftx"
        :max-widthx="dropdownMaxWidthx"
        :min-widthx="dropdownMinWidthx"
        :columnx="columns"
        :combo-type="comboType"
        :empty-text="null"
        :highligh-index="typeAheadPointer"
        :scroll-top.sync="dropdownScrollTop"
        :loading="loading"
        :show-empty-text="
          internalDataSource.length === 0 &&
          !!quickAdd &&
          (queryMode !== 'remote' || !!lastRequestParam)
        "
        :maxItemsDisplay="maxItemsDisplay"
        @scrollend="dropdownScrollEnd"
        @addNew="showQuickAdd"
      >
        <!-- <MsRecycleScroller
					ref="scroller"
					:style="styleScroller"
					:items="internalDataSource"
					:itemSize="itemSize"
					:keyField="keyField || valueField"
					:emitUpdate="true"
					:buffer="0"
					:visiableIndex="typeAheadPointer"
					@visible="onScrollerVisible"
					@update="onScrollerUpdate"
				> -->
        <!-- :visiableIndex="typeAheadPointer" -->
        <!-- @visible="onScrollerVisible" -->
        <template v-for="(item, index) in internalDataSource">
          <ms-combo-box-item
            :key="index"
            :combo-type="comboType"
            :item="item"
            :columnx="columns"
            :value-field="valueField"
            :display-field="displayField"
            :is-selected="
              value.filter(
                (i) =>
                  i[valueField] == item[valueField] || i == item[valueField]
              ).length > 0
            "
            :class="{
              'ms-combobox-item--highlight': typeAheadPointer == index,
            }"
            @click="onItemClick(item, $event)"
          />
          <!-- :removeButton="hasRemoveItemButton" -->
          <!-- :class="{'combobox-item--highlight': (typeAheadPointer == index)}" -->
          <!-- @click="onItemClick(item,$event)"
					@removeItem="onRemoveItemClick(item)"-->
          <!-- :align="internalAlign" -->
        </template>
        <!-- </MsRecycleScroller> -->
      </ms-combo-box-dropdown>
    </div>
  </div>
</template>
<script>
import MsComboBoxDropdown from "./MsComboBoxDropdownMulti.vue";
import MsComboBoxItem from "./MsComboBoxMultipleItem.vue";
// import MsRecycleScroller from "@/components/msvirtualscroller/MsRecycleScroller";
import commonFunc from "@/commons/commonFunction.js";
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
import popupUtil from "@/commons/popupUtil";
import commonFn from "@/commons/commonFunction.js";
import { filter } from "@/mixins/common/filter";
import { validateCombobox } from "@/mixins/component/validateCombobox";

export default {
  name: "MsComboboxMultiple",
  components: {
    MsComboBoxDropdown,
    // MsRecycleScroller,
    MsComboBoxItem,
  },
  extends: msBaseComponent,
  mixins: [filter, validateCombobox],
  props: {
    value: {
      default: () => [],
    },
    placeholder: {
      default: null,
      type: [Number, String],
    },
    maxItemsDisplay: {
      default: 5,
      type: Number,
    },
    columns: {
      type: Array,
      default: () => [],
    },
    /**
     * Trường làm value
     * CreatedBy LTDAT 15.06.2020
     */
    valueField: {
      type: String,
      default: null,
    },
    keyField: {
      // default: '__vKeyValue',
      type: String,
    },
    /**
     * Trường làm text display
     * CreatedBy LTDAT 15.06.2020
     */
    displayField: {
      type: String,
      default: null,
    },
    //Dữ liệu của combobox
    data: {
      default: () => [],
      type: Array,
    },
    //Độ rộng của 1 item
    itemSize: {
      default: 36,
      type: Number,
    },
    //Chỉ nhận giá trị có trong danh sách
    forceSelection: {
      default: true,
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
    //Không cho phép chọn trường là cha
    notSelectionParent: {
      default: false,
      type: Boolean,
    },
    //Độ rông của dropdown tính bằng px
    dropdownWidth: {
      default: null,
      type: [String, Number],
    },
    //Store xử lý dữ liệu trên liên quan đến data trong grid
    store: {
      default: null,
    },
    //Mode query lấy dữ liệu từ server hay client
    queryMode: {
      type: String,
      default: "remote",
    },
    //Gán giá trị text lúc ban đầu
    initText: {
      default: null,
      type: [Number, String, Array],
    },
    //Trạng thái có phân trang hay không
    pagination: {
      default: false,
      type: Boolean,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    /**
     * Câu hình quicksearch
     * pvduy 08/02/2020
     */
    quickSearch: {
      type: String,
    },
    /**
     * Dữ liệu truyền kèm quicksearch
     * pvduy 08/02/2020
     */
    quickSearchParam: {
      type: Object,
      default: null,
    },
    /**
     * Câu hình add
     */
    quickAdd: {
      type: String,
      default: null,
    },
    showTitle: {
      type: Boolean,
      default: false,
    },
    /**
     * Danh sách các trường dữ liệu lấy về
     */
    title: {
      type: String,
      default: null,
    },
    /**
     * custom lại tham số filter
     */
    buildFilter: {
      type: Function,
      default: null,
    },
    //Là combotree hay không
    isTree: {
      default: false,
      type: Boolean,
    },
    /**
     * size paging
     */
    pageSize: {
      type: Number,
      default: 10,
    },
    // //Tổng số bản ghi
    // pageTotal: {
    //   default: 0,
    //   type: Number,
    // },
    /**
     * Danh sách các trường dữ liệu lấy về
     * pvduy 18/05/2021
     */
    requestField: {
      type: String,
      default: null,
    },
    /**
     * Giá trị bản ghi tất cả
     */
    selectAllValue: {
      type: [Number, String],
      default: -1,
    },
    /**
     * Text hiển thị tất cả
     */
    selectAllText: {
      type: String,
      default: null,
    },
    /**
     * Có hiển thị bản ghi tất cả không
     */
    showSelectAll: {
      type: Boolean,
      default: false,
    },
    autoLoad: {
      default: false,
      type: Boolean,
    },
    //Danh dau combo tree thì kéo xuống vẫn load tiếp dữ liệu
    scrollToLoad: {
      type: Boolean,
      default: false,
    },

    //Tự chọn item khi tìm kiếm NTTHANH1
    autoSelectItem: {
      type: Boolean,
      default: true,
    },

    //tự xóa input khi nhập NTTHANH1
    isResetInput: {
      type: Boolean,
      default: true,
    },

    /**
     * chiều cao tối đa của vùng select item
     */
    maxSelectedHeight: {
      type: Number,
      default: 100,
    },
  },
  data() {
    const me = this;
    me.initStaticData();
    return {
      internalDataSource: [],
      internalText: "",
      expanded: false,
      dropdownTopx: 0,
      dropdownLeftx: 0,
      internalSelectedItem: null,
      typeAheadPointer: -1,
      dropdownScrollTop: 0,
      /**
       * Đang load dữ liệu
       */
      loading: false,
      /**
       * Tham số load dữ liệu lần gần nhất
       */
      lastRequestParam: null,
    };
  },
  computed: {
    listeners() {
      const me = this;
      return {
        input: (event) => me.onInput(event),
        focus: (event) => me.onFocus(event),
        change: (event) => me.onChange(event),
        blur: (event) => me.onBlur(event),
        keydown: (event) => me.onKeydown(event),
      };
    },
    //Tính độ rộng của dropdown combobox để scroll
    styleScroller() {
      const me = this;
      return { "max-height": me.maxItemsDisplay * me.itemSize + "px" };
    },
    inputStyle() {
      let width = 15;
      if (this.internalText) {
        width += this.internalText.length * 13;
      }

      return {
        width: width + "px",
      };
    },
    /**
     * Có hiển thị quickadd không
     */
    hasShowQuickAdd() {
      const me = this;
      let res = false;

      if (me.internalDataSource.length === 0 && me.quickAdd) {
        if (me._allData) {
          res = true;
        } else if (me.lastRequestParam) {
          res = true;
        }
      }

      return res;
    },
  },
  watch: {
    /**
     * Set lại giá trị hiển thị khi giá trị của biến initText thay đổi
     */
    initText: {
      handler(newVal) {
        let me = this;
        me.setInitText(newVal);
      },
      deep: true,
      immediate: true,
    },
    /**
     * Nếu giá trị VModel của combo thay đổi thì gán lại giá trị mới và select vào item tương ứng có trong data
     */
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;
        let checkNew = newVal || [],
          checkOld = oldVal || [];

        if (newVal == null) {
          this.value = [];
        }

        if (Array.isArray(newVal) && newVal.length > 0) {
          for (let i = 0; i < newVal.length; i++) {
            let item = newVal[i];
            if (
              typeof item != "object" &&
              me.internalDataSource &&
              me.internalDataSource.length > 0
            ) {
              let selected = me.internalDataSource.find(
                (x) => x[me.valueField] == item
              );

              newVal[i] = selected;
            }
          }
        }

        // if (checkNew.length !== checkOld.length) {
        //   me.validate(me);
        // }

        if (Array.isArray(newVal) && newVal.length > 0) {
          for (let i = 0; i < newVal.length; i++) {
            let item = newVal[i];
            if (typeof item == "object") {
              if (
                item[me.valueField] === me.selectAllValue &&
                !item[me.displayField]
              ) {
                item[me.displayField] = me._selectAllText;
                break;
              }
            }
          }
        } else {
          if (me.isResetInput) {
            me.reset();
          }
        }
      },
    },
    data: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;

        if (me.loading) {
          me.loading = false;

          me.$nextTick(() => {
            me.doHightlightItem();
          });
        }

        if (newVal == null) {
          //tình huống có thêm/sửa/xóa dữ liệu gốc -> reset để khi expand sẽ load lại dữ liệu
          me.lastQueryString = new Date().getTime();
          me._allData = null;
        } else {
          if (me.queryMode !== "remote") {
            me._allData = newVal;
          }

          if (
            me.internalDataSource != newVal &&
            !(me.internalDataSource.length === 0 && newVal.length === 0)
          ) {
            me.initData();
          }
        }
      },
    },
  },
  //Hàm khởi tạo dữ liệu hook func
  created() {
    const me = this;
    me.initIndex = 0;

    me.initCombo();
    me.initData(me.data);
    if (me.autoLoad) {
      me.doQueryInternal(null, false);
    }
    me.setInitText();
  },
  mounted() {
    const me = this;
    //Debounce query để delay load
    if (me.queryMode != "remote") {
      me.internalQueryDelay = 20;
    }
    me.doQuery = _.debounce(me.doQueryInternal, me.internalQueryDelay);
    if (me.store) {
      me.store.pageAppend = true;
    }

    document.addEventListener("click", me.click_out);

    //init alltext
    me._selectAllText =
      me.selectAllText || me.$t("i18nComponent.Combobox.SelectAllItemText");
  },
  beforeDestroy() {
    const me = this;
    document.removeEventListener("click", me.click_out);
  },
  methods: {
    deSelect(item) {
      let me = this;
      if (me.disabled) {
        return;
      }

      let selectItem = me.mapItemInSource(item, me.value);
      if (selectItem) {
        me.value.remove(selectItem);
      }

      let sourceItem = me.mapItemInSource(item, me.internalDataSource);
      if (sourceItem) {
        sourceItem.isSelected = false;
        me.$emit("deselected", sourceItem);
      }

      me.validate(me);
    },

    /**
     * maping từ bản ghi hiển thị với source
     */
    mapItemInSource(item, source) {
      const me = this;

      if (source && source.length > 0) {
        for (let i = 0; i < source.length; i++) {
          let temp = source[i];
          if (temp[me.valueField] === item[me.valueField]) {
            return temp;
          }
        }
      }

      return null;
    },

    // /**
    //  * Kiểm tra scroll đã đến bản ghi cuối cùng hay chưa
    //  * Nếu load theo kiểu phân trang và số bản ghi trong combo nhỏ hơn tổng số bản ghi thi load tiếp dữ liệu vào store
    //  * @param start: vị trí bắt đầu của view trong vitual scroll
    //  * @param end: vị trí kết thúc của view trong vitual scroll
    //  * Created by LTDAT(30.06.2020)
    //  *  */
    // onScrollerUpdate(start, end) {
    //   const me = this;
    //   if (
    //     me.store &&
    //     end == me.store.getCount() &&
    //     end < me.store.pageTotal &&
    //     start == this.store.getCount() - 5
    //   ) {
    //     this.store.pageAppend = true;
    //     this.store.nextPage();
    //   }
    // },
    /**
     * Set giá trị hiện thị ban đầu cho combobox khi combo chưa có dữ liệu
     * Created by LTDAT(25.06.2020)
     */
    setInitText() {
      const me = this;
      me.internalText = me.initText;
    },
    /**
     * Thực hiện query dữ liệu, có thể từ local hoặc remote tùy theo cấu hình
     * CreatedBy LTDAT 11/12/2019
     */
    doQueryInternal(searchString, expand) {
      let me = this,
        event = { preventDefault: false, sender: me },
        queryString = searchString;
      me.$emit("beforeQuery", event);
      if (event.preventDefault) {
        return false;
      }
      if (me.lastQueryString === queryString && !me.isReload) {
        if (expand) {
          me.expand();
        }
      } else {
        me.dropdownScrollTop = 0;
        me.internalDataSource = [];
        me.lastQueryString = queryString;
        me.querying = true;
        // me.typeAheadPointer = -1;
        if (me.queryMode === "remote" && !me._allData) {
          me.doRemoteQuery(queryString);
        } else {
          me.$nextTick(() => {
            me.doLocalQuery(queryString);
            if (expand && !me.expanded) {
              me.expand();
            }
          });
        }
        me.$props.isReload = false;
      }
    },
    /**
     * Xử lý sau khi query xong dữ liệu
     * CreatedBy LTDAT 24.06.2020
     */
    afterQuery(expand) {
      const me = this;
      me.expand();
      me.typeAheadPointer = me.filterIndexItemByText();
    },
    /**
     * Query dữ liệu api
     * CreatedBy LTDAT 24.06.2020
     */
    doRemoteQuery(queryString, expand) {
      //Build filter,
      let me = this,
        filters = [],
        filterFields = me.filterFields;
      return new Promise((resolve, reject) => {
        if (queryString) {
          let filter = null;
          for (const key in filterFields) {
            if (filterFields.hasOwnProperty(key)) {
              const f = filterFields[key];

              if (filter) {
                filter.childrens.push({
                  property: key,
                  value: queryString,
                  operator: f,
                  operand: "or",
                });
              } else {
                filter = {
                  property: key,
                  value: queryString,
                  operator: f,
                  operand: "and",
                  childrens: [],
                };
              }
            }
          }

          if (filter) {
            filters.push(filter);
          }
        }
        let payload = {};
        // if (me.pagination) {
        payload.skip = 0;
        payload.take = me.pageSize;
        payload.pageAppend = false;
        if (filters.length > 0) {
          payload.filter = filters;
        }
        // if (filters.length > 0) {
        //   payload.filter = me.buildFilterParam(filters);
        // }

        let columns = [me.displayField, me.valueField];
        if (me.columns && me.columns.length > 0) {
          me.columns.forEach((item) => {
            if (item.dataField && columns.indexOf(item.dataField)) {
              columns.push(item.dataField);
            }
          });
        }

        if (me.requestField) {
          me.requestField.split(",").forEach((item) => {
            if (item && columns.indexOf(item)) {
              columns.push(item);
            }
          });
        }

        payload.columns = columns.join(",");
        // }
        me.lastRequestParam = payload;
        if (typeof me.buildFilter == "function") {
          me.buildFilter(payload);
        }
        me.loading = true;
        me.$emit("loadData", payload);
      });
    },
    /**
     * Query dữ liệu local
     * CreatedBy LTDAT 24.06.2020
     */
    doLocalQuery(queryString) {
      const me = this;
      let filterData = me.filterData(queryString);
      if (queryString && me.comboType === 3) {
        let firstItem = filterData[0];

        //thêm cha vào để build cây
        let roots = [];
        let i = 0;
        while (i < filterData.length) {
          let item = filterData[i],
            parent = item.parentNode;

          if (!parent || Array.isArray(parent)) {
            roots.push(item);
          } else if (filterData.indexOf(parent) === -1) {
            filterData.push(parent);
          }
          i++;
        }

        //sắp xếp root theo đúng thứ tự
        if (roots.length > 1) {
          let rs = [];
          for (let i = 0; i < me._allData.length; i++) {
            let item = me._allData[i];
            if (roots.indexOf(item) > -1) {
              rs.push(item);

              if (rs.length === roots.length) {
                roots = rs;
                break;
              }
            }
          }
        }

        //build cây
        let rs = [];
        let fnPush = function (item) {
          rs.push(item);
          if (Array.isArray(item.childNodes)) {
            item.childNodes.forEach((child) => {
              if (filterData.indexOf(child) > -1) {
                fnPush(child);
              }
            });
          }
        };
        roots.forEach((item) => {
          fnPush(item);
        });

        //sắp xếp theo misaCode
        filterData = rs;
      }

      me._filterData = filterData;
      let count = Math.min(me._filterData.length, me.pageSize);
      let ds = [];
      for (let i = 0; i < count; i++) {
        ds.push(me._filterData[i]);
      }
      me.internalDataSource = ds;
    },
    filterData(queryString) {
      const me = this;
      let matchItem = [];

      if (queryString) {
        me._allData.forEach((item) => {
          let valid = false;
          for (let f in me.filterFields) {
            let value = item[f];
            let test = me.testFilter(me.filterFields[f], value, queryString);
            if (test) {
              valid = true;
              break;
            }
          }

          if (valid) {
            matchItem.push(item);
          }
        });
      } else {
        matchItem = me._allData;
      }

      return matchItem;
    },
    /**
     * Lấy chuỗi cần query, trường hợp number thì lấy value bỏ qua ký tự phân cách
     * CreatedBy LTDAT 11/12/2019
     */
    getQueryString() {
      return (this.internalText || "").trim();
    },
    //Click ra ngoài combo đóng combo lại
    //Created by LTDAT 18.06.2020
    click_out(e) {
      const me = this;
      if (
        !commonFunc.hasParent(e.target, me.$el) &&
        me.$refs.dropdownPanel &&
        me.$refs.dropdownPanel.$el &&
        !commonFunc.hasParent(e.target, me.$refs.dropdownPanel.$el) &&
        !e.target.classList.contains("mi-checkbox-active") // pvduy 02/07/2021 thêm điều kiện click vào icon tick thì ko đóng dropdown
      ) {
        me.collapse();
        me.$emit("clickOut");
      }
    },
    //Reset lại các giá trị trong combobox
    reset(commit) {
      const me = this;
      me.internalText = "";
      me.internalSelectedItem = null;
      me.typeAheadPointer = -1;
      me.internalValue = null;
      if (commit) {
        me.$emit("input", []);
      }
    },
    setInternalText(value) {
      const me = this;
      me.internalText = value;
    },
    setValue(value) {
      const me = this;
      me.internalValue = value;
      me.$emit("input", me.internalValue);
    },
    //Sự kiện nhập liệu trên input
    //Created by LTDAT (16.06.2020)
    onInput(e) {
      const me = this;
      if (!me.expanded) {
        me.expand();
      }
      if (!me.internalText) {
        if (me.internalValue) {
          let metaData = {
            oldData: me.internalSelectedItem,
            newData: null,
          };
          me.$emit("selected", metaData);
        }
        me.reset(true);
      }

      /**
       * tvloi 28.05.2021
       * Lỗi chung. Mote query local thì ko tự query được giá trị ko có trong danh sách mà đang hiên thị hết
       * */
      me.doQuery(me.internalText, true);

      //TVLOI 28.05.2021 Bỏ checkmode ở đây do trong doQuery đã checkmode để tìm kiếm đúng rồi. => Phần check headPointer ở đây không cần thiết.

      // if (me.queryMode == "remote") {
      //   me.doQuery(me.internalText, true);
      // } else {
      //   me.typeAheadPointer = me.filterIndexItemByText();
      // }

      me.doHightlightItem(true);
      me.adjustScroll();

      // if(itemSelected)
      // {
      //     onItemClick(itemSelected,e);
      // }
    },
    //Sự kiện focus vào input
    //Created by LTDAT (16.06.2020)
    onFocus(e) {
      const me = this;
      me.focused = true;
    },
    //Sự kiện change input
    //Created by LTDAT (16.06.2020)
    onChange(e) {
      const me = this;
      if (me.focused) {
        if (me.forceSelection && me.typeAheadPointer < 0) {
          me.internalText = null;
          // me.reset(true);
        } else if (
          me.typeAheadPointer >= 0 &&
          me.internalDataSource.length > me.typeAheadPointer
        ) {
          if (me.autoSelectItem) {
            me.setInternalItem(me.internalDataSource[me.typeAheadPointer]);
          }
        }
      }
    },
    //Sự kiện blur input
    //Created by LTDAT (16.06.2020)
    onBlur(e) {
      const me = this;
      me.focused = false;
      //bnduc 28.5.2021: nếu thoát khỏi control -> xóa text đang hiển thị đi
      if (me.internalText) {
        setTimeout(() => {
          me.validate(me.value);
          if (!me.focused) {
            me.internalText = null;
          }
        }, 150);
      }
    },
    //Sự kiện keydown input
    //Created by LTDAT (16.06.2020)
    onKeydown(e) {
      const me = this;
      switch (e.which) {
        case 40:
          if (!me.expanded) {
            me.expand();
          } else if (me.typeAheadPointer < me.getTotalData() - 1) {
            if (me.notSelectionParent) {
              let typeAheadPointerNext = me.typeAheadPointer + 1;
              for (let i = typeAheadPointerNext; i < me.getTotalData(); i++) {
                me.typeAheadPointer++;
                me.adjustScroll(typeAheadPointerNext);
                if (!me.internalDataSource[i].isParent) {
                  break;
                }
              }
            } else {
              me.typeAheadPointer++;
              me.adjustScroll();
            }
          }
          break;
        case 38:
          if (me.expanded) {
            if (me.typeAheadPointer > 0) {
              if (me.notSelectionParent) {
                let typeAheadPointerPre = me.typeAheadPointer - 1;
                for (let i = typeAheadPointerPre; i > 0; i--) {
                  me.typeAheadPointer--;
                  me.adjustScroll(me.typeAheadPointer);
                  if (!me.internalDataSource[i].isParent) {
                    break;
                  }
                }
              } else {
                me.typeAheadPointer--;
                me.adjustScroll();
              }
            }
          }
          break;
        case 13: //enter
          event.preventDefault();
          if (me.typeAheadPointer >= 0) {
            me.setInternalItem(me.internalDataSource[me.typeAheadPointer]);
          }
          me.collapse();
          break;
        case 9: //tab
          if (me.expanded) {
            me.collapse();
          }
          break;
      }
    },
    getTotalData() {
      const me = this;
      return me.internalDataSource.length;
    },
    //Bôi màu hightlight cho item
    doHightlightItem(appendSource = true) {
      const me = this;
      let index = -1;

      if (me.internalDataSource && me.internalDataSource.length > 0) {
        index = -1;

        if (me.internalValue != null && me.internalValue != undefined) {
          let sources = me._allData || me.internalDataSource;

          //Trước khi load tính toán lại typeAheadPointer nếu cần thiết để scroll di chuyển về dúng vị trí khi show scroller lên
          //Tìm vị trí selectedItem trong source, không lấy selectedIndex vì có thể không chính xác khi source thay đổi
          for (let i = 0; i < sources.length; i++) {
            let item = sources[i];
            if (item[me.valueField] === me.internalValue) {
              index = i;
              break;
            }
          }

          if (index >= me.internalDataSource.length && appendSource) {
            for (let i = me.internalDataSource.length; i <= index; i++) {
              me.internalDataSource.push(sources[i]);
            }
          }
        }

        if (index === -1 && me.internalText) {
          let lowerText = me.internalText.toLowerCase();
          for (let i = 0; i < me.internalDataSource.length; i++) {
            let itemValue = me.internalDataSource[i][me.displayField];
            if (
              typeof itemValue === "string" &&
              itemValue.toLowerCase().indexOf(lowerText) > -1
            ) {
              index = i;
              break;
            }
          }
        }

        if (index === -1) {
          index = 0;
        }
      }

      me.typeAheadPointer = index;
    },
    //Tìm kiếm item trong list
    //Created by LTDAT(16.06.2020)
    filterIndexItemByText() {
      const me = this;
      let filters = me.filterFields,
        value = me.internalText,
        index = -1;
      if (filters) {
        index = me.internalDataSource.findIndex((item, _index) => {
          let ret = false;
          for (const key in filters) {
            if (filters.hasOwnProperty(key)) {
              const s = filters[key];
              if (s == "contains") {
                ret =
                  item[key] &&
                  item[key].toString() &&
                  item[key]
                    .toString()
                    .toLowerCase()
                    .contains(value.toLowerCase());
              } else {
                ret =
                  item[key] &&
                  item[key].toString() &&
                  item[key]
                    .toString()
                    .toLowerCase()
                    .startsWith(value.toLowerCase());
              }
              if (ret) {
                break;
              }
            }
          }
          return ret;
        });
      }
      me.adjustScroll();
      return index;
    },
    //Lấy cột filter để tìm kiếm local
    //Created by LTDAT 16.06.2020
    getFilterFields() {
      let filter = {};

      if (this.columns && this.columns.length > 0) {
        for (let i = 0; i < this.columns.length; i++) {
          const col = this.columns[i];
          if (!col.filterOperator) {
            col.filterOperator = "contains";
          }
          if (col.dataField && col.filterOperator) {
            if (this.filterColumns && this.filterColumns.length > 0) {
              this.filterColumns.forEach((e) => {
                if (!filter.hasOwnProperty(e)) {
                  filter[e] = col.filterOperator;
                }
              });
            } else {
              filter[col.dataField] = col.filterOperator;
            }
          }
        }
      } else {
        filter[this.displayField] = "contains";
      }
      return filter;
    },
    //Lấy element scroll
    //Created by LTDAT (16.06.2020)
    getScroller() {
      if (this.expanded) {
        // return this.$refs["scroller"];
        let dd = this.$refs["dropdownPanel"];
        if (dd && dd.$el && typeof dd.$el.querySelector === "function") {
          return dd.$el.querySelector(".scroller");
        }
      }
      return null;
    },
    /**
     * Di chuyển view đến bản ghi nếu cần
     * @param {Bản ghi cần view} index
     * CreatedBy LTDAT 16.06.2020
     */
    adjustScroll(typeAheadPointer = this.typeAheadPointer) {
      let scroller = this.getScroller();
      if (scroller) {
        // scroller.scrollToItem(typeAheadPointer, true);
        scroller.scrollTop = 35 * typeAheadPointer;
      }
    },
    onScrollerVisible() {
      const me = this;
      me.adjustScroll();
    },
    //Hàm xử lý khi chọn item trên dropdown
    //Created by LTDAT(16.06.2020)
    onItemClick(item, event) {
      const me = this;
      me.setInternalItem(item);
      me.$refs.input.focus();
    },
    //Set giá trị được chọn
    setInternalItem(item, fromQuickSearch) {
      const me = this;
      if (me.notSelectionParent && item.isParent) {
        return;
      }

      let VModel = me.value;
      if (!VModel) {
        VModel = [];
      }

      let metaData = {
        oldData: me.z,
        newData: item,
        obdListData: VModel,
        newListData: [...VModel, item],
      };
      me.internalSelectedItem = item;
      me.internalValue = item[me.valueField];
      let itemInLists = null;
      if (!fromQuickSearch) {
        for (let i = 0; i < VModel.length; i++) {
          let temp = VModel[i];
          if (temp[me.valueField] == item[me.valueField]) {
            itemInLists = temp;
            break;
          }
        }
      }

      if (itemInLists) {
        VModel.remove(itemInLists);
        item.isSelected = false;
      } else {
        let check =
          VModel.filter((i) => {
            i[me.valueField] == item[me.valueField];
          }) || [];
        if (check.length == 0) {
          let selectItem = {},
            fields = [me.valueField, me.displayField];
          fields.forEach((field) => {
            selectItem[field] = item[field];
          });
          selectItem.isSelected = true;
          VModel.push(selectItem);
          item.isSelected = true;
        }
      }

      me.$emit("input", VModel);
      me.internalText = null;
      // me.typeAheadPointer = me.findIndexItem(item);
      // me.collapse(); -- pvduy 03/07/2021: tại sự kiện chọn form thì ko đóng dropdown
      me.$emit("selected", metaData);
      me.scrollToBottom();
      me.validate(me);
      me.changeDropdownPosition();
    },
    scrollToBottom() {
      const el = this.$el.querySelector(".ms-combobox.border");
      this.$nextTick(() => {
        el.scrollTop = el.scrollHeight + 5000;
      });
    },
    //Tìm vị trị của item trong data
    findIndexItem(item) {
      const me = this;
      return me.internalDataSource.findIndex((_item) => {
        return _item == item;
      });
    },
    //Khởi tạo dữ liệu tĩnh mặc định
    initStaticData() {
      const me = this;
      me.comboType = 1;
      me.internalDataSource = [];
      me.internalQueryDelay = 200;
      me.filterFields = me.getFilterFields();
      me.focused = false;
      me.internalValue = null;
      me.firstExpand = true;
    },
    /**
     * thêm bản ghi chọn tất cả vào source
     */
    appendSelectAllItem() {
      const me = this;
      if (!me.showSelectAll) {
        return;
      }
      let firstItem = me.internalDataSource[0];
      if (firstItem && firstItem[me.valueField] !== me.selectAllValue) {
        let allItem = {};
        allItem[me.valueField] = me.selectAllValue;
        allItem[me.displayField] = me._selectAllText;

        // vvkiet - 24.06.2021: Bổ sung text Tất cả cho tất cả các cột
        me.columns.forEach((column) => {
          allItem[column.dataField] = me._selectAllText;
        });

        me.internalDataSource.unshift(allItem);
      }
    },
    //Khởi tạo dữ liệu
    initData() {
      const me = this;
      if (me.store) {
        me.internalDataSource = [...me.store.data.items];
        me.appendSelectAllItem();
      } else if (
        me.lastRequestParam &&
        me.lastRequestParam.pageAppend &&
        me.scrollDoing
      ) {
        me.scrollDoing = false;
        me.internalDataSource.append(me.data);
      } else {
        me.internalDataSource = [...me.data];

        me.appendSelectAllItem();
      }

      if (me.keyField && me.keyField !== me.valueField) {
        commonFn.genVKeyValue(me.internalDataSource, me.keyField);
      }
      //Nếu là combo dạng tree
      if (me.comboType == 3) {
        for (let index = 0; index < me.internalDataSource.length; index++) {
          const element = me.internalDataSource[index];

          delete element.childNodes;
        }
        let data = JSON.parse(JSON.stringify(me.internalDataSource));
        let dataTree = commonFn.nomalizeDataTree(
          data,
          me.idProperty || me.valueField,
          me.parentIdProperty
        );
        let treeData = commonFn.getBodyData(dataTree, true);

        if (me.scrollToLoad) {
          me.internalDataSource = treeData;
        } else {
          if (treeData.length > 0) {
            me._allData = treeData;
          } else {
            me.internalDataSource = [];
            me._allData = null;
          }
        }
      }

      me.initValue();

      if (me._allData) {
        me.doLocalQuery(me.lastQueryString);
      }
    },

    initValue() {
      const me = this;

      if (me.value && me.value.length > 0) {
        for (let i = 0; i < me.value.length; i++) {
          let item = me.value[i];
          if (
            typeof item != "object" &&
            me.internalDataSource &&
            me.internalDataSource.length > 0
          ) {
            let selected = me.internalDataSource.find(
              (x) => x[me.valueField] == item
            );

            me.value[i] = selected;
          }
        }
      }
    },
    /**
     * Khởi tạo combo
     *
     * @author hngiap - 01.09.2019
     * 1 là combo không có columns (ComboEditor)
     * 2 là combo có columns
     * 3 là combo tree
     */
    initCombo() {
      let me = this;
      if (me.isTree) {
        me.comboType = 3;
      } else if (me.columns && me.columns.length !== 0) {
        me.comboType = 2;
      } else {
        me.comboType = 1;
      }
    },
    //Đóng mở combobox
    expand() {
      const me = this;

      me.$emit("beforeExpand");
      // vvkeit - 06.04.2021: 89823 - Lỗi chung: Lỗi trên form điều chuyển hàng loạt dưới bảng chi tiết khi đã chọn tài sản thì đang không xổ combo để chọn tiếp
      // me.$refs.input.focus();
      me.changeDropdownPosition();
      me.doHightlightItem();

      //đặt nextick để tránh lỗi render dom của combobox tree khi chọn item từ dropdown
      me.$nextTick(() => {
        me.expanded = true;
      });
    },
    /**
     * Hàm set vị trí cho dropdown menu khi expand
     * TODO: Chưa xử lý khi có scroll
     */
    changeDropdownPosition() {
      let me = this,
        comboEl = me.$el,
        comboElRect = comboEl.getBoundingClientRect(),
        comboMenuEl = me.$el;

      let windowWidth =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      let windowHeight =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;

      me.dropdownLeftx = comboElRect.left;
      me.dropdownTopx = comboElRect.top + comboElRect.height + 2;
      me.dropdownMaxWidthx = me.dropdownMinWidthx = me.dropdownWidth
        ? me.dropdownWidth
        : comboElRect.width;

      // Nếu chạm phải thì align sang trái
      if (comboElRect.left + comboMenuEl.offsetWidth > windowWidth) {
        me.dropdownLeftx = comboElRect.right - comboMenuEl.offsetWidth;
      }

      // Nếu chạm bottom thì align top
      if (
        comboElRect.bottom + me.itemSize * me.maxItemsDisplay + 2 >
        windowHeight
      ) {
        me.dropdownTopx =
          comboElRect.top -
          (me.itemSize *
            Math.min(me.maxItemsDisplay, me.internalDataSource.length) +
            4);
      }
    },
    //Validate required
    validateRequired(value) {
      let selected = this.value;
      // return !!this.$refs.input.value;
      if (!selected || selected.length === 0) {
        return false;
      } else {
        return true;
      }
    },
    controlClick(e) {
      //disable thì không làm gì
      if (this.disabled) {
        return;
      }

      if (e.target === this.$refs.container) {
        e.preventDefault();
        this.$refs.input.focus();
      }
    },
    /**
     * Click vào icon quicksearch
     * pvduy 08/02/2020
     */
    quickSearchClick(e) {
      const me = this;
      if (me.quickSearch) {
        if (me.disabled) {
          return;
        }

        me.expanded = false;

        popupUtil.show(me, me.quickSearch, me.quickSearchParam || {}, {
          /**
           * Sự kiện callback khi chọn item từ form tìm nhanh
           */
          searchSubmit: function (record) {
            //me.setInternalItem(record[0]);
            // if (me.isTree) {
            me.value.removeAll();
            // }
            record.forEach((x) => {
              me.setInternalItem(x, true);
            });
            me.$refs.input.focus();
          },
        });
      }
    },
    /**
     * scroll xuống cuối drowndown -> load thêm dữ liệu
     */
    dropdownScrollEnd() {
      const me = this;

      // if (me.pagination) {
      if (me.queryMode === "remote" && !me._allData) {
        me.scrollDoing = true;
        //remote
        if (me.lastRequestParam && !me.lastRequestParam.end) {
          //TODO bnduc 21.6.2021: ghi nhận tính huống gọi vào đây 2 lần trên máy qc -> thêm kiểm tra này để k lỗi
          if (
            me.lastRequestParam.skip &&
            me.lastRequestParam.skip === me.internalDataSource.length
          ) {
            return;
          }

          let payload = me.lastRequestParam;
          payload.skip = me.internalDataSource.length;
          payload.pageAppend = true;
          me.$emit("loadData", payload);
          // me.$nextTick(() => {
          //   if (me.scrollToLoad) {
          //     for (let index = 0; index < me.internalDataSource.length; index++) {
          //       const element = me.internalDataSource[index];

          //       delete element.childNodes;
          //     }
          //     let data = JSON.parse(JSON.stringify(me.internalDataSource));
          //     let dataTree = commonFn.nomalizeDataTree(
          //       data,
          //       me.idProperty || me.valueField,
          //       me.parentIdProperty
          //     );
          //     let treeData = commonFn.getBodyData(dataTree, true);
          //       me.internalDataSource = treeData;
          //   }
          // });
        }
      } else {
        //local
        let data = me._filterData || me._allData;
        if (data) {
          me.internalDataSource = me.internalDataSource || [];
          let start = me.internalDataSource.length;
          let count = Math.min(data.length, me.pageSize + start);
          for (let i = start; i < count; i++) {
            me.internalDataSource.push(data[i]);
          }
        }
      }
      // }
    },
    /**
     * xử lý phím esc
     */
    onEsc(e) {
      const me = this;

      //ẩn dropdown và stop event nếu đang expand
      if (me.expanded) {
        me.collapse();
        e.preventDefault();
        e.cancel = true;
      }
    },
    /**
     * xử lý phím enter
     */
    onEnter(e) {
      const me = this;

      if (me.expanded && !me.loading && me.internalDataSource.length === 0) {
        me.showQuickAdd();
      }
    },

    /**
     * Mở form thêm nhanh
     */
    showQuickAdd() {
      const me = this;
      if (me.hasShowQuickAdd) {
        if (!me.quickAdd) {
          return;
        }

        me.expanded = false;
        let param = { ...(me.quickSearchParam || {}) };
        if (me.internalText) {
          param.quickAddText = me.internalText;
        }
        popupUtil.show(me, me.quickAdd, param, {
          /**
           * Sự kiện callback khi submit từ form thêm nhanh
           */
          submit: function (result, param, action) {
            //todo
            let record = result.Data;

            if (record) {
              if (me.queryMode === "remote") {
                //append data to source
                me.internalDataSource.push(record);
              } else {
                // me._allData.push(record);
                me.doLocalQuery(null);
              }

              //update value and display
              me.internalSelectedItem = null;
              me.setInternalItem(record);

              me.$nextTick(() => {
                me.validate(me);
              });
            }

            me.$refs.input.focus();
          },
        });
      }
    },

    /**
     * click vào icon dropdown
     */
    triggerClick(e) {
      const me = this,
        expanded = me.expanded;

      //disable thì không làm gì
      if (me.disabled) {
        return;
      }

      if (!expanded) {
        // if (me.pagination) {
        me.doQueryInternal(null, true);
        // } else if (me.firstExpand) {
        //   me.firstExpand = false;

        //   me.doQueryInternal(null, true);
        // }

        me.$emit("beforeExpand");
        // vvkeit - 06.04.2021: 89823 - Lỗi chung: Lỗi trên form điều chuyển hàng loạt dưới bảng chi tiết khi đã chọn tài sản thì đang không xổ combo để chọn tiếp
        // me.$refs.input.focus();
        me.changeDropdownPosition();
        me.doHightlightItem();
      }

      //đặt nextick để tránh lỗi render dom của combobox tree khi chọn item từ dropdown
      me.$nextTick(() => {
        me.expanded = !expanded;
      });

      //focus input
      me.$refs.input.focus();
    },
    /**
     * ẩn dropdown
     */
    collapse() {
      const me = this;
      me.$nextTick(() => {
        me.expanded = false;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msCombobox.scss";
.ms-combobox {
  position: relative;
  .icon-combo--dropdown {
    right: -1px;
  }
}

.ms-combobox-input {
  max-height: 100%;
}

.selected-options {
  overflow: auto;
  // max-height: 100px;
  //   display: flex;
  //   flex-basis: 100%;
  //   flex-grow: 1;
  //   flex-wrap: wrap;
  //   border: 1px solid #e0e0e0;
  //   border-radius: 3.5px;
  //   min-height: 34px;
  //   min-width: 100%;
  //   &:focus-within {
  //     outline: $input-outline;
  //   }
  //   &:hover {
  //     border-color: $input-hover-border-color;
  //   }

  .selected-item {
    border-radius: 4px;
    background-color: #e0e0e0;
    padding: 6px 3px 7px 6px;
    margin: 2px;
    max-width: calc(100% - 4px);
    float: left;

    .item-text {
      font-size: 14px;
      color: #212121;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .item-icon {
      margin-left: 4px;
    }
  }

  .selected-item:not(:last-child) {
    margin-right: 2px;
  }

  .ms-input {
    font-size: 13px;
    text-overflow: ellipsis;
    background-color: transparent;
    border: none;
    padding: 0 0 0 8px;
    height: 34px;
  }
  .ms-input:focus {
    outline: none;
  }
  .ms-input::placeholder {
    font-size: 12px;
    font-style: italic;
    color: $grey;
  }
  .mi-close--small {
    top: 0;
    right: 0;
    cursor: pointer;
    height: 8px;
    width: 8px;
    margin-top: 5px;
    &::before {
      content: "";
      display: block;
      background: transparent url($ms-image-sprites) no-repeat -242px -26px;
      height: 8px;
      width: 8px;
      background-position: -4px -124px;
    }
  }
}
</style>
