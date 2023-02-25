import organizationAPI from "@/apis/dictionary/organizationAPI";
import emulationRegisterAPI from "@/apis/movement/emulationRegisterAPI";
//Combo danh hiệu thi đua
//TDNGHIA 1/11/2021
export const organizationData = {
  data() {
    return {
      organizationSource: [],
    };
  },

  watch: {
    /**
     * Thay đổi dữ liệu -> reset source
     */
    "$store.state.organization.version": function (newVal) {
      const me = this;
      me.organizationSource = null;
    },
  },

  methods: {
    /**
     * Gọi lấy dữ liệu danh sách phòng ban
     * TDNGHIA 28/10/2021
     * @param {*} payload
     */
    loadOrganizationSource(payload) {
      const me = this;
      if (typeof me.customPayloadCombo === "function") {
        me.customPayloadCombo(payload);
      }

      organizationAPI
        .getComboboxPaging(payload)
        .then((result) => {
          me.organizationSource = result.PageData;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    /**
     * Lấy danh sách đơn vị cho combo tree
     * NTBAO 24.11.2021
     * @param {*} payload
     */
    loadOrganizationTreeCombo(payload) {
      const me = this;
      if (typeof me.customPayloadCombo === "function") {
        me.customPayloadCombo(payload);
      }

      organizationAPI
        .loadListOrganizationTreePaging(payload)
        .then((result) => {
          me.organizationSource = result.PageData;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    /**
     * Lấy danh sách đơn vị có tham gia phong trào thi đua cho combo đơn vị - Đăng ký thi đua
     * NTBAO 08.11.2021
     * @param {*} payload
     */
    loadEmulationOrgTreeSource(payload) {
      const me = this;

      if (typeof me.customPayloadCombo === "function") {
        me.customPayloadCombo(payload);
      }

      emulationRegisterAPI.loadListOrgTreePaging(payload).then((result) => {
        let administrativeLevel = me.context.Organization.AdministrativeLevel;
        let organizationID = me.context.Organization.OrganizationID;
        let datas = [];
        
        for (let i = 0; i < result.PageData.length; i++) {
          const item = result.PageData[i];
          // Chỉ hiện các đơn vị có danh hiệu/hình thức ở cấp hiện tại
          let rewardInLevel = JSON.parse(
            item.RewardRegister ? item.RewardRegister : "[]"
          ).filter((x) => x.CommendationLevel <= administrativeLevel);
          if (item.OrganizationID == organizationID || rewardInLevel.length > 0) {
            datas.push(item);
          }
        }
        me.organizationSource = datas;
      });
    },
  },
};
