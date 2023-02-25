import httpClient from '@/apis/base/httpClient';
// import Filter from '@/apis/filter';
import commonFunction from '@/commons/commonFunction';
import {
    MSEventName
} from '@/commons/eventName';
import Vue from 'vue';
import modelUtil from '@/commons/modelUtil';
import _ from 'lodash';
import axios from 'axios';
// import clientDatabase from '@/cache/clientDatabase';

/**
 * Đối tượng thực hiện quản lý dữ liệu: chứa + load/add/update/delete trên các control: grid + combo + dropdow
 * Hoặc dùng để loadData trên form, ...
 * Dữ liệu sẽ thao tác trên `data` (là dữ liệu đã được xử lý: sort, filter).
 * => Ví dụ: Các action Remove cũng phải xử lý trên đây, nếu trên `data` không có mà trên datasource có thì chỉ xóa trên `data`
 * @author DNThang - 04.07.2019
 */
export default class MSStore extends Vue {
    /**
     * Khởi tạo Store
     * @param {Object} options Tùy chọn khởi tạo
     * @param {Object} [options.proxy] Đối tượng proxy phục vụ load dữ liệu
     * @param {Array} [options.data] dữ liệu khởi tạo
     * @author DNThang 01.07.2019
     */
    constructor(options) {
        super();
        let me = this;
        if (options) {
            let items = null;
            for (let property in options) {
                switch (property) {
                    case 'data':
                        items = options.data;

                        break;
                    default:
                        me[property] = options[property];
                        break;
                }
            }

            if (items && items.length > 0) {
                if (items instanceof Array) {
                    me.loadRecords(items);
                }
            }
        }
    }

    //#region Properties

    /**
     * PrimaryKey của Entity (Nếu có cấu hình Model)
     */
    idProperty = null;

    /**
     * Cờ xác định đây có phải là Store hay không
     */
    isStore = true;

    /**
     * Có thực hiện tự động load dữ liệu không (khi store được khởi tạo thì sẽ tự động load)
     * Default: false
     */
    autoLoad = false;

    /**
     * @property {Boolean} loading Đang xử lý load dữ liệu - True
     */
    loading = false;

    /**
     * Store đã hoàn thành việc load dữ liệu
     */
    _loaded = false;

    /**
     * Key đại diện cho bộ tham số load dữ liệu
     * DÙng để kiểm tra xem với bộ tham số hiện tại có cần phải gọi lên server load dữ liệu không
     */
    _lastRequestParamKey = '';

    /**
     * Thực hiện sort data ngay sau khi load dữ liệu
     * `true`: thực hiện sắp xếp sau khi load dữ liệu, trước khi raise sự kiện dataChanged
     * `false`: không thực hiện
     * nếu remoteSort = `true`: bỏ qua thuộc tính này
     */
    sortOnLoad = true;

    /**
     * `true`: thực hiện sắp xếp phía server
     * `false`: thực hiện sắp xếp trên client
     */
    remoteSort = false;

    /**
     * `true`: thực hiện filter phía server
     * `false`: thực hiện filter trên client
     */
    remoteFilter = false;

    /**
     * Model của store (là Type Model store được import vào component)
     * {Model}
     */
    model = undefined;

    /**
     * @property {Boolean} complete True Hoàn thành việc load dữ liệu từ server
     */
    complete = true;

    /**
     * filters: [{
     *      id: 'store_filter_99', //options
     *      property: 'RefNo',
     *      value: 'HĐ00001',
     *      operator: '=' (<, <=, =, >=, >, !=, in, notin, contains, notContains, startsWith, endsWith)
     *      caseSensitive: false,
     *      filterFn: null,
     *      operand: 'or'  //options - default `and`,
     * }]
     * filterFn: chỉ đáp ứng cho tình huống query dữ liệu local, nếu config filterFn thì sẽ không đáp ứng filter theo property
     * nếu operator: 'in' thì value: "1, 2, 3"/[1, 2, 3]/"'a', 'b', 'c'"
     */
    filters = [];

    /**
     *  sorters: [{
     *      id: 'store_sort_99', //options
     *      property: 'RefDate',
     *      desc: true
     *      },{
     *      id: 'store_sort_100',
     *      property: 'RefNo',
     *      desc: false
     *  }],
     * Chú ý: Property chính là key của Filter (dùng cho xóa) nên khi config filter hoặc remove filter cần chú ý
     * Bổ sung sorter dạng function sau (nếu cần)
     */
    sorters = [];

    /**
     * @private
     * Dữ liệu gốc lưu lại trước khi thực hiện filter, sort (local)
     * @readonly
     */
    dataSource = {
        items: []
    };

    /**
     * Dữ liệu sau khi load lên hoặc add vào sẽ được lưu vào đây
     * Đây là dữ liệu cuối cùng:
     * 1 - Khi load từ server lên
     * 2 - Nếu là dữ liệu inline thì khi đã thực hiện filter và sort trên client
     */
    data = {
        items: [],

        /**
         * Kiểm tra item có nằm trong array items không
         */
        contains(item) {
            let me = this,
                exist = false;

            if (item) {
                if (me.items.indexOf(item) > -1) {
                    exist = true;
                }
            }
            return exist;
        }
    };

    /**
     * Danh sách các record bị xóa cần phải xử lý xóa phía server
     */
    _removed = [];

    /**
     * Control gắn với store hiện tại (có thể là grid hoặc combo)
     */
    _ownerCtr = null;

