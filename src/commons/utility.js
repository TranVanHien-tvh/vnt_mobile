/**
 * Chứa các function tiện ích phía client của hệ thống
 * Chú ý: class này chỉ được phép chứa funcion, không được tự ý thêm property
 * @author DNThang - 15.10.2019
 */

import shajs from 'sha.js';
import moment from 'moment';
import commonFn from './commonFunction.js';

class Utility {
    /**
     * Thực hiện duyệt từng phần tử của bảng hoặc thuộc tính của object để call fn
     * @param {Array/Object/...} obj
     * @param {Function} fn hàm thực hiện khi for
     */
    forEach(obj, fn) {
        if (obj === null || typeof obj === 'undefined') {
            return;
        }

        // Force an array if not already something
        if (typeof obj !== 'object') {
            obj = [obj];
        }

        if (obj instanceof Array) {
            // Duyệt từng phần tử của mảng
            for (let i = 0, l = obj.length; i < l; i++) {
                fn.call(null, obj[i], i, obj);
            }
        } else {
            // nếu là Object thì duyệt từng thuộc tính
            for (let key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    fn.call(null, obj[key], key, obj);
                }
            }
        }
    }

    /**
     * Lấy ra giá trị theo tên thuộc tính của Object cho phép caseSensitive
     * @param {Object} obj Đối tượng cần check
     * @param {String} key  Thuộc tính cần check
     * @param {Boolean} caseSensitive Có phân biệt Hoa thường hay không. Mặc định là không
     */
    objectGetField(obj, key, caseSensitive = false) {
        if (obj && key) {
            if (caseSensitive) {
                return obj[key];
            } else {
                for (let k in obj) {
                    if (
                        obj.hasOwnProperty(k) &&
                        k.toLowerCase() === key.toLowerCase()
                    ) {
                        return obj[k];
                    }
                }
                return;
            }
        }
    }

    /**
     * Convert từ dữ liệu String sang dữ liệu có kiểu theo enum DataType truyền vào
     * @param {String} data String của dữ liệu cần convert
     * @param {DataType} dataType kiểu dữ liệu cần convert sang
     * @param {DataType} DataType
     * @author DNThang - 29.11.2019
     */
    convertStringToDataType(data, dataType, DataType) {
        const me = this;
        let ret = data;
        if (data && dataType && DataType) {
            switch (dataType) {
                case DataType.String:
                    ret = data.toString();
                    break;
                case DataType.Boolean:
                    if (typeof data != 'boolean') {
                        switch (data.toLowerCase()) {
                            case 'true':
                            case 1:
                            case '1':
                            case 'yes':
                                ret = true;
                                break;
                            default:
                                ret = false;
                        }
                    }
                    break;
                case DataType.DateTime:
                    ret = me.convertStringToDate(data);
                    break;
                case DataType.Number:
                    if (!(typeof data == 'number')) {
                        //Loại bỏ dấu , trong chuỗi data (nếu có)
                        let sNumber = data.toString().replace(/,/g, ''),
                            n = Number.parseFloat(sNumber);

                        if (!isNaN(n)) {
                            ret = n;
                        }
                    }
                    break;
            }
        }

        return ret;
    }

    /**
     * Convert từ dữ liệu string sang kiểu DateTime
     * @param {String} dateString Giá trị cần convert
     * @param {String} dateTimeFormat Định dạng của `dateString` - Nếu không truyền vào thì mặc định theo moment (YYYY-MM-DDTHH:mm:ssZ)
     * @author DNThang
     * @returns {DateTime}
     * @public
     */
    convertStringToDate(dateString, dateTimeFormat) {
        let ret = dateString,
            mo = moment;

        if (dateString && !(dateString instanceof Date)) {
            //dateTimeFormat = dateTimeFormat ? dateTimeFormat : session.DateTimeFormatValue
            let dte = dateTimeFormat ?
                mo(dateString, dateTimeFormat) :
                mo(dateString);
            //Date.parse(dateString);

            if (dte.isValid()) {
                ret = dte.toDate();
            }
        }

        return ret;
    }

    /**
     * check date time
     */
    isDateTime(value, dateTimeFormat) {
        let mo = moment;
        if (value && !(value instanceof Date)) {
            let dte = dateTimeFormat ?
                mo(value, dateTimeFormat) :
                mo(value, 'DD/MM/YYYY');
            if (dte.isValid()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Sinh session Key theo param
     */
    generateSessionKey(data) {
        let me = this,
            ret = '';
        if (data) {
            let options = { useUTC: true };
            for (const key in data) {
                if (data.hasOwnProperty(key) && key != 'p_session_key') {
                    let value = data[key];

                    ret += me.convertToString(value, options);
                }
            }

            let sha256 = shajs;
            ret = sha256('sha256')
                .update(ret)
                .digest('hex');
        }

        return ret;
    }

    /**
     * Convert từ giá trị có kiểu bất kỳ ra string
     * @param {any} value Dữ liệu cần parse ra string
     * @param {Object} options Một số tùy chọn khi parse. VD: useUTC - với DateTime có thể dùng tùy chọn này để parse sử dụng UTC format
     * @public
     */
    convertToString(value, options) {
        let ret = '';
        if (value) {
            if (value instanceof Date) {
                if (options && options.useUTC) {
                    ret = value.toUTCDateTime();
                } else {
                    //Nếu không có dateTimeFormat trong options thì mặc định lấy theo định dạng Ngày tháng năm
                    let mo = moment,
                        dateTimeFormat =
                        options && options.dateTimeFormat ?
                        options.dateTimeFormat :
                        session.DateTimeFormatValue,
                        dte = mo(value);

                    ret = dte.format(dateTimeFormat);
                }
            } else if (typeof value == 'number') {
                ret = value.toString();
            } else {
                ret = value.toString();
            }
        }

        return ret;
    }

    /**
     * Func bỏ dấu và khoảng cách
     * @param {String} str
     */
    removeUnicodeAndSpace(str) {
        let me = this;
        return me.removeUnicode(me.removeAllSpace(str));
    }

    /**
     * Func bỏ dấu tiếng việt
     * @param {String} str
     * @author NCThanh1
     */
    removeUnicode(str) {
        let tmp = str;
        tmp = tmp.toLowerCase();
        tmp = tmp.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        tmp = tmp.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        tmp = tmp.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        tmp = tmp.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        tmp = tmp.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        tmp = tmp.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        tmp = tmp.replace(/đ/g, 'd');
        tmp = tmp.replace(
            /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
            ' '
        );
        tmp = tmp.replace(/ + /g, ' ');
        tmp = tmp.trim();
        return tmp;
    }

    /**
     * Func bỏ các dấu cách giữa các từ
     * @param {String} str
     * @author NCThanh1
     */
    removeAllSpace(str) {
        return str.replace(/\s+/g, '');
    }

    /**
     * format ngày thực hiện nghiệp vụ phát sinh 
     * @param {Number} type 
     * CreatedBy: tlminh - 29/03/2021
     */
    formatBussinessOccruredTypeToDate(type) {
		let val = "";
		switch (type) {
			case 1:
				val = "ngày cấp phát";
				break;
			case 0:
				val = "ngày ghi tăng";
				break;
			case 2:
				val = "ngày thu hồi";
				break;
			case 4:
				val = "ngày sửa chữa";
				break;
			case 3:
				val = "ngày bảo dưỡng";
				break;
			case 17:
			case 18:
			case 19:
			case 20:
			case 21:
				val = "ngày điều chuyển";
				break;
			case 6:
				val = "ngày đánh dấu hỏng";
				break;
			case 22:
				val = "ngày đánh báo hỏng";
				break;
			case 23:
				val = "ngày báo mất";
				break;
			case 14:
				val = "ngày đề nghị thanh lý";
				break;
			case 13:
				val = "ngày hoàn thành sửa chữa/bảo dưỡng";
				break;
		}
		return val;
	}
	/**
	 * Hàm trả về mã theo từng chữ cái đầu của tên 
	 */
    generateCodeByName(name, maxLength) {
        let strCode = "";
        if (name) {
            let arrWord = name.split(" ");
            if (arrWord.length > 0) {
                //Lặp qua các từ
                arrWord.forEach(element => {
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
            strCode = commonFn.removeVietnameseTones(strCode);
            //chuyển thành chữ hoa
            strCode = strCode.toUpperCase();
            // check rule max length, cắt chuỗi đi nếu thừa
            // let maxlength = me.$refs.refAccountObjectCode.maxLength;
            if (strCode && maxLength && strCode.length > maxLength) {
                strCode = strCode.substr(0, maxLength);
            }
        }
        return strCode;
    }
}

export default new Utility();