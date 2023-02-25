import { MSEnum } from "@/commons/enumeration";
import Utility from "@/commons/utility";
import commonFn from "@/commons/commonFunction";
import i18n from "@/i18ns/i18n";

export const exportList = {
  props: {},
  data: function() {
    return {};
  },
  created() {},
  methods: {
    /**
     * Lấy tham số xuất khẩu
     */
    getGridExportParameter(grid) {
      let parameter = {
        Columns: this.convertColumnFromLayout(grid),
        // GetDataUrl: grid.store.proxy.apiUrl,
        // GetDataMethod: this.customGetDataMethodExport(grid),
        GetDataParam: this.lastParam || {},
        DataCount: grid.pageTotal || grid.rowNumber,
        Resources: {}
      };

      //duyệt các cột, nếu cột nào là enum thì build seource gửi lên
      parameter.Columns.forEach(item => {
        if (item.Enum && !parameter.Resources[item.Enum]) {
          let enums = MSEnum[item.Enum],
            enumSource = {}
          for (let i in enums) {
            enumSource[String(enums[i])] = commonFn.getEnumResource(enums[i], item.Enum);
          }

          parameter.Resources[item.Enum] = enumSource;
        }
      });

      //gom resource group, stt, summary... vào Common
      const localize = i18n,
        commonRs = localize.messages[localize.locale]["i18nCommon"]["exportCommon"] || {};
      parameter.Resources.Common = commonRs;

      this.customExportParameter(parameter);

      return parameter;
    },

    /**
     * Created by: pvduong1 - 17/08/2020
     * Modified by PCMINH 26.11.2020: Sửa lại lấy method theo cấu hình của store
     */
    customGetDataMethodExport(grid) {
      return grid.store.proxy.method;
    },

    /**
     * Custom tham số xuất khẩu
     */
    customExportParameter(parameter) {},

    /**
     * Function Tạo danh sách column gửi lên xuất khẩu - in từ layout
     */
    convertColumnFromLayout(grid) {
      let me = this,
        result = [],
        columns = grid.columnx,
        isTree = typeof grid.isTree === "function" && grid.isTree();
      if (Array.isArray(columns)) {
        let i = 0;
        for (let config of columns) {
          if (isTree || me.checkExportColumn(config)) {
            let col = {
              Key: config.dataField,
              // DisplayField: config.exportDisplayField,
              Caption: config.caption,
              Width: parseInt(config.width || 180, 10)
            };

            if (config.exportDisplayField) {
              col.DisplayField = config.exportDisplayField;
            }

            /**
             * Sửa lỗi xử lý thiếu formatType --> truyền lên backend không căn lề phải các cột có định dạng số.
             * ModifiedBy: NTAnh2 (12/03/2021)
             */
            let formatType = config.formatType || config.dataFormat || config.dataType;
            if (formatType) {
              switch (formatType) {
                case "text":
                  col.FormatType = MSEnum.FormatType.Text;
                  break;
                case "checkbox":
                  col.FormatType = MSEnum.FormatType.Checkbox;
                  break;
                case 20:
                  col.FormatType = MSEnum.FormatType.Number;
                  break;
                case 11:
                  col.FormatType = MSEnum.FormatType.Quantity;
                  break;
                default:
                  col.FormatType = parseInt(formatType, 10);
                  break;
              }
            }

            //nếu cấu hình formattype là enum nhưng k có cấu hình enum thì sẽ để là text
            if (col.FormatType === MSEnum.FormatType.Enum && !config.enum) {
              delete col.FormatType;
            } else if (config.enum) {
              col.Enum = config.enum;
              col.FormatType = MSEnum.FormatType.Enum;
            }

            if (config.groupId && config.definition !== config.groupId) {
              let groupId = config.groupId;
              col.HeaderGroupKey = Utility.removeUnicodeAndSpace(groupId);
              col.GroupCaption = groupId;
            }
            if (config.wrapText != undefined) {
              col.WrapText = config.wrapText;
            }

            if (config.Align != undefined) {
              col.Align = config.Align;
            }

            // //TODO tạm fix là sum local
            // if (typeof config.footerText === "string") {
            //   col.FooterText = config.footerText;
            // } else if (typeof config.sumText === "string") {
            //   col.SumText = config.sumText;
            // } else if (
            //   config.footerCommand === "sum" ||
            //   config.footerCommand === "sumAll"
            // ) {
            //   const SumTypeLocal = me.$ms.enum.ExportSummaryType.Sum;
            //   col.Sum = SumTypeLocal;
            // }

            me.customExportColumn(col, config);

            result.push(col);
          }
        }

        //xử lý nhóm cột
        let headers = grid.headers;
        if (Array.isArray(headers) && headers.length > 1) {
          const parents = headers[0],
            childs = headers[1];
          let ix = 0,
            gi = 0,
            gs = {};

          parents.forEach(p => {
            if (p.isGroup && p.colspan) {
              let gkey = String(++gi);
              let gcaption = p.caption;

              for (let i = 0; i < p.colspan; i++, ix++) {
                let col = childs[ix];

                gs[col.dataField] = {
                  key: gkey,
                  caption: gcaption
                };
              }
            }
          });

          result.forEach(item => {
            let map = gs[item.Key];
            if (map) {
              item.HeaderGroupKey = map.key;
              item.GroupCaption = map.caption;
            }
          });
        }
      }

      return result;
    },

    /**
     * Custom thông tin của cột xuất khẩu
     */
    customExportColumn(column, config) {

    },

    /**
     * Cho các form custom lại có lấy cột này đẻ xuất khẩu không
     * @param {*} column : Cấu hình cột
     * @param {*} baseCheckResult : Kết quả check trên trên base
     */
    checkExportColumn(column) {
      switch (column.dataField) {
        case "branch_id":
        case "branch_name":
          return this.$ms.session.IsMultiBranch;
        default:
          return column.visible;
      }
    }
  }
};