    /**
     * Đối tượng cấu hình phục vụ call api lên server
     * @property {String} apiUrl đường dẫn đẩy đủ đến Service
     * @property {String} method method của api
     */
    proxy = {
        /**
         * Loại proxy là gì (Default sẽ là server, nếu cần load từ cache thì sẽ cấu hình là 'cache')
         */
        type: '',

        /**
         * Key của dữ liệu sẽ đọc trong cache
         *  (Sử dụng trong tình huống type == 'cache')
         */
        keyCache: '',

        /**
         * Path url của api
         *  (Sử dụng trong tình huống type != 'cache')
         */
        apiUrl: '',

        /**
         * Method của api
         *  (Sử dụng trong tình huống type != 'cache')
         */
        method: 'GET'
    };

    /**
     * Function load dữ liệu custom và trả về list records
     */
    loadFn = null;

    /**
     * Mặc định pagesize khi load theo page là `20`
     */
    pageSize = 20;

    /**
     * Tổng Số lượng record của request paging (Sẽ được cập nhật sau mỗi lần gọi loadPage()
     */
    pageTotal = 0; //this.data.items.length;

    /**
     * Dữ liệu tổng các cột được tổng hợp từ server
     */
    summaryData = null;
    /**
     * Dữ liệu tổng của group các cột từ server
     */
    summaryGroupData = null;

    /**
     * Có append sau khi thực hiện load Paging không?
     * `true`: append, `false`: clear data trước khi load
     */
    pageAppend = false;

    /**
     * Có dùng thủ tục lưu hay không? nếu không sẽ tự sinh câu lệnh động
     */
    useSp = false;

    /**
     * Thực hiện clear dữ liệu khi thực hiện load paging (mặc định là `true`)
     * `true`: clear
     * `false`: append
     */
    clearOnPageLoad = true;

    /**
     * Page hiện tại khi thực hiện load paging
     */
    currentPage = 1;

    /**
     * Danh sách các column phục vụ cho việc load dữ liệu theo một số column được chỉ định sẵn
     * VD: columns = "account_object_id, organization_unit_id, account_object_code, account_object_name"
     */
    columns = '';

    /**
     * Tên view query dữ liệu (truyền lên server cho phần lấy dữ liệu Paging)
     */
    viewName = '';

    /**
     * Danh sách các column phục vụ cho việc load dòng tổng theo 1 số cột được chỉ định sẵn
     * VD: summaryColumns = "amount,total_amount"
     * @author pcminh 08.05.2020
     */
    summaryColumns = '';


    //#endregion Properties

    //#region Private

    /**
     * Kiểm tra xem store có được đăng ký lắng nghe eventName hay không
     * @param {String} eventName tên event cần check
     * @author DNThang - 05.07.2019
     * @private
     */
    checkHasListener(eventName) {
        let me = this;
        // return me.$listeners && me.$listeners[eventName];
        return me._events && me._events[eventName];
    }

    /**
     *
     * @param {*} list
     * @param {*} start
     * @private
     */
    toArray(list, start) {
        start = start || 0;
        let i = list.length - start;
        let ret = new Array(i);
        while (i--) {
            ret[i] = list[i + start];
        }
        return ret;
    }

    /**
     * Raise event cho các control thực hiện xử lý binding data
     * @param {String} eventName tên event
     * @param {Array} [args] danh sách các tham số của event
     * @author DNThang - 05.07.2019
     * @private
     */
    notify(eventName) {
        let me = this;

        if (eventName) {
            let eventEnum = MSEventName.MSStore,
                eventDataChanged;
            //Kiểm tra từ event hiện tại có cần raise event dataChanged không
            switch (eventName) {
                case eventEnum.add:
                case eventEnum.remove:
                case eventEnum.clear:
                    eventDataChanged = eventEnum.dataChanged;
                    break;
            }

            let args = me.toArray(arguments, 1);

            //Nếu store không đc lắng nghe eventName thì không cần emit nữa
            if (me.checkHasListener(eventName)) {
                let argsTemp = args.clone();
                argsTemp.insertAt(0, eventName);
                me.$emit.apply(me, argsTemp);
                // me.$emit(eventName, args);
            }

            if (eventDataChanged && me.checkHasListener(eventDataChanged)) {
                args.insertAt(0, eventDataChanged);
                me.$emit.apply(me, args);
                // me.$emit(eventDataChanged, args);
            }
        }
    }

    /**
     * Thực hiện clear toàn bộ dữ liệu trên store
     * @author DNThang - 04.07.2019
     * @param {Boolean} silent: Có raise event dataChange không
     * @private
     */
    clearData(silent = false) {
        let me = this,
            data = me.data,
            dataSource = me.dataSource;

        if (data && data.items && data.items.length > 0) {
            data.items.removeAll();
        }

        if (dataSource && dataSource.items && dataSource.items.length > 0) {
            dataSource.items.removeAll();
        }
    }

    /**
     * Reset trạng thái combobox về như khi vừa khởi tạo xong
     * CreatedBy PDKIEN 7/1/2020
     */
    reset() {
        //Clear data
        this.clearData();
        //Clear trạng thái loaded
        this._loaded = false;
        //PDKIEN Clear filter về filter thiết lập ban đầu (chưa làm ngay được vì cơ chế filter hiện tại chưa phân biệt)
    }

    /**
     * Xác định xem store đã thực hiện việc load dữ liệu chưa
     * Dùng để tối ưu tránh call lên api nhiều lần
     * Các chỗ bên ngoài tránh không lấy trực tiếp _loaded, để sau có rename thì cũng không vấn đề gì
     * @author DNThang - 23.04.2020
     */
    isLoaded() {
        return this._loaded;
    }

    /**
     * Sinh Filter Function cho array data phục vụ filter trên client
     * @returns function dùng cho filter
     * @author DNThang - 10.07.2019
     * @private
     */
    genFilterFn() {
        let me = this;

        //Nếu chưa tồn tại Filter Function thì sinh
        if (me.filters.length > 0 && !me._filterFn) {
            let filterFn = Filter.genFilterFunction(me.filters);
            me._filterFn = filterFn;
        }

        return me._filterFn;
    }

    /**
     * Sinh sort function cho array data phục vụ sắp xếp trên client
     * (Chỉ thực hiện khi remoteSort === `false`)
     * @returns function dùng cho sort
     * @author DNThang - 06.07.2019
     * @private
     */
    genSortFn() {
        let me = this;
        //Nếu chưa có sortFn thì thực hiện sinh
        if (!me._sortFn) {
            //Input của hàm là danh sách các sorter
            let sort_by = function() {
                let fields = arguments[0], //[].slice.call(arguments),
                    n_fields = fields.length;

                return function(A, B) {
                    let a, b, field, property, desc, result, i;

                    for (i = 0; i < n_fields; i++) {
                        result = 0;
                        field = fields[i];

                        property =
                            typeof field === 'string' ? field : field.property;

                        a = A[property];
                        b = B[property];

                        desc = field.desc ? -1 : 1;

                        if (a < b) result = desc * -1;
                        if (a > b) result = desc * 1;
                        if (result !== 0) break;
                    }
                    return result;
                };
            };

            me._sortFn = sort_by;
        }

        return me._sortFn;
    }

    /**
     * Thực hiện convert dữ liệu sang MSEntity để xử lý trạng thái
     * @param {Object/Array} records
     * @param {Boolean} isTemp Có phải là temp model không
     */
    convertObjectToModel(records, isTemp, isPhantom) {
        let me = this,
            model = me.model,
            result;

        //Nếu không có Model thì return record Object hiện tại luôn (quản lý trực tiếp trên Object luôn)
        if (!model) {
            return records;
        }

        result = modelUtil.createModel(records, model, isTemp, isPhantom);

        return result;
    }

    /**
     * Thực hiện sắp xếp cho dữ liệu trên store
     * chỉ thực hiện khi remoteSort = `false`
     * @public
     */
    localSort() {
        let me = this;
        if (
            me.remoteSort === false &&
            me.data.items.length > 0 &&
            me.sorters &&
            me.sorters.length > 0
        ) {
            me.genSortFn();
            if (me._sortFn) {
                me.data.items.sort(me._sortFn(me.sorters));
            }
        }
    }

    /**
     * Thực hiện filter dữ liệu phía local trên store
     * @param {Boolean} force có force filter không
     * @public
     */
    localFilter(force) {
        let me = this;
        if (me.remoteFilter === false && me.dataSource.items.length > 0) {
            if (force || me._filterChange) {
                //DNThang - 09.10.2019: Nếu Force thì thực hiện sinh lại filterFn
                if (force) {
                    me._filterFn = null;
                }

                let filterFn = me.genFilterFn();

                let filtered;

                if (filterFn) {
                    filtered = me.dataSource.items.filter(filterFn);
                } else {
                    filtered = me.dataSource.items;
                }

                me.data.items.removeAll();
                me.data.items.append(filtered);
                me.localSort();
                delete me._filterChange;
            }
        }
    }

    //#endregion Private

    //#region Method

    /**
     * Thực hiện thêm mới record vào dữ liệu của store
     * @param {int} index vị trí cần thêm
     * @param {Array/Object} records bản ghi hoặc array bản ghi cần thêm
     * @param {Boolean} isTemp Có phải là temp model không
     * @author DNThang - 04.07.2019
     * @public
     */
    insert(index, records, isTemp) {
        //
        let me = this,
            len,
            i,
            result;

        result = me.convertObjectToModel(records, isTemp);

        // if (me.data.items) {
        me.dataSource.items.insertArray(index, result);
        me.data.items.insertArray(index, result);

        me.localFilter(true);
        me.localSort();

        //Raise event cho control
        me.notify(MSEventName.MSStore.add, me, records, index);

        if (me.pageTotal) {
            let length = 1;
            if (result instanceof Array) {
                length = result.length;
            }
            me.pageTotal += length;
        }

        return result;
        // }
    }

    /**
     * Lấy ra model theo Index
     * @param {Int} idx index của model cần lấy
     * @public
     */
    getAt(index) {
        return this.getData()[index] || null;
    }

    /**
     * Lấy ra bản ghi theo field và value
     * @return {Int}
     * @public
     */
    findRecord(field, value, startIdx, caseSensitive) {
        let me = this,
            fn = function(item) {
                let result,
                    fieldValue = item[field];
                if (typeof fieldValue === 'string') {
                    result = caseSensitive ?
                        fieldValue === value :
                        fieldValue === value;
                } else {
                    result = fieldValue === value;
                }

                return result;
            };

        let record = me.findBy(fn, startIdx);

        return record;
    }

    /**
     * Thực hiện tìm kiếm theo PrimaryKey
     * @param {String} key primary key của bản ghi
     * @param {*} caseSensitive Có phân biệt hoa thường ko?
     */
    findByKey(key, caseSensitive) {
        let me = this,
            idProperty = me.getIdProperty();
        if (idProperty && me.model) {
            return me.findRecord(idProperty, key, 0, caseSensitive);
        }

        return null;
    }

    /**
     * Lấy ra item đầu tiên theo function truyền vào
     * @param {Function} fn Hàm filter item (có tham số là item của store)
     * @param {Int} startIdx vị trí bắt đầu
     * @return {Model}
     * @public
     */
    findBy(fn, startIdx) {
        let me = this,
            items = me.getData(),
            length = items.length,
            i;

        for (i = startIdx || 0; i < length; i++) {
            let item = items[i];
            if (fn.call(me, item)) {
                return item;
            }
        }

        return;
    }

    /**
     * Trả ra tổng số record đang có trên store
     * (nếu có rule gì đó liên quan đến Group thì sau sẽ xử lý tại đây)
     * @author DNThang - 05.07.2019
     * @public
     */
    getCount() {
        let me = this;
        let count = 0;
        if (me.data && me.data.items) {
            count = me.data.items.length;
        }
        return count;
    }

    /**
     * Thực hiện xóa 1 hoặc nhiều bản ghi trên store
     * @param {Model/Array} @records Danh sachs các bản ghi cần xóa
     */
    remove(records, silent) {
        let me = this,
            result = [],
            data = me.data,
            lstRemove;

        if (records) {
            if (records instanceof Array) {
                lstRemove = records;
            } else if (records instanceof Object) {
                lstRemove = [records];
            } else {
                throw new Error(
                    'DEV: Store chưa hỗ trợ xóa cho trường hợp này.'
                );
            }

            let i = 0;
            for (i = 0; i < lstRemove.length; i++) {
                let record = lstRemove[i];

                if (record.isModel) {
                    //Nếu item này nằm trong tập data thì xử lý
                    if (data.contains(record) > -1) {
                        //Nếu không phải là bản ghi thêm mới từ Client thì thực hiện Add vào danh sách các bản ghi đc xóa để sau còn xử lý trạng thái bản ghi xóa
                        if (!record._phantom) {
                            me._removed.add(record);
                        }
                    }
                }
                result.add(record);
            }

            //Xóa trên data và dataSource
            me.dataSource.items.remove(result);
            me.data.items.remove(result);

            if (me.pageTotal) {
                let length = 1;
                if (result instanceof Array) {
                    length = result.length;
                }
                me.pageTotal -= length;
            }
        }

        if (!silent) {
            //Raise event remove + dataChanged cho control
            me.notify(MSEventName.MSStore.remove, me, result);
        }

        return result;
    }

    /**
     * Thực hiện xóa toàn bộ các record trên store
     * @param {Boolean = false} silent `true` không raise event, `false` có raise event
     * @public
     */
    removeAll(silent) {
        let me = this;
        let records = me.data.items;

        return me.remove(records, silent);
    }

    /**
     * Xóa model tại vị trí index
     * @param {Int} index: vị trí của model cần xóa
     * @description Nếu index < 0 thì sẽ mặc định xóa tại vị trí đầu tiên
     */
    removeAt(index) {
        let me = this,
            record = me.data.items[index];

        index = Math.max(index, 0);

        if (record) {
            me.remove(record);
        }
    }

    /**
     * Xóa filter theo key (property)
     * @param {String} filterKey key/property của filter
     * @param {Array} filters : danh sách các filter
     * @private
     */
    removeFilterByKey(filterKey, filters) {
        let me = this;
        let filter = filters.filter(function(item) {
            return (
                item.property === filterKey ||
                (item.id && item.id === filterKey)
            );
        });

        filters.remove(filter);
        //Bỏ _filterFn để gen lại
        me._filterFn = null;
    }

    /**
     * Lấy ra filter theo id hoặc key
     * @param {string} key id hoặc property của filter cần lấy
     */
    getFilter(key) {
        const me = this;
        let filters = me.filters,
            filter = filters.filter(function(item) {
                return (item.id && item.id === key) || item.property === key;
            });

        return filter;
    }

    /**
     * Xóa Filter khỏi danh sách filter hiện tại của store
     * @param {Object/Key} filter: đối tượng Filter hoặc Key (property) của filter
     * @param {Boolean} silent : có raise event khi remove không
     * @public
     * ModifiedBy DNThang - 13.11.2019: Sửa param silent về mặc định là = false
     */
    removeFilter(filter, silent) {
        let me = this,
            filters = me.filters;

        if (filters.length > 0 && filter) {
            //Nếu xóa theo key
            if (typeof filter === 'string') {
                me.removeFilterByKey(filter, filters);
            } else if (filter instanceof Array) {
                filters.remove(filter);
            } else if (filter instanceof Object) {
                filters.remove(filter);
            } else {
                return;
            }

            //Bỏ _filterFn để gen lại
            me._filterFn = null;

            me._filterChange = true;

            me.localFilter();

            //Raise event filterChanged
            if (!silent) {
                me.notify(MSEventName.MSStore.filterChanged, me, filters);
            }

            // delete me._filterChange;
        }
    }

    /**
     * Xóa toàn bộ filter của store
     * @public
     * ModifiedBy DNThang - 13.11.2019: Sửa param silent về mặc định là = false
     */
    clearFilter(silent) {
        let me = this,
            filters = me.filters;

        if (filters.length > 0) {
            filters.length = 0;

            //Bỏ _filterFn để gen lại
            me._filterFn = null;
            me._filterChange = true;

            me.localFilter();

            //Raise event filterChanged
            if (!silent) {
                me.notify(MSEventName.MSStore.filterChanged, me, filters);
            }

            // delete me._filterChange;
        }
    }

    /**
     * Kiểm tra xem filter đã tồn tại chưa
     * @param {Object/Key} filter
     */
    hasFilter(filter) {
        let me = this;
        if (me.filters && me.filters.length > 0) {
            if (typeof filter === 'string') {
                let i = 0;
                for (i = 0; i < me.filters.length; i++) {
                    let filterTemp = me.filters[i];
                    if (
                        filterTemp.property === filter ||
                        (filterTemp.id && filterTemp.id === filter)
                    ) {
                        return true;
                    }
                }
                return false;
            } else {
                if (me.filters.indexOf(filter) > -1) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    /**
     * Thêm filter vào danh sách filter hiện tại của store
     * @param {Array/Object} filters
     * @param {Boolean} silent
     * @public
     * ModifiedBy DNThang - 13.11.2019: Sửa param silent về mặc định là = false
     */
    addFilter(filters, silent) {
        let me = this;

        //Đẩy vào array filters của store
        if (filters instanceof Array) {
            me.filters.append(filters);
        } else if (filters instanceof Object) {
            me.filters.push(filters);
        } else {
            return;
        }

        //Bỏ _filterFn để gen lại
        me._filterFn = null;

        me._filterChange = true;

        //Thực hiện filter lại dữ liệu
        me.localFilter();

        //Raise event filterChanged
        if (!silent) {
            me.notify(MSEventName.MSStore.filterChanged, me, filters);
        }
    }

    /**
     * Thực hiện load danh sách dữ liệu vào store
     * @param {MSEntity[]/Object[]} data Array dữ liệu cần load vào store
     * @param {Boolean=false} append `true` thực hiện add records vào danh sách các records đã tồn tại, `false` thực hiện remove các records đã tồn tại trước.
     * @param {Boolean=false} isTemp Cờ đánh dấu là dòng Temp hay không
     * @public
     */
    loadData(data, append, isTemp, isPhantom) {
        const me = this;
        if (data) {
            me.rawData = data;
            let newData = me.convertObjectToModel(data, isTemp, isPhantom);

            newData = me.prepareDataBeforeLoad(newData);

            me.loadRecords(newData, append);

            //Raise event loaded
            me.notify(MSEventName.MSStore.loaded, me, newData);
        }
    }

    /**
     * Xử lý dữ liệu trước khi thực hiện load
     * Cho phép derive có thể override
     * @overrideAble
     */
    prepareDataBeforeLoad(data) {
        return data;
    }

    /**
     * Load một array các record vào Store
     * @param {array} records: danh sách các bản ghi load lên
     * @param {Boolean=false} append `true` thực hiện add records vào danh sách các records đã tồn tại, `false` thực hiện remove các records đã tồn tại trước.
     * Nếu sau này xử lý loadOnDemand thì sẽ sử dụng cờ append này
     * @public
     */
    loadRecords(records, append) {
        let me = this;

        me.lastSourceData = records;

        if (!append) {
            me.clearData(true);
        }

        //Chuẩn hóa: nếu truyền vào Object thì chuyển sang Array
        if (!(records instanceof Array)) {
            records = [records];
        }

        //Đẩy vào dataSource
        me.dataSource.items.append(records);

        //Đẩy vào dữ liệu hiện tại
        me.data.items.append(records);
        // me.data.items = me.dataSource.items.clone();

        if (me.remoteFilter === false) {
            me.localFilter(true);
        }

        if (me.remoteSort === false) {
            me.localSort();
        }

        me.loading = false;
        me.complete = true;

        //Raise event dataChanged cho control
        me.notify(MSEventName.MSStore.dataChanged, me);
    }

    /**
     * Load dữ liệu theo page (phục vụ load paging ví dụ cho Grid hoặc loadOnDemand cho combo)
     * @author DNThang - 06.07.2019
     * @public
     */
    loadPage(page, options = {}, axiosOptions) {
        let me = this,
            size = me.pageSize,
            extraParams = null;

        if (options && options.pageSize) {
            size = options.pageSize;
        }
        if (options && options.extraParams) {
            extraParams = options.extraParams;
        }
        //lưu lại page hiện tại
        me.currentPage = page;
        options = Object.assign(options || {}, {
            paging: true,
            pageIndex: page,
            pageSize: size,
            extraParams: extraParams,
            useSp: me.useSp
        });

        return me.load(options, axiosOptions);
    }

    /**
     * Sang trang tiếp theo
     * @param {Object} options
     */
    nextPage(options) {
        let me = this;
        me.loadPage(me.currentPage + 1, options);
    }

    /**
     * Trở về trang trước
     * @param {Object} options
     */
    previousPage(options) {
        let me = this;
        me.loadPage(me.currentPage - 1, options);
    }

    cancelSource = null;

    /**
     * Hủy request đang load
     */
    cancel() {
        if (this.loading && this.cancelSource) {
            this.loading = false;
            this.cancelSource.cancel();
        }
    }

    /**
     * Thực hiện load dữ liệu cho store từ server
     * @param {Object} options: {callback: function, }
     * @modifiedBy DNThang 18.10.2019: Bổ sung tình huống cho phép load theo function custom (loadFn)
     * @public
     */
    load(options, axiosOptions) {
        if (options && options.cancelLoading) {
            this.cancel();
        }

        let me = this,
            proxy = me.proxy,
            CancelToken = axios.CancelToken,
            source = CancelToken.source(),
            cancelOptions = {
                cancelToken: source.token
            };
        axiosOptions = _.assign(cancelOptions || {}, axiosOptions);

        //Thiết lập cancelSource để cancel request đang load
        me.cancelSource = source;

        if (!me.loading) {
            //Nếu chưa config Proxy cho store thì throw exp cảnh báo
            if (
                (!proxy ||
                    (proxy.type === 'cache' &&
                        proxy.keyCache.isNullOrWhiteSpace()) ||
                    (proxy.type !== 'cache' &&
                        proxy.apiUrl.isNullOrWhiteSpace())) &&
                !me.loadFn
            ) {
                throw new Error('DEV: config proxy/loadFn invalid.');
            }
            let paging = options && options.paging,
                isParam = false,
                lstMethodsParam = ['delete', 'get', 'head', 'options'];

            let promise = new Promise((resolve, reject) => {
                //Function xử lý khi call api thành công
                let localCallbackOnSuccess = function(response) {
                    if (response) {
                        let records = [],
                            append = false;

                        me.loading = false;
                        me._loaded = true;

                        if (response instanceof Array) {
                            records = response;
                        } else {
                            let success = response.status == 200;

                            if (response.data) {
                                success = response.data.Success;
                                if (success) {
                                    if (paging) {
                                        if (response.data.Data.Data) {
                                            records =
                                                response.data.Data.Data;
                                        } else {
                                            commonFn.infoLogging(
                                                'Get Paging no data.'
                                            );
                                        }
                                        //Gán lại Total
                                        me.pageTotal = response.data.Data.Total;
                                        // DVQuan 2.11.2019: Gán lại summanryData
                                        me.summaryData =
                                            response.data.Data.SummaryData;
                                        me.summaryGroupData = response.data.Data.SummaryGroupData;

                                        append = me.pageAppend;
                                    } else if (response.data.Data) {
                                        records = response.data.Data;
                                    }
                                    //DNThang - 22.04.2020: Không hiểu sao lại có đoạn code này ở đây vì gán thế này thì lại đi gán records = Object ServiceResponse từ server => Sai dữ liệu
                                    // else {
                                    // 	records = response.data;
                                    // }

                                    if (records.Data) {
                                        records = records.Data;
                                    }

                                    // return records;
                                } else {
                                    //Nếu có lỗi thì gọi hàm xử lý lỗi
                                    reject(response);
                                    return;
                                }
                            }
                        }

                        // if (records.length > 0){
                        me.loadData(records, append);
                        // }

                        resolve({
                            response: response,
                            records: records
                        });
                    }
                };

                //Function xử lý khi call api thất bại
                let localCallbackOnError = function(error) {
                    me.loading = false;

                    commonFn.handleException(error);
                    reject(error);
                };

                if (me.loadFn) {
                    me.loading = true;

                    let customFilter =
                        options && options.customFilter ?
                        options.customFilter : [],
                        queryString = customFilter[0] ?
                        customFilter[0].value :
                        '',
                        result = me.loadFn.call(null, queryString, options, me);

                    if (result instanceof Promise) {
                        result.then(
                            localCallbackOnSuccess,
                            localCallbackOnError
                        );
                    } else {
                        me.loading = false;
                        if (result && result instanceof Array) {
                            localCallbackOnSuccess.call(me, result);
                            //me.loadData(result);
                        }
                    }

                    //Không xử lý tình huống load qua httpClient nữa
                    return;
                } else if (proxy.type === 'cache') {
                    clientDatabase
                        .get(proxy.keyCache)
                        .then(localCallbackOnSuccess, localCallbackOnError);
                    return;
                }
                let params = {};
                //Nếu có Custom Filter thì thực hiện truyền lên server
                let customFilter = [];
                if (
                    options &&
                    options.customFilter &&
                    options.customFilter.length > 0
                ) {
                    options.customFilter.forEach(function(item) {
                        customFilter.push(item);
                    });
                }

                if (options && options.checkParamBeforeLoad) {
                    let keys = [];
                    if (options) {
                        if (options.extraParams) {
                            keys.push(options.extraParams);
                        }
                    }
                    if (
                        me.remoteFilter &&
                        me.filters &&
                        me.filters.length > 0
                    ) {
                        keys.push(me.filters);
                    }

                    //Raise event cho control
                    me.notify('beforeLoad', me, params, customFilter);
                    if (customFilter) {
                        keys.push(customFilter);
                    }
                    keys.push(params);

                    let checkKey = JSON.stringify(keys);
                    if (checkKey === me._lastRequestParamKey) {
                        //return không load dữ liệu
                        let newData = me.lastSourceData;
                        me.loadRecords(newData, false);

                        //Raise event loaded
                        me.notify(MSEventName.MSStore.loaded, me, newData);

                        return;
                    }
                    me._lastRequestParamKey = checkKey;
                }

                //DNThang - 23.08.2019: Bổ sung thêm tình huống custom param cho các tình huống đặc thù
                //Đặt đầu tiên để ưu tiên các param khác của hệ thống
                if (options && options.extraParams) {
                    Object.assign(params, options.extraParams);
                }

                if (me.remoteSort && me.sorters && me.sorters.length > 0) {
                    // params.sort = MSJson.serialize(me.sorters);
                    // params.sort = commonFn.convertToBase64(me.sorters);
                    params.sort = me.buildSortParam(me.sorters);
                }

                if (me.remoteFilter && me.filters && me.filters.length > 0) {
                    // params.filter = MSJson.serialize(me.filters);
                    params.filter = me.buildFilterParam(me.filters);

                    params.filter = commonFn.convertToBase64(
                        params.filter
                    );
                }

                //Raise event cho control
                me.notify('beforeLoad', me, params, customFilter);

                if (options && customFilter.length > 0) {
                    params.customFilter = me.buildFilterParam(customFilter);
                    params.customFilter = commonFn.convertToBase64(
                        params.customFilter
                    );
                }

                //Nếu có xử lý phân trang thì truyền thêm các tham số phục vụ paging .
                if (paging) {
                    if (options.group_key) {
                        params.group_key = options.group_key;
                    }
                    params.takeRemain = options.takeRemain;
                    params.skip = (options.pageIndex - 1) * options.pageSize;
                    params.take = options.pageSize;
                    // params.TaxCode = "0101243150-999";
                    // params.useSp = options.useSp;
                }

                if (me.columns && me.columns !== '') {
                    params.columns = me.columns;
                }

                if (me.viewName && me.viewName != '') {
                    params.view = me.viewName;
                }
                if (lstMethodsParam.indexOf(me.proxy.method !== -1)) {
                    isParam = true;
                }

                if (me.summaryColumns && me.summaryColumns !== '') {
                    params.summaryColumns = me.summaryColumns;
                }

                me.loading = true;

                /**
                 * Giữ lại tham số lần load cuối để xử lý xuất khẩu
                 */
                me.lastParam = params;

                let optionAjax = {
                    url: me.proxy.apiUrl,
                    method: me.proxy.method,
                    data: isParam ? null : params,
                    params: isParam ? params : null
                };

                //PDKIEN Bổ sung thiết lập axios nếu có
                if (axiosOptions) {
                    _.assign(optionAjax, axiosOptions);
                }

              //  httpClient
              //      .request(optionAjax)
              //      .then(localCallbackOnSuccess, localCallbackOnError);
            });

            return promise;
        }
    }

    /**
     * Build param filter từ array filter hiện tại để tương thích với xử lý trên server
     * theo format: [[“IsActive”,”=”,1], “and”, [“Status”,”=”,0],”and”,[[“CourseGroupID”, “=”, 1356]]]
     * ["Name", "contains", "Mi"]
     * ["is_vendor", "=", "true"]
     * @param {Array/Object} filters
     */
    buildFilterParam(filters) {
            let me = this,
                sFilter = '';

            if (filters && !(filters instanceof Array)) {
                filters = [filters];
            }

            let length = filters.length;

            if (length > 0) {
                let i,
                    arrayFilters = [],
                    sJoin = ',';

                for (i = 0; i < length; i++) {
                    let filter = filters[i],
                        s =
                        '"' +
                        filter.property +
                        '",' +
                        (filter.operator ? '"' + filter.operator + '",' : ''),
                        //Mặc định operand là `and`
                        operand = '"and"';

                    // if (typeof filter.value === "number") {
                    //   s += filter.value.toString();
                    // } else {
                    //   s += '"' + filter.value + '"';
                    // }

                    s += me.nomalizeFilterValue(filter.operator, filter.value);

                    s = '[' + s + ']';

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
                    sFilter = '[' + sFilter + ']';
                }
            }

            return sFilter;
        }
        /**
         * Build sort từ dạng Array hiện tại sang dạng phù hợp với server
         * Từ dạng [{property: 'inventory_item_code',desc: false}] sang dạng "inventory_item_code ASC"
         * @params sorters Array cần chuyển
         * @return Mang dữ liệu kiểu String
         */
    buildSortParam(sorters) {
            let params = [];
            if (sorters && sorters.length > 0) {
                sorters.forEach(_item => {
                    let param = _item.property + " " + (_item.desc ? "DESC" : "ASC");
                    params.push(param);
                });
            }
            params = params.join(',');
            return params;
        }
        /**
         * Chuẩn hóa giá trị dùng để build filter lên server
         * @param {String} operator toán tử filter
         * @param {*} value các giá trị dùng để filter
         * CreatedBy DNThang - 26.11.2019
         */
    nomalizeFilterValue(operator, value) {
        let me = this,
            ret = '';
        if (value instanceof Date) {
            ret = '"' + value.toUTCDateTime() + '"';
        } else {
            switch (operator) {
                case 'in':
                case 'notin':
                    /* Trong trường hợp
                      - Là number thì chỉ đáp ứng: value: xxx
                      - Nếu là string thì chỉ đáp ứng: "1, 2, 3" hoặc "(1, 2, 3)"
                      - Nếu là Array thì tự build
                    */
                    if (typeof value === 'number') {
                        ret = value.toString();
                    } else if (value instanceof Array) {
                        //Trong trường hợp là mảng thì chuẩn hóa tiếp
                        let sValue;
                        value.forEach(item => {
                            if (typeof item === 'number') {
                                sValue = item.toString();
                            } else {
                                sValue = "'" + item + "'";
                            }

                            if (ret) {
                                ret += ',' + sValue;
                            } else {
                                ret = sValue;
                            }
                        });

                        if (ret) {
                            //ret = '"(' + ret + ')"'
                            ret = '"' + ret + '"';
                        }
                    } else {
                        value = value.toString();
                        if (value.startsWith('(')) {
                            ret = '"' + value + '"';
                        } else {
                            ret = '"(' + value + ')"';
                        }
                    }

                    break;
                default:
                    if (typeof value === 'number') {
                        ret = value.toString();
                    } else {
                        ret = '"' + value + '"';
                    }
            }
        }

        return ret;
    }

    /**
     * Thực hiện giải phóng đối tượng
     * (Cần giải phóng những đối tượng gì sẽ xử lý ở đây)
     * @author DNThang - 04.07.2019
     * @public
     */
    doDestroy() {
            let me = this;
            //Raise event beforeDestroy
            me.$emit('beforeDestroy');
            me.clearData();
        }
        //#endregion Method

    /**
     * Thực hiện filter dữ liệu theo function truyền vào
     * @param {Function} fnFilter
     * @param {Function} forceAll
     *  * Modified LTDAT 25.03.2020
     * Thêm param forceAll để xác định lấy dữ liệu từ data hay dataSource
     */
    filterDataSource(fnFilter, forceAll = false) {
        let me = this,
            source = forceAll ? me.dataSource : me.data,
            items = source.items,
            len = items.length,
            result = [],
            i;

        for (i = 0; i < len; i++) {
            if (fnFilter.call(source, items[i])) {
                result.push(items[i]);
            }
        }

        return result;
    }

    /**
     * Lấy ra danh sách các bản ghi bị xóa trên store
     */
    getRemovedRecords() {
        let me = this;
        return me._removed;
    }

    /**
     * Lấy ra danh sách các bản ghi có thay đổi trên store
     * Modified LTDAT 25.03.2020
     * Thêm param forceAll để xác định lấy dữ liệu từ data hay dataSource
     */
    getUpdatedRecords(forceAll = false) {
        let me = this,
            filterUpdated = function(item) {
                return item.getChanges() && item._phantom !== true;
            };

        return me.filterDataSource(filterUpdated, forceAll);
    }

    /**
     * Lấy ra các bản ghi thêm mới
     *  * Modified LTDAT 25.03.2020
     * Thêm param forceAll để xác định lấy dữ liệu từ data hay dataSource
     */
    getNewRecords(forceAll = false) {
        let me = this,
            filterNew = function(item) {
                return item._phantom === true;
            };

        return me.filterDataSource(filterNew, forceAll);
    }

    /**
     * Thực hiện thêm mới 1 bản ghi hoặc danh sách bản ghi
     * @param {Model[]} arg Model cần thêm
     */
    addNew(arg, isTemp) {
        let me = this,
            model = me.model;

        //Xử lý chuẩn hóa dữ liệu truyền vào để khởi tạo Model
        if (arg && arg.constructor && arg.constructor.name === 'Object') {
            delete arg.isModel;
            delete arg.isEntity;
        }

        if (!arg && model) {
            arg = modelUtil.createModel({}, model);
        }

        let result = me.insert(me.getCount(), arg, isTemp);
        if (Array.isArray(result)) {
            result.forEach(function(item) {
                item.__vKeyValue = commonFn.generateUUID();
                item._phantom = true;
            });
        } else {
            //Khi gọi vào đây thì luôn force là new record
            result.__vKeyValue = commonFn.generateUUID();
            result._phantom = true;
        }

        return result;
    }

    /**
     * Xóa đi các bản ghi temp
     * @author DNThang - 23.04.2020
     * @returns {Array} Danh sách các temp records
     */
    removeTempRecord() {
        const me = this,
            count = me.getCount();

        let ret = [];
        if (me.getCount() > 0) {
            for (let i = 0; i < count; i++) {
                let item = me.data.items[i];
                if (item._isTemp) {
                    ret.push(item);
                }
            }

            //Xóa tập các tempRecord khỏi data của store
            if (ret.length > 0) {
                me.data.items.remove(ret);
                me.dataSource.items.remove(ret);
            }
        }

        return ret;
    }

    /**
     * Lấy ra danh sách các Items đang có của store
     * Vì là this.data.items nên là dữ liệu sau filter
     */
    getData() {
        let me = this;
        return me.data.items;
    }

    /**
     * Lấy ra toàn bộ data (là data gốc chưa filter và sort)
     */
    getFullData() {
        let me = this;
        return me.dataSource.items.clone();
    }

    /**
     * Kiểm tra model của store có tồn tại `fieldName` hay không
     * @param {String} fieldName
     * @returns true: tồn tại, false: không tồn tại
     */
    hasField(fieldName) {
        let me = this,
            exist = false;

        if (me.model) {
            exist = me.model.prototype.hasField(fieldName);
        }

        return exist;
    }

    /**
     * Lấy ra idProperty của Model
     */
    getIdProperty() {
        let me = this,
            ret = '';

        if (me.model) {
            if (!me.idProperty) {
                me.idProperty = me.model.prototype.getIdProperty();
            }
            ret = me.idProperty;
        }

        return ret;
    }

    /**
     * Lấy ra danh sách các fields của model
     * (Nếu không có model thì return `null`)
     */
    getFields() {
        let me = this,
            fields = null;

        if (me.model) {
            fields = me.model.prototype.getFields();
        }

        return fields;
    }

    /**
     * Lấy ra các bản ghi có thay đổi phục vụ cho commit
     */
    getModifiedRecords() {
        return [].concat(this.getNewRecords(), this.getUpdatedRecords());
    }

    /**
     * Lấy ra các Records thay đổi cần reject
     *  * Modified LTDAT 25.03.2020
     * Thêm param forceAll để xác định lấy dữ liệu từ data hay dataSource
     */
    getRejectRecords(forceAll = false) {
        let me = this,
            filterRejects = function(item) {
                return item._phantom || item._dirty;
            };

        return me.filterDataSource(filterRejects, forceAll);
    }

    /**
     * Thực hiện commit tất cả các record có thay đổi
     */
    commitChanges() {
        let me = this,
            recs = me.getModifiedRecords(),
            len = recs.length,
            i = 0,
            removed = me._removed;

        for (; i < len; i++) {
            recs[i].commit();
        }

        //Xóa các record đã bị remove
        if (removed) {
            removed.length = 0;
        }
    }

    /**
     * Xử lý rejectChanges toàn bộ các thay đổi trên store
     * (Phục vụ cho việc cancel thay đổi)
     */
    rejectChanges() {
        let me = this,
            recs = me.getRejectRecords(),
            len = recs.length,
            removed = me._removed,
            i,
            rec,
            added;

        //Thực hiện remove các record thêm và sửa
        for (i = 0; i < len; i++) {
            rec = recs[i];
            if (rec._phantom) {
                added = added || [];
                added.push(rec);
            } else {
                rec.reject();
            }
        }

        //Xóa các bản ghi thêm mới từ client trên store
        if (added) {
            me.remove(added);
            for (i = 0, len = added.length; i < len; ++i) {
                added[i].reject();
            }
        }

        //Rollback các bản ghi đã xóa trên store
        if (removed) {
            len = removed.length;

            for (i = len - 1; i >= 0; i--) {
                rec = removed[i];
                rec.reject();

                //Xử lý sort data sau
                me.insert(0, rec);
            }

            //Xóa các bản ghi bị xóa
            removed.length = 0;
        }
    }

    /**
     * Kiểm tra store có thay đổi gì liên quan đến dữ liệu không?
     * `true`: có, `false`: không
     */
    hasChanges() {
            let me = this,
                forceAll = false,
                ignoreTemp = true,
                recs = me.getModifiedRecords(forceAll, ignoreTemp),
                result = false;

            // Bỏ qua những bản ghi isTemp mà chưa có sự thay đổi
            recs = recs.filter(x => !(x._isTemp && !x.getChanges()));

            if (recs && recs.length > 0) {
                result = true;
            } else if (me._removed && me._removed.length > 0) {
                result = true;
            }

            return result;
        }
        /**
         * Thiếp lập url cho proxy
         * @param {url} url
         * CreatedBy PDKIEN 8/1/2020
         */
    setApiUrl(url) {
        this.proxy.apiUrl = url;
        this.$emit('urlChanged', url);
    }

    /**
     * Tính tổng số trang theo pageSize hiện tại của store
     */
    getTotalPages() {
        return Math.ceil(this.pageTotal / this.pageSize);
    }
}

// export default MSStore();