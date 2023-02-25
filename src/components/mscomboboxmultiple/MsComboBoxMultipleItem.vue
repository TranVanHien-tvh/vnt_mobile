<template>
  <!-- Item của combo không có column -->
  <li
    v-if="comboType === 1"
    class="combobox-item single"
    :class="{ parent: item.is_parent }"
    :style="'text-align: ' + align"
    v-on="listeners"
  >
    <div class="combobox-item-con">
      <div class="combobox-item--text" :title="getItemDisplay(item)">
        {{ getItemDisplay(item) }}
      </div>
      <span
        v-if="hasRemoveItemButton"
        class="trash-icon"
        @click="onRemoveItemClick()"
      >
        <span class="mi mi-16 mi-garbage" />
      </span>
    </div>
    <div v-if="item.isSelected || isSelected" class="selected-container">
      <div :class="['icon24', 'mi-checkbox-active']" />
    </div>
  </li>
  <li
    v-else-if="comboType === 3 && columnx.length == 0"
    class="combobox-item single"
    :class="{ parent: item.isParent }"
    :style="'text-align: ' + align"
    v-on="listeners"
  >
    <div class="combobox-item-con">
      <div
        class="combobox-item--text"
        :class="`level-${item.level}`"
        :title="getItemDisplay(item)"
      >
        {{ getItemDisplay(item) }}
      </div>
      <span
        v-if="hasRemoveItemButton"
        class="trash-icon"
        @click="onRemoveItemClick()"
      >
        <span class="mi mi-16 mi-garbage" />
      </span>
    </div>
    <div v-if="item.isSelected || isSelected" class="selected-container">
      <div :class="['icon24', 'mi-checkbox-active']" />
    </div>
  </li>
  <!-- Item của combo có column -->
  <tr
    v-else
    class="combobox-item"
    :class="{ parent: item.isParent }"
    v-on="listeners"
  >
    <td
      v-for="(column, tdIndex) in columnx"
      :key="tdIndex"
      class="combobox-item-td"
      :class="comboType === 3 && tdIndex === 0 ? `level-${item.level}` : null"
    >
      <div class="combobox-item-td--contents" :style="getCellStyle(column)">
        <div
          :title="getItemDisplay(item, column)"
          class="combobox-item-td--text"
        >
          {{ getItemDisplay(item, column) }}
        </div>
      </div>
    </td>
    <td class="selected-container">
      <div
        v-if="item.isSelected || isSelected"
        :class="['icon24', 'mi-checkbox-active']"
      />
    </td>
  </tr>
</template>

<script>
export default {
  name: "MsComboBoxItem",
  props: {
    /**
     * Loại combo
     */
    comboType: {
      type: Number,
      default: 1,
    },

    /**
     * Item sử dụng để binding
     */
    item: {
      type: Object,
    },

    /**
     * bản ghi có dc chọn hay k
     */
    isSelected: {
      type: Boolean,
      default: false,
    },

    /**
     * Cấu hình cột của menu
     */
    columnx: {
      type: Array,
      default: function () {},
    },
    /**
     * Trường làm value
     * CreatedBy PDKIEN 10/12/2019
     */
    valueField: {
      type: String,
      default: null,
    },
    /**
     * Trường là display
     * CreatedBy PDKIEN 10/12/2019
     */
    displayField: {
      type: String,
      default: null,
    },

    /**
     * Trạng thái có btn `Xóa` trong item
     */
    hasRemoveItemButton: {
      type: Boolean,
      default: false,
    },
    /**
     * Kiểu định dạng dữ liệu trên combobox
     * Tương ứng với FormatType
     * CreatedBy PDKIEN 07/12/2019
     */
    formatType: {
      type: [Number, String],
      default: null,
    },
    align: {
      type: String,
      default: "left",
    },
  },
  computed: {
    /**
     * Binding sự kiện của menu item
     */
    listeners() {
      let me = this;
      return {
        ...me.$listeners,
      };
    },
  },
  watch: {
    item: {
      deep: true,
      handler(newVal, oldVal) {
        let x = 1;
      },
    },
  },
  methods: {
    /**
     * Hàm lấy style cho td trong table
     * dữ liệu động theo config của dev
     */
    getCellStyle(column) {
      return {
        width: column.isResize ? null : `${column.width}px`,
        textAlign: column.columnAlign,
      };
    },

    /**
     * Lấy text hiển thị trên item
     * Nếu có column lấy theo column.field, nếu không có column lấy theo displayField, nếu không có displayField lấy theo valueField
     * CreatedBy PDKIEN 10/12/2019
     */
    getItemDisplay(item, column) {
      let field = column
        ? column.dataField
        : this.displayField || this.valueField;
      if (field) {
        return item[field];
      } else {
        return item;
      }
    },

    /**
     * Xử lý sự kiện khi click icon xóa item
     */
    onRemoveItemClick() {
      this.$emit("removeItem");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msComboboxItem.scss";
</style>
