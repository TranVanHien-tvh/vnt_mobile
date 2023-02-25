import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
import { filter } from "@/mixins/common/filter";
import { exportList } from "@/mixins/list/exportList";
import { mixinSuper } from "@/mixins/common/mixinSuper";
import moment from "moment";
import { comboboxColumns } from "@/mixins/common/comboboxColumns";
import { shortkeyStatusbar } from '@/mixins/common/shortkeyStatusbar';
import debounce from "lodash.debounce";
import { _ } from "core-js";
/**
 * Các thông tin chung của màn hình danh sách
 * Sử dụng chung cho danh sách và báo cáo động
 */
export default {
  name: "BaseList",
  mixins: [mixinSuper, filter, exportList, comboboxColumns, shortkeyStatusbar],
  props: {},

  data() {
    return {
      /**
       * refname control hiển thị dữ liệu: grid/tree
       */
      viewRef: "viewList",
      /**
       * binding ô tìm kiếm
       */
      searchText: "",
      /**
       * Tên trường khóa chính của bản ghi
       */
      idField: "",
      /**
       * Danh sách các bản ghi đang chọn
       */
      selected: [],
      /**
       * Chọn tất cả các trang
       */
      selectAllPage: false,
      /**
       * Số lượng bản ghi trên 1 trang
       */
      pageSize: 50,
      /**
       * Điều kiện load tham số
       */
      condition: {},
      /**
       * có filter header không
       */
      filterable: true,
      /**
       * Tách riêng request lấy summary ra khỏi hàm lấy paging data
       */
      splitLoadRequest: true,
      /**
       * cấu hình link help
       */
      helpId: '',
      /**
      * Danh sách các property cho input tìm kiếm
      * Sử dụng để build vào payload khi ấn tìm kiếm trên input
      * TDNGHIA 5/10/2021
      */
      listPropertySearch: [],
      /**
       * danh sách giá trị các combo trong filterBox
       * DHPhi 22/10/2021
       */
      filterBox: [],

      /**
       * refname cho ô tìm kiếm
       * NMTUAN2 03.12.2021
       */
      searchBoxRef: "searchBox",

      /**
       * đánh dấu đang search dữ liệu grid
       * NMTUAN2 03.12.2021
       */
      isSearching: false,

      /**
       * giá trị search gần nhất của ô tìm kiếm
       * NMTUAN2 04.12.2021
       */
      lastSearchText: ""
    };
  },

  computed: {
    /**
     * Đối tượng hiển thị grid/view
     */
    grid() {
      return this.$refs[this.viewRef];
    },
    /**
     * Chọn nhiều bản ghi
     */
    multiSelected() {
      return this.selected.length > 1;
    },
    ...mapGetters({
      /**
       * Ngôn ngữ hiện tại
       */
      Culture: ModuleContext + "/Culture",
    }),

    /**
     * Đối tượng hiển thị ô tìm kiếm
     * NMTUAN2 03.12.2021
     */
    searchBox() {
      return this.$refs[this.searchBoxRef];
    },

    context() {
      return this.$store.state[ModuleContext]
    },
  },

  watch: {},

  created() {
    this.getPageSize();
  },

  mounted() {
    window._helpId = this.helpId;
  },

  methods: {
    /**
     * Lấy pagesize từ cache
     */
    getPageSize() {
      let me = this,
        cacheKey = me.$route?.name;

      if (cacheKey) {
        try {
          me.$ms.indexedDB.get(cacheKey).then((res) => {
            me.pageSize = res || 50;
            me._gotCache = true;
          });
        } catch (error) {
          me.pageSize = 50;
          me._gotCache = true;
        }
      }
    },

    /**
     * Xử lý khi nhập nội dung tìm kiếm
     */
    searchChange: debounce(function () {
      // this.searchText = this.searchText ? this.searchText.trim() : null; // bỏ thì vẫn tìm bình thường
      this.searchText = this.searchText ? this.searchText : "";
      if (this.lastSearchText != this.searchText.trim()) {
        this.lastSearchText = this.searchText.trim();
        this.isSearching = true;
        this.reload();
      }
    }, 500),

    /**
     * thực hiện lọc theo giá trị từ filterBox
     * DHPhi 22/10/2021
     */
    filterBoxChange(data) {
      // let item;
      // if (data.length > 0) { // nếu số lượng bằng 0 là trường hợp bỏ lọc
      //   data.forEach((element) => {
      //     if (element.enumName !== null) { // kiểm tra trường hợp combobox thường hay combobox enum
      //       item = {
      //         caption: this.$t(
      //           `i18nBaseForm.Filter.FilterBox.${element.name}`
      //         ),
      //         filterIgnoreValue: element.value, ///thêm cái thuộc tính này để ko thực hiện vào filterheader
      //         IsSelected: false,
      //         enum: element.nameEnum,
      //         dataField: element.name,
      //         filter: { operator: "=", value: element.value },
      //         formatType: this.$ms.enum.FormatType.Enum,
      //       };
      //     } else {
      //       item = {
      //         caption: this.$t(
      //           `i18nBaseForm.Filter.FilterBox.${element.name}`
      //         ),
      //         filterIgnoreValue: element.value, ///thêm cái thuộc tính này để ko thực hiện vào filterheader
      //         IsSelected: false,
      //         enum: element.nameEnum,
      //         dataField: element.name,
      //         filter: { operator: "=", value: element.text },
      //       };
      //     }

      //     this.$refs.viewList.filterHeader.push(item); //gọi tới thằng set cho header trong grid
      //   });
      // }
      this.filterBox = data;

      this.reload();
    },

    /**
     * Load lại dữ liệu
     */
    reload() {
      const me = this;
      //chuyển paging bar về trang đầu
      if (me.grid && typeof me.grid.setPage === "function") {
        me.grid.setPage(1);
      }

      //xóa tham số cũ để reload
      delete me.lastParam;
      me.refresh();
    },

    /**
     * Load lại dữ liệu
     */
    refresh() {
      const me = this;
      let cacheKey = me.$route?.name;
      // Nếu chưa get cache xem thì chặn lại chờ get xong mới gọi load data
      if (!me._gotCache && cacheKey) {
        me.loadDataByCache(cacheKey);
      } else {
        let param = me.lastParam || {
          skip: 0,
          take: me.pageSize,
        };

        me.loadData(param);

        //load summary
        if (me.splitLoadRequest) {
          me.loadDataSumary(param);
        }
      }
    },

    /**
     * Load dữ liệu theo pagesize của cache
     */
    loadDataByCache(cacheKey) {
      var me = this;
      // Vì indexDB hay lỗi nên cần bọc try-catch trong trường hợp multiple tabs
      try {
        // có cachekey thì gọi lại lấy số liệu theo pagesize không thì gọi như thường
        me.$ms.indexedDB.get(cacheKey).then((res) => {
          let param = {
            skip: 0,
            take: res || 20,
          };
          me.loadData(param);

          //load summary
          if (me.splitLoadRequest) {
            me.loadDataSumary(param);
          }
        });
      } catch (error) {
        me._gotCache = true;
        me.refresh();
      }
    },
    /**
     * Load dữ liệu danh sách
     */
    loadData(payload) {
      const me = this;
      //nếu là trang đầu build lại tham số, các trang tiếp theo dùng lastParam và chỉ đổi skip
      if (!payload.skip) {
        //xử lý các tham số khác
        me.processLoadParameter(payload);

        //chuẩn hóa tham số truyền lên server
        me.nomalizeLoadParameter(payload);
      } else {
        for (let i in me.lastParam) {
          switch (i) {
            case "skip":
              //bỏ qua
              break;
            default:
              payload[i] = me.lastParam[i];
              break;
          }
        }
      }

      //cache lại tham số để dùng cho xuất khẩu và restore data cho lần sau quay lại
      me.lastParam = payload;

      if (me.splitLoadRequest) {
        //fix chỉ đọc data
        payload.readType = 1;
      }

      /**
       * Gọi request load data
       */
      me.requestLoadData(payload);
    },

    /**
     * Load summary cho grid danh sách
     */
    loadDataSumary(payload) {
      const me = this;

      //tham số chỗ này đã qua hàm load data dc xử lý rồi
      let param = {};
      for (let i in payload) {
        switch (i) {
          case "skip":
          case "take":
          case "sort":
            //bỏ qua
            break;
          // case "columns":
          //   //TODO chỗ này sẽ chế lại chỉ lấy các cột có sum thôi
          //   break;
          default:
            param[i] = payload[i];
            break;
        }
      }
      //fix chỉ đọc summary
      param.readType = 2;

      /**
       * Gọi request load data
       */
      me.requestLoadDataSummary(param);
    },

    /**
     * Gọi request load dữ liệu
     */
    requestLoadData() { },

    /**
     * Gọi request load summary
     */
    requestLoadDataSummary() { },

    /**
     * Xử lý tham số load dữ liệu
     */
    processLoadParameter(payload) {
      const me = this;
      //filter
      payload.filter = [];
      if (me.filterable && typeof me.grid.getFilterHeader === "function") {
        payload.filter = me.grid.getFilterHeader();
      }

      //TDNGHIA 5/10/2021: build payload.filter từ ô input tìm kiếm
      if (me.searchText && me.listPropertySearch.length > 0) {
        me.getFilterInput(payload);
      }
      //TDNGHIA 5/10/2021: build payload.filter từ combo lọc
      if (me.filterBox.length > 0) {
        me.getFilterCombo(payload);
      }

      //column
      payload.columns = me.processLoadParameterColumn(payload);

      //tham số load dữ liệu
      payload.condition = me.getConditionParameter();

      // nếu grid có cấu hình sort default thì
      if (me.grid.defaultSort && Array.isArray(me.grid.defaultSort)) {
        let listSort = [];
        me.grid.defaultSort.forEach((item) => {
          // nếu có sort custom thì nếu trùng với item nào thì loại item đó ra khỏi listSort để không bị trùng
          if (payload.Sort) {
            if (!payload.Sort.contains(item.sortField)) {
              listSort.push(
                `${item.sortField} ${item.sortType == me.$ms.enum.SortStatus.desc ? "DESC" : "ASC"
                }`
              );
            }
          } else {
            listSort.push(
              `${item.sortField} ${item.sortType == me.$ms.enum.SortStatus.desc ? "DESC" : "ASC"
              }`
            );
          }
        });
        let sortDefault = listSort.length > 0 ? listSort.join(", ") : "";
        let sortCustom = payload.Sort ? payload.Sort : "";
        if (sortCustom && sortDefault) {
          payload.Sort = [sortCustom, sortDefault].join(", ");
        } else if (!sortCustom && sortDefault) {
          payload.Sort = sortDefault;
        } else if (sortCustom && !sortDefault) {
          payload.Sort = sortCustom;
        } else {
          payload.Sort = "";
        }
      }

      //Tách lấy summary ra request khác
      if (me.splitLoadRequest) {
        payload.ignoreSummary = true;
      }

      payload = me.customPayload(payload);
    },

    /**
     * Lấy list các property config lọc trên input
     * Sau đấy add thêm vào payload.filter
     * @param {*} payload truyền vào API
     //template
     //  {
     //   property: "AssetCategoryName",
     //   value: me.searchText,
     //   operator: "contains",
     //   childrens: [
     //     {
     //       property: "AssetCategoryCode",
     //       value: me.searchText,
     //       operator: "contains",
     //       operand: "or"
     //     }
     //   ]
     // }
     */
    getFilterInput(payload) {
      const me = this;
      if (me.listPropertySearch.length > 0) {
        let itemFilter = {
          operator: me.$ms.enum.FilterHeader.Contains,
          property: me.listPropertySearch[0],
          value: me.searchText.trim(),
          childrens: [],
        };

        //Cho tất cả các property khác vào children để build câu or
        for (let index = 1; index < me.listPropertySearch.length; index++) {
          let fieldName = me.listPropertySearch[index];
          let childFilter = {
            property: fieldName,
            value: me.searchText.trim(),
            operator: me.$ms.enum.FilterHeader.Contains,
            operand: "or",
          };

          itemFilter.childrens.push(childFilter);
        }

        payload.filter.push(itemFilter);
      }
    },

    /**
     * thực hiện lấy list từ msfilterbox
     * sau đó add thêm vào payload.filter
     * @param {*} payload truyền vào api
     */
    getFilterBox(payload) {
      const me = this;

      if (me.listPropertyFilter.length > 0) {
        let itemFilter = {
          operator: me.$ms.enum.FilterHeader.Contains,
          property: me.listPropertyFilter[0],
          value: me.filterBox[0],
          childrens: [],
        };

        //Cho tất cả các property khác vào children để build câu or
        for (let index = 1; index < me.listPropertyFilter.length; index++) {
          let fieldName = me.listPropertyFilter[index];
          let childFilter = {
            property: fieldName,
            value: me.filterBox[index],
            operator: me.$ms.enum.FilterHeader.Contains,
            operand: "and",
          };

          itemFilter.childrens.push(childFilter);
        }

        payload.filter.push(itemFilter);
      }
    },


    /**
   * Lấy các thông tin từ combo lọc
   * Build payload.filter
   * TDNGHIA 5/10/2021
   * override từng màn hình
   */
    getFilterCombo(payload) {
      const me = this;

      let itemFilter = {
        operator: me.$ms.enum.FilterHeader.Equals,
        property: me.filterBox[0].name,
        value: me.filterBox[0].value,
        childrens: [],
      };

      //Cho tất cả các property khác vào children để build câu or
      for (let index = 1; index < me.filterBox.length; index++) {
        let fieldName = me.filterBox[index];
        let childFilter = {
          property: fieldName.name,
          value: fieldName.value,
          operator: me.$ms.enum.FilterHeader.Equals,
          operand: "and",
        };

        itemFilter.childrens.push(childFilter);
      }

      payload.filter.push(itemFilter);
    },

    /**
     * Custom tham số payload trước khi call api
     */
    customPayload(payload) {
      return payload;
    },

    /**
     * Custom tham số load dữ liệu
     */
    processLoadParameterColumn(payload) {
      let columns = this.grid.columnx;
      let cols = [];

      if (columns) {
        for (let i = 0; i < columns.length; i++) {
          let col = columns[i];
          if (col.dataField && cols.indexOf(col.dataField) === -1) {
            cols.push(col.dataField);
          }
        }
      }
      if (this.grid.idField) {
        cols.push(this.grid.idField);
      }
      /*
       * Cấu hình lấy thêm các cột được cấu hình luôn lấy dữ liệu trên grid
       * pvduy 19/01/2021
       */
      if (
        this.grid.alwayTakeColumns &&
        this.grid.alwayTakeColumns.length != 0
      ) {
        for (let i = 0; i < this.grid.alwayTakeColumns.length; i++) {
          if (!cols.includes(this.grid.alwayTakeColumns[i])) {
            cols.push(this.grid.alwayTakeColumns[i]);
          }
        }
      }
      return cols;
    },

    /**
     * Lấy điều kiện load dữ liệu
     */
    getConditionParameter() {
      const me = this;
      let param = {};
      if (me.condition) {
        for (let i in me.condition) {
          let value = me.condition[i];
          if (value) {
            //date
            if (typeof value.getFullYear === "function") {
              //nếu tên thuộc tính có từ Time -> lấy full datetime
              //else chỉ lấy date
              if (i.indexOf("Time") > -1) {
                value = moment(value).format("YYYY-MM-DD hh:mm:ss");
              } else {
                value = moment(value).format("YYYY-MM-DD");
              }
            }
          }
          param[i] = value;
        }
      }
      return param;
    },

    /**
     * Chuẩn hóa lại tham số truyền lên server
     */
    nomalizeLoadParameter(payload) {
      const me = this;
      if (!payload.skip) {
        delete payload.skip;
      }

      if (payload.filter && payload.filter.length > 0) {
        payload.filter = me.buildFilterParam(payload.filter);
      } else {
        delete payload.filter;
      }

      if (payload.condition && Object.keys(payload.condition).length > 0) {
        payload.condition = JSON.stringify(payload.condition);
      } else {
        delete payload.condition;
      }

      if (payload.columns && payload.columns.length > 0) {
        payload.columns = payload.columns.join(",");
      } else {
        delete payload.columns;
      }
    },

    /**
     * Xử lý ngôn ngữ cho caption và title của column
     */
    localizationColumn(columns, tag) {
      const me = this,
        culture = me.Culture;

      //nếu là mẫu mặc định và ngôn ngữ khác tiếng việt -> cập nhật caption/title theo ngôn ngữ
      if (culture !== "vi") {
        let fn = function (column, field, key) {
          let text = me.$ms.commonFn.getColumnText(field, tag);
          if (typeof text !== "undefined") {
            column[field] = text;
          }
        };

        for (let i = 0; i < columns.length; i++) {
          let col = columns[i];
          fn(col, "caption", col.dataField);
          fn(col, "title", col.dataField + "Title");
        }
      }
    },

    /**
     * Thay đổi pagesize
     */
    gridChangePageSize(value) {
      this.pageSize = value;
    },

    /**
     * Thay đổi độ rộng cột trên grid
     * created by ntphong 13/5/2021
     */
    gridResizeCol(col) {
      const me = this;
      me.setCacheLayoutTemplate(col);
    },

    /**
     * set cache mẫu layout
     * created by ntphong 13/5/2021
     */
    async setCacheLayoutTemplate(col) {
      const me = this;
      try {
        let cacheKey = me.getCacheLayoutTemplateKey();
        if (cacheKey) {
          let cacheData = await me.$ms.indexedDB.get(cacheKey),
            layoutTemplate;
          if (cacheData) {
            layoutTemplate = JSON.parse(cacheData);
          }
          if (!layoutTemplate) {
            layoutTemplate = me.layoutColumns[me.layoutTag];
          }
          if (layoutTemplate) {
            let columns;
            if (layoutTemplate.Columns) {
              columns = JSON.parse(layoutTemplate.Columns);
            }
            if (!columns && me.grid && me.grid.columnx) {
              columns = me.grid.columnx;
            }
            if (columns) {
              if (col) {
                let column = columns.find((x) => x.dataField == col.dataField);
                if (column && col.hasOwnProperty("newWidth")) {
                  column.width = col.newWidth;
                }
              }
              layoutTemplate.Columns = JSON.stringify(columns);
            }
          }
          if (layoutTemplate) {
            //me.$ms.commonFn.removeLocalStorage(cacheKey);
            //me.$ms.commonFn.setLocalStorage(cacheKey, JSON.stringify(layoutTemplate));
            me.$ms.indexedDB.set(cacheKey, JSON.stringify(layoutTemplate));
          }
        }
      } catch (ex) {
        console.log(ex);
      }
    },

    /**
     * lấy mẫu layout từ cache
     * created by ntphong 13/5/2021
     */
    async getCacheLayoutTemplate() {
      const me = this;
      try {
        let layoutTemplate;
        let cacheKey = me.getCacheLayoutTemplateKey();
        if (cacheKey) {
          let cacheData = await me.$ms.indexedDB.get(cacheKey);
          if (cacheData) {
            layoutTemplate = JSON.parse(cacheData);
          }
        }
        return layoutTemplate;
      } catch (ex) { }
      return null;
    },

    /**
     * lấy cache key mẫu layout
     * created by ntphong 13/5/2021
     */
    getCacheLayoutTemplateKey() {
      const me = this;
      let cacheKey = "";
      if (me.Context && me.Context.UserID && me.layoutTag) {
        cacheKey = "LayoutTemplate_{0}_{1}".format(
          me.layoutTag,
          me.Context.UserID
        );
      }
      return cacheKey;
    },

    buttonClick(srcKey, e) { },
  },
};
