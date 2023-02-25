import pickListAPI from "@/apis/dictionary/pickListAPI";

export const pickList = {
  data() {
    return {
        dataPickList: []
    };
  },

  watch: {
  },

  methods: {
    /**
     * Lấy dữ liệu Picklist cho combobox
     * NTTHANH1
     * @param {*} payload
     */
     loadAllPickList(payload) {
        const me = this;

        if (typeof me.customPayloadPickList === "function") {
            me.customPayloadPickList(payload);
        }
  
        pickListAPI.loadAllPickList(payload).then((result) => {
          me.dataPickList = result.PageData;
        });
      },
  },
};
