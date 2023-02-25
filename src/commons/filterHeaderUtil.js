import Vue from "vue";
import commonFn from "@/commons/commonFunction";
import i18n from "@/i18ns/i18n";
import { MSEnum } from "@/commons/enumeration";

/**
 * Lớp xử lý hiển thị lọc cột
 * @author bnduc 24.9.2020
 */
class FilterHeaderUtil {
  /**
   * Hiển thị tùy chọn của cột
   */
  showOption(th, column, isLock) {
    var me = this,
      options = {},
      promise = null;

    //ẩn options cũ đi
    let lastShow = window._lastThOption,
      optionType = me.getColumnOptionType(column),
      frm = window._thOptions[optionType];
    let removeLastActive = function (optionFrm) {
      if (optionFrm.$el && typeof optionFrm.$el.closest === "function") {
        let lastThEl = optionFrm.$el.closest("th");
        if (lastThEl) {
          let lastTh = commonFn.mapDomToVue(lastThEl);
          if (lastTh) {
            lastTh.thOptionClass = null;
          }
        }
      }
    };

    if (lastShow && lastShow !== frm) {
      removeLastActive(lastShow);

      lastShow.hide();
    } else if (frm) {
      if (frm.ownerForm === th) {
        frm.col = column;
        frm.isLock = isLock;
        frm.moduleAutocomplete = th.moduleAutocomplete;
        let isShow = frm.toggle(th.$el);
        th.thOptionClass = isShow ? "active-option" : null;
        return;
      } else {
        removeLastActive(frm);
      }
    }
    if (!th.component) {
      let component = me.getOptionComponent(column, th);

      promise = new Promise((resolve, reject) => {
        let fnSuccess = function (module) {
          if (module && module.default) {
            th.component = module.default;

            me.showOptionDialog(th.component, th, options, column, isLock);
          }
        };

        let fnFailure = function (error) {
          commonFn.handleException(error);
          reject(error);
        };

        component.then(fnSuccess, fnFailure);
      });
    } else {
      promise = me.showOptionDialog(th.component, th, options, column, isLock);
    }

    return promise;
  }
  /**
   * Lấy component của column
   */
  getOptionComponent(column, th) {
    switch (this.getColumnOptionType(column)) {
      case th.$ms.enum.FormatType.None:
        return import(
          "@/components/msgridviewer/columnoption/msThOptionNoFilter.vue"
        );
      case th.$ms.enum.FormatType.Enum:
        return import(
          "@/components/msgridviewer/columnoption/msThOptionEnum.vue"
        );
      case th.$ms.enum.FormatType.Number:
      case th.$ms.enum.FormatType.Rate:
      case th.$ms.enum.FormatType.Quantity:
        return import(
          "@/components/msgridviewer/columnoption/msThOptionNumber.vue"
        );
      case th.$ms.enum.FormatType.Date:
      case th.$ms.enum.FormatType.DateTime:
      case th.$ms.enum.FormatType.Time:
        return import(
          "@/components/msgridviewer/columnoption/msThOptionDate.vue"
        );
      case th.$ms.enum.FormatType.Checkbox:
        return import(
          "@/components/msgridviewer/columnoption/msThOptionBoolean.vue"
        );
      case th.$ms.enum.FormatType.Progress:
        return import(
          "@/components/msgridviewer/columnoption/msThOptionProgress.vue"
        );
      case th.$ms.enum.FormatType.FilterStateGrid:
        return import(
          "@/components/msgridviewer/columnoption/msThOptionEnumDropDown.vue"
        );
      default:
        return import(
          "@/components/msgridviewer/columnoption/msThOptionText.vue"
        );
    }
  }

  /**
   * Lấy loại option của cột
   */
  getColumnOptionType(column) {
    if (column.filterable === false) {
      return MSEnum.FormatType.None;
    } else if (column.enumName || column.enum) {
      if (!column.formatType) {
        return MSEnum.FormatType.Enum;
      }
    }

    return column.formatType;
  }

  /**
   * Hiển thị tùy chọn của cột
   */
  showOptionDialog(component, owner, options, column, isLock) {
    let promise = new Promise((resolve, reject) => {
      if (owner && component) {
        let frm = this.prepareForDialog(column, component, owner, {
          i18n,
          propsData: {
            col: column,
            isLock: isLock,
            ownerForm: owner,
            moduleAutocomplete: owner.moduleAutocomplete,
          }
        });
        if (frm) {
          window._lastThOption = frm;

          frm.ownerForm = owner;
          frm.col = column;
          frm.isLock = isLock;
          frm.moduleAutocomplete = owner.moduleAutocomplete;
          frm.show(owner.$el);

          owner.thOptionClass = "active-option";
        }
      }
    });

    return promise;
  }

  /**
   * Xử lý hiển thị dialog
   * @author DNThang - 30.10.2019
   * DNThang - 06.05.2020: Trong trường hợp owner là popup thì sẽ append vào content để không bị chìm ở dưới
   */
  prepareForDialog(column, component, owner, options) {
    const me = this,
      optionType = me.getColumnOptionType(column);

    let frm = window._thOptions[optionType];
    if (!frm) {
      var frmType = Vue.extend(component);
      frm = new frmType(options);
      frm.$mount();
      window._thOptions[optionType] = frm;
    }

    // owner.$el.appendChild(frm.$el);
    document.body.appendChild(frm.$el);

    return frm;
  }
  /**
   * Sinh ra function để lọc local cho 1 số màn hình danh sách
   * @param {String} keyword Từ khóa tìm kiếm
   * @param {Array} columns danh sách cột của grid
   * @param {Array} filter bộ lọc của grid
   * @author NVLAM 01.12.2020
   */
  generateFilterFn(keyword, columns) {
    let filterFn = null,
      words = commonFn.splitKeyWord(keyword);
    filterFn = function (data) {
      let match = false;
      for (let i = 0; i < columns.length; ++i) {
        let col = columns[i];
        if (
          col.columnType === "ColumnText" ||
          col.columnType === "ColumnDrilldown"
        ) {
          let field = col.dataField;
          match = words.every(w => data[field].includes(w));
        }
        if (match) {
          break;
        }
      }
      return match;
    };
    return filterFn;
  }
}

export default new FilterHeaderUtil();
