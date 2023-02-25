import commonFn from '@/commons/commonFunction';
export default class {
  constructor(name, api) {
    const me = this;
    /**
     * state
     */
    me.state = {
      /**
       * Cấu hình của module
       */
      _config: {
        field: {}
      },
      /**
       * loading
       */
      loading: false,
      /**
       * loading load summary
       */
      loadingSummary: false,
      /**
       * Tổng bản ghi theo paging
       */
      total: 0,
      /**
       * Thông tin tổng
       */
      summary: null,
      /**
       * active data - dùng cho combobox
       */
      items: [],
      /**
       * Không có dữ liệu trong bảng
       * Dùng cờ này để hiển thị mặc hình trống trên danh sách
       */
      empty: false,
      /**
       * Danh sách các cache key sẽ phải xóa đi khi có cập nhật dữ liệu
       */
      cacheKeys: [],
      /**
       * Version dữ liệu ở client để đánh dấu là có thay đổi -> dựa theo món này thay đổi để load lại dữ liệu của combobox
       */
      version: 1,
    };

    /**
     * actions
     */
    me.actions = {
      /**
       * Lấy đường dẫn controller api
       */
      getController() {
        return api.getAPIUrl();
      },

      /**
       * TDNGHIA 28/9/2021
       * Sau khi base gọi load data ($store.dispatch)
       * Nó gọi về đẩy để load, set item các kiểu này
       * Load danh sách
       */
      async load(context, payload) {
        let res = null;
        try {
          context.commit("updateLoading", true);
          res = await api.getList(payload || {});

        } finally {
          context.commit("updateLoading", false);
        }

        if (res) {

          context.commit("setItems", { result: res, payload: payload });
        }

        return res;
      },

      /**
       * TDNGHIA 28/9/2021
       * Sau khi base gọi load sumary (dòng tổng cộng, chi tiết thông số ở foooter)
       * Nó gọi vào đây để set các giá trị biến
       */
      async loadSummary(context, payload) {

        let res = null;
        try {

          context.commit("updateLoadingSummary", true);
          res = await api.getList(payload || {});
        } finally {
          context.commit("updateLoadingSummary", false);
        }

        if (res) {
          context.commit("setItems", { result: res, payload: payload });
        }

        return res;
      },

      /**
       * Load danh sách
       */
      async full(context, payload) {
        //context.commit("updateLoading", true);

        let res = await api.getFullList();
        //context.commit("updateLoading", false);

        if (res) {
          // res.skip = payload ? payload.skip : 0;
          res.payload = payload;
          context.commit("setAllItems", res);
        }

        return res;
      },

      /**
       * Load danh sách
       */
      async loadListTree(context, payload) {
        context.commit("updateLoading", true);

        let res = await api.getListTree(payload || {});
        context.commit("updateLoading", false);

        if (res) {
          // res.skip = payload ? payload.skip : 0;
          res.payload = payload;
          context.commit("setAllItems", res.PageData);
        }

        return res;
      },
      /**
       * Lấy mã tự tăng
       */
      async getAutoID(context, payload) {
        //context.commit("updateLoading", true);

        let res = await api.getAutoID();
        //context.commit("updateLoading", false);

        return res;
      },

      /**
       * Load dữ liệu để thêm/sửa/nhân bản
       * Hàm này sẽ không commit mà return value để binding cho form
       */
      async get(context, payload) {
        let method = "get" + payload.action;
        delete payload.action;

        let res = await api[method](payload);
        return res;
      },
      /**
       * Thêm mới
       */
      async insert(context, payload) {
        let res = await api.insert(payload);
        if (res && res.Success) {
          if (res.Data) {
            //cập nhật danh sách
            context.commit("insertItem", res.Data);
          }
        }
        return res;
      },
      /**
       * Cập nhật
       */
      async update(context, payload) {
        let res = await api.update(payload);
        if (res && res.Success) {
          if (res.Data) {
            //cập nhật danh sách
            context.commit("updateItem", res.Data);
          }
        }
        return res;
      },
      /**
       * Xóa
       */
      async delete(context, payload) {
        let res = await api.delete(payload);
        if (res && res.Success) {
          //cập nhật danh sách
          let deleteSucessItems = payload.Entity;
          context.commit("deleteItems", deleteSucessItems);
        }
        return res;
      },

      /**
       * update trạng thái theo dõi ngừng theo dõi
       * TDNGHIA 15/11/2021
       */
      async updateStatus(context, payload) {
        let res = await api.updateStatus(payload);

        return res;
      },

      /**
       * update trạng thái theo dõi ngừng theo dõi
       * TDNGHIA 15/11/2021
       */
      async updateConfig(context, payload) {
        let res = await api.updateConfig(payload);

        return res;
      }
    };

    /**
     * mutations
     */
    let defaultState = {};
    Object.assign(defaultState, me.state);
    me.mutations = {
      resetState(state) {
        Object.assign(state, defaultState);
      },
      setItems(state, data) {
        if (data.result) {
          for (let i in data.result) {
            let resultValue = data.result[i];
            switch (i) {
              case "PageData":
                state.items.removeAll();
                state.items.append(resultValue);
                break;
              case "Total":
                state.total = resultValue;
                break;
              case "Empty":
                state.empty = resultValue;
                break;
              case "SummaryData": {
                let summaryx = { ...resultValue }
                delete summaryx.Total
                delete summaryx.TotalAmount
                delete summaryx.TotalQuantity
                delete summaryx.Type
                if (resultValue) {
                  resultValue.isShowDetailAmount = !_.isEmpty(summaryx)
                }
                state.summary = resultValue;
                break;
              }
            }
          }
        }

        // state.items.removeAll();
        // state.items.append(res.PageData);
        // if (!res.payload || !res.payload.skip) {
        //   state.total = res.Total;
        //   state.empty = res.Empty;
        // }
      },
      setSummary(state, res) {
        state.summary = res;
      },
      setAllItems(state, res) {
        state.items.removeAll();
        state.items.append(res);
      },
      addNew(state, item) {
        state.items.push(item);
      },
      updateLoading(state, data) {
        state.loading = data;
      },
      updateLoadingSummary(state, data) {
        state.loadingSummary = data;
      },
      setItem(state, data) {
        state.item = data;
      },
      /**
       * Cập nhật khi thêm bản ghi
       * modifiedby: nmsinh 3/4/2021 : xử lý trường extdata
       */
      insertItem(state, data) {
        let newItem = { ...data };
        if (newItem.ExtData) {
          let ext = JSON.parse(newItem.ExtData);
          for (let i in ext) {
            newItem[i] = ext[i];
          }
        }
        state.items.insertAt(0, newItem);
        state.total += 1;
        //pvduy 11/05/2021 cất thành công thì cập nhật lại cờ empty để render lại giao diện.
        state.empty = false;

        //xóa cache combobox data
        if (state.cacheKeys) {
          commonFn.removeCacheComboboxData(state.cacheKeys);
        }
        state.version++;
      },
      /**
       * Cập nhật khi sửa bản ghi
       */
      updateItem(state, data) {

        let keyField = state._config.field.key;

        if (keyField) {
          let id = data[keyField];
          for (let i = 0; i < state.items.length; i++) {
            let item = state.items[i];

            if (item[keyField] === id) {
              Object.assign(item, data);
              break;
            }
          }
        }

        //xóa cache combobox data
        if (state.cacheKeys) {
          commonFn.removeCacheComboboxData(state.cacheKeys);
        }
        state.version++;
      },
      /**
       * Cập nhật khi xóa bản ghi
       */
      deleteItems(state, items) {
        let keyField = state._config.field.key;

        if (keyField) {
          let count = items.length;
          for (let k = 0; k < count; k++) {
            let id = items[k][keyField];
            for (let i = 0; i < state.items.length; i++) {
              let item = state.items[i];

              if (item[keyField] === id) {
                state.items.remove(item);
                break;
              }
            }
          }

          state.total -= count;
        }

        //xóa cache combobox data
        if (state.cacheKeys) {
          commonFn.removeCacheComboboxData(state.cacheKeys);
        }
        state.version++;
      }
    };

    /**
     * getters
     */
    me.getters = {};
    for (let i in me.state) {
      me.getters[i] = function (state) {
        return state[i];
      };
    }
  }
}

