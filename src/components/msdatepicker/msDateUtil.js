import moment from 'moment';
let mo = moment;
mo.locale('vi');
class msDateUtil {
    /**
     * Convert từ giá trị DateTime sang string
     * @param {DateTime} value Giá trị datetime cần convert
     * @param {String} formatString Định dạng string datetime cần convert
     */
    parseDateTimeToString(value, formatString) {
        if (value) {
            //Nếu là DateTime mới xử lý parse
            if (value instanceof Date) {
                let m = mo(value),
                    ret = m.format(formatString);

                return ret;
            } else {
                return value;
            }
        }
    }
}

export default new msDateUtil();