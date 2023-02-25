/*
 * Kiểm tra string empty
 */
String.prototype.isEmpty =
  String.prototype.isEmpty ||
  function () {
    return this.length == 0;
  };

/**
 * Kiểm tra string null Or empty
 */
String.prototype.isNullOrEmpty =
  String.prototype.isNullOrEmpty ||
  function () {
    return !this;
  };

/**
 * Giả lập string format
 */
String.prototype.format =
  String.prototype.format ||
  function () {
    let args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };

/**
 * Kiểm tra string empty sau khi trim
 */
String.prototype.isLastTrimEmpty = function () {
  return this.trim().length == 0;
};

/**
 * Kiểm tra null hoặc space
 */
String.prototype.isNullOrWhiteSpace =
  String.prototype.isNullOrWhiteSpace ||
  function () {
    return this.isNullOrEmpty() || this.isLastTrimEmpty();
  };

/*
 * Kiểm tra có chứa ký tự truyền vào
 */
String.prototype.contains =
  String.prototype.contains ||
  function () {
    return arguments && arguments[0] && this.indexOf(arguments[0]) > -1;
  };

/**
 * tính width của 1 đoạn text
 */
String.prototype.width = function (fontSize, fontType) {

  var el,
    w = 0,
    f = fontSize + " px GoogleSans" || "12px GoogleSans";
  if (fontType) {
    f = fontSize + "px " + fontType;
  }
  el = document.createElement("div");
  el.style.position = "absolute";
  el.style.float = "left";
  el.style.whiteSpace = "nowrap";
  el.style.visibility = "hidden";
  el.style.font = f;
  el.innerHTML = this;
  el = document.body.appendChild(el);
  w = el.offsetWidth;
  el.parentNode.removeChild(el);
  return w;
};

/**
 * Sinh hash code cho string
 */
Object.defineProperty(String.prototype, "hash", {
  value: function () {
    var hash = 0,
      i,
      chr;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
});
Object.defineProperty(Object, "clear", {
  value: function (target) {
    let keys = Object.keys(target);
    keys.forEach((key) => {
      delete target[key];
    });
  },
});

//#endregion

//#region Date

/*
 * Chỉ lấy giá trị date
 */
Date.prototype.getDateOnly =
  Date.prototype.getDateOnly ||
  function () {
    let d = new Date(this);
    d.setHours(0, 0, 0, 0);
    // d.setMinutes(0);
    // d.setSeconds(0);

    return d;
  };

/*
 * Tạo ra kiểu chuỗi UTC truyền lên service
 */
Date.prototype.toUTCDateTime = function () {
  let vValue = null;

  function pad(number) {
    if (number < 10) {
      return "0" + number;
    }
    return number;
  }
  if (this) {
    vValue =
      this.getUTCFullYear() +
      "-" +
      pad(this.getUTCMonth() + 1) +
      "-" +
      pad(this.getUTCDate()) +
      "T" +
      pad(this.getUTCHours()) +
      ":" +
      pad(this.getUTCMinutes()) +
      ":" +
      pad(this.getUTCSeconds()) +
      "." +
      pad(this.getUTCMilliseconds()) +
      "Z";
  }
  return vValue;
};

(Element.prototype.appendAfter = function (element) {
  element.parentNode.insertBefore(this, element.nextSibling);
}),
  false;
/**
 * Cộng thêm giá trị Giờ vào Date
 */
Date.prototype.addHours =
  Date.prototype.addHours ||
  function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000);

    return this;
  };

/**
 * Cộng thêm giá trị Phút vào Date
 */
Date.prototype.addMinutes =
  Date.prototype.addMinutes ||
  function (m) {
    this.setTime(this.getTime() + m * 60 * 1000);

    return this;
  };

/**
 * Cộng thêm giá trị Giây vào Date
 */
Date.prototype.addSeconds =
  Date.prototype.addSeconds ||
  function (m) {
    this.setTime(this.getTime() + m * 1000);
    return this;
  };

/**
 * Cộng thêm giá trị Ngày vào Date
 */
Date.prototype.addDays =
  Date.prototype.addDays ||
  function (day) {
    this.setDate(this.getDate() + day);
    return this;
  };

/**
 * Cộng thêm giá trị Tháng vào Date
 */
Date.prototype.addMonths =
  Date.prototype.addMonths ||
  function (month) {
    this.setMonth(this.getMonth() + month);
    return this;
  };

/**
 * Cộng thêm giá trị Năm vào Date
 */
Date.prototype.addYears =
  Date.prototype.addYears ||
  function (year) {
    this.setYear(this.getFullYear() + year);
    return this;
  };

/**
 * So sánh chỉ lấy giá trị Ngày-Tháng-Năm
 * @return true: equal, false not equal
 */
Date.prototype.equalDateOnly =
  Date.prototype.equalDateOnly ||
  function (date) {
    if (this.getDateOnly().getTime() === date.getDateOnly().getTime()) {
      return true;
    }
    return false;
  };

/**
 * So sánh lấy full giá trị ngày giờ
 * @return true: equal, false not equal
 */
