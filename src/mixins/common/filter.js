/**
 * Xử lý filter
 */
export const filter = {
  props: {},
  data: function() {
    return {};
  },
  created() {
    this.operatorFns = {
      '<': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (data == null) return false;
        value = this.convertDataForCompare(value);
        return data < value;
      },
      '<=': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (data == null) return false;
        value = this.convertDataForCompare(value);
        return data <= value;
      },
      '>': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (data == null) return false;
        value = this.convertDataForCompare(value);
        return data > value;
      },
      '>=': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (data == null) return false;
        value = this.convertDataForCompare(value);
        return data >= value;
      },
      '=': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        value = this.convertDataForCompare(value);
        return data == value;
      },
      '===': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        value = this.convertDataForCompare(value);
        return data === value;
      },
      '==': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        value = this.convertDataForCompare(value);
        return data == value;
      },
      '!==': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        value = this.convertDataForCompare(value);
        return data !== value;
      },
      '!=': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        value = this.convertDataForCompare(value);
        return data != value;
      },
      in: function(item, property, value) {
        let data = this.getValueFilter(item, property);
        let lowercaseValues = value.map(val => {
          if (typeof val === 'string') {
            return val.toLowerCase();
          }
          return val;
        });
        let result = lowercaseValues.indexOf(data) !== -1;
        return result;
      },
      notin: function(item, property, value) {
        let data = this.getValueFilter(item, property);
        let lowercaseValues = value.map(val => {
          if (typeof val === 'string') {
            return val.toLowerCase();
          }
          return val;
        });
        let result = lowercaseValues.indexOf(data) === -1;
        return result;
      },
      startsWith: function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (typeof data === 'string') {
          data = data.toLowerCase();
          return data.startsWith(value.toLowerCase());
        } else if (data === null || data === undefined) {
          return false;
        } else {
          throw Error('DEV: operator startswith only support field with data type string.');
        }
      },
      notStartsWith: function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (typeof data === 'string') {
          data = data.toLowerCase();
          return !data.startsWith(value.toLowerCase());
        } else if (data === null || data === undefined) {
          //NVLAM 15.04.2021 đối với trường hợp là null hoặc undefined vẫn thỏa mãn
          return true;
        } else {
          throw Error('DEV: operator startswith only support field with data type string.');
        }
      },
      endsWith: function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (typeof data === 'string') {
          data = data.toLowerCase();
          return data.endsWith(value.toLowerCase());
        } else if (data === null || data === undefined) {
          return false;
        } else {
          throw Error('DEV: operator startswith only support field with data type string.');
        }
      },
      // contains: this.filtercontains,
      contains: function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (typeof data === 'string') {
          data = data.toLowerCase();
          let result = data.indexOf(value.toLowerCase()) > -1;
          return result;
        } else if (data === null || data === undefined) {
          return false;
        } else {
          throw Error('DEV: operator contains only support field with data type string.');
        }
      },
      notContains: function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (typeof data === 'string') {
          data = data.toLowerCase();
          let result = data.indexOf(value.toLowerCase()) === -1;
          return result;
        } else if (data === null || data === undefined) {
          //NVLAM 15.04.2021 đối với trường hợp là null hoặc undefined vẫn thỏa mãn
          return true;
        } else {
          throw Error('DEV: operator contains only support field with data type string.');
        }
      },
      'is null': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (data === null || data === undefined || data === '') {
          return true;
        } else {
          return false;
        }
      },
      'is not null': function(item, property, value) {
        let data = this.getValueFilter(item, property);
        if (data === null || data === undefined || data === '') {
          return false;
        } else {
          return true;
        }
      }
    };
  },
  methods: {
    /**
     * Build param filter từ array filter hiện tại để tương thích với xử lý trên server
     * theo format: [[“IsActive”,”=”,1], “and”, [“Status”,”=”,0],”and”,[[“CourseGroupID”, “=”, 1356]]]
     * ["Name", "contains", "Mi"]
     * ["is_vendor", "=", "true"]
     * @param {Array/Object} filters
     * @modified DNThang - 02.07.2020: Hỗ trợ filter nhiều điều kiện khi filter trên server (Bao gồm cả and, or)
     * Bằng cách cấu hình thêm thuộc tính childrens trên các condition
     * @private
     */
    buildFilterParam(filters) {
      return this.$ms.commonFn.buildFilterParam(filters);
    },

    /**
     * Chuẩn hóa giá trị dùng để build filter lên server
     * @param {String} operator toán tử filter
     * @param {*} value các giá trị dùng để filter
     * Mặc định với kiểu dữ liệu là Date thì sẽ chuyển về dạng UTC
     * @author DNThang - 26.11.2019
     * @private
     */
    nomalizeFilterValue(operator, value) {
      return this.$ms.commonFn.nomalizeFilterValue(operator, value);
    },

    /**
     * Kiểm tra dữ liệu có họp lệ không
     */
    testFilter(op, source, value) {
      switch (op) {
        case "contains":
          if (!value) {
            return true;
          } else if (
            source &&
            source.toLowerCase().indexOf(value.toLowerCase()) > -1
          ) {
            return true;
          }
          break;
        case "=":
          if (source === value) {
            return true;
          }
          break;
      }

      return false;
    },

    /**
     * Thực hiện filter record trên client
     * @param {Array} filters mảng các filter được cấu hình
     * Khi có thay đổi mảng các filter cấu hình mà có mode là local thì cần phải gọi hàm này sinh lại
     * Hướng xử lý là sẽ luôn thỏa mãn tất cả các filter mới đc pass
     */
    genFilterFunction(filters) {
      let me = this;
      if (!filters) {
        return;
      }

      //filter ở local chưa đáp ứng trường hợp trải phẳng mà and / or xen kẽ nhau
      let i,
        hasOr = false;
      for (i = 0; i < filters.length; i++) {
        let filter = filters[i];
        if (filter.operand && filter.operand === "or") {
          hasOr = true;
          break;
        }
      }

      //hàm thực hiện filter local (hasOr - có toán hạng Or hay không, truyền vào để tối ưu thuật toán filter)
      return function(item) {
        let match = true,
          length = filters.length,
          i;

        for (i = 0; (match || hasOr) && i < length; i++) {
          match = me.filterRecord(filters[i], item);

          //Nếu thực hiện filter OR mà đã match thì không cần check nữa
          if (hasOr && match) {
            break;
          }
        }

        return match;
      };
    },

    /**
     * Kiểm tra bản ghi có pass filter không
     * bnduc 2.10.2020: Tách hàm để xử lý childrens của filter
     */
    filterRecord(filter, item) {
      let me = this,
        operator = filter.operator,
        property = filter.property,
        value = filter.value,
        //operand = filter.operand?filter.operand: 'and',
        filterFn = filter.filterFn;

      //Trong trường hợp filter có thiết lập filterFn thì sẽ ưu tiên filterFn
      if (filterFn && typeof filterFn === "function") {
        match = filterFn.call(me, item);
      } else {
        //Nếu không có cấu hình operator thì ngầm định là biểu thức chính quy
        if (operator) {
          filterFn = me.operatorFns[operator];
          //Nếu không tồn tại Function hỗ trợ thì throw lỗi
          if (!filterFn) {
            throw new Error(
              "DEV: Filter hiện tại chưa hỗ trợ operator: " + operator
            );
          }
        } else {
          filterFn = me.createRegexFilter(filter);
          //Gán lại để sau không cần sinh nữa
          filter.filterFn = filterFn;
        }
      }

      let match = filterFn.call(me, item, property, value);

      //Nếu không match thì kiểm tra xem filter có childrens thì kiểm tra tiếp
      if (Array.isArray(filter.childrens) && filter.childrens.length > 0) {
        for (let j = 0; j < filter.childrens.length; j++) {
          let child = filter.childrens[j];
          if (j == 0 && match && child.operand === "or") {
            break;
          }
          let chiMatch = me.filterRecord(child, item);
          if (child.operand === "or") {
            if (chiMatch) {
              match = true;
              if (j == 0) break;
            }
          } else {
            if (!chiMatch) match = false;
          }
        }
      }

      return match;
    },

    /**
     * Tạo biểu thức chính quy cho trường hợp filter theo biểu thức chính quy
     */
    createRegexFilter(filter) {
      var me = this,
        property = filter.property,
        value = filter.value,
        anyMatch = !!filter.anyMatch, //containt
        exact = !!filter.exactMatch,
        caseSensitive = !!filter.caseSensitive,
        matcher = me.createRegex(
          value,
          !anyMatch, //startWith
          !anyMatch && exact, //endWith
          !caseSensitive
        );

      return function(item) {
        var val = Object.isObject(item) ? item[property] : item;
        return matcher ? matcher.test(val) : val == null;
      };
    },

    /**
     * Sinh regex theo options truyền vào
     * @private
     */
    createRegex(value, startsWith, endsWith, ignoreCase) {
      var ret = value;

      if (value != null && !value.exec) {
        var sValue = String(value);

        ret = sValue;

        if (startsWith !== false) {
          ret = '^' + ret;
        }
        if (endsWith !== false) {
          ret += '$';
        }

        ret = new RegExp(ret, ignoreCase !== false ? 'i' : '');
      }

      return ret;
    },
    /**
     * Chuẩn hóa các giá trị trước khi so sánh
     * @param {any} data Giá trị cần chuẩn hóa
     */
    convertDataForCompare(data) {
      // Chuẩn hóa dạng date
      if (data instanceof Date) {
        data = data.getDateOnly().getTime();
      }
      // chuẩn hóa string về lowercase
      if (typeof data === 'string') {
        data = data.toLowerCase();
      }
      return data;
    },
  
    /**
     * Lấy ra giá trị theo thông tin property của bản ghi mang đi filter
     * @param {Object} item record filter
     * @param {String} property fileName thực hiện filter
     * Sau này có thể bổ sung phần convert dữ liệu ở đây trước khi mang đi xử lý filter
     */
    getValueFilter(item, property) {
      //Convert dữ liệu nếu cần
      let ret = item,
        me = this;
      if (item instanceof Object) {
        ret = item[property];
      }
      ret = me.convertDataForCompare(ret);
  
      return ret;
    }
  },

};
