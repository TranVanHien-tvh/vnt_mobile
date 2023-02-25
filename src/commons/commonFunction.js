import Vue from "vue";
import i18n from "@/i18ns/i18n";
import { MSEnum } from "@/commons/enumeration";
import store from "@/stores/store";
import { ModuleContext } from "@/stores/module-const";
import _ from "lodash";
import moment from "moment";
import messageBox from "@/commons/messageBox";

let numberFormat = store.state[ModuleContext].NumberFormat;
let numeral = require("numeral");
/**
 * Class chứa các function dùng chung cho hệ thống phía client
 */
class CommonFunction {
  getMainLoading() {
    let el = document.body.querySelector("#mloading");
    return el;
  }
  mask() {
    let el = this.getMainLoading();
    if (el) {
      el.style.display = "flex";
    }
  }
  unmask() {
    let el = this.getMainLoading();
    if (el) {
      el.style.display = "none";
    }
  }
  infoLogging() { }

  /**
   * Log error
   * @param {*} error
   */
  errorLogging(error) {
    console.error(error);
  }

  /**
   * Xử lý exception
   */
  handleException(error, showAlert) {
    console.error(error);

    if (showAlert) {
      const msgBox = messageBox,
        localize = i18n;
      msgBox.showError(localize.t("i18nCommon.GlobalErrorMessage"));
    }
  }

  /**
   * Xử lý hiển thị dialog
   * @author DNThang - 30.10.2019
   * DNThang - 06.05.2020: Trong trường hợp owner là popup thì sẽ append vào content để không bị chìm ở dưới
   */
  prepareForDialog(component, owner, options) {
    var me = this;
    if (owner && component) {
      var frmType = Vue.extend(component),
        frm = new frmType(options);

      frm.$mount();

      if (owner.isMsPopup) {
        let contentElement = owner.$refs.popupx; //owner.$el.querySelector('.ms-popup-content.ms-popup');
        contentElement.appendChild(frm.$el);
      } else {
        if (owner instanceof Element) {
          owner.appendChild(frm.$el);
        } else {
          owner.$el.appendChild(frm.$el);
        }
      }

      return frm;
    }

    return;
  }
  /**
   * Build vue key cho data
   */
  genVKeyValue(data, field = "__vKeyValue") {
    if (data) {
      data.forEach((item) => {
        item[field] = this.generateUUID();
      });
    }
  }
  /**
   *  Tạo uuid
   *  Create by: pvduong1 - 30/08/2019
   */
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      let d = new Date().getTime();
      d += performance.now();
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  /**
   * Guild empty
   */
  generateEmptyUUID() {
    return "00000000-0000-0000-0000-000000000000";
  }
  /**
   * Kiểm tra 2 đối tượng có phải là cha con của nhau không
   */
  hasParent(child, parent) {
    if (child.parentElement) {
      if (child.parentElement === parent) {
        return true;
      } else {
        return this.hasParent(child.parentElement, parent);
      }
    }

    return false;
  }

  /**
   * Kiểm tra đối tượng có class style không
   * Modified nntam: thêm case cối vào cho không chết
   */
  hasClass(element, className) {
    if (element && element.className) {
      return element.className.indexOf(className) > -1;
    }
    return false;
  }

  /**
 * Thực hiện format định dạng đơn giá quy đổi
 */
   formatNumberDisplay(num, options) {
    let result = num;

    if (options && options.optionFormat == MSEnum.OptionFormat.ZeroToEmpty && num === 0) {
      return null;
    }

    if (typeof num === 'undefined' || num === null) {
      return "-";
    }

    if (num != undefined && num != null) {
      // && session           
      let digits = 0,//numberFormat.UnitPriceDecimalDigits,
        buildDigits = 0;
      this.formatSeperator(options);
      result = numeral(Number(num)).format("0," + buildDigits.toFixed(digits));
      result = this.formatNegative(result);
    }

    return result;
  }

  /**
 * Format định dạng số với kí tự ngăn cách trên tùy chọn theo báo cáo hoặc các form thường
 * @param {Object} options : tùy chọn hệ thống
 */
   formatSeperator(options) {
    let decimalCharacter = numberFormat.GeneralDecimalSeparator,
      digitGroupSeparator = numberFormat.GeneralGroupSeparator;

    if (options && options.isReport) {
      decimalCharacter = session.GeneralDecimalSeparatorReport;
      digitGroupSeparator = session.GeneralGroupSeparatorReport;
    }

    numeral.localeData().delimiters.decimal = decimalCharacter;
    numeral.localeData().delimiters.thousands = digitGroupSeparator;
  }

  /**
   * format số âm theo cấu hình
   * @param {*} value 
   * @returns 
   */
  formatNegative(value) {
    if (value.startsWith('-')) {
      let CurrencyNegativePattern = 0;
      switch (CurrencyNegativePattern) {
        case 0:
          value = ['(', value.substr(1), ')'].join('');
          break;
        case 2:
          value = value.substr(1) + '-';
          break;
      }
    }

    return value;
  }

  shortkeyPushView(el) {
    window.shortkeyView.remove(el);
    window.shortkeyView.push(el);
  }

  shortkeyPopView(el) {
    window.shortkeyView.remove(el);
  }

  /**
   * Xử lý render element động
   * modified by ntphong 28/5/2021 - isAppendTarget: nếu là append 1 đoạn code html vào 1 trong target
   */
  renderDynamicElement(target, component, owner, options, isAppendTarget) {
    var me = this;
    if (component) {
      var frmType = Vue.extend(component),
        frm = new frmType(options);

      frm.$mount();

      if (target && isAppendTarget && frm.$el) {
        target.appendChild(frm.$el);
      }
      return frm;
    }
  }

  /**
   * focus vào control trước đó
   */
  focusPreviewControl(curfocus) {
    const me = this;
    let fn = function (parent) {
      let items = parent.querySelectorAll(
        "input:not([disabled]),button:not([disable]),a"
      );
      if (items[0] !== curfocus) {
        for (let i = 1; i < items.length; i++) {
          if (items[i] === curfocus) {
            for (let j = i - 1; j >= 0; j--) {
              //check item visible
              if (me.isVisible(items[j])) {
                items[j].focus();
                return;
              }
            }
            //reset focus to parent
            curfocus = parent;
          }
        }
      }
      fn(parent.parentElement);
    };
    fn(curfocus.parentElement);
  }
  /**

  /**
   * focus vào control tiếp theo
   */
  focusNextControl(curfocus) {
    var el = this.getNextInputControl(curfocus);
    if (el) {
      el.focus();
      if (typeof el.select === "function") {
        el.select();
      }

      return true;
    }
  }

  /**
   * Kiểm tra element có hiển thị không
   */
  isVisible(element) {
    return element.offsetParent;
  }

  /*
   * Lấy control nhập liệu tiếp theo
   */
  getNextInputControl(current) {
    let me = this,
      //i = c.index(),
      p = current.parentNode;
    if (!p) {
      return null;
    }

    let ch = p.children,
      r = null,
      o,
      i = 0;
    for (; i < ch.length; i++) {
      if (ch[i] === current) {
        break;
      }
    }

    for (var k = i + 1; k < ch.length; k++) {
      o = ch[k];
      if (
        ["INPUT", "TEXTARE", "BUTTON", "A"].indexOf(o.tagName) > -1 &&
        !o.getAttribute("disabled") &&
        !o.getAttribute("tabindex") !== -1 &&
        me.isVisible(o)
      ) {
        r = o;
      } else {
        r = me.getFirstControlFocus(o);
      }

      if (r) {
        break;
      }
    }

    if (!r) {
      r = me.getNextInputControl(p);
    }

    return r;
  }
  /**
   * Lấy control nhập liệu đầu tiên
   */
  getFirstControlFocus(parent) {
    const me = this,
      obj = parent || document,
      selector = [
        'input:not([disabled]):not([tabindex="-1"])',
        'textarea:not([disabled]):not([tabindex="-1"])',
        'select:not([disabled]):not([tabindex="-1"])',
        'button:not([disabled]):not([tabindex="-1"]):not(.ms-con-dropdown)',
        'a:not([disabled]):not([tabindex="-1"]):not(.ms-collapse-item--header)',
      ].join(",");

    const items = obj.querySelectorAll(selector);
    if (items != null && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (me.isVisible(item)) {
          return item;
        }
      }
    }