Date.prototype.equalDateTime =
  Date.prototype.equalDateTime ||
  function (date) {
    if (date && this.getTime() === date.getTime()) {
      return true;
    }
    return false;
  };

/**
 * So sánh chỉ lấy giá trị Ngày-Tháng-Năm
 * @return true: equal, false not equal
 */
Date.prototype.getTimeOnly =
  Date.prototype.getTimeOnly ||
  function () {
    return this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
  };
/**
 * Thêm 1 phần tử vào mảng
 */
Array.prototype.insertAt =
  Array.prototype.insertAt ||
  function (idx, item) {
    this.splice(idx, 0, item);
    return this;
  };

/**
 * Merge 1 array vào array
 */
Array.prototype.insertArray =
  Array.prototype.insertArray ||
  function (idx, items) {
    // this.slice(0, idx).concat(items).concat(this.slice(idx));
    this.splice.apply(this, [idx, 0].concat(items));
    return this;
  };

/**
 * Thực hiện thay đổi position của 1 phần tử trong mảng
 * CreatedBy DNThang - 27.09.2019
 */
Array.prototype.move =
  Array.prototype.move ||
  function (oldIdx, newIdx) {
    this.splice(newIdx, 0, this.splice(oldIdx, 1)[0]);
    return this;
  };

/**
 * Ghép thêm 1 mảng vào mảng hiện tại
 */
Array.prototype.append =
  Array.prototype.append ||
  function (items) {
    this.push.apply(this, items);
    return this;
  };

/**
 * Clone 1 mảng ra mảng khác
 */
Array.prototype.clone =
  Array.prototype.clone ||
  function () {
    return this.slice(0);
  };

/*
 * Lấy ra item đầu tiên thỏa mãn fn
 * @param fn {funciton}: method kiểm tra
 */
Array.prototype.find = Array.prototype.firstOrDefault = function (fn) {
  if (typeof fn === "function") {
    for (var i = 0; i < this.length; i++) {
      if (fn(this[i])) {
        return this[i];
      }
    }
  } else {
    throw "param is not function";
  }

  return null;
};
/**
 * Add thêm 1 phần tử vào cuối của mảng
 */
Array.prototype.add = Array.prototype.add || Array.prototype.push;

/**
 * Xóa 1 object/array khỏi array
 * Force overrides để thực hiện xử lý cả Object/Array
 */
Array.prototype.remove = function (item) {
  let idx = -1;
  if (item instanceof Array) {
    for (let i = item.length - 1; i >= 0; i--) {
      this.remove(item[i]);
    }
  } else {
    idx = this.indexOf(item);
    if (idx === -1) return;
    this.splice(idx, 1);
  }

  return this;
};

/**
 * Xóa toàn bộ các phần tử trong mảng
 */
Array.prototype.removeAll =
  Array.prototype.removeAll ||
  function () {
    return this.splice(0, this.length);
  };

/**
 * Thực hiện hoán đổi vị trí của 2 phần tử trong mảng
 * CreatedBy DNThang - 27.09.2019
 */
Array.prototype.swapElement =
  Array.prototype.swapElement ||
  function (idx1, idx2) {
    let temp = this[idx1];
    this[idx1] = this[idx2];
    this[idx2] = temp;
  };

/*
 * bnduc 11.6.2015: Sort mảng object
 * param: fields sort truyền qua arguments
 * bnduc 24.8.2015: cho phép fields truyền nhiều cấp. VD [].sortObject('data.firstName', 'data.lastName')
 */
Array.prototype.sortObject = function () {
  if (arguments.length > 0) {
    let fn = function (a, b, fields, index) {
      let r = 0,
        d = fields[index].split(" "),
        f = d[0],
        v = d.length > 1 && d[d.length - 1].toLowerCase() === "desc" ? -1 : 1,
        fnCompare = function (field) {
          let res = 0,
            va = undefined,
            vb = undefined;
          field.split(".").forEach(function (fi) {
            va = typeof va === "undefined" ? a[fi] : va[fi];
            vb = typeof vb === "undefined" ? b[fi] : vb[fi];
          });

          if (va < vb) {
            res = -1 * v;
          } else if (va > vb) {
            res = v;
          }

          return res;
        };

      r = fnCompare(f);

      if (r === 0 && fields.length > index + 1) {
        r = fn(a, b, fields, index + 1);
      }

      return r;
    };

    let fs = arguments;
    return this.sort(function (a, b) {
      return fn(a, b, fs, 0);
    });
  } else {
    throw "fields invalid";
  }
};

/**
 * TDNGHIA 6/1/2021
 * Trả về mảng distinct (mảng này là mảng đơn chứ k phải mảng object)
 * @returns 
 */
Array.prototype.unique = function () {
  let unique = [...new Set(this)];

  return unique;
}

/**
 * TDNGHIA 6/1/2021
 * @param {trường thông tin dùng để unique} fieldName 
 * @returns 
 */
Array.prototype.uniqueObject = function (fieldName) {
  const arrayUniqueByKey = [
    ...new Map(this.map((item) => [item[fieldName], item])).values(),
  ];

  return arrayUniqueByKey;
}

//#endregion
