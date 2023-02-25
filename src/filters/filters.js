import Vue from "vue";

import { MSEnum } from "@/commons/enumeration";
import moment from "moment";
import i18nEnum from "@/i18ns/vi/i18nEnum";
import i18n from "@/i18ns/i18n";
import store from "@/stores/store";
import { ModuleContext } from "@/stores/module-const";

let numberFormat = store.state[ModuleContext].NumberFormat;

let numeral = require("numeral");
let mo = moment;
mo.locale("vi");
numeral.register("locale", "vi", {
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "nghìn",
        million: "triệu",
        billion: "tỷ",
        trillion: "nghìn tỷ"
    },
    ordinal: function(number) {
        return ".";
    },
    currency: {
        symbol: "" //'₫'
    }
});

// switch between locales
numeral.locale("vi");
/**
 * Xử lý convert từ string sang DateTime
 * @param {String} sDate Chuỗi cần parse
 * @author DNThang - 17.03.2020
 */
let parseStringToDate = function(sDate) {
    if (typeof sDate == "string") {
        let dte = mo(value);
        if (!dte.isValid()) {
            dte = dte.toDate();
            return dte;
        }
    }
};

let msFormat = {
    /**
     * Định dạng Time (theo format string truyền vào)
     * @param {DateTime/String} value Giá trị cần format
     * @param {String} formatString Định dạng cần trả ra sau khi format. Nếu không truyền thì sẽ lấy theo session.TimeFormat
     * @author DNThang - 17.03.2020
     */
    formatTime(value, formatString) {
        if (value) {
            let ret = value,
                dte = value;
            if (typeof dte == "string") {
                dte = parseStringToDate(dte);
            }

            if (dte instanceof Date) {
                //formatString = formatString ? formatString : session.TimeFormat;
                dte = mo(dte);
                if (dte.isValid()) {
                    ret = dte.format(formatString);
                }
            }

            return ret;
        }
    },

    /**
     * Author: ĐVThi
     * 25/02/2021
     * format theo định dạng culture của hệ thống
     */
    formatNull(value, options) {
        if (options && options.optionFormat == MSEnum.OptionFormat.EmptyToEmpty && (typeof value === 'undefined' || value === null)) {
            return null;
        }
        if (typeof value === 'undefined' || value === null) {
            return "-";
        }
        return value;
    },

    /**
     * Format ngày tháng - trước mắt hỗ trợ dd/MM/yyyy
     * Mặc định hỗ trợ định dạng YYYY-MM-DDTHH:mm:ss.SSSSZ (đây là format dữ liệu từ server)
     * Bổ sung thêm hỗ trợ cho định dạng DD/MM/YYYY (do sử dụng từ )
     * @param {Date/String} value
     * Modify by ĐVThi 25/02/2020: sửa lại nếu không có giá trị thì hiển thị "--"
     */
    formatDate(value) {
        
        if (!value) {
            return "-";
        }

        let ret,
            dte = value;

        if (!(dte instanceof Date)) {
            if (value) {
                value = value.replace("Z", "");
            }
            dte = mo(value);
            if (!dte.isValid()) {
                let dateFormat = "DD/MM/YYYY";
                dte = mo(value, dateFormat.toUpperCase());
                if (!dte.isValid()) {
                    throw new Error("DEV: value <" + value + "> format Date invalid.");
                }
            }

            dte = new Date(dte.year(), dte.month(), dte.date());
            // dte = dte.toDate();
        }
        ret = dte.toLocaleDateString("vi", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        return ret;
    },

    /**
     * Format trạng thái
     * @param {Number} value
     * CreatedBy: ntnghia - 03/03/2021
     */
    formatStatus(value) {
        if (value) {
            return "Ngừng theo dõi";
        } 
        return "Đang theo dõi";
    },
    
    /**
     * @modified by TVLoi 08.07.2021 - Sửa cách hiển thị. Nếu khác undifined thì mới hiển thị có/không. Ngược lại trả về rỗng. Sửa lỗi 107172
    */
    formatCheckbox(value){
        if (value) {
            return i18n.t('i18nComponent.i18nHeaderOption.Boolean.True');
        }else{
            if(value !== undefined){
                return i18n.t('i18nComponent.i18nHeaderOption.Boolean.False');
            }
        }
        return '';
    },

    /**
     * Format giới tính
     * @param {Number} value
     * CreatedBy: ntnghia - 23/03/2021
     */
    formatGender(value) {
        if (value) {
            return "Nam";
        } 
        return "Nữ";
    },

    formatDateTimeFull(value, formatString) {
        if (!value) {
            return "-";
        }

        let ret,
            format = formatString || "DD/MM/YYYY HH:mm:ss",
            dte = value;

        if (!(dte instanceof Date)) {
            dte = mo(value);
            if (!dte.isValid()) {
                // let dateFormat = session.DateTimeFormat;
                // dte = mo(value, dateFormat.toUpperCase());
                // if (!dte.isValid()) {
                // 	throw new Error('DEV: value <' + value + '> format Date invalid.');
                // }
            }

            dte = dte.toDate();
        }

        let m = mo(dte);

        ret = m.format(format);

        return ret;
    },

    formatEnum(value, enumName) {
        if (typeof value == "number" || value || typeof value == "boolean") {
            let formatValue = Number(value);
            if (Number.isNaN(formatValue)) {
                formatValue = value;
            }
            if (enumName) {
                let enumObj = MSEnum[enumName];
                if (enumObj) {
                    if (!Object.keys(enumObj)) {
                        return "";
                    }
                    let key = Object.keys(enumObj).find(k => enumObj[k] === formatValue);
                    if (key) {
                        let rs = i18nEnum[enumName];
                        if (rs) {
                            let text = rs[key];
                            return text;
                        }                        
                    } else {
                        return formatValue;
                    }
                    // 	// return this.$t('i18nEnum.' + key + '');
                } else {
                    return formatValue;
                }
            } else {
                return formatValue;
            }
        }
        return '';
    },

    /**
     * Thực hiện định dạng số lượng theo hệ thống
     */
    formatQuantity(num, options) {
        let result = num;

        if (options && options.optionFormat == MSEnum.OptionFormat.ZeroToEmpty && num === 0) {
            return null;
        }
        if (options && options.optionFormat == MSEnum.OptionFormat.ZeroToZero && num === 0) {
            return 0;
        }

        if (typeof num === 'undefined' || num === null) {
            return "-";
        }

        //ĐVThi sửa bug 90688- số lượng không hiển thị định dạng sau dấu chấm
        if (num != undefined && num != null) {
            let digits =0,// numberFormat.QuantityDecimalDigits,
                buildDigits = 0;
             this.formatSeperator(options);
            result = numeral(Number(num)).format("0," + buildDigits.toFixed(digits));
            result = msFormat.formatNegative(result);
        }

        return result;
    },
    /**
     * Thực hiện format kiểu số không có định dạng sau dấu chấm
     */
    formatNumber(num, options) {
        if (options && options.optionFormat == MSEnum.OptionFormat.ZeroToEmpty && num === 0) {
            return null;
        }
        if (options && options.optionFormat == MSEnum.OptionFormat.ZeroToZero && num === 0) {
            return 0;
        }
        
        if (typeof num === 'undefined' || num === null) {
            return "-";
        }

        let result = num;


        if (num != undefined && num != null) {
            let digits = 0,
                buildDigits = 0;
            if (options && options.digits) {
                digits = options.digits;
            }
            //this.formatSeperator(options);
            result = numeral(Number(num)).format("0," + buildDigits.toFixed(digits));
            result = msFormat.formatNegative(result);
        }

        return result;
    },
    
    /**
     * Thực hiện format định dạng số của hệ số/tỷ lệ
     */
    formatCoefficient(num, options) {
        let result = num;

        if (options && options.optionFormat == MSEnum.OptionFormat.ZeroToEmpty && !num) {
            return null;
        }

        if (typeof num === 'undefined' || num === null) {
            return "-";
        }

        if (num != undefined && num != null) {
            let digits = numberFormat.CoefficientDecimalDigits,
                buildDigits = 0;
            this.formatSeperator(options);
            result = numeral(Number(num)).format("0," + buildDigits.toFixed(digits));
            result = msFormat.formatNegative(result);
        }

        return result;
    },
   
    /**
     * format số âm theo cấu hình
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
    },
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
    },
    /**
     * Join mảng thành chuỗi string theo dấu ;
     */
    formatJoinString(value) {
        try {
            let arr = value;
            if (typeof value === "string") {
                arr = JSON.parse(value);
            }
            if (Array.isArray(arr)) {
                return arr.join("; ");
            }
        } catch (error) {
            return "";
        }
    },
    formatGroup(value) {
        if (value) {
            return value.substring(1, value.length - 1);
        }
    },
  
    formatEnumStatus(value, options) {
        if (typeof value == "number" || value || typeof value == "boolean") {
            let enumName = options.enumName || options.enum;
            let formatValue = Number(value);
            if (Number.isNaN(formatValue)) {
                formatValue = value;
            }
            if (enumName) {
                let enumObj = MSEnum[enumName];
                if (enumObj) {
                    if (!Object.keys(enumObj)) {
                        return "";
                    }
                    let key = Object.keys(enumObj).find(k => enumObj[k] === formatValue);
                    if (key) {
                        let text = i18nEnum[enumName][key];
                        return text;
                    } else {
                        return formatValue;
                    }
                    // 	// return this.$t('i18nEnum.' + key + '');
                } else {
                    return formatValue;
                }
            } else {
                return formatValue;
            }
        }
    },
    formatRomanize(num) {
        let lookup = {
                M: 1000,
                CM: 900,
                D: 500,
                CD: 400,
                C: 100,
                XC: 90,
                L: 50,
                XL: 40,
                X: 10,
                IX: 9,
                V: 5,
                IV: 4,
                I: 1
            },
            roman = "",
            i;
        for (i in lookup) {
            while (num >= lookup[i]) {
                roman += i;
                num -= lookup[i];
            }
        }
        return roman;
    },
    formatDozens(value) {
        if (value < 10) {
            value = "0" + value;
        }
        return value;
    },
    /**
     * format hiển thị kích thước file
     */
    formatFileSize(value) {
        let size = value / 1024; //chia ra KB
        if (size > 1024) {
            size = size / 1024; //chia ra MB
            if (size > 1024) {
                size = Math.roundNumber(size / 1024, 1) + " GB";
            } else {
                size = Math.roundNumber(size, 1) + " MB";
            }
        } else {
            size = Math.roundNumber(size, 1) + " KB";
        }
        return size;
    }
};

Vue.filter("formatGroup", msFormat.formatGroup);
Vue.filter("formatTime", msFormat.formatTime);
Vue.filter("formatTimeFull", msFormat.formatTimeFull);
Vue.filter("formatDate", msFormat.formatDate);
Vue.filter("formatNull", msFormat.formatNull);
Vue.filter("formatDateTimeFull", msFormat.formatDateTimeFull);
Vue.filter("formatEnum", msFormat.formatEnum);
Vue.filter("formatQuantity", msFormat.formatQuantity);
Vue.filter("formatCoefficient", msFormat.formatCoefficient);
Vue.filter("formatJoinString", msFormat.formatJoinString);
Vue.filter("formatNumber", msFormat.formatNumber);
Vue.filter("formatEnumStatus", msFormat.formatEnumStatus);
Vue.filter("formatRomanize", msFormat.formatRomanize);
Vue.filter("formatFileSize", msFormat.formatFileSize);
Vue.filter("formatStatus", msFormat.formatStatus);
Vue.filter("formatGender", msFormat.formatGender);
/**
 * Xử lý format cho các kiểu số
 * CreatedBy PDKIEN 21/12/2019
 */
Vue.filter("formatData", function(value, options = {}) {
    let result;
    let enumName = options.enumName || options.enum;
    if (options.enumName && typeof options.enumName == "function") {
        enumName = options.enumName(options.dataRow);
    }
    if (enumName && value != null) {
        let valueData = Number(value) || value;
        if (valueData || valueData == 0) {
            result = msFormat.formatEnum(valueData, enumName);
        } else {
            result = value;
        }
        return result;
    } else {
        switch (options.formatType) {
            case MSEnum.FormatType.GroupItem:
                result = msFormat.formatGroup(value);
                break;
            case MSEnum.FormatType.DateTime:
                result = msFormat.formatDateTimeFull(value, options.formatString);
                break;
            case MSEnum.FormatType.Time:
                result = msFormat.formatTime(value, options.formatString);
                break;
            case MSEnum.FormatType.Rate:
                result = msFormat.formatCoefficient(value, options);
                break;
            case MSEnum.FormatType.Join:
                result = msFormat.formatJoinString(value);
                break;
            case MSEnum.FormatType.Quantity:
                result = msFormat.formatQuantity(value, options);
                break;
            case MSEnum.FormatType.Number:
                result = msFormat.formatNumber(value, options);
                break;
            case MSEnum.FormatType.Date:
                result = msFormat.formatDate(value);
                break;
            case MSEnum.FormatType.Status:
                result = msFormat.formatStatus(value);
                break;
            case MSEnum.FormatType.Gender:
                result = msFormat.formatGender(value);
                break;
            /*
             * pvduy 12/04/2021 Thêm cấu hình định dạng file 
             */    
            case MSEnum.FormatType.FormatFileSize: 
                result = msFormat.formatFileSize(value);
                break;
            /*
             * nnlam 27/05/2021 Thêm format checkbox
             */    
            case MSEnum.FormatType.Checkbox: 
                result = msFormat.formatCheckbox(value);
                break;
            default:
                //Modify by ĐVThi 02/03/2021 thên format null cho giá trị
                result = msFormat.formatNull(value, options);
                break;
        }
    }
    return result;
});

export default numeral;
export { msFormat };