/**
 * Mixin xử lý group dữ liệu của grid view/edit
 */
export const gridGroupData = {
  props: {
    /**
     * Trường để nhóm dữ liệu
     */
    groupField: {
      type: String,
      default: null
    },
    /**
     * Có hiển thị summary trên dòng group text không
     */
    groupSumable: {
      type: Boolean,
      default: false
    },
    /**
     * Dữ liệu sum sẽ lấy từ server
     */
    groupSumRemote: {
      type: Array,
      default: null
    },
    /**
     * custom lại cách nhóm dữ liệu
     */
    customGroupField: {
      type: Function,
      default: null
    },

    /**
     * custom lại text nhóm
     */
     buildGroupTextCustom: {
      type: Function,
      default: null
    },

    /**
     * custom lại cách đánh SortOrder
     */
     rebuildSortOrderCustom: {
      type: Function,
      default: null
    },

    /**
     * Thêm sort cho GroupField
     */
    sortTypeGroupField: {
      type: String,
      default: 'asc'
    },

    /**
     * Trường dùng để sắp xếp
     */
    sortValueGroupField: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      /**
       * Danh sách các group expanded
       */
      groupExpand: []
    };
  },
  computed: {
    /**
     * Dữ liệu group dùng để render
     */
    groupData() {
      const me = this,
        source = me.datax,
        map = {};

      let res = [];

      if (me.groupField) {
        source.forEach((record, index) => {
          record.rowIndex = index;
          let value = record[me.groupField];
          let valueSortField = record[me.sortValueGroupField];
          if (!map.hasOwnProperty(value)) {
            map[value] = {
              value: value,
              valueSortField: valueSortField || value,
              datax: []
            };
            res.push(map[value]);
          }
          map[value].datax.push(record);
        });

        let column = null;
        for (let i = 0; i < me.columnx.length; i++) {
          let item = me.columnx[i];
          if (item.dataField === me.groupField) {
            column = item;
            break;
          }
        }

        // Sắp xếp group
        if (res && res.length > 0) {
          res = res.sortObject('valueSortField');
        }

        // Sau khi sort group cần gán lại số thứ tự
        me.rebuildSortOrder(res)

        //build group text
        for (let i = 0; i < res.length; i++) {
          res[i].text = me.buildGroupText(res[i], i, column);
        }

        //Xử lý summary của group
        me.processGroupSummary(res);
      }

      if (typeof me.customGroupField == 'function') {
        res = me.customGroupField(me, res, me.datax, me.columnx);
      }

      return res;
    }
  },
  methods: {
    /**
     * Sau khi sort group cần gán lại số thứ tự
     */
    rebuildSortOrder(res) {
      let me = this;
      if (typeof me.rebuildSortOrderCustom === 'function') {
        me.rebuildSortOrderCustom(res);
      }
      else {
        let currentPage = (me.currentPage - 1) * me.pageSize + 1;
        res.flatMap(x => x.datax).map((x, idx) => x.SortOrder = currentPage + idx)
      }
    },

    /**
     * Xử lý summary của group
     * xử lý cho các trường kiểu số
     */
    processGroupSummary(groups) {
      const me = this;
      if (!me.groupSumable) {
        groups.forEach(item => {
          item.colspan = me.columnx.length + 1; // cộng 1 để colspan thêm cột stt
        });
      } else {
        //xử lý lấy các cột sẽ sum
        let cols = [];
        let firstIndexSumColumn = null;
        let columnLockNumber = 0; // tổng số cột bị ghim
        me.columnx.forEach((col, i) => {
          if (col.lock) {
            columnLockNumber++;
          }
          switch (col.formatType) {
            case me.$ms.enum.FormatType.Quantity:
            case me.$ms.enum.FormatType.Number:
              if(col.dataField != "Sortorder"){
                if (!firstIndexSumColumn) {
                  firstIndexSumColumn = i;
                }
                cols.push({
                  index: i,
                  dataField: col.dataField,
                  formatType: col.formatType,
                });
              }
              break;
          }
        });

        //nếu không có cột sum nào -> colspan all
        if (cols.length === 0) {
          groups.forEach(item => {
            item.colspan = me.columnx.length;
          });
        } else {
          //xử lý tính sum cho từng group
          groups.forEach(group => {
            let sum = {};

            if (me.groupSumRemote && me.groupSumRemote.length > 0) {
              for (let i = 0; i < me.groupSumRemote.length; i++) {
                let gs = me.groupSumRemote[i];
                if (gs[me.groupField] === group.value) {
                  sum = gs;
                  break;
                }
              }
            } else {
              group.datax.forEach(record => {
                cols.forEach(col => {
                  let dataField = col.dataField;
                  if (!sum.hasOwnProperty(dataField)) {
                    sum[dataField] = 0;
                  }
                  sum[dataField] += (record[dataField] || 0);
                });
              });
            }

            let colspan = 1;
            if (columnLockNumber > 0) {
              colspan = Math.min(columnLockNumber, firstIndexSumColumn);
            } else {
              colspan = firstIndexSumColumn;
            }

            //column
            group.columnx = [];
            if(colspan < cols[0].index){
              group.columnx.push({
                colspan: cols[0].index - colspan,
                empty: true
              });
            }

            for (let i = cols[0].index; i < me.columnx.length; i++) {
              let map = null;
              for (let j = 0; j < cols.length; j++) {
                if (cols[j].index === i) {
                  map = cols[j];
                  break;
                }
              }

              if (map) {
                group.columnx.push({
                  formatType: map.formatType,
                  value: sum[map.dataField],
                  field: map.dataField
                });
              } else {
                group.columnx.push(null);
              }
            }

            //xử lý cột selection và số thứ tự
            if (me.serial) {
              colspan++;
            }
            if (me.multiple) {
              colspan++;
            }

            if (colspan > 1) {
              group.colspan = colspan;
            }
          });
        }
      }
    },
    /**
     * build text hiển thị của column
     */
    buildGroupText(group, index, column) {
      const me = this,
        formater = me.$options.filters;
      let text = formater.formatData(group.value, {
        formatType: column ? column.formatType : 0,
        enumName: column ? column.enum : null
      });

      // return text;
      let resultText = [index + 1, ". ", text == '-' ? "Khác" : text, " (", group.datax.length, ")"].join("");

      if(typeof me.buildGroupTextCustom === 'function'){
        resultText = me.buildGroupTextCustom(group, index, column, text, resultText);
      }

      return resultText;
    },

    /**
     * collapse/expand group
     */
    toggleGroup(group) {
      const me = this,
        value = group.value;
      if (me.groupExpand.indexOf(value) === -1) {
        me.groupExpand.push(value);
      } else {
        me.groupExpand.remove(value);
      }
    },
    /**
     * expand all group data
     */
    expandAll() {
      const me = this;
      if (me.groupData) {
        let gs = [];
        me.groupData.forEach(item => {
          gs.push(item.value);
        });
        me.groupExpand = gs;
      }
    },
    /**
     * expand dữ liệu mặc định sau khi render
     * expand nhóm đầu - để hiệu năng render tốt nhất
     */
    defaultExpand() {
      const me = this;
      me.expandAll();
      return;

      if (me.groupData) {
        let gs = [];
        if (me.groupData.length > 0) {
          gs.push(me.groupData[0].value);
        }
        me.groupExpand = gs;
      }
    },
    /**
     * collapse all group data
     */
    collapseAll() {
      const me = this;
      me.groupExpand = [];
    }
  }
};
