import commendationDetailAPI from "@/apis/commendation/commendationDetailAPI";

export const commendationDetailData = {
  data() {
    return {
      //Dữ liệu combo danh hiệu thi đua
      comboEmulationTitle: [],

      //Combo hình thức khen thưởng
      comboRewardCategory: [],

      //Combo organization tree
      cboOrganizationSource: [],

      listParentDepartment: [],
    };
  },

  watch: {},

  methods: {
    /**
     * Gọi lấy dữ liệu danh sách danh hiệu thi đua combobox
     * NTTHANH1 25/11/2021
     * @param {*} payload
     */
    getEmutationTitleFromVotation(payload) {
      const me = this;
      if (typeof me.customPayloadCombo === "function") {
        me.customPayloadEmulationCombo(payload);
      }

      commendationDetailAPI
        .getListRewardFromVotation(payload)
        .then((result) => {
          me.comboEmulationTitle = result.PageData;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    /**
     * Gọi lấy dữ liệu danh sách hình thức khen thưởng combobox
     * NTTHANH1 25/11/2021
     * @param {*} payload
     */
    getRewardCategoryFromVotation(payload) {
      const me = this;
      if (typeof me.customPayloadCombo === "function") {
        me.customPayloadRewardCombo(payload);
      }

      commendationDetailAPI
        .getListRewardFromVotation(payload)
        .then((result) => {
          me.comboRewardCategory = result.PageData;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    /**
     * Lấy danh sách đơn vị cho combo tree
     * @param {*} payload
     */
    getListOrganizationTree(payload) {
      const me = this;
      if (typeof me.customPayloadCombo === "function") {
        me.customPayloadCombo(payload);
      }

      commendationDetailAPI
        .getListOrganizationTree(payload)
        .then((result) => {
          me.cboOrganizationSource = result.PageData;
        })
        .catch((err) => {
          console.log(err);
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

      commendationDetailAPI.loadListDepartmentByOrgID(payload).then((result) => {
        me.listParentDepartment = result.PageData;

      });
    },
  },
};
