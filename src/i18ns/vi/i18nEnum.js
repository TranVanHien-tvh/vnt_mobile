export default {
  //Common
  FormState: {
    Add: "Thêm",
    View: "Xem",
    Edit: "Sửa",
    Duplicate: "Nhân bản",
    QuickAdd: "Thêm nhanh",
  },

  /**
   * Tên Entity Ghi auditLog
   */
  AuditingLogAction: {
    Login: "Đăng nhập",
    Logout: "Đăng xuất",
    Insert: "Thêm",
    Edit: "Sửa",
    Delete: "Xóa",
    Import: "Nhập khẩu",
  },

  /**
   * Toán tử filter
   */
  FilterHeader: {
    Contains: "Chứa",
    Notcontains: "Không chứa",
    StartsWith: "Bắt đầu với",
    EndsWith: "Kết thúc với",
    Null: "(Trống)",
    NotNull: "(Không trống)",
    Equals: "Bằng",
    NotEquals: "Khác",
    GreaterThan: "Lớn hơn",
    GreaterThanEquals: "Lớn hơn hoặc bằng",
    LessThan: "Nhỏ hơn",
    LessThanEquals: "Nhỏ hơn hoặc bằng",
    Between: "Trong khoảng",
  },

  //Bussiness

  /*
   * Enum trạng thái của cơ cấu tổ chức
   */
  OrganizationStatus: {
    All: "Tất cả",
    Inactive: "Ngừng theo dõi",
    Active: "Đang theo dõi",
  },

  /**
   * Loại đối tượng
   */
  EnumObjectType: {
    All: "Tất cả",
    Personal: "Cá nhân",
    Organization: "Tập thể",
  },

  /**
   * Loại phong trào thi đua
   */
  EnumEmulationType: {
    All: "Tất cả",
    Always: "Thường xuyên",
    ByTimes: "Theo đợt(chuyên đề)",
  },

  /**
   * Loại phong trào thi đua màn danh hiệu thi đua
   * ntthanh1
   */
  EmulationTypeEmulationTitle: {
    All: "Thường xuyên; Theo đợt",
    Always: "Thường xuyên",
    ByTimes: "Theo đợt",
  },

  /**
   * Loại phong trào thi đua bind trên grid
   * NMTUAN3 17/11/2021
   */
  EnumEmulationTypeColumn: {
    All: "Tất cả phong trào",
    Regular: "Thường xuyên",
    ByTimes: "Theo đợt",
    Process: "Quá trình cống hiến",
    Rush: "Đột xuất",
  },

  /**
   * Loại trạng thái
   */
  EnumStatusType: {
    Active: "Đang sử dụng",
    Inactive: "Ngừng sử dụng",
  },

  /**
   * Hiện vật khen thưởng
   * NMTUAN3 28/10/2021
   */
  RewardThingID: {
    Medal: "Huân chương",
    StateHonors: "Danh hiệu vinh dự nhà nước",
    Prize: "Giải thưởng",
    CampaignMedal: "Kỷ niệm chương, huy hiệu",
    Commendation: "Giấy khen",
    Certificate: "Bằng khen",
  },

  /**
   * Cấp khen thưởng
   * NMTUAN3 28/10/2021
   */
  CommendationLevel: {
    GovernmentLevel: "Cấp Nhà nước",
    ProvinceLevel: "Cấp Tỉnh/tương đương",
    DistrictLevel: "Cấp Huyện/tương đương",
    VillageLevel: "Cấp Xã/tương đương",
  },

  /**
   * Đối tượng khen thưởng
   * NDHUY 15.09.2021
   */
  Object: {
    Individual: "Cá nhân",
    Team: "Tập thể",
    Both: "Cá nhân và tập thể",
  },

  /**
   * Đối tượng tham gia
   * TDNGHIA clone ra đặt tên lại cho đúng
   */
  CompeteeType: {
    Individual: "Cá nhân",
    team: "Tập thể",
    Both: "Cá nhân và tập thể",
  },

  /**
  * Nhóm chức vụ
  * DHPHI 16.09.2021
  */
  JobPositionGroup: {
    Secretary: "Bí thư",
    Chairperson: "Chủ tịch",
    DeputySecretary: "Phó bí thư",
    ViceChairman: "Phó chủ tich",
    Director: "Giám đốc",
    ViceDirector: "Phó giám đốc",
    HeadOfDepartment: "Trưởng phòng",
  },
  /**
* Cấp áp dụng
* DHPHI 16.09.2021
*/
  ApplyGroup: {
    ProvincialLevel: "Cấp tỉnh",
    DistrictLevel: "Cấp huyện",
    VillageLevel: "Cấp xã",
  },
  /**
  * Áp dụng cho sự nghiệp
  * DHPHI 16.09.2021
  */
  ApplyCareer: {
    Education: "Giáo dục",
    Medican: "Y tế",
    EducationAndMedican: "Giáo dục và y tế"
  },
  /**
* loại chức vụ/chức danh
* DHPHI 16.09.2021
*/
  JobPositionType: {
    All: "Tất cả loại",
    Position: "Chức vụ",
    Title: "Chức danh",
  },

  /**
   * Trạng thái
   */
  Inactive: {
    Inactive: "Ngừng sử dụng",
    Active: "Sử dụng",
  },

  /**
   * Loai trạng thái
   * ntthanh1
   */
  InactiveType: {
    Inactive: "Ngừng sử dụng",
    Active: "Sử dụng",
  },

  //giới tính
  EnumGender: {
    Male: "Nam",
    Female: "Nữ",
    Other: "",
  },

  /**
   * Trạng thái diễn ra
   * DLHuy 21.09.2021
   */
  MovementAction: {
    InProcess: "Đang diễn ra",
    NotInProcess: "Chưa diễn ra",
    Processed: "Đã kết thúc",
  },

  /**
   * Trạng thái đăng ki
   * DHPhi 02.10.2021
   */
  MovementActionRegister: {
    All: "Tất cả",
    Unregistered: "Chưa đăng kí",
    Unsent: "Chưa gửi",
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
    Denied: "Bị từ chối"
  },

  /**
   * Trạng thái phát động
   * DLHuy 21.09.2021
   */
  IsMotive: {
    Motive: "Đã phát động",
    NotMotive: "Chưa phát động",
    //Processed: "Đã phát động" //Trạng thái này là đã phát động nhưng phòng trào lại kết thúc mất rồi,
  },

  /**
   * Loại phong trào
   * DLHuy 21.09.2021
   */
  EmulationType: {
    InPeriod: "Theo đợt",
    InRegular: "Thường xuyên",
  },

  /**
   * Cấp phát động
   * DLHuy 23.09.2021
   */
  GroupMotive: {
    Government: "Cấp Nhà nước",
    Province: "Cấp Tỉnh/tương đương",
    District: "Cấp Huyện/tương đương",
    Town: "Cấp Xã/tương đương",
  },

  /**
   * Đối tượng của phong trào
   * DLHuy 23.09.2021
   */
  ApplyObject: {
    Personal: "Cá nhân",
    Group: "Tập thể",
    PerAndGroup: "Cá nhân và tập thể",
    Family: "Hộ gia đình",
  },

  /**
   * Trạng thái tham gia phong trào
   * DLHuy 01.10.2021
   */
  IsJoined: {
    Join: "Đã tham gia",
    NotJoin: "Chưa tham gia"
  },

  /**
   * Trạng thái của màn tôi lập trong đăng ký thi đua phong trào thường xuyên
   * DLHuy 07.10.2021
   */
  EmulationRegisterStatus: {
    All: "Tất cả",
    UnRegistered: "Chưa đăng ký",
    UnSent: "Chưa gửi",
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt"
  },

  /**
   * Trạng thái duyệt (chi tiết tôi duyệt)
   * DLHuy 07.10.2021
   */
  ApproveDetailStatus: {
    All: "Tất cả",
    UnSent: "Chưa gửi",
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
  },

  /**
   * Trạng thái duyệt của màn tổng hợp (để build tab navigation)
   * DLHuy 13.10.2021
   */
  SynthesizeStatus: {
    All: "Tất cả",
    UnSent: "Chưa gửi",
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
  },

  /**
 * Lĩnh vực nghề nghiệp
 * NTBAO 28.09.2021
 */
  CareerField: {
    Education: "Giáo dục- đào tạo và dạy nghề",
    Technology: "Khoa học và công nghệ",
    Medican: "Y tế, dân số và gia đình",
    Cultural: "Văn hóa thông tin",
    News: "Phát thanh, truyền hình, thông tấn",
    Sport: "Thể dục, thể thao",
    EnvironmentalProtection: "Bảo vệ môi trường",
    Economy: "Các hoạt động kinh tế",
    StateManagement: "Quản lý nhà nước",
    SocialSecurity: "Bảo đảm xã hội",
    NotStateBudget: "Ngoài ngân sách nhà nước",
    Other: "Các đơn vị đặc thù, đơn vị khác",
  },

  /**
   * Trạng thái tờ trình
   * TDNGHIA 11/10/2021
   */
  DocumentaryState: {
    Sent: "Đã gửi",
    UnSend: "Chưa gửi"
  },

  /**
   * Lập quyết định
   * TDNGHIA 19/10/2021
   */
  SubmitState: {
    Created: "Đã lập",
    UnCreated: "Chưa lập",
  },

  /**
  * Bình xét
  * DHPHI 28/12/2021
  */
  VotationState: {
    Finish: "Đã bình xét",
    UnFinish: "Chưa bình xét"
  },

  RegisterStatus: {
    Finish: "Hoàn thành",
    UnFinish: "Chưa hoàn thành"
  },

  /**
   * Enum trạng thái ban hành khen thưởng
   * NMTUAN2 27.10.2021
   */
  PromulgateStatus: {
    Promulgate: "Đã phát động",  // đã phát động
    NotPromulgate: "Chưa phát động", // chưa phát động
  },

  /**
  * Trong/ngoài đơn vị
  * NTBAO 01.11.2021
  */
  IsOutSider: {
    IsOutSider: "Ngoài đơn vị", //
    InSider: "Trong đơn vị", //
  },

  /**
   * Loại khen thưởng
   * NMTUAN 4/11/2021
   */
  CommendationType: {
    Rush: "Đột xuất",
    Process: "Quá trình cống hiến",
  },

  /**
  * resource để bind vào column header
  * TDNGHIA
  */
  ApplyLevel: {
    ProvinceLevel: "Khen thưởng cấp tỉnh/Tương đương",
    DistrictLevel: "Khen thưởng cấp huyện/Tương đương",
    WardLevel: "Khen thưởng cấp xã/Tương đương",
  },

  /**
  * Trạng thái đang theo dõi ngừng theo dõi
  */
  EnumStatusColumn: {
    All: "Tất cả",
    Inactive: "Đang theo dõi",
    Active: "Ngừng theo dõi"
  },

  /**
   * Loại quyết định khen thưởng
   * DLHuy 19.11.2021
   *  Đột xuất ở trước cống hiến
   */
  CommendationType: {
    InRegular: "Phong trào thường xuyên",
    InPeriod: "Phong trào theo đợt",
    UnExpected: "Khen thưởng đột xuất",
    Dedicated: "Khen thưởng quá trình cống hiến",
  },

  /**
   * Toán tử filter cho tìm kiếm nâng cao
   * NTBAO 10.12.2021
   */
  AdvanceSearchOperand: {
    CONTAINS: "Chứa",
    NOT_CONTAINS: "Không chứa",
    NULL: "Trống",
    NOT_NULL: "Không trống",
    EQUALS: "Là",
    NOT_EQUALS: "Không là",
    GREATE_THAN: "Lớn hơn",
    GREATE_THAN_EQUALS: "Lớn hoặc bằng",
    LESS_THAN: "Nhỏ hơn",
    LESS_THAN_EQUALS: "Nhỏ hoặc bằng",
    BETWEEN: "Trong khoảng",
    NOT_BETWEEN: "Ngoài khoảng",
    IN: "Là",
    NOTIN: "Không là",
    NUMBER_EQUALS: "Bẳng",
    NUMBER_NOT_EQUALS: "Khác",

    RANGE_DATE_EQUALS: "Bằng",
    RANGE_DATE_NOT_EQUALS: "Khác",
    RANGE_DATE_BETWEEN: "Trong khoảng",
    RANGE_DATE_NOT_BETWEEN: "Ngoài khoảng",
    RANGE_DATE_GREATE_THAN: "Lớn hơn",
    RANGE_DATE_GREATE_THAN_EQUALS: "Lớn hoặc bằng",
    RANGE_DATE_LESS_THAN: "Nhỏ hơn",
    RANGE_DATE_LESS_THAN_EQUALS: "Nhỏ hoặc bằng",

    YES: "Có",
    NO: "Không",
  },

  /**
   * Loại của combo từ ngày đến ngày khi theo đợt ở màn Phong trào thi đua
   * DLHuy 24.12.2021
   */
  TimeTypeInPeriod: {
    Day: "Ngày",
    Month: "Tháng",
    Year: "Năm"
  },

  TimeUnit: {
    Month: "Tháng",
    Year: "Năm"
  },

  /**
   * Trạng thái làm việc của cá nhân
   * tương đương enum bên QLCB
   * NMTUAN2 14.02.2022
   */
  EnumEmployeeStatus: {
    Working: "Đang làm việc",
    ForeignWork: "Đang đi công tác nước ngoài",
    Retiring: "Nghỉ hưu",
    LeaveJob: "Nghỉ việc",
  },

  /**
   * Chọn lập một/lập nhiều quyết định cho một phong trào
   * DLHuy 24.01.2022
   */
  CommendationDecisionOneOrMore: {
    One: "Lập một quyết định",
    More: "Lập nhiều quyết định"
  },

  /**
   * Danh sách tập thể, cá nhân đạt
   * DLHuy 24.01.2022
   */
  CommendationDecisionTakeFrom: {
    FromVotation: "Lấy từ bình xét",
    FromNew: "Lập mới"
  },

  /**
   * Danh sách tập thể, cá nhân đạt ở xã => Thực ra là để đổi text 
   * DLHuy 24.01.2022
   */
  CommendationDecisionTakeFrom_InWard: {
    FromVotation: "Lập từ dữ liệu bình xét",
    FromNew: "Lập mới"
  },

  /**
   * Lập quyết định theo
   * DLHuy 25.01.2022
   */
  CommendationDecisionCreateBy: {
    ByTitle: "Từng danh hiệu/từng hình thức là 1 quyết định",
    ByUnit: "Từng đơn vị là 1 quyết định"
  },

  /**
  * Cấp công nhận sáng kiến
  * NTBAO 17.02.2022
  */
  InventApproveLevel: {
    GovernmentLevel: 'Cấp toàn quốc',
    ProvinceLevel: 'Cấp tỉnh',
    DistrictLevel: 'Cấp huyện',
    BranchLevel: 'Cấp ngành',
    SchoolLevel: 'Cấp trường',
  },

  /**
   * Kết quả đánh giá
   * NTBAO 17.02.2022
   */
  EvaluationResult: {
    ExcellentLevel: 'Hoàn thành xuất sắc nhiệm vụ', // 
    GoodLevel: 'Hoàn thành tốt nhiệm vụ', // 
    NormalLevel: 'Hoàn thành nhiệm vụ', // 
    FailedLevel: 'Không hoàn thành nhiệm vụ', // 
  },

    /**
   * Danh sách các tháng
   * npcuong 27.06.2022
   */
     MonthList: {
      January: "Tháng 1", // Tháng 1
      February: "Tháng 2", // Tháng 2
      March: "Tháng 3", // Tháng 3
      April: "Tháng 4", // Tháng 4
      May: "Tháng 5", // Tháng 5
      June: "Tháng 6", // Tháng 6
      July: "Tháng 7", // Tháng 7
      August: "Tháng 8", // Tháng 8
      September: "Tháng 9", // Tháng 9
      October: "Tháng 10", // Tháng 10
      November: "Tháng 11", // Tháng 11
      December: "Tháng 12", // Tháng 12
    },

};