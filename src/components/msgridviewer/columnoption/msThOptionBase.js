import { mixinSuper } from "@/mixins/common/mixinSuper";
export default {
  name: "msThOptionBase",
  mixins: [mixinSuper],
  props: {
    /**
     * Thông tin cột
     */
    col: {
      default: null
    },
    /**
     * Có lock cột không
     */
    isLock: {
      type: Boolean,
      default: false
    },
    ownerForm: null
  },
  data() {
    return {
      /**
       * Có hiển thị dialog không
       */
      isShow: false,
      /**
       * Style chỉnh vị trí hiển thị
       */
      stylex: {
        top: "30px"
      },
      /**
       * Label tương ứng với giá trị operator trên form
       */
      operatorText: "",
      /**
       * Giá trị filter mặc định
       */
      defaultFilterValue: null,
      /**
       * Toán tử mặc định
       */
      defaultFilterOperator: this.$ms.enum.FilterHeader.Equals,
      /**
       * Giá trị nhập liệu trên form
       */
      filterValue: null,
      /**
       * Giá trị hiển thị
       */
      filterValueDisplay: null,
      /**
       * Giá trị từ
       */
      filterFrom: null,
      /**
       * Giá trị đến
       */
      filterTo: null,
      /**
       * Toán tử đang chọn
       */
      filterOperator: null,
      /**
       * Toán tử này có nhập dữ liệu không
       */
      operatorValueReadonly: true,
      /**
       * có filter không
       */
      filterable: true,
      /**
       * có hiển thị lock không, xài cho các cột trong group
       */
      lockable: true,
      /**
       * Danh sách các toán tử
       */
      operators: [],
      /**
       * biến lưu grid
       */
      grid: null
    };
  },
  computed: {
    /**
     * Điều kiện hiển thị tính năng cố định cột
     */
    isShowPin() {
      return false;
      let me = this;
      if (me.lockable) {
        if (me.col && me.col.group && me.col.group != me.col.title) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    opSource() {
      const me = this;
      let source = [];

      if (me.operators && me.operators.length > 0) {
        source = me.$ms.commonFn.getEnumSource("FilterHeader", me.operators);
      }

      return source;
    }
  },
  watch: {
    /**
     * Khi thay đổi toán tử trên form sẽ cập nhật lại trạng thái nhập liệu của control filter value
     */
    filterOperator(val) {
      this.operatorText = this.$ms.commonFn.getEnumResource(
        val,
        "FilterHeader"
      );
      switch (val) {
        case this.$ms.enum.FilterHeader.Null:
        case this.$ms.enum.FilterHeader.NotNull:
          this.operatorValueReadonly = true;

          if (this.filterValue) {
            this.hideValue = this.filterValue;
            this.filterValue = this.defaultFilterValue;
          }
          break;
        default:
          this.operatorValueReadonly = false;

          if (this.hideValue) {
            this.filterValue = this.hideValue;
            this.hideValue = null;
          }
          break;
      }
    }
  },
  created() {
    /**
     * filter value sẽ đuọc lưu vào đây khi chọn toán tử: trống, không trống
     * Dùng để khôi phục khi chọn lại toán tử khác 2 toán tử trên
     */
    this.hideValue = null;
  },
  mounted() {
    const me = this;
  },
  methods: {
    checkParent(target) {
      for (let i = 0; i < 10; i++) {
        if (target === this.$el) {
          return true;
        }

        if (target) {
          target = target.parentNode;
        } else {
          break;
        }
      }

      return false;
    },
    /**
     * Bắt sự kiện click không phải vào popup option thì ẩn đi
     */
    documentClick(evt) {
      if (!this.checkParent(evt.target)) {
        if (
          evt.target.classList.contains("filter-header") ||
          evt.target.closest(".condition-container") ||
          evt.target.closest(".datepicker") ||
          evt.target.closest(".combo-menu") ||
          evt.target.closest(".ms-dropdown") ||
          evt.target.closest(".combobox-item") ||
          evt.target.closest(".autocomplete") ||
          evt.target.closest(".autocomplete__results__item")
        ) {
          return;
        }
        this.hide();
      }
    },

    /**
     * Xử lý sự kiện scroll document
     */
     documentScroll(event) {
      if (event.target.contains(this.$el) ||
        event.target.contains(this.$target)) {
        this.hide();
      }
    },

    /**
     * Xử lý đối tượng grid đang target
     */
    initGrid(el) {
      let grdElement =
        el.closest(".ms-grid-viewer") || el.closest(".gridComponent");
      if (grdElement) {
        this.grid = this.$ms.commonFn.mapDomToVue(grdElement);
      }
    },
    /**
     * Hiển thị option
     */
    show(target) {
      const me = this;

      me.hideValue = null;
      //binding value
      me.beforeShow();
      if (target) {
        //đánh dấu là target vào element nào
        me.$target = target;

        me.initGrid(target);

        if (me.grid) {
          me.filterable = me.grid.filterable && me.col.filterable != false;
        }
        this.lockable = this.col.lockable !== false;

        me.setPosition(target);
      }

      me.isShow = true;

      me.$nextTick(() => {
        me.focusInputControl();
        document.addEventListener("mousedown", this.documentClick, true);
        document.addEventListener("scroll", this.documentScroll, true);
      });
    },

    /**
     * Xử lý vị trí hiển thị
     */
    setPosition(target) {
      const me = this,
        targetPos = target.getClientRects()[0],
        left = targetPos.left;
      let top = target.offsetHeight + 2 + targetPos.top;

      //nếu tràn dưới bị che khuất -> quay lên trên
      if (top + 200 > document.body.scrollHeight) {
        me.stylex.top = '0';
        me.$nextTick(() => {
          if (!me._elHeight) {
            if (me.$el && me.$el.clientHeight) {
              me._elHeight = me.$el.clientHeight;
            } else {
              me._elHeight = 210;
            }
          }

          top = top - me._elHeight - target.clientHeight;
          me.stylex.top = top + 'px';
        });
      } else {
        me.stylex.top = top + 'px';
      }

      if (
        target.parentNode.children[0] == target ||
        target.parentNode.children[1] == target ||
        target.parentNode.children[2] == target
      ) {
        me.stylex.left = left + 'px'; 
        // me.stylex.right = "unset";
        me.stylex.position = "";
      } else {
        me.stylex.left = (left + targetPos.width - 280) + 'px'; 
        // me.stylex.right = targetPos.right + 'px';
        me.stylex.position = "";
      }
      //Sửa lỗi : 74004
      // nnlam bổ sung thêm hasOffsetRight vì trường hợp grid trên popup detail có right > 0
      if (
        target.parentNode.children[target.parentNode.children.length - 1] ==
        target && !me.col.hasOffsetRight
      ) {
        //nếu width của thẻ th quá lớn thì không được sét rigth = 0 vì sẽ rất xấu
        if (target.offsetWidth > 320) {
          let rect = target.getBoundingClientRect();
          me.stylex.left = rect.left + "px";
          me.stylex.right = "auto";
          me.stylex.maxWidth = "320px";
          me.stylex.position = "fixed";
          me.stylex.top = rect.top + target.offsetHeight + "px";
        } else {
          me.stylex.left = "unset";
          me.stylex.right = "0";
        }
      }

      //tìm đến tr-> grid và check xem có phải grid tree k, cái này đang k biết làm ntn cho tốt nên cứ tạm thế đã
      if (
        target.parentElement.parentElement &&
        target.parentElement.parentElement.parentElement._prevClass.contains(
          "ms-table-tree"
        )
      ) {
        let rect = target.getBoundingClientRect();
        me.stylex.top = rect.top + target.offsetHeight + "px";
        if (
          target.parentNode.children[0] != target &&
          target.parentNode.children[target.parentNode.children.length - 1] !=
            target
        ) {
          me.stylex.left = rect.left - (320 - target.offsetWidth) + "px";
        } else {
          if (
            target.parentNode.children[target.parentNode.children.length - 1] !=
            target
          ) {
            me.stylex.left = "210px"; // khoảng cachs leftmenu
          }
        }
        if (
          target.parentNode.children[target.parentNode.children.length - 1] !=
          target
        ) {
          me.stylex.right = rect.right + "px";
        }
        me.stylex.maxWidth = "320px";
        me.stylex.position = "fixed";
      }
    },

    /**
     * Gán filter khi mở form
     */
    beforeShow() {
      this.filterValue = this.col.filter?this.col.filter.value: null;
      this.filterOperator = this.col.filter?this.col.filter.operator: null;
      if(!this.filterOperator){
        if(!this.col.formatType || this.col.formatType == this.$ms.enum.FormatType.Text || this.col.formatType == this.$ms.enum.FormatType.None){
          this.col.filter.operator = this.$ms.enum.FilterHeader.Contains;
        }else{
          this.col.filter.operator = this.$ms.enum.FilterHeader.Equals;
        }
      }
      this.filterOperator = this.col.filter.operator;
    },
    /**
     * Ẩn
     */
    hide() {
      if (this.$el && typeof this.$el.closest === "function") {
        let thEl = this.$el.closest("th");
        if (thEl) {
          let th = this.$ms.commonFn.mapDomToVue(thEl);
          if (th && th.thOptionClass) {
            th.thOptionClass = null;
          }
        }
      }

      this.isShow = false;
      document.removeEventListener("mousedown", this.documentClick);
      document.removeEventListener("scroll", this.documentScroll);
    },
    close(){
      this.hide;
    },
    /**
     * Toggle ẩn/hiện
     */
    toggle(target) {
      if (this.isShow) {
        this.hide();
        return false;
      } else {
        this.show(target);
        return true;
      }
    },
    /**
     * Bấm lock/unlock
     */
    lockClick() {
      let grid = this.grid;

      //phân biệt xử lý cho msgrid, msgridviewer
      if (typeof grid.changeLock === "function") {
        this.col.isLock = !this.isLock;
        grid.lockTable();
      } else {
        grid.lockTable(this.col);
      }

      this.isLock = !this.isLock;
      this.hide();
      this.grid.$emit("lockColumn", this.isLock, this.col);
    },
    /**
     * Cập nhật giá trị filter khi click vào nút lọc
     */
    submitFilter() {
      let me = this,
        filter = me.col.filter;

      filter.operator = me.filterOperator;
      
      filter.value = me.filterValue;
      switch (me.filterOperator) {
        case me.$ms.enum.FilterHeader.Between:
          if (me.filterFrom == null && me.filterTo == null) {
            filter.operator = me.defaultFilterOperator;
            filter.to = me.defaultFilterValue;
          } else if (me.filterFrom != null && me.filterTo != null) {
            filter.from = me.filterFrom;
            filter.to = me.filterTo;
          } else if (me.filterFrom != null) {
            filter.operator = me.$ms.enum.FilterHeader.GreaterThanEquals;
            filter.value = me.filterFrom;
          } else {
            filter.operator = me.$ms.enum.FilterHeader.LessThanEquals;
            filter.value = me.filterTo;
          }
          break;
      }
      if(me.col.isExtData && me.col.formatType === me.$ms.enum.FormatType.Date){
        filter.value = filter.value + '';
        filter.from = filter.from + '';
        filter.to = filter.to + '';
      }
    },
    /**
     * Kiểm tra có thay đổi filter so với lúc mở form lên không
     */
    checkChangeFilter() {
      const me = this;

      if (me.col.filter.operator !== me.filterOperator) {
        return true;
      }

      switch (me.filterOperator) {
        case me.$ms.enum.FilterHeader.Between:
          return (
            me.col.filter.from !== me.filterFrom ||
            me.col.filter.to !== me.filterTo
          );
        default:
          return me.col.filter.value !== me.filterValue;
      }
    },
    /**
     * Xử lý khi enter trong filter input
     */
    inputEnter(e) {
      e.preventDefault();

      this.$nextTick(() => {
        this.filterClick();
      });
    },
    /**
     * Bấm lọc
     */
    filterClick() {
      //validate
      if (!this.isValid()) {
        return;
      }

      //nếu filter của column khác với giá trị trên giao diện thì sẽ cập nhật giá trị theo giao diện và trigger event để load lại dữ liệu
      //else -> chỉ ẩn box đi thôi
      if (this.checkChangeFilter()) {
        this.submitFilter();

        this.col.hasActionFilter = true;
        //gán cờ là đã thực hiện lọc để chốc hiển thị icon lọc
        this.raiseFilterEvent();
      }

      this.hide();
    },
    /**
     * Kiểm tra dữ liệu nhập vào có hợp lệ không
     */
    isValid() {
      let me = this;
      if (me.$refs.validateObserver) {
        if(!me.$refs.validateObserver.validate()){
          return false;
        }
      }
      if(me.filterOperator && me.filterOperator != me.$ms.enum.FilterHeader.Null && me.filterOperator != me.$ms.enum.FilterHeader.NotNull && me.filterOperator != me.$ms.enum.FilterHeader.Between){
        if((!me.filterValue && me.filterValue != 0)  || (me.filterValue && !(me.filterValue +"").trim() && (me.filterValue +"").trim() != '0')){
          return false;
        }
      }
      if(me.filterOperator && me.filterOperator == me.$ms.enum.FilterHeader.Between){
        if(!me.filterTo && !me.filterFrom){
          return false;
        }
      }
      if(!me.filterOperator && !me.filterValue){
        return false;
      }
      return true;
    },
    /**
     * Bấm bỏ lọc
     */
    resetClick() {
      //nếu filter của column khác với mặc định thì sẽ reset giá trị và trigger event để load lại dữ liệu
      //else -> chỉ ẩn box đi thôi
      if (
        this.col.filter.operator !== this.defaultFilterOperator ||
        this.col.filter.value !== this.defaultFilterValue
      ) {
        this.col.filter.operator = this.defaultFilterOperator;
        this.col.filter.value = this.defaultFilterValue;
        this.col.filter.from = null;
        this.col.filter.to = null;

        this.raiseFilterEvent();
      }
      this.grid.removeFilterItem(this.col);
      //ẩn icon lọc trên th của grid
      this.col.hasActionFilter = false;
      if (this.ownerForm) {
        this.ownerForm.showOption = false;
      }
      this.hide();
    },
    /**
     * trigger event cho grid
     */
    raiseFilterEvent() {
      this.ownerForm.$emit("buildFilter", this.col);
      this.grid.$emit("filter", this.col);
    },
    /**
     * Đổi operator
     */
    changeOperator(value) {
      if (this.filterOperator !== value) {
        this.filterOperator = value;
      }

      this.focusInputControl();
    },
    /**
     * Focus control nhập liệu
     */
    focusInputControl() {
      let input = this.$el.querySelector("input");
      if (input) {
        input.focus();

        if (typeof input.select === "function") {
          input.select();
        }
      }
    }
  }
};
