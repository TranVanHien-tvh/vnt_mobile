Math = Math || {};

/*
 * bnduc 19.9.2015: thêm/sửa các hàm của Math sử dụng <library> để xử lý món dấu chấm động lỗi tính toán trên js
 * <library>: decimal.js
 */
Math._fnMathNewDecimal = function (v) {
    var r;
    if (typeof v == 'undefined') {
        r = new Decimal(NaN);
    } else if (v == null) {
        r = new Decimal(0);
    } else {
        r = new Decimal(v);
    }
    return r;
};

/*
 * Cộng
 */
Math.add = function () {
    var value,
        temp;

    for (var i = 0; i < arguments.length; i++) {
        temp = Math._fnMathNewDecimal(arguments[i]);

        if (isNaN(temp)) {
            value = temp;
            break;
        }

        if (i == 0) {
            value = temp;
        } else {
            value = value.plus(temp);
        }
    }

    return value;
}

/*
 * Trừ
 */
Math.subtract = Math.sub = function () {
    var value,
        temp;

    for (var i = 0; i < arguments.length; i++) {
        temp = Math._fnMathNewDecimal(arguments[i]);

        if (isNaN(temp)) {
            value = temp;
            break;
        }

        if (i == 0) {
            value = temp;
        } else {
            value = value.minus(temp);
        }
    }

    return value;
}

/*
 * Nhân
 */
Math.multiply = Math.multi = function () {
    var value,
        temp;

    for (var i = 0; i < arguments.length; i++) {
        temp = Math._fnMathNewDecimal(arguments[i]);

        if (isNaN(temp)) {
            value = temp;
            break;
        }

        if (i == 0) {
            value = temp;
        } else {
            value = value.times(temp);
        }
    }

    return value;
}

/*
 * Chia
 */
Math.div = function () {
    /*
     * - Nếu số bị chia là undefined -> kết quả luôn là NaN
     * - Nếu số bị chia là null -> kết quả luôn là 0
     * - Nếu số bị chia là number, số chia có null -> kết quả luôn là Infinity
     * - Nếu số bị chia là number, số chia có undefined -> kết quả luôn là NaN
     * - Nếu số bị chia là number, số chia có 0 -> kết quả luôn là Infinity
     */

    var value;
    if (typeof arguments[0] === 'undefined') {
        value = new Decimal(NaN);
    } else if (arguments[0] === null) {
        value = new Decimal(0);
    } else {
        for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'undefined') {
                value = new Decimal(NaN);
                break;
            } else if (arguments[i] === null) {
                value = new Decimal(Infinity);
                break;
            } else {
                if (i == 0) {
                    value = Math._fnMathNewDecimal(arguments[i]);
                } else if (arguments[i] == 0) {
                    value = new Decimal(Infinity);
                    break;
                } else {
                    value = value.div(Math._fnMathNewDecimal(arguments[i]));
                }
            }
        }
    }

    return value;
}

/*
 * Chia lấy nguyên
 */
Math.divToInt = function () {
    /*
     * - Nếu số bị chia là undefined -> kết quả luôn là NaN
     * - Nếu số bị chia là null -> kết quả luôn là 0
     * - Nếu số bị chia là number, số chia có null -> kết quả luôn là Infinity
     * - Nếu số bị chia là number, số chia có undefined -> kết quả luôn là NaN
     * - Nếu số bị chia là number, số chia có 0 -> kết quả luôn là Infinity
     */

    var value;
    if (typeof arguments[0] === 'undefined') {
        value = new Decimal(NaN);
    } else if (arguments[0] === null) {
        value = new Decimal(0);
    } else {
        for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'undefined') {
                value = new Decimal(Infinity);
                break;
            } else if (arguments[i] === null) {
                value = new Decimal(NaN);
                break;
            } else {
                if (i == 0) {
                    value = Math._fnMathNewDecimal(arguments[i]);
                } else if (arguments[i] == 0) {
                    value = new Decimal(Infinity);
                    break;
                } else {
                    value = value.divToInt(Math._fnMathNewDecimal(arguments[i]));
                }
            }
        }
    }

    return value;
}

/*
 * So sánh 2 giá trị
 */
Math._fnDecimal = function (a, b, fn) {
    /*
     * Case: 
     *  0 == null
     *  0 == undefined
     * Khi so sánh số với 2 giá trị null/undefined -> so sánh với 0
     */
    if (typeof a == 'undefined' || a == null) {
        a = 0;
    }

    if (typeof b == 'undefined' || b == null) {
        b = 0;
    }

    return new Decimal(a)[fn](new Decimal(b));
}

/*
 * So sánh
 */
Math.compareTo = function (a, b) {
    return Math._fnDecimal(a, b, 'comparedTo');
}

/*
 * Lớn hơn
 */
Math.greaterThan = Math.gt = function (a, b) {
    return Math._fnDecimal(a, b, 'greaterThan');
}

/*
 * Lớn hơn hoặc bằng
 */
Math.greaterThanOrEqualTo = Math.gte = function (a, b) {
    return Math._fnDecimal(a, b, 'greaterThanOrEqualTo');
}

/*
 * Nhỏ hơn
 */
Math.lessThan = Math.lt = function (a, b) {
    return Math._fnDecimal(a, b, 'lessThan');
}

/*
 * Nhỏ hơn hoặc bằng
 */
Math.lessThanOrEqualTo = Math.lte = function (a, b) {
    return Math._fnDecimal(a, b, 'lessThanOrEqualTo');
}

/*
 * Bằng
 */
Math.equals = Math.eq = function () {
    var res = true,
        getDecimal = function (value) {
            return new Decimal(value || 0);
        },
        fnNotValue = function (value) {
            return value === undefined || value === null;
        },
        notValue = fnNotValue(arguments[0]),
        value = getDecimal(arguments[0]);

    for (var i = 1; i < arguments.length; i++) {
        if (notValue !== fnNotValue(arguments[i])) {
            res = false;
            break;
        }

        if (!value.equals(getDecimal(arguments[i]))) {
            res = false;
            break;
        }
    }

    return res;
}

/*
 * Nếu đầu vào là decimal, nếu toNumber không bị tràn giá trị -> chuyển về number else -> để nguyên
 */
Math.getValue = function (value) {
    var res = value;

    if (value instanceof Decimal) {
        var number = value.toNumber();
        if (value.equals(number)) {
            res = number;
        }
    }
    return res;
}

/*
 * bnduc 7.10.2015: tính phần trăm cho mảng giá trị tryền vào
 */
Math.percents = function (datas) {
    var res = [],
        total = new Decimal(datas[0]),
        i;

    for (i = 1; i < datas.length; i++) {
        total = total.plus(new Decimal(datas[i]));
    }

    for (i = 0; i < datas.length; i++) {
        res.push(new Decimal(datas[i]).div(total).times(new Decimal(100)).toNumber());
    }

    return res;
}

/**
 * Làm tròn số
 * @param value: số làm tròn
 * @param digit: bao nhiêu số thập phân
 */
Math.roundNumber = function(value, digit) {
    if (!value) {
        return value;
    }
    
    if (digit) {
        let po = Math.pow(10, digit);
        return Math.round(value * po) / po;
    }

    return Math.round(value);
}