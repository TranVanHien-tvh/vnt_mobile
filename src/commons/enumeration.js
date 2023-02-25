export const MSEnum = {
  //===============BASE=================

  AuditingLogAction: {
    /*
     * Đăng nhập
     */
    Login: 1,
    /*
     * Đăng xuất
     */
    Logout: 2,
    /*
     * Thêm dữ liệu
     */
    Insert: 10,
    /*
     * Sửa dữ liệu
     */
    Edit: 11,
    /*
     * Xóa dữ liệu
     */
    Delete: 12,
    /*
     * Nhập khẩu
     */
    Import: 16,
  },
  /**
   * Định dạng dữ liệu hiển thị
   */
  FormatType: {
    //Loại mà không xử lý gì cả
    None: 0,

    //Kiểu chữ
    Text: 1,

    //Số lượng
    Quantity: 2,

    //Kiểu số không có định dạng sau dấu phẩy
    Number: 3,

    //Hệ số, Tỷ lệ
    Rate: 4,

    //Kiểu tích chọn
    Checkbox: 5,

    //Kiểu ngày tháng
    Date: 6,

    //Kiểu thời gian
    Time: 7,

    //Kiểu ngày/tháng/năm có giờ
    DateTime: 8,

    //Kiểu năm
    Year: 9,

    //Kiểu danh sách
    List: 15,

    // Join mảng theo dấu ;
    Join: 17,

    //Group Item
    GroupItem: 18,

    //Kiểu số không có định dạng sau dấu phẩy
    Number: 20,

    //Kiểu text nhưng trên grid khi click vào sẽ drilldown
    Drilldown: 21,

    //Format trạng thái
    Status: 22,

    //Format giới tính
    Gender: 23,

    //Format file size
    FormatFileSize: 24,

    //Format tiến độ %
    Progress: 25,

    //Kiểu chữ trong textarea
    TextArea: 26,

    //Định dạng dữ liệu html
    Html: 99,

    //Kiểu enum
    Enum: 100,

    //Kiểu cho các filter trạng thái trên grid
    FilterStateGrid: 101,
  },

  OptionFormat: {
    None: -1, //mặc định
    ZeroToMinus: 0, //nếu giá trị là số không thì trả về '-'
    ZeroToZero: 1, //nếu giá trị là số không thì trả về 0
    ZeroToEmpty: 2, //nếu giá trị là số không thì trả về trống
    EmptyToMinus: 3, //nếu giá trị là trống thì trả về '-'
    EmptyToZero: 4, //nếu giá trị là trống thì trả về 0
    EmptyToEmpty: 5, //nếu giá trị là trống thì trả về trống
  },

  /**
   * Trạng thái sắp xếp
   */
  SortStatus: {
    /**
     * Không sort
     */
    none: 0,

    /**
     * Giảm dần
     */
    desc: 1,

    /**
     * Tăng dần
     */
    asc: 2,
  },

  /**
   * Trạng thái của form
   */
  FormState: {
    /**
     * Mode View
     */
    View: 0,

    /**
     * Thêm
     */
    Add: 1,

    /**
     * Sửa
     */
    Edit: 2,

    /**
     * Nhân bản
     */
    Duplicate: 4,

    /**
     * Thêm nhanh
     */
    QuickAdd: 5,
  },

  /**
   * Mode save truyền lên server để điều khiển
   */
  SaveMode: {
    Save: 0,
    SaveNew: 1,
    SaveView: 2,
    SaveAndConfig: 3,
  },

  /**
   * Loại xóa 1 bản ghi hay nhiều bản ghi
   */
  DeleteType: {
    Single: 0,
    Multi: 1,
  },

  /**
   * Loại xóa 1 hay nhiều tệp đính kèm
   */
  DeleteAttachmentType: {
    Single: 1,
    Multi: 2,
  },

  /**
   * Các loại kết quả validate trả về lỗi
   */
  ValidateResultType: {
    /**
     * Lỗi
     * Hiển thị thông báo và dừng lại
     */
    Error: 0,
    /**
     * Thông tin
     * Hiển thị thông báo và vẫn tiếp tục xử lý
     */
    Info: 1,
    /**
     * Cảnh báo - chỉ thông báo
     * Hiển thị thông báo và vẫn tiếp tục xử lý
     */
    Alert: 2,
    /**
     * Cảnh báo - cần xác nhận
     * Hiển thị confirm có tiếp tục xử lý không
     */
    Warning: 9,
  },

  /**
   * Enum cấu hình style của ô check box multi-grid
   */
  ShortKeyToolTip: {
    Add: "F9",
    Close: "Đóng", //Đóng
    Save: "Ctrl + S", //Cất
    SaveAndAdd: "Ctrl + Shift + S", //Cất và thêm
    Help: "F1", //Giúp
    Print: "Ctrl + P", //IN
    Maximum: "Ctrl + Space", //phóng to thu nhỏ form
    QuickSelect: "F3", //chọn nhanh
  },

  /**
   * Loại cột - xác định editor
   */
  ColumnType: {
    Text: 0,
    Combobox: 1,
    Number: 2,
    Checkbox: 3,
    Datepicker: 5,
    Dropdown: 6,
    Template: 7,
    TextArea: 8,
    Enum: 9,
  },

  /**
   * Trạng thái của model
   */
  ModelState: {
    None: 0,
    Insert: 1,
    Update: 2,
    Delete: 3,
    Duplicate: 4,
  },

  /**
   * Filter header của grid
   */
  FilterHeader: {
    Contains: "contains",
    Notcontains: "notContains",
    StartsWith: "startsWith",
    EndsWith: "endsWith",
    Null: "is null",
    NotNull: "is not null",
    Equals: "=",
    NotEquals: "!=",
    GreaterThan: ">",
    GreaterThanEquals: ">=",
    LessThan: "<",
    LessThanEquals: "<=",
    Between: "[]",
    Or: "or",
  },

  /**
   * Enum cấu hình style của ô check box multi-grid
   */
  StyleCheckBoxMulti: {
    Width: 54,
  },

  //===============VNT=================

  AttachmentType: {
    Image: 1,
    File: 2,
    Link: 3,
  },

    /**
   * Danh sách các tháng
   */
     MonthList: {
      January: 1, // Tháng 1
      February: 2, // Tháng 2
      March: 3, // Tháng 3
      April: 4, // Tháng 4
      May: 5, // Tháng 5
      June: 6, // Tháng 6
      July: 7, // Tháng 7
      August: 8, // Tháng 8
      September: 9, // Tháng 9
      October: 10, // Tháng 10
      November: 11, // Tháng 11
      December: 12, // Tháng 12
    },
  //===============END VNT=================
};
