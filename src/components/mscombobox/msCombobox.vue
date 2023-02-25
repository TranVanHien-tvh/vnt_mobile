<template>
  <div class="ms-combobox ms-editor">
    <div v-if="title && showTitle" class="combo-title flex">
      <div class="combo-title__text">
        {{ title }}
      </div>
    </div>
    
    <div
      class="flex-row border combo-box-input"
      :class="{ error: errorProvider.isValid, disabled: disabled }"
    >
      <div v-if="leftIcon" :class="['icon24 left-icon', leftIcon]" />
      <v-popover
        offset="5"
        trigger="hover"
        :disabled="!customTooltip || isNullOrEmptyvalue()"
        class="vnt-popover flex"
        :popover-class="getTooltipClass()"
        position="top-left"
      >
        <!-- This will be the content of the popover -->
        <template v-if="customTooltip" slot="popover">
          <MSTooltip
            :custom-tooltip="customTooltip"
            :combobox-value="value"
            :combobox-store="tooltipDataSource"
          />
        </template>
        <input
          ref="input"
          v-model="internalText"
          class="input flex"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readOnly || selectOnly"
          :maxlength="maxLength"
          :class="{ disabled: disabled }"
          v-on="listeners"
          @keydown.esc="onEsc"
          @keydown.enter="onEnter"
          @keydown.f3="quickSearchClick"
          @keydown.f9="showQuickAdd(false, true)"
        />
      </v-popover>
      <div
        v-show="errorProvider.isValid && !isShowText"
        class="icon24 error error-icon"
        :title="errorProvider.message"
      />

      <div
        class="icon-combo--dropdown"
        :class="{ disabled: disabled, 'point-event-none': readOnly }"
        @click="triggerClick"
      />

      <div v-if="isHasComboAdd" class="icon-quickadd" @click="comboQuickAdd" />

      <div
        v-if="quickSearch"
        class="quickSearch"
        :class="{ hide: readOnly || disabled }"
        @click="quickSearchClick"
        @keydown.enter="quickSearchClick"
      />
    </div>
    <div v-if="errorProvider.isValid && isShowText" class="error-text">
      {{ errorProvider.message }}
    </div>
    <ms-combo-box-dropdown
      v-if="expanded"
      ref="dropdownPanel"
      :topx="dropdownTopx"
      :leftx="dropdownLeftx"
      :max-widthx="dropdownMaxWidthx"
      :min-widthx="dropdownMinWidthx"
      :columnx="columns"
      :combo-type="comboType"
      :forceMaxWidth="forceMaxWidth"
      :class="dropdownClass"
      :highligh-index="typeAheadPointer"
      :scroll-top.sync="dropdownScrollTop"
      :loading="loading"
      :show-empty-text="hasShowQuickAdd"
      :max-items-display="maxItemsDisplay"
      @scrollend="dropdownScrollEnd"
      @addNew="showQuickAdd"
    >
      <template v-for="(item, index) in internalDataSource">
        <ms-combo-box-item
          :key="index"
          :combo-type="comboType"
          :item="item"
          :is-selected="item && item[valueField] == value"
          :columnx="columns"
          :value-field="valueField"
          :display-field="displayField"
          :class="{ 'ms-combobox-item--highlight': typeAheadPointer == index }"
          @mousedown="onItemClick(item, $event)"
          :isShowCheckBox="isShowCheckBox"
        />
      </template>
    </ms-combo-box-dropdown>
  </div>
</template>
<script>
import MsComboBoxDropdown from "./MsComboBoxDropdown.vue";
import MsComboBoxItem from "./MsComboBoxItem.vue";
import commonFn from "@/commons/commonFunction.js";
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
import EventBusGlobal, { GlobalEventName } from "@/commons/eventBusGlobal";
import popupUtil from "@/commons/popupUtil";
import i18n from "@/i18ns/i18n";
import messageBox from "@/commons/messageBox";
import _ from "lodash";
import { filter } from "@/mixins/common/filter";
import { setTimeout } from "timers";
import { validateCombobox } from "@/mixins/component/validateCombobox";

