import departmentAPI from "@/apis/dictionary/departmentAPI";

//Dungcho combo thuoc phong ban o to chuc chi tiet
export const departmentList = {
  data() {
    return {
      listParentDepartment: [],
    };
  },

  watch: {
    /**
     * Thay đổi dữ liệu -> reset source
     */
    "$store.state.department.version": function (newVal) {
      const me = this;
      me.listParentDepartment = null;
    },
  },

  methods: {
    /**
     * Gọi lấy dữ liệu danh sách phòng ban
     * TDNGHIA 28/10/2021
     * @param {*} payload
     */
    loadAllDepartment(payload) {
      const me = this;

      departmentAPI.getComboboxPaging(payload).then((result) => {
        me.listParentDepartment = result.PageData;
      });
    },

    /**
     * Lấy danh sách phòng ban theo đơn vị cho combo
     * NTBAO 24.11.2021
     * @param {*} payload
     */
    loadListDepartmentByOrgID(payload) {
      const me = this;

      if (typeof me.customPayloadCombo === "function") {
        me.customPayloadCombo(payload);
      }

      departmentAPI.loadListDepartmentByOrgID(payload).then((result) => {
        me.listParentDepartment = result.PageData;
        // me.listParentDepartment.splice(0, 0, {
        //   DepartmentID: -1,
        //   DepartmentName: "Tất cả",
        // });
      });
    },
  },
};
