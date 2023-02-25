import { MSEnum } from "@/commons/enumeration";
import popupUtil from "@/commons/popupUtil";
import customFieldApi from "@/apis/system/customFieldAPI";
/**
 * Xử lý filter
 */
export const customField = {
  props: {},
  data: function() {
    window._xx = this;
    return {
      /**
       * Tên bảng target
       */
      customFieldType: null,
      /**
       * Cấu hình custom field của form
       */
      customFieldConfig: {
        /**
         * Số lượng trường đã xử lý
         * Dùng món này để khi thêm trường mới sẽ không trùng với các trường đã sinh
         */
        count: 0,
        /**
         * Danh sách các trường
         */
        fields: 0
      }
    };
  },
  created() {},
  methods: {
    /**
     * load dữ liệu customField
     */
    loadCustomField() {
      const me = this;

      if (me.customFieldType) {
        if (!window._customField) {
          window._customField = {};
        }

        if (window._customField[me.customFieldType]) {
          me.setCustomFieldConfig(window._customField[me.customFieldType]);
        } else {
          customFieldApi
            .get(me.customFieldType)
            .then(res => {
              me.setCustomFieldConfig(res);
            })
            .catch(err => {
              console.error(err);
            });
        }
      }
    },
    /**
     * Gán dữ liệu customField
     * pvduy 05/07/2021: thêm đoạn xử lý đối với trường hợp data trống.
     */
    setCustomFieldConfig(config) {
      const me = this;
      let data = config || {fields:[]};

      window._customField[me.customFieldType] = data;
      me.customFieldConfig = data;
      me.customFieldLoaded();
    },
    /**
     * hàm được gọi khi dữ liệu customField được load xong
     */
    customFieldLoaded() {

    },
    /**
     * Mặc định dữ liệu customfield cho data theo config
     */
    defaultCustomFieldValue(data) {
      const me = this,
        fields = me.customFieldConfig.fields;

      if (Array.isArray(fields)) {
        fields.forEach(item => {
          if (!data.hasOwnProperty(item.field)) {
            let value = null;
            switch (item.type) {
              case MSEnum.CustomFieldType.Bool:
                value = false;
                break;
            }
            data[item.field] = value;
          }
        });
      }
    },
    /**
     * Hiển thị form sửa cấu hình customField
     */
    showCustomFieldEdit() {
      const me = this;
      let param = {
        type: me.customFieldType,
        config: me.customFieldConfig
      };

      popupUtil.show(me, "CustomField", param, {
        submit: function(data) {
          me.setCustomFieldConfig(data);
        }
      });
    }
  }
};