export default {
  name: "MsCombobox",
  components: {
    MsComboBoxDropdown,
    MsComboBoxItem,
  },
  extends: msBaseComponent,
  mixins: [filter, validateCombobox],
  inheritAttrs: false,
  props: {
    value: {},
    customTooltip: {
      default: null,
      type: [Object],
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
    //Là combotree hay không
    isTree: {
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
    //Mode query lấy dữ liệu từ server hay client
    queryMode: {
      type: String,
      default: "local",
    },
    remoteFilter: {
      type: Boolean,
      default: false,
    },
    //Gán giá trị text lúc ban đầu
    initText: {
      default: null,
      type: [Number, String],
    },
    // //Combo mặc định chọn bản ghi theo index
    // initIndex: {
    //   default: 0,
    //   type: Number
    // },
    disabled: {
      default: false,
      type: Boolean,
    },
    readOnly: {
      default: false,
      type: Boolean,
    },

    //chỉ cho phép chọn không cho phép nhập text
    selectOnly: {
      default: false,
      type: Boolean,
    },
    autoLoad: {
      default: false,
      type: Boolean,
    },
    display: {},
    mappingField: {
      default: null,
    },
    firstExpandLoad: {
      default: false,
      type: Boolean,
    },
    keyField: {
      // default: '__vKeyValue',
      type: String,
    },
    maxLength: {
      default: null,
      type: Number,
    },
    leftIcon: {
      type: String,
    },
    /**
     * Câu hình quicksearch
     */
    quickSearch: {
      type: String,
    },
    /**
     * Dữ liệu truyền kèm quicksearch
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
    isShowText: {
      type: Boolean,
      default: true,
    },
    /**
     * check quyền với quickadd
     */
    isPermission: {
      type: Boolean,
      default: true,
    },
    //pvduy 17/03/2021: thêm prop rule để có thể custom ở ngoài form
    rules: {
      type: String,
      default: "",
    },
    /*
     * Hàm show ra câu thông báo riêng theo từng trường hợp
     * ví dụ: customWarring {rules:'required', mes: 'Tài sản này là của pvduy'}
     */
    customWarring: {
      type: Object,
      default: null,
    },
    /**
     * Danh sách các trường dữ liệu lấy về
     */
    requestField: {
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

    isReload: {
      type: Boolean,
      default: false,
    },
    /**
     * size paging
     */
    pageSize: {
      type: Number,
      default: 10,
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

    /**
     * Nếu focus thì mới validate
     * @author vvkiet - 18.08.2021
     */
    validateOnFocus: {
      type: Boolean,
      default: false,
    },

    /**
     * Validate khi blur
     * @author NDHUY 06.01.2021
     */
    validateOnBlur: {
      type: Boolean,
      default: true,
    },
    /**
     * Giá trị value cho của giá trị "Tất cả"
     */
    valueAllSelected: {
      type: [Number, String],
      default: -1,
    },
    /**
     * Tên enum của combobox
     */
    nameEnum: {
      type: String,
      default: null,
    },

    /**
     * cờ ẩn hiện nút thêm nhanh bên ngoài combo
     * NMTUAN2 03.11.2021
     */
    isHasComboAdd: {
      type: Boolean,
      default: false,
    },

    /**
     * cờ đế nếu giá trị nhập vào là trống thì sẽ bỏ chọn
     * NMTUAN2 30.12.2021
     */
    allowDeselectItem: {
      type: Boolean,
      default: false,
    },

    /**
     * cờ cho phép luôn giữ lại giá trị nhập
     * NMTUAN2 04.01.2022
     */
    allowFreeText: {
      type: Boolean,
      default: false,
    },

    /**
     * true: bỏ qua chữ hoa/ thường
     * NMTUAN2 04.01.2022
     */
    ignoreCase: {
      type: Boolean,
      default: false,
    },

    /**
     * set typeAheadPointer về -1
     * NTTHANH1
     */
    resetTypeAheadPointer: {
      type: Boolean,
      default: false,
    },
    /**
     * có muốn show check box hay không
     */
    isShowCheckBox: {
      type: Boolean,
      default: true,
    },

    /**
     * có muốn dropdown có độ dài fit với combo thì cho bằng true
     * TDNGHIA 3/3/2021
     */
    forceMaxWidth: {
      type: Boolean,
      default: false,
    },

    /**
     * Combo trong bộ lọc thì phải có trường này
     * NMTUAN3 14/4/2022
     */
    filterName: {
      type: String,
    },
  },
  data() {
    const me = this;
    me.initStaticData();

    return {
      internalDataSource: [],
      internalText: null,
      expanded: false,
      dropdownTopx: 0,
      dropdownLeftx: 0,
      internalSelectedItem: null,
      typeAheadPointer: -1,
      focused: false,
      //ĐVThi  03/03/2021
      //kích thước mặc định của itemSize của combox khi được dùng trên lưới Editor
      gridItemSize: 48,
      tooltipLeft: 0,
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
    /**
     * data source cho tooltip
     * created by ntphong 29/5/2021
     */
    tooltipDataSource() {
      const me = this;
      let dataSource = me.internalDataSource;
      if (me._allData && me._allData.length > 0) {
        dataSource = me._allData;
      }
      return dataSource;
    },
    listeners() {
      const me = this;
      return {
        input: (event) => me.onInput(event),
        focus: (event) => me.onFocus(event),
        change: (event) => me.onChange(event),
        blur: (event) => me.onBlur(event),
        keydown: (event) => me.onKeydown(event),
        click: (event) => me.onClick(event),
      };
    },
    //Tính độ rộng của dropdown combobox để scroll
    styleScroller() {
      const me = this;
      return { "max-height": me.maxItemsDisplay * me.itemSize + "px" };
    },
    /**
     * ĐVThi 03/03/2021 tùy biến lại độ rộng của item Size khi dùng combox trên lưới Editor =48px
     */
    itemSizeCompute() {
      const me = this;
      if (me.$editorClass) {
        return me.gridItemSize;
      } else {
        return me.itemSize;
      }
    },
    /**
     * ĐVThi 03/03/2021 nếu combox mà được dùng trên lưới Editor thì apply thêm class để tùy biến độ rộng
     */
    dropdownClass() {
      if (this.$editorClass) {
        return this.$editorClass;
      }
      return null;
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
    rules: {
      handler(newVal, oldVal) {
        const me = this;
        me.validate(me);
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
    /**
     * Set lại giá trị hiển thị khi giá trị của biến initText thay đổi
     */
    initText: {
      immediate: true,
      handler(newVal, oldVal) {
        let me = this;
        if (newVal || oldVal) {
          let val = newVal ? newVal : oldVal;
          // NMTUAN2 04.01.2021: cho phép lấy giá trị mới nhất
          if (me.allowFreeText) {
            val = newVal ? newVal : "";
          }
          me.setInitText(val);
        }
      },
    },
    /**
     * Kiểm tra nếu text hiện thị thay đổi thi validate
     * Modify by ĐVThi 05/02/2020 truyền thêm me vào validate (me) để khi người dùng chọn giá trị chưa có trong danh mục
        thi báo lỗi
     */
    internalText: {
      handler(newVal, oldVal) {
        const me = this;
        newVal = newVal ? newVal : "";
        oldVal = oldVal ? oldVal : "";
        // vvkiet - 18.08.2021: Thêm điều kiện phục vụ cho TH nếu focus vào control thì mới validate
        // Ví dụ: TH Lưu và Thêm mới, sau khi lưu xong thì tự động báo lỗi control không được để trống
        if (newVal != oldVal && (!me.validateOnFocus || me.focused)) {
          //Add me by ĐVThi 05/02/2021 phục vụ validate giá trị người dùng nhập sai forceSelection
          setTimeout(() => {
            me.validate(me);
          }, 500);
        }
        // me.$emit('input',newVal);
      },
    },
    //Khi thay đổi số phần tử của combox thì thiết lập lại vị trí của dropdow
    internalDataSource: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;
        //ĐVThi sửa lỗi 90491 không thay đổi vị trí khi gõ text để search trên combox
        me.changeDropdownPosition();
      },
    },
    /**
     * Nếu giá trị VModel của combo thay đổi thì gán lại giá trị mới và select vào item tương ứng có trong data
     */
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;
        if (newVal != oldVal) {
          if (newVal != null && newVal != undefined) {
            me.internalValue = newVal;

            //xử lý giá trị tất cả
            if (newVal === me.selectAllValue && !me.initText) {
              me.internalText = me._selectAllText;
            }

            if (
              !me.internalSelectedItem ||
              me.internalSelectedItem[me.valueField] !== newVal
            ) {
              if (me.internalDataSource != me.data) {
                me.initData();
              }
              me.doHightlightItem();
              if (me.resetTypeAheadPointer) {
                me.typeAheadPointer = -1;
              }
              if (me.typeAheadPointer >= 0) {
                me.setInternalItem(
                  me.internalDataSource[me.typeAheadPointer],
                  false
                );
              } else {
                if (!me.forceSelection && me.valueField == me.displayField) {
                  me.setInternalText(me.internalValue);
                }
              }
            }
          } else {
            // nếu bắt buộc phải chọn giá trị thì mới reset
            if (me.forceSelection) {
              me.reset();
            }
          }
        }
      },
    },
  },
  //Hàm khởi tạo dữ liệu hook func
  created() {
    const me = this;
    // me.initIndex = 0;
    me.initCombo();
    // me.setInitIndex();
    me.initData();
    if (me.autoLoad) {
      me.doQueryInternal(null, false);
    }
    EventBusGlobal.$on(GlobalEventName.scrollEvent, me.scrollEvent);
    if (me.mappingField) {
      for (let key in me.mappingField) {
        me.$options.propsData[key] = null;
      }
    }
    // me.initData();
    // me.setInitText();
  },
  mounted() {
    let me = this;
    //Debounce query để delay load
    if (me.queryMode != "remote") {
      me.internalQueryDelay = 20;
    }
    me.doQuery = _.debounce(me.doQueryInternal, me.internalQueryDelay);
    document.addEventListener("click", me.click_out);
    //init alltext
    me._selectAllText =
      me.selectAllText || i18n.t("i18nComponent.Combobox.SelectAllItemText");
  },
  beforeDestroy() {
    const me = this;
    me.collapse();
    if (me.$refs.dropdownPanel) {
      me.$refs.dropdownPanel.$el.remove();
    }
    EventBusGlobal.$off(GlobalEventName.scrollEvent, me.scrollEvent);
    document.removeEventListener("click", me.click_out);
  },
  methods: {
    getTooltipClass() {
      let me = this;
      if (me.$el) {
        me.tooltipLeft = -me.$el.offsetWidth / 2;
      }
      if (me.customTooltip) {
        return "tooltip-" + me.customTooltip.type.toLowerCase();
      } else {
        return "";
      }
    },
    /**
     * kiểm tra xem dữ liệu trên combobox có trống hay không
     * @author tmchi 16.04.2021
     */
    isNullOrEmptyvalue() {
      if (this.value == null || this.value == {}) {
        return true;
      } else {
        return false;
      }
    },
    /**
     * Bắt sự kiện khi scroll trên chương trình thì đóng combobox lại
     * Created by LTDAT
     */
    scrollEvent(e) {
      const me = this;
      if (me.expanded) {
        me.collapse();
      }
    },
    /**
     * Mặc định chọn giá trị theo index ban đầu
     * Created by LTDAT
     */
    setInitIndex() {
      const me = this;
      if (
        me.initIndex >= 0 &&
        me.internalDataSource &&
        me.internalDataSource.length > 0 &&
        me.typeAheadPointer < 0
      ) {
        me.typeAheadPointer = me.initIndex;
        me.setInternalItem(me.internalDataSource[me.typeAheadPointer], false);
      }
    },
    /**
     * Set giá trị hiện thị ban đầu cho combobox khi combo chưa có dữ liệu
     * Created by LTDAT(25.06.2020)
     */
    setInitText(val) {
      const me = this;
      me.internalText = (typeof val == "string" ? val : me.initText) || "";

      //TDNGHIA tạo thêm hàm kiểm tra nếu text khớp với data source thì gán giá trị combo bằng luôn
      if (me.internalDataSource.length > 0) {
        var selected = me.internalDataSource.find(function (item) {
          if (me.ignoreCase) {
            return (
              item[me.displayField].toLowerCase().trim() ==
              me.internalText.toLowerCase().trim()
            );
          }
          return item[me.displayField] == me.internalText;
        });

        if (me.allowFreeText) {
          me.internalSelectedItem = null;
          me.internalValue = null;
        }

        if (selected != null) {
          me.internalSelectedItem = selected;
          me.internalValue = selected[me.valueField];
        }
      }
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
          if (me.isTree) {
            queryString = null;
          }
          me.doRemoteQuery(queryString);
        } else {
          me.$nextTick(() => {
            me.doLocalQuery(queryString);
            if (expand && !me.expanded) {
              me.expand();
            } else {
              me.doHightlightItem(true);
            }
          });
        }
        // me.$props.isReload = false;
      }
    },

    /**
     * Xử lý sau khi query xong dữ liệu
     * CreatedBy LTDAT 24.06.2020
     */
    afterQuery(expand) {
      const me = this;
      if (expand) {
        me.expand();
      }
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
        payload.skip = 0;
        payload.take = me.pageSize;
        payload.pageAppend = false;
        if (filters.length > 0) {
          payload.filter = filters;
        }

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

        me.lastRequestParam = payload;
        if (typeof me.buildFilter == "function") {
          me.buildFilter(payload);
        }
        me.loading = true;
        me.$emit("loadData", payload);
        //TVLoi 28.08.2021 Cho tắt luôn cờ ở đây nữa, Phòng trường hợp xổ combo nhưng ko gọi API thì ko tắt được cờ loading.
        me.loading = false;
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
        !commonFn.hasParent(e.target, me.$el) &&
        me.$refs.dropdownPanel &&
        me.$refs.dropdownPanel.$el &&
        !commonFn.hasParent(e.target, me.$refs.dropdownPanel.$el)
      ) {
        me.collapse();
      }
    },
    //Reset lại các giá trị trong combobox
    reset() {
      const me = this;
      me.internalText = "";
      me.internalSelectedItem = null;
      me.typeAheadPointer = -1;
      me.internalValue = null;
      me.$emit("input", me.internalValue);
    },
    /**
     * Set giá trị hiển thị
     * @pram value giá trị hiển thị
     */
    setInternalText(value) {
      const me = this;
      me.internalText = value;
    },
    /**
     * Set value cho combo
     */
    setValue(value, userAction = false) {
      const me = this;
      me.internalValue = value;
      me.$emit("input", me.internalValue);
      me.doHightlightItem();
      if (me.typeAheadPointer >= 0) {
        me.setInternalItem(
          me.internalDataSource[me.typeAheadPointer],
          userAction
        );
      }
    },
    //Sự kiện nhập liệu trên input
    //Created by LTDAT (16.06.2020)
    onInput(e) {
      const me = this;
      me._typing = true;
      if (!me.expanded) {
        me.expand();
        // me.doQueryInternal(me.getQueryString(), true);
      }
      if (!me.internalText) {
        // if (me.internalValue) {
        //   let metaData = {
        //     oldData: me.internalSelectedItem,
        //     newData: null,
        //   };
        //   me.$emit("selected", metaData);
        // }

        /**
         * reset lại combo khi internalText rỗng
         * NMTUAN3 16/11/2021
         */
        me.reset();

        if (!me.forceSelection) {
          me.reset();
        }
      }
      me.doQuery(me.internalText, true);
      me._typing = false;
      if (!me.forceSelection && me.valueField == me.displayField) {
        me.internalValue = me.internalText;
        me.$emit("input", me.internalValue);
      } else if (
        me.forceSelection &&
        me.allowDeselectItem &&
        me.internalText == ""
      ) {
        me.internalValue = me.internalText;

        let dataEmpty = {};
        dataEmpty[me.valueField] = null;
        dataEmpty[me.displayField] = me.internalText;
        let metaData = {
          oldData: me.internalSelectedItem,
          newData: dataEmpty,
        };

        me.$emit("selected", metaData);
        me.$emit("input", me.internalValue);
      } else if (me.allowFreeText) {
        me.internalValue = null;
        me.setInitText(me.internalText);

        let dataEmpty = {};
        dataEmpty[me.valueField] = me.internalValue;
        dataEmpty[me.displayField] = me.internalText;
        let metaData = {
          oldData: me.internalSelectedItem,
          newData: dataEmpty,
        };

        me.$emit("selected", metaData);
        me.$emit("input", me.internalValue);
      }

      me.doHightlightItem(true);
      me.adjustScroll();
    },
    //Sự kiện click vào input
    //Created by NNLAM (19/04/2021)
    onClick(e) {
      this.$emit("click", e);
    },
    //Sự kiện focus vào input
    //Created by LTDAT (16.06.2020)
    onFocus(e) {
      const me = this;
      me.focused = true;
      me.$emit("focus", e);
    },
    //Sự kiện change input
    //Created by LTDAT (16.06.2020)
    onChange(e) {
      const me = this;
      if (me.focused) {
        if (me.forceSelection) {
          if (me.typeAheadPointer < 0) {
            //me.reset();
            // let dataEmpty = {};
            //   dataEmpty[me.valueField] = null;
            //   dataEmpty[me.displayField] = me.internalText;
            //   let metaData = {
            //     oldData: me.internalSelectedItem,
            //     newData: dataEmpty,
            //     userAction: false
            //   };
            //TODO bnduc 9.7.2021: Bỏ raise selectd event đi vì các form đang handle để gán lại initText -> lỗi validate forceSelection
            // me.$emit("selected", metaData);
            me.$emit("input", me.internalValue);
          } else if (me.allowDeselectItem && me.internalText == "") {
            me.typeAheadPointer = -1;
            me.internalValue = null;
            let dataEmpty = {};
            dataEmpty[me.valueField] = null;
            dataEmpty[me.displayField] = me.internalText;
            let metaData = {
              oldData: me.internalSelectedItem,
              newData: dataEmpty,
              userAction: false,
            };
            me.$emit("selected", metaData);
            me.$emit("input", me.internalValue);
          } else {
            me.typeAheadPointer = me.filterIndexItemByText();
          }
        } else {
          if (me.valueField == me.displayField) {
            me.internalValue = me.internalText;
            me.$emit("input", me.internalValue);
          } else {
            me.typeAheadPointer = me.filterIndexItemByText();
            if (me.typeAheadPointer < 0) {
              me.internalValue = null;
              let dataEmpty = {};
              dataEmpty[me.valueField] = null;
              dataEmpty[me.displayField] = me.internalText;
              let metaData = {
                oldData: me.internalSelectedItem,
                newData: dataEmpty,
                userAction: false,
              };
              me.$emit("selected", metaData);
              me.$emit("input", me.internalValue);
            }
          }
        }
      }
      //TODO bnduc 5.5.2021 chỗ này gọi change làm gì nhỉ
      // me.$emit("change", me.internalValue);
    },
    //Sự kiện blur input
    //Created by LTDAT (16.06.2020)
    // pvduy 07/05/2021: sửa lại combobox (đã trao đổi với SA anh BNDuc)
    onBlur(e) {
      const me = this;
      me.focused = false;

      //nếu không có value mà source chỉ có 1 bản ghi + text hiển thị đang map -> select item này
      if (
        me.internalDataSource.length === 1 &&
        me.internalText &&
        !me.internalValue
      ) {
        let firstItem = me.internalDataSource[0];
        me.setInternalItem(firstItem);
      }

      //me.validate(me);
      if (me.internalText != "") {
        if (me.validateOnBlur) {
          me.$nextTick(() => {
            me.validateBlur();
          });
        }
      }

      //TDNGHIA 16/9/2021 nếu force selection thì out focus ra mà xóa hết text thì set lại giá trị cũ cho combo
      // NMTUAN2 13.04.2022: nếu không cho bỏ chọn thì mới set lại giá trị cũ
      if (
        me.forceSelection &&
        !me.allowDeselectItem &&
        me.internalText == "" &&
        me.internalSelectedItem
      ) {
        me.internalText = me.internalSelectedItem[me.displayField];
      }

      //TDNGHIA 14/11/2021: hiện tại nếu xóa hết text đi combo tự chọn lại giá trị => case nếu xóa hết thì reset luôn
      if (me.internalText == "" && !me.internalSelectedItem) {
        me.reset();
      }

      me.$emit("blur", e);
    },
    //Sự kiện keydown input
    //Created by LTDAT (16.06.2020)
    onKeydown(e) {
      const me = this;

      switch (e.which) {
        case 40:
          {
            if (!me.expanded) {
              me.doQueryInternal(null, true);
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
          }
          break;
        case 38:
          {
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
          }
          break;
        case 13:
          {
            e.preventDefault();
            if (me.typeAheadPointer >= 0) {
              me.setInternalItem(me.internalDataSource[me.typeAheadPointer]);
            }
            me.collapse();
          }
          break;
        case 9:
          {
            if (me.expanded) {
              // NMTUAN3 16/11/2021 Thêm điều kiện kiểm tra internalText có rỗng hay không
              //TDNGHIA comment lại: đoạn này là để nếu ấn tab mà trên combo có map được giá trị nào rồi thì sẽ tự chọn giá trị đấy
              if (me.typeAheadPointer >= 0 && me.internalText) {
                me.setInternalItem(me.internalDataSource[me.typeAheadPointer]);
              }

              me.collapse();
            }
          }
          break;
      }
      me.$emit("keydown", e);
    },
    //Lấy tổng số lượng dữ liệu trong data
    getTotalData() {
      const me = this;
      return me.internalDataSource.length;
    },
    //Bôi màu hightlight cho item
    doHightlightItem(ignoreValue) {
      const me = this;
      let index = -1;

      if (me.internalDataSource && me.internalDataSource.length > 0) {
        index = -1;

        if (
          !ignoreValue &&
          me.internalValue != null &&
          me.internalValue != undefined
        ) {
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

          if (index >= me.internalDataSource.length) {
            for (let i = me.internalDataSource.length; i <= index; i++) {
              me.internalDataSource.push(sources[i]);
            }
          }
        }

        if (index === -1 && me.internalText) {
          let lowerText = me.internalText.toLowerCase();

          if (me.columns && me.columns.length > 0) {
            for (let i = 0; i < me.internalDataSource.length; i++) {
              let item = me.internalDataSource[i];
              for (let j = 0; j < me.columns.length; j++) {
                let field = me.columns[j].dataField;
                let itemValue = item[field];
                if (
                  typeof itemValue === "string" &&
                  itemValue.toLowerCase().indexOf(lowerText) > -1
                ) {
                  index = i;
                  break;
                }
              }

              if (index > -1) {
                break;
              }
            }
          } else {
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
        }

        if (index === -1) {
          index = 0;
        }
      }

      me.typeAheadPointer = index;
    },
    //Tìm kiếm item trong list
    //Created by LTDAT(16.06.2020)
    filterIndexItemByText(queryText) {
      const me = this;
      let filters = me.filterFields,
        value = queryText || me.internalText,
        index = -1;
      if (filters && value) {
        value = value.toString();
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
      event.preventDefault();
      me.setInternalItem(item);
      me.$refs.input.focus();
    },
    //Set giá trị được chọn
    setInternalItem(item, userAction = true) {
      const me = this;
      if (item) {
        if (me.notSelectionParent && item.isParent) {
          return;
        }
        let metaData = {
          oldData: me.internalSelectedItem,
          newData: item,
        };
        me.internalSelectedItem = item;
        me.internalValue = item[me.valueField];
        me.$emit("input", me.internalValue);
        me.internalText = item[me.displayField];
        me.typeAheadPointer = me.findIndexItem(item);
        me.collapse();
        me.$emit("update:display", me.internalText);
        if (me.mappingField) {
          for (let key in me.mappingField) {
            let emitStrUpdate = "update:" + key;
            me.$emit(
              emitStrUpdate,
              me.internalSelectedItem[me.mappingField[key]]
            );
          }
        }
        if (userAction == true) {
          me.$emit("selected", metaData);

          if (metaData.oldData !== metaData.newData) {
            me.$emit(
              "change",
              me.internalValue,
              metaData.newData,
              metaData.oldData
            );
          }
        } else {
          me.$emit("autoSelected", metaData);
        }
      }
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

      me.internalQueryDelay = 200;
      me.filterFields = me.getFilterFields();
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
      if (
        me.lastRequestParam &&
        me.lastRequestParam.pageAppend &&
        me.scrollDoing
      ) {
        // if(me.internalDataSource.filter(i=>i==))
        me.internalDataSource.append(me.data);
        me.scrollDoing = false;
        //nếu dữ liệu trả về ít hơn mong đợi -> đánh dấu kết thúc để khi scroll xuống k load thêm nữa
        if (me.data.length < me.pageSize) {
          me.lastRequestParam.end = true;
        } else {
          me.lastRequestParam.end = false;
        }
      } else {
        me.internalDataSource = [...me.data];

        me.appendSelectAllItem();
      }

      if (me.keyField && me.keyField !== me.valueField) {
        commonFn.genVKeyValue(me.internalDataSource, me.keyField);
      }
      //Nếu là combo dạng tree
      if (me.comboType == 3) {
        let data = JSON.parse(JSON.stringify(me.internalDataSource));
        let dataTree = commonFn.nomalizeDataTree(
          data,
          me.idProperty || me.valueField,
          me.parentIdProperty
        );
        let treeData = commonFn.getBodyData(dataTree, true);

        if (treeData.length > 0) {
          me._allData = treeData;
        } else {
          me.internalDataSource = [];
          me._allData = null;
        }
      }

      if (me._allData) {
        me.doLocalQuery(me.lastQueryString);
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
     * hiển thị dropdown
     */
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
     * ẩn dropdown
     */
    collapse() {
      const me = this;
      me.$nextTick(() => {
        me.expanded = false;
      });
    },
    /**
     * Hàm set vị trí cho dropdown menu khi expand
     * TODO: Chưa xử lý khi có scroll
     */
    changeDropdownPosition() {
      let me = this,
        comboEl = me.$el;
      if (comboEl) {
        comboEl = comboEl.getElementsByClassName("combo-box-input")[0];
      }

      if (comboEl) {
        let comboElRect = comboEl.getBoundingClientRect(),
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
        let maxItemsDisplay = me.maxItemsDisplay;
        if (me.columns && me.columns.length > 0) {
          maxItemsDisplay += 1;
        }
        if (
          comboElRect.bottom + me.itemSize * maxItemsDisplay + 2 >
          windowHeight
        ) {
          me.dropdownTopx =
            comboElRect.top -
            (me.itemSize *
              Math.min(maxItemsDisplay, me.internalDataSource.length) +
              4);
        }
      }
    },
    /**
     * Click vào icon quicksearch
     */
    quickSearchClick(e) {
      const me = this;
      e.preventDefault();
      if (me.quickSearch) {
        if (me.disabled) {
          return;
        }
        me.expanded = false;
        let param = { ...(me.quickSearchParam || {}) };
        popupUtil.show(me, me.quickSearch, param, {
          /**
           * Sự kiện callback khi chọn item từ form tìm nhanh
           */
          searchSubmit: function (record) {
            if (Array.isArray(record)) {
              // chọn từ form chọn nhanh xuống combo do rule của dự án là đk lọc trên form chọn nhanh và combo như nhau nên có thể bỏ qua validate k có trong dnah mục
              //và bỏ qua validate k có trong danh mục bằng cách kiểm tra source dưới combo có item dc chọn từ form chọn nhanh k, nếu k có thì add vào
              let check = me.internalDataSource.filter(
                (i) => i[me.valueField] == record[0][me.valueField]
              );
              if (!check || check.length == 0) {
                me.internalDataSource.push(record[0]);
              }
              me.setInternalItem(record[0]);
            } else {
              // chọn từ form chọn nhanh xuống combo do rule của dự án là đk lọc trên form chọn nhanh và combo như nhau nên có thể bỏ qua validate k có trong dnah mục
              //và bỏ qua validate k có trong danh mục bằng cách kiểm tra source dưới combo có item dc chọn từ form chọn nhanh k, nếu k có thì add vào
              let check = me.internalDataSource.filter(
                (i) => i[me.valueField] == record[me.valueField]
              );
              if (!check || check.length == 0) {
                me.internalDataSource.push(record);
              }
              me.setInternalItem(record);
            }
            me.$nextTick(() => {
              me.validate(me);
            });
            me.$refs.input.focus();
          },
          close: function () {
            me.$refs.input.focus();
          },
        });
      }
    },
    /**
     * Validate khi blur
     * ntnghia - 11/03/2021
     * bnduc 21.6.2021: Đổi lại thành gọi hàm validate của control thay vì viết scustom như này
     */
    validateBlur() {
      this.validate(this);
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
        e.preventDefault();
        e.stopPropagation();
        me.showQuickAdd(true);
      }
    },

    /**
     * Mở form thêm nhanh
     */
    showQuickAdd(isfromEnter, isfromShortKey) {
      const me = this;
      if (
        (me.expanded && !me.loading && me.internalDataSource.length === 0) ||
        isfromShortKey
      ) {
        if (!me.quickAdd) {
          return;
        }
        if (!me.isPermission) {
          if (!isfromEnter) {
            me.collapse();
          }
          messageBox.showError(me.$t("i18nBaseForm.Validate.NotPermission"));
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
                //load lại ra để push thêm icon vào (bug 115885 )
                me.doQueryInternal(null, false);
                //append data to source
                me.internalDataSource.push(record);

                //ntphong 29/5/2021 - thêm bản ghi mới vào source(nếu là kiểu tree thì thêm đúng vị trí cha con)
                //nnlam 07/07/2021: a phong a k check xem combo có là dạng tree hay k mà a đã làm thế này r à
                if (me.isTree) {
                  try {
                    if (!me._allData) {
                      me._allData = [];
                    }
                    let isExistItem = false,
                      parentItem,
                      itemIndex = me._allData.length;
                    for (let i = 0; i < me._allData.length; i++) {
                      let item = me._allData[i];
                      if (item) {
                        if (item[me.valueField] == record[me.valueField]) {
                          isExistItem = true;
                          break;
                        }
                        if (
                          record[me.parentIdProperty] &&
                          item[me.valueField] == record[me.parentIdProperty]
                        ) {
                          parentItem = item;
                          itemIndex = i + 1;
                        }
                      }
                    }
                    if (!isExistItem) {
                      if (record[me.parentIdProperty] && parentItem) {
                        parentItem.IsParent = true;
                        if (me.isTree) {
                          if (parentItem.level) {
                            record.level = parentItem.level + 1;
                          }
                          record.parentNode = parentItem;
                          parentItem.childNodes = [record];
                        }
                      }
                      me._allData.splice(itemIndex, 0, record);
                    }
                  } catch (ex) {
                    console.log(ex);
                  }
                }
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
          close: function () {
            me.$refs.input.focus();
          },
        });
      }
    },

    /**
     * @override
     */
    customRuleValidateRules(rules) {
      const me = this;
      me.super("customRuleValidateRules", rules);

      if (me.forceSelection && rules.indexOf("forceSelection")) {
        rules.push("forceSelection");
      }
    },

    /**
     * Xử lý khi click nút quickadd ngoài combo
     * NMTUAN2 03.11.2021
     */
    comboQuickAdd(event) {
      const me = this;

      me.$emit("comboQuickAdd");
    },
  },
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msCombobox.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msCombobox.scss';
// }
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msCombobox.scss";
.ms-combobox .menu {
  position: relative;
  .combo-dropdown-panel {
    top: 0px !important;
    left: 0px !important;
  }
}
.combo-dropdown-panel {
  padding-right: 8px;
}

.icon-quickadd {
  border-radius: 0 3.5px 3.5px 0;
  width: 34px;
  height: 34px;
  position: relative;
  border-left: 1px solid #e0e0e0;
  background: url($ms-image-ic_add_blue) no-repeat center;

  &:hover {
    cursor: pointer;
  }
}
</style>