    return null;
  }

  /**
   * Tìm ra control Input đầu tiên theo scope truyền vào và cho phép sửa
   * @param {Element} scope Parent cần tìm input
   */
  findFirstControlInput(scope) {
    if (scope && scope.querySelector) {
      var input = scope.querySelector(
        "input:not([type=button]):not([type=radio]):not([type=checkbox]):not([readonly]):not([disabled]):not([class='hidden']),textarea:not([readonly]):not([disabled]):not([class='hidden'])"
      );
      return input;
    }
    return;
  }

  /**
   * Tự động focus vào control nhập liệu đầu tiên theo scope truyền vào
   * @param {Element} scope Phạm vi cần xử lý focus
   * @author DNThang - 31.10.2019
   */
  focusFirstControlInput(scope, select = true) {
    var me = this;
    // setTimeout(() => {
    var input = me.findFirstControlInput(scope);
    if (input) {
      input.focus();

      if (select && typeof input.select === "function") {
        input.select();
      }
    } else {
      //nếu k có input nào để focus thì focus vào dòng đầu tiên của grid( nếu có ) để có thể thực hiện phím tắt keydown up/down để chọn dòng
      me.focusFirstRowGrid(scope);
    }
    // });
  }

  /**
   * Tự động focus vào control nhập liệu đầu tiên theo scope truyền vào
   * @param {Element} scope Phạm vi cần xử lý focus
   * @author bnduc - 15.11.2019
   */
  focusFirstControl(scope) {
    if (scope) {
      const me = this;

      // setTimeout(() => {
      let input;
      if (
        scope.type === "text" ||
        (scope.hasAttribute &&
          scope.hasAttribute("type") &&
          scope.getAttribute("type") === "text")
      ) {
        input = scope;
      } else {
        input = me.findFirstControlFocus(scope);
      }

      if (input) {
        input.focus();
      }
      // });
    }
  }

  /**
   * Tự động focus vào control nhập liệu vào dòng đầu tiên của grid( nếu có ) để có thể thực hiện phím tắt keydown up/down để chọn dòng
   * @param {Element} scope Phạm vi cần xử lý focus
   * @author nnlam - 16.06.2021
   */
  focusFirstRowGrid(scope) {
    if (scope) {
      const me = this;

      // setTimeout(() => {
      let grid;
      if (me.grid) {
        grid = me.grid.$el;
      } else {
        grid = me.findFirstGrid(scope);
      }

      if (grid) {
        //me.$nextTick(() => {
        if (grid && !grid.classList.contains('notAutoFocus')) {
          let trFirst = grid.querySelector(".ms-tbody.data tr");
          if (trFirst) {
            trFirst.focus();
          }
        }
      }
    }
  }

  /**
   * Tìm ra control Input đầu tiên theo scope truyền vào và cho phép sửa
   * @param {Element} scope Parent cần tìm input
   * @author bnduc - 15.11.2019
   */
  findFirstControlFocus(scope) {
    if (scope && scope.querySelector) {
      let input = scope.querySelector(
        "input:not([readonly]):not([disabled]),button:not([disable]),a,textarea"
      );
      return input;
    }
    return;
  }

  /**
   * Tìm ra grid đầu tiên của form
   * @param {Element} scope Parent cần tìm grid
   * @author nnlam - 16.06.2021
   */
  findFirstGrid(scope) {
    if (scope && scope.querySelector) {
      let grid = scope.querySelector(".ms-grid-viewer");
      return grid;
    }
    return;
  }

  /**
   * Xử lý khi focus control cuối cùng thì sẽ thực thi fn
   */
  processUnfocusLastControl(e, fn) {
    if (e.which === 9 && !e.shiftKey) {
      //console.log(e.target.attributes.class.value);
      let cur = e.target;
      let els = e.currentTarget.querySelectorAll("*");
      var flag = true;
      for (let i = 0; i < els.length; i++) {
        if (els[i] === cur) {
          flag = false;
          continue;
        }
        if (flag) {
          continue;
        }

        els[i].focus();
        if (els[i] === document.activeElement) {
          e.preventDefault();
          return;
        }
      }

      //focus first control
      e.preventDefault();
      fn();
    }
  }

  /**
   * Kiểm tra 2 đôi tượng có khác nhau không
   */
  checkDiff(newVal, oldVal) {
    let ret = false;
    if (typeof newVal == "object" && typeof oldVal == "object") {
      for (let field in newVal) {
        if (
          typeof newVal[field] != "object" &&
          newVal[field] != oldVal[field]
        ) {
          ret = true;
          break;
        }
      }
    }
    return ret;
  }
  /**
   * pvduy 28/06/2021
   * lẩy ra danh sách các trường thay đổi và giá trị thay đổi
   * thêm đoạn xử lý trường hợp tìm sự thay đổi cửa giá trị datetime
   */
  getDiffListProperty(newVal, oldVal) {
    let listField = [];
    if (typeof newVal == "object" && typeof oldVal == "object") {
      for (let field in newVal) {
        if (
          typeof newVal[field] != "object" &&
          newVal[field] != oldVal[field]
        ) {
          listField.push(field);
        } else if (newVal[field] instanceof Date) {
          var isChange = false;
          // nếu 2 giá trị khác nhau hoặc một trong 2 thằng null thì xác nhận sự thay đổi.
          if (
            newVal[field] != null &&
            oldVal[field] != null &&
            typeof newVal[field].getTime == "function" &&
            typeof oldVal[field].getTime == "function" &&
            newVal[field].getTime() != oldVal[field].getTime()
          ) {
            isChange = true;
          } else if (
            (newVal[field] == null && oldVal[field] != null) ||
            (newVal[field] == null && oldVal[field] != null)
          ) {
            isChange = true;
          }
          if (isChange) {
            listField.push(field);
          }
        }
      }
    }
    return listField;
  }

  //Chuyển dữ liệu thành dạng tree
  // Created by LTDAT(16.06.2020)
  nomalizeDataTree(data, idField, parentField) {
    const me = this;
    let dataTemp = [...data],
      parentNodes = [];
    dataTemp.forEach((item, index) => {
      if (!item.hasOwnProperty("parentNode")) {
        item["parentNode"] = [];
      }
      if (item[parentField]) {
        //Tìm cha
        let parent = _.find(dataTemp, (o) => {
          return o[idField] === item[parentField];
        });

        if (parent) {
          item.parentNode = parent;
          if (!parent.hasOwnProperty("childNodes")) {
            parent["childNodes"] = [];
          }
          if (!parent.hasOwnProperty("isParent")) {
            parent["isParent"] = true;
          }
          parent.childNodes.push(item);
        } else {
          parentNodes.push(item);
        }
      } else {
        // NMSINH: thêm món này vì nếu chọn thằng ko có Cha trong list thì nó chính là cha luôn
        parentNodes.push(item);
      }
    });
    return parentNodes;
  }

  /**
   * Thực hiện ghép các node cha đi kèm với các node con luôn để thực hiện show ra ngay bên dưới node cha
   * @param {[TreeModel]} dataResoures Danh sách các node cha cần sắp xếp
   * @param {*} expanded Có Mở rộng ra không
   * @param {*} level
   */
  getBodyData(dataResoures, expanded, level = 1, childNodes = "childNodes") {
    if (!dataResoures) {
      return [];
    }
    let data = [...dataResoures];
    let bodyData = [];
    data.forEach((row, index) => {
      const children = row[childNodes];
      const childrenLen =
        Object.prototype.toString.call(children).slice(8, -1) === "Array"
          ? children.length
          : 0;

      row.level = level;
      Vue.set(row, "isHide", false);
      Vue.set(row, "expanded", expanded);
      // row.expanded = expanded;
      row.isSelected = false;
      row._isSelectedMultiple = false;

      bodyData.push(row);
      if (childrenLen > 0) {
        row._expandable = true;
        bodyData = bodyData.concat(
          this.getBodyData(children, expanded, level + 1)
        );
      }
    });

    return bodyData;
  }

  /**
   * Lấy giá trị enum theo text
   */
  getEnumValue(enumName, text) {
    let source = this.getEnumSource(enumName);
    let textTrim = text.trim();
    for (let i = 0; i < source.length; i++) {
      let item = source[i];
      if (textTrim === item.enumText) {
        return item.enumValue;
      }
    }

    return null;
  }

  /**
   * Lấy ra giá trị key của enum theo value
   * @param {Number} value Giá trị của enum cần lấy ra enum text
   * @param {String} enumName EnumName để get text
   */
  getEnumText(value, enumName) {
    let e = MSEnum[enumName],
      localize = i18n;

    if (e) {
      for (const key in e) {
        if (e.hasOwnProperty(key) && e[key] === value) {
          return key;
        }
      }
    }

    return value;
  }

  /**
   * Lấy ra resource theo enum
   * @param {Number} value Giá trị của enum cần lấy ra enum resource
   * @param {String} enumName EnumName để get text
   */
  getEnumResource(value, enumName) {
    const me = this,
      localize = i18n;

    let key = me.getEnumText(value, enumName);
    let resourceKey = enumName + "." + key;
    let text = localize.t("i18nEnum." + resourceKey);
    return text;
  }

  /**
   * Lấy enumsource với tên enum truyền vào
   * @param {String} enumName Tên enum trong enumeration
   * @param {Array} values Danh sách các enum lấy ra (nếu cần chỉ định), nếu không thì sẽ lấy tất cả
   * @param {Boolean} prefixIdx Có kèm theo tiền tố index không: true - có, false - không (Mặc định không)
   * VD: getEnumSource("EnumCABAReasonType",[10,11,12,13])
   * CreatedBy: PDKIEN 15/08/2019
   */
  getEnumSource(enumName, values, prefixIdx) {
    let e = MSEnum[enumName],
      arr = [],
      localize = i18n;
    if (e) {
      let idx = 0;
      for (const key in e) {
        if (e.hasOwnProperty(key)) {
          let v = e[key],
            ix = -1;
          if (!values || (ix = values.indexOf(v)) > -1) {
            /*
             * sửa lại cách lấy dữ liệu theo enum
             * pvduy 02/02/2020
             */
            let enumText = localize.t("i18nEnum." + enumName + "." + key);
            if (prefixIdx) {
              enumText = ++idx + ". " + enumText;
            }

            let item = {
              enumValue: v,
              enumKey: key,
              enumText: enumText,
            };

            if (ix > -1) {
              // DVQUAN: sửa lại cách lấy enum source với trường hợp 9 và 99 => không lấy được 1 trong 2
              if (arr[ix]) {
                arr[arr.length] = item;
              } else {
                arr[ix] = item;
              }
            } else {
              arr.push(item);
            }
          }
        }
      }
    }
    return arr;
  }

  /**
   * Lấy tham số trên query string
   */
  getUrlParams() {
    let search;
    if (window.location.hash) {
      search = window.location.hash.substr(1);
    } else {
      search = window.location.search;
    }
    const temp = new URLSearchParams(search);
    let result = {};
    for (var value of temp.keys()) {
      result[value] = temp.get(value);
    }

    return result;
  }

  /**
   * Build query string param
   * @param {*} params
   */
  buildQueryStringParams(params) {
    const searchParams = new URLSearchParams(params);
    return searchParams.toString();
  }

  /**
   * Đăng xuất khỏi ứng dụng
   * TDNGHIA 4/4/2022 sửa lại nếu đnag ở môi trường phát triển thì về trang dev-login
   */
  logoff() {
    if (process.env.NODE_ENV === "development") {
      this.redirect("/dev-login");
    } else {
      this.redirect("/logout");
    }
  }

  /**
   * Redirect ứng dụng tới màn hình khác
   * @param {string} url
   */
  redirect(url) {
    location.href = url;
  }

  /**
   * Download
   * @param {string} link
   */
  downloadLink(link) {
    let a = document.getElementById("adownload");
    a.href = link;
    a.click();
  }

  /**
   * Gán cookie
   */
  setCookie(name, value, hours) {
    var expires = "";
    if (hours) {
      var date = new Date();
      date.setTime(date.getTime() + hours * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  /**
   * Đọc cookie
   */
  getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Xóa cookie
   */
  removeCookie(name) {
    document.cookie =
      name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  /**
   * Xử lý dữ liệu trả về từ server
   */
  processServerResponseData(data) {
    if (data) {
      const rg = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/;
      for (let i in data) {
        if (data[i]) {
          if (
            typeof data[i] === "string" &&
            i.indexOf("Date") > -1 &&
            rg.test(data[i])
          ) {
            data[i] = new Date(data[i]);
          } else if (
            typeof data[i] === "object" &&
            Object.keys(data[i].length > 0)
          ) {
            this.processServerResponseData(data[i]);
          }
        }
      }
    }
  }

  /**
   * Lấy text hiển thị của trường thông tin
   * @param {*} field : Tên trường
   * @param {*} namespace : mã để xem có custom lại không, nếu không thì lấy mặc định
   */
  getColumnText(field, namespace) {
    const localize = i18n,
      common = localize.messages[localize.locale]["i18nColumn"],
      custom = namespace ? common[namespace] : null;
    if (custom && custom.hasOwnProperty(field)) {
      return custom[field];
    }
    return common[field];
  }

  /**
   * Lấy text hiển thị của bảng
   * @param {*} table : Tên bảng
   * @param {*} namespace : mã để xem có custom lại không, nếu không thì lấy mặc định
   */
  getTableText(table, namespace) {
    const localize = i18n,
      common = localize.messages[localize.locale]["i18nTable"],
      custom = namespace ? common[namespace] : null;

    if (custom && custom.hasOwnProperty(table)) {
      return custom[table];
    }
    return common[table];
  }
  /**
   * Maping từ html element thành đối tượng vuejs để thao tác
   * @param {object} dom html dome element
   */
  mapDomToVue(dom) {
    return dom.__vue__;
  }

  /**
   * Chuyển tiếng việt có dấu thành không dấu
   * @author ĐVThi 09/03/2021
   */
  removeVietnameseTones(str) {
    if (str) {
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
      str = str.replace(/đ/g, "d");
      str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
      str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
      str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
      str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
      str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
      str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
      str = str.replace(/Đ/g, "D");
      // Some system encode vietnamese combining accent as individual utf-8 characters
      // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
      str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
      str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
      // Remove extra spaces
      // Bỏ các khoảng trắng liền nhau
      str = str.replace(/ + /g, " ");
      str = str.trim();
      // Remove punctuations
      // Bỏ dấu câu, kí tự đặc biệt
      //str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
      return str;
    } else {
      return "";
    }
  }

  buildFilterParam(filters) {
    let me = this,
      sFilter = "";

    if (filters && !(filters instanceof Array)) {
      filters = [filters];
    }

    let length = filters.length;

    if (length > 0) {
      let i,
        arrayFilters = [],
        sJoin = ",";

      for (i = 0; i < length; i++) {
        let filter = filters[i],
          sChildFilter = "",
          operandChild = "and";

        if (filter.childrens instanceof Array && filter.childrens.length > 0) {
          let childFirst = filter.childrens[0];
          if (childFirst.operand) {
            operandChild = childFirst.operand;
          }

          sChildFilter = me.buildFilterParam(filter.childrens);
        }

        let s =
          '"' +
          filter.property +
          '",' +
          (filter.operator ? '"' + filter.operator + '",' : ""),
          //Mặc định operand là `and`
          operand = '"and"';

        s += me.nomalizeFilterValue(filter.operator, filter.value);
        //xử lý tình huống muôn filter = 0/false nhưng muốn lọc ra cả các giá trị null
        if (
          filter.nullToFail &&
          (filter.value === 0 || filter.value === false)
        ) {
          s += ",true";
        }

        s = "[" + s + "]";

        if (sChildFilter) {
          s = "[" + s + ',"' + operandChild + '",' + sChildFilter + "]";
        }

        if (i !== 0) {
          if (filter.operand) {
            operand = '"' + filter.operand + '"';
          }
          arrayFilters.add(operand);
        }
        arrayFilters.add(s);
      }

      sFilter = arrayFilters.join(sJoin);
      if (length > 1) {
        sFilter = "[" + sFilter + "]";
      }
    }

    return sFilter;
  }

  nomalizeFilterValue(operator, value) {
    var ret = "";
    switch (operator) {
      case "in":
      case "notin":
        ret = JSON.stringify(value);
        break;
      default:
        if (typeof value === "number") {
          ret = value.toString();
        } else if (typeof value === "boolean") {
          ret = value;
        } else if (value instanceof Date) {
          if (
            value.getHours() === 0 &&
            value.getMinutes() === 0 &&
            value.getSeconds() === 0
          ) {
            ret = ['"', moment(value).format("YYYY-MM-DD"), 'T00:00:00"'].join(
              ""
            );
          } else {
            ret = ['"', moment(value).format("YYYY-MM-DDThh:mm:ss"), '"'].join(
              ""
            );
          }
        } else {
          ret = ['"', value, '"'].join("");
        }
    }

    return ret;
  }

  /**
   * Xử lý tham số trước khi gọi lên server load dữ liệu cho combobox
   */
  processComboboxParamRequest(param) {
    const me = this;
    for (let i in param) {
      let value = param[i];
      switch (i) {
        case "filter":
          //chuẩn hóa tham số filter
          if (Array.isArray(value) && value.length > 0) {
            value = me.buildFilterParam(value);
          } else {
            continue;
          }
          break;
        case "condition":
          //stringgify condition để build trên c#
          if (value && Object.keys(value).length > 0) {
            value = JSON.stringify(value);
          } else {
            continue;
          }
          break;
      }
      param[i] = value;
    }
  }

  setLocalStorage(key, value) {
    localStorage.setItem(this.processLocalStorageKey(key), value);
  }

  getLocalStorage(key) {
    return localStorage.getItem(this.processLocalStorageKey(key));
  }

  removeLocalStorage(key) {
    localStorage.removeItem(this.processLocalStorageKey(key));
  }

  processLocalStorageKey(key) {
    return [window._appConfig.storageKey, key].join("_");
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  checkFullMonth(fromDate, toDate) {
    let shortText = "",
      localize = i18n;
    if (fromDate && toDate) {
      if (fromDate.getDate() == 1) {
        let fromYear = fromDate.getFullYear(),
          fromMonth = fromDate.getMonth();
        let toYear = toDate.getFullYear(),
          toMonth = toDate.getMonth();
        let daysOfMonth = 32 - new Date(toYear, toMonth, 32).getDate();
        if (toDate && daysOfMonth == toDate.getDate()) {
          if (fromMonth == toMonth && fromYear == toYear) {
            shortText = localize
              .t("i18nReport.ReportTerm")
              .format(fromMonth + 1, fromYear);
          } else if (fromMonth < toMonth && fromYear == toYear) {
            shortText = localize
              .t("i18nReport.ReportTermRange")
              .format(fromMonth + 1, toMonth + 1, fromYear);
          }
          return shortText;
        }
      }
    }
    return shortText;
  }

  /**
   * Hàm gọi link help truyền vào đường dẫn đến từng màn hình
   * @param {*} helpId 
   * @returns 
   */
  helpAms(helpId) {
    return [window._appConfig.helpURL, helpId].join("");
  }

  /**
   * Hàm build link help với ID(screencode) truyền vào
   * @param {*} helpId kiểm tra và uppercase ký tự đầu lên để ghép vào enum
   * @returns 
   */
  getLinkHelpCegov(helpId) {
    let helpIdConverted = helpId.charAt(0).toUpperCase() + helpId.slice(1);
    return [window._appConfig.helpURL, MSEnum.HelpID[helpIdConverted]].join("");
  }

  /**
   * Func bỏ dấu tiếng việt
   * @param {String} str
   * @author NCThanh1
   */
  removeUnicode(str) {
    let tmp = str;
    tmp = tmp.toLowerCase();
    tmp = tmp.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    tmp = tmp.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    tmp = tmp.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    tmp = tmp.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    tmp = tmp.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    tmp = tmp.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    tmp = tmp.replace(/đ/g, "d");
    tmp = tmp.replace(
      /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      " "
    );
    tmp = tmp.replace(/ + /g, " ");
    tmp = tmp.trim();
    return tmp;
  }

  /**
   * Load dữ liệu combobox
   */
  getCacheComboboxData(type, payload, loadPromise, loadScope) {
    let key = [type, JSON.stringify(payload)].join("_").toLowerCase(),
      cache = window._cboData[key];

    return new Promise((resolve) => {
      if (cache) {
        resolve(cache);
        return;
      }

      loadPromise.call(loadScope, payload).then((result) => {
        window._cboData[key] = result;
        resolve(result);
      });
    });
  }

  /**
   * Load dữ liệu combobox
   */
  removeCacheComboboxData(key) {
    const caches = window._cboData;
    if (caches) {
      var keys = [];
      if (Array.isArray(key)) {
        keys = key;
      } else if (typeof key === "string") {
        keys.push(key);
      } else {
        keys.push(String(key));
      }

      keys.forEach((item) => {
        let key = [item, ""].join("_").toLowerCase(),
          removeKeys = [];
        for (let i in caches) {
          if (i.indexOf(key) === 0) {
            removeKeys.push(i);
          }
        }

        for (let i = 0; i < removeKeys.length; i++) {
          let cacheKey = removeKeys[i];
          delete caches[cacheKey];
        }
      });
    }
  }

  /**
   * Tách từ khóa tìm kiếm thành các từ theo quy tắc
   * 1. Nếu có ngoặc kép "" thì tìm đúng kí tự trong ngoặc kép
   * 2. Nếu không thì chỉ cần chứa cả 2 kí tự là đủ
   * @param {string} keyword từ khóa tìm kiếm
   * @author NVLAM 23.11.2020
   */
  splitKeyWord(keyword) {
    let wordArr = [];
    if (typeof keyword !== "string") {
      keyword = _.toString(keyword);
    }
    let firstDoubleQuoteIdx = keyword.indexOf('"'),
      lastDoubleQuoteIdx = keyword.lastIndexOf('"');
    /**
     * Các TH tìm kiếm full text
     * 1. Đây là foo
     * 2. "Đây là foo
     * 3. Đây "là foo"
     * 4. "Đây là" foo
     */
    if (
      firstDoubleQuoteIdx === -1 ||
      firstDoubleQuoteIdx === lastDoubleQuoteIdx ||
      firstDoubleQuoteIdx !== 0 ||
      lastDoubleQuoteIdx !== keyword.length - 1
    ) {
      wordArr = keyword.split(/\s+/); //tách theo dấu cách
    } else {
      let fullText = keyword.slice(firstDoubleQuoteIdx + 1, lastDoubleQuoteIdx);
      if (!_.isEmpty(fullText)) {
        wordArr.push(fullText);
      }
    }
    // for (let i = 0; i < wordArr.length; ++i) {
    //     wordArr[i] = wordArr[i].replace(/[^a-z\d]/g, '\\$&');//chèn thêm 1 kí từ
    // }
    return wordArr;
  }

  /**
   * hàm search local
   * properties: danh sách các trường cần search
   * searchText: text nhập ở ô search
   * source: dữ liệu gốc dùng để filter
   * grid: grid filter
   * NTAnh2: thêm notSearchText = true để lọc từ các màn hình danh sách dạng tree
   */
  filterFn(properties, source, grid, searchText, form, notSearchText = false) {
    let data = [],
      me = this;
    let sourceTemp = [];
    if (Array.isArray(source)) {
      Object.assign(sourceTemp, source);
      // NTAnh2: thêm notSearchText sửa bug không lọc được cột từ các màn hình danh sách trạng tree dùng filter local
      if ((searchText && searchText != "") || notSearchText == true) {
        sourceTemp.forEach((item) => {
          if (
            me.checkSearchText(item, properties, searchText) &&
            me.checkFilterHeader(item, grid) &&
            form.checkFilterGridTreeCustom(item, properties, searchText)
          ) {
            if (data.indexOf(item) === -1) {
              data.push(item);
            }
            if (grid && grid.isGridTree) {
              me.findParentNode(source, data, item, form);
            }
          }
        });
      } else {
        data = sourceTemp;
      }
    }
    if (form.filterHeader && form.filterHeader.length > 0) {
      grid.dataTemp = data;
    } else {
      grid.dataTemp = source;
    }
    return data;
  }

  /*
   *  Hàm tìm kiếm các node cha khi thực hiện tìm kiếm dữ liệu.
   *  pvduy 06/01/2021
   */
  findParentNode(items, filterItems, itemChild, form) {
    let me = this;
    let key = "",
      parentKey = "ParentID";
    if (form && form.grid && form.grid.idProperty) {
      key = form.grid.idProperty;
    }
    if (form && form.grid && form.grid.parentIdProperty) {
      parentKey = form.grid.parentIdProperty;
    }
    items.forEach((item) => {
      if (
        item[key] == itemChild[parentKey] &&
        !filterItems.find((x) => x[key] == item[key])
      ) {
        if (filterItems.indexOf(item) === -1) {
          filterItems.push(item);
        }
        me.findParentNode(items, filterItems, item, form);
      }
    });
  }
  /**
   * hàm filter col
   */
  checkFilterHeader(item, grid) {
    let me = this;
    let listFilterHeader = [],
      check = true;
    listFilterHeader = grid.getFilterHeader(true);
    if (listFilterHeader.length > 0) {
      listFilterHeader.forEach((filter) => {
        let value = filter.value ? (filter.value + "").toLowerCase() : "";
        switch (filter.operator) {
          case MSEnum.FilterHeader.Contains:
            if (
              !(
                item[filter.property] ? item[filter.property].toLowerCase() : ""
              ).contains(value)
            ) {
              check = false;
              return false;
            }
            break;
          case MSEnum.FilterHeader.Notcontains:
            if (
              (item[filter.property]
                ? item[filter.property].toLowerCase()
                : ""
              ).contains(value)
            ) {
              check = false;
              return false;
            }
            break;
          case MSEnum.FilterHeader.StartsWith:
            if (
              !(
                item[filter.property] ? item[filter.property].toLowerCase() : ""
              ).startsWith(value)
            ) {
              return false;
            }
            break;
          case MSEnum.FilterHeader.EndsWith:
            if (
              !(
                item[filter.property] ? item[filter.property].toLowerCase() : ""
              ).endswith(value)
            ) {
              check = false;
              return false;
            }
            break;
          case MSEnum.FilterHeader.Equals:
            if (item[filter.property] != filter.value) {
              check = false;
              return false;
            }
            break;
          case MSEnum.FilterHeader.NotEquals:
            if (item[filter.property] == filter.value) {
              check = false;
              return false;
            }
            break;
          case MSEnum.FilterHeader.GreaterThan:
            if (item[filter.property] <= filter.value) {
              check = false;
              return false;
            }
            break;
          // case MSEnum.FilterHeader.GreaterThan:
          //   if(item[filter.property] < filter.value){
          //     check = false;
          //     return false;
          //   }
          //   break;
          case MSEnum.FilterHeader.LessThan:
            if (item[filter.property] >= filter.value) {
              check = false;
              return false;
            }
            break;
          case MSEnum.FilterHeader.LessThanEquals:
            if (item[filter.property] > filter.value) {
              check = false;
              return false;
            }
            break;
          case MSEnum.FilterHeader.Between:
            //if(item[filter.property] > filter.value){
            check = false;
            return false;
            //}
            break;
          case MSEnum.FilterHeader.Null:
            if (item[filter.property]) {
              check = false;
              return false;
            }
            break;
          case MSEnum.FilterHeader.NotNull:
            if (!item[filter.property]) {
              check = false;
              return false;
            }
            break;
        }
      });
    }
    return check;
  }
  /**
   * hàm search theo text
   */
  checkSearchText(item, properties, searchText) {
    let me = this,
      check = false;
    if (searchText) {
      let text = searchText.toLowerCase();
      if (Array.isArray(properties)) {
        properties.forEach((field) => {
          if (item[field] && item[field].toLowerCase().contains(text)) {
            check = true;
            return;
          }
        });
      }
    } else {
      return true;
    }
    return check;
  }

  /**
   * Lấy thông tin channel chung để gửi/nhận thông báo giữa các tab
   */
  getBroadcastChannel() {
    if (!window.__bc) {
      window.__bc = new BroadcastChannel(window._appConfig.broadcastChannel);
    }

    return window.__bc;
  }

  /**
   * TDNGHIA
   * 22/9/2021
   * convert từ string sang kiểu date
   * @param {*} dateString string truyền vào ví dụ: '18/07/1999'
   * formatType = 1 là chuỗi đang theo kiểu dd/mm/yyyy 2 là kiểu yyyy/mm/dd 3 là kiểu mm/dd/yyy
   * tự thêm các case sau nếu gặp thêm
   * charSplit là ký tự split
   */
  convertStringToDate(dateString, charSplit, formatType) {
    if (typeof dateString !== "string") {
      return new Date();
    }
    let datePart = dateString.split(charSplit ? charSplit : "/");
    let result;

    switch (formatType) {
      case 1:
        result = new Date(datePart[2], parseInt(datePart[1]) - 1, datePart[0]);
        break;
      case 2:
        result = new Date(datePart[0], parseInt(datePart[1]) - 1, datePart[3]);
        break;
      default:
        result = new Date(datePart[2], parseInt(datePart[1]) - 1, datePart[0]);
        break;
    }

    return result;
  }

  /**
   * Hàm convert từ DateTime sang string format dạng dd/mm/yyyy
   * @param {*} date date truyền dạng DateTime
   */
  convertDateToString(date) {
    if (typeof date !== "string" && date) {
      var dd = String(date.getDate()).padStart(2, "0");
      var mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = date.getFullYear();

      return dd + "/" + mm + "/" + yyyy;
    } else if (typeof date === "string" && date) {
      return date;
    }
    return "";
  }

  /**
   * Build code từ chuỗi nhập vào
   * VD: Trần Đại Nghĩa => TDN
   * TDNGHIA 7/10/2021
   * @param {*} name chuỗi vào
   * @param {*} maxLength độ dài giới hạn
   */
  generateFirstCharacter(name, maxLength) {
    let strCode = "";

    if (name) {
      let arrWord = name.split(" ");

      if (arrWord.length > 0) {
        //Lặp qua các từ
        arrWord.forEach((element) => {
          //Loại bỏ các từ rổng (có nhiều cách trống)
          if (element) {
            //lặp qua các ký tự để lấy về ký tự đầu tiên
            let arrChar = element.split("");

            if (arrChar.length > 0) {
              strCode += arrChar[0];
            }
          }
        });
      }
    }
    if (strCode) {
      //Loại bỏ ký tự tiếng việt
      strCode = this.removeVietnameseTones(strCode);
      //chuyển thành chữ hoa
      strCode = strCode.toUpperCase();
      // check rule max length, cắt chuỗi đi nếu thừa
      if (strCode && maxLength && strCode.length > maxLength) {
        strCode = strCode.substr(0, maxLength);
      }
    }
    return strCode;
  }

  /**
   * Hàm sort arr theo mode
   * TDNGHIA 31/10/2021
   * @param {*} mode
   * @param {*} data
   * @param {*} dataField
   * @param {*} isCastToDate trong trường hợp phải cast về date mới so sánh được thì truyền vào
   * @returns
   */
  sortArray(mode, data, dataField, isCastToDate) {
    //hàm sort
    function compare(a, b) {
      let first = a[dataField],
        second = b[dataField];

      if (isCastToDate) {
        first = new Date(a[dataField]).getTime();
        second = new Date(b[dataField]).getTime();
      }
      if (first < second) return mode == MSEnum.SortStatus.desc ? 1 : -1;
      if (first > second) return mode == MSEnum.SortStatus.asc ? 1 : -1;
      return 0;
    }

    return data.sort(compare);
  }

  /**
   * distinct mảng truyền vào
   * @param {*} array mảng cần distinct
   * @param {*} key fieldName distinct
   * TDNGHIA 31/10/2021
   * @returns
   */
  distinctArray(array, key) {
    const arrayUniqueByKey = [
      ...new Map(array.map((item) => [item[key], item])).values(),
    ];

    return arrayUniqueByKey;
  }

  /**
   * Tải file về, cho vào iframe
   * NTDIEM 03.12.2021
   * @param {url} url 
   */
  downloadFile(url, isShowLoading = true) {
    const iframeId = 'downloadIframe';
    let iframe = document.getElementById(iframeId);
    let checkLoaded = () => {
      var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // kiểm tra đã download xong chưa
      if (iframeDoc.readyState == 'complete') {
        this.unmask();
        return;
      }

      // check trạng thái mỗi 200ms
      setTimeout(checkLoaded, 200);
    };

    // NMTUAN2 08.04.2022: luôn xoá cái iframe cũ đi để show mask
    if (iframe) {
      document.body.removeChild(iframe);
    }

    // NMTUAN2 14.04.2022: luôn tạo mới cái iframe
    iframe = document.createElement('iframe');
    iframe.id = iframeId

    iframe.setAttribute('src', url);
    iframe.setAttribute('class', 'hidden');

    if (isShowLoading) {
      this.mask();
    }

    document.body.appendChild(iframe);

    if (isShowLoading) {
      checkLoaded();
    }
  }

  /**
   * Hàm remove các ký hiệu html từ chuỗi truyền vào
   * @param {Chuỗi nội dung truyền vào} contentString 
   * @returns 
   */
  removeHTML(contentString) {
    return contentString.replace(/(<([^>]+)>)/ig, "");
  }

  /**
   * Hàm encode các ký hiệu, script để giữ nguyên nội dung text
   * @param {Chuỗi nội dung truyền vào} contentString 
   * VD: "<b>Bài</b> toán tuổi thơ" => "&lt;Bài;&lt;/b&gt; toán tuổi thơ"
   * sử dụng nếu phải lấy text nguyên các thẻ script
   * @returns 
   */
  encodeHTML(contentString) {
    var txt = document.createElement("textarea");

    txt.innerHTML = contentString;
    contentString = txt.innerHTML;
    txt = null;
    return contentString;
  }

  /**
  * Hàm decode các ký hiệu, script để giữ nguyên nội dung text
  * @param {Chuỗi nội dung truyền vào} contentString 
  * VD: "&lt;Bài;&lt;/b&gt; toán tuổi thơ" => "<b>Bài</b> toán tuổi thơ"
  * sử dụng nếu lấy ra giá trị chứa các thẻ, ký hiệu đã được encode
  * @returns 
  */
  decodeHTML(contentString) {
    var txt = document.createElement("textarea");

    txt.innerHTML = contentString;
    return contentString = txt.value;
  }

  /**
   * TDNGHIA 10/12/2021
   * format lại ngày tháng năm theo template truyền vào mặc định là dd/mm/yyyy
   * @param {Giá trị ngày tháng} value 
   * @param {Kiểu format} formatType 
   */
  formatDateTime(value, formatType) {
    return moment(value).format(formatType ? formatType : "DD/MM/YYYY");
  }

  /** DHPHI 24/12/2021
   * thêm dấu vào số dạng từ xxxx => x.xxxx 
   * @param {Số truyền vào} number 
   * @param {Loại dấu muốn thêm vào, mặc định là dấu '.'} typeCommas 
   */
  formatNumber(number, typeCommas) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, typeof typeCommas !== 'undefined' ? typeCommas : '.');
  }

  /**
   * Lấy thông tin log firebase khi update
   * NTTHANH1
   * @param {*} menuNameCurrent Tên menu hiện tại (trùng với name trong router)
   * @param {*} context 
   * @returns 
   */
  logDataFireBaseUpdate(menuNameCurrent, context) {
    let groupType = null,
      businessType = null,
      menuItems = window.menuItems,//Thông tin các menu cha
      allChildMenu = window.allChildMenu,//Thông tin các menu con
      routers = window.inforRouters;//Thông tin router

    //Lấy trong menu cha
    let menuParent = menuItems.find((item) => {
      return item.name == menuNameCurrent;
    });
    //Lấy trong menu con
    let menuChild = allChildMenu.find((item) => {
      return item.name == menuNameCurrent;
    });

    if (menuParent || menuChild) {
      if (menuParent) {
        //Nếu có thì lấy menu không có menu con (groupType = BusinessType)
        if (!menuParent.hasChild) {
          groupType = businessType = menuParent.text;
        }
      }
      else {
        businessType = menuChild.text;
        groupType = menuItems.find((item) => {
          return menuChild.parent == item.name;
        }).text;
      }
    }
    else {
      //Không có trong menu thì tìm trong router
      for (let i = 0; i < routers.length; i++) {
        if (routers[i].children) {
          let router = routers[i].children.find((item) => {
            return item.name == menuNameCurrent;
          });
          if (router) {
            menuNameCurrent = routers[i].name;
            break;
          }
        }
      }
      this.logDataFireBaseUpdate(menuNameCurrent, context);
      return;
    }

    if (groupType && businessType) {
      // Firebase.logDataFireBase(
      //   groupType,
      //   businessType,
      //   MSEnum.FireBaseActionType.Update,
      //   context
      // );
    }
  }

  /**
   * Thêm các thông báo tới các đơn vị
   * NMTUAN3 08/03/2022
   * @param {Array} notifications mảng danh sách các thông báo, thông báo là object 
   * {
   *    OrganizationID: ID đơn vị nhận hoặc tạo thông báo
   *    Content: Nội dung câu thông báo
   *    Type: Kiểu thông báo phục vụ hiển thị
   *    ExtraData: Dữ liệu bổ sung
   * }
   * @param {Number} subSystemCode enum dùng để lấy câu sql insert thông báo
   * 
   */
  insertNotifications(notifications, subSystemCode) {
    let payload = {
      Notifications: notifications,
      SubSystemCode: subSystemCode,
    };

    // notificationAPI.insert(payload);
  }

}
export default new CommonFunction();
