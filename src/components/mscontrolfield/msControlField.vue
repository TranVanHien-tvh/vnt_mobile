<template>
  <div :class="['flex',{'ms-control-field': !isAcceptEdit,'ms-editor':isAcceptEdit}]">
    <component
      :is="getEditorType(controlField)"
      v-show="!(controlField.textLink || controlField.textNormal)"
      v-model="controlField.value"
      :read-only="!isAcceptEdit"
      :disabled="controlField.disabled"
      :placeholder="controlField.placeholder"
      :init-text="controlField.initText"
      :data="controlField.data"
      :page-total="controlField.pageTotal"
      :rules="controlField.rules"
      :query-mode="controlField.queryMode"
      :pagination="controlField.pagination"
      :remote-filter="controlField.remoteFilter"
      :value-field="controlField.valueField"
      :display-field="controlField.displayField"
      :build-filter="controlField.buildFilter"
      :selected-item="controlField.selectedItem"
      :force-selection="controlField.forceSelection"
      :is-tree="controlField.isTree"
      :quick-search="controlField.quickSearch"
      :quick-add="controlField.quickAdd"
      :quick-search-param="controlField.quickSearchParam"
      :has-cell-buttons="controlField.hasCellButtons"
      :min="controlField.min"
      :max="controlField.max"
      :spin="controlField.spin"
      ref="msControlField"
      :format-type="controlField.formatType"
      :text="controlField.text"
      :is-permission="controlField.isPermission"
      :auto-load="controlField.autoLoad"
      :request-field="controlField.requestField"
      :custom-warring="controlField.customWarring"
      :columns="controlField.columns"
      :rows="controlField.rows"
      :max-length="controlField.maxLength"
      v-on="listeners"
    />
    <div
      v-show="controlField.textLink || controlField.textNormal"
      class="container"
    >
      <ms-input :read-only="!isAcceptEdit" />
      <div
        class="alert d-inline-block init-text-custom"
        @click.prevent="fieldActionClickCustom"
      >
        <span class="text-link">{{ controlField.textLink }}</span>
        {{ controlField.textNormal }}
      </div>
    </div>

    <div class="content-button">
      <!-- <div class="mrl"></div> -->
      <div
        class="list-button"
        :class="{'flex':isAcceptEdit}"
      >
        <div
          v-for="action in listButton"
          :key="action.command"
          class="icon-cover"
          @click.prevent="fieldActionClick(action.command, $event)"
        >
          <div
            class="icon24 icon mr-2"
            :class="action.icon"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
export default {

  name: "MsControlField",
  extends: msBaseComponent,

  props: {
    controlField: {
      type: Object,
      default: {
        type: 0
      }
    },
    /*
     * pvduy 04/03/2021: tên field
     */
    fieldName: {
      type: String,
      default: null
    },
    listButtonView: {
      type: [Array, Object],
      default: null
    },
    listButtonEdit: {
      type: [Array, Object],
      default: null
    }
  },

  data() {
    return {
      internalText: this.controlField.initText
        ? this.controlField.initText
        : this.value,
      focused: false,
      displayValue: null,
      scrollWidth: 0,
      isAcceptEdit: false,
      listButton: []
    };
  },

  computed: {
    listeners() {
      return {
        //pvduy sự kiện dbclick
        dblclick: e => {
          this.dblclick(e);
        },
        //pvduy thêm sự kiện load data
        loadData: e => {
          this.loadData(e);
        },
        //tvloi : bắt event chọn từ combo
        selected: e => {
          this.selected(e);
        },
        //tvloi : bắt event khi thay đổi giá trị (input) từ combo
        input: e => {
          this.onChange(e);
        },
        change: e => {
          this.change(e);
        }
      };
    }
  },

  watch: {
    listButtonView(newVal, oldVal){
      const me = this;

      me.listButton = newVal;
    }
  },

  created() {
    const me = this;
    
    me.listButton = me.listButtonView;
  },

  methods: {
    /*
     * pvduy 18/03/2021
     * thêm đoạn check xem control có command sửa hay không mới cho phép sửa
     */
    dblclick(e) {
      const me = this;
      var isHasButtonEdit = null;
      for (var i = 0; i < me.listButton.length; i++) {
        if (me.listButton[i].command == "edit") {
          isHasButtonEdit = true;
        }
      }
      if (isHasButtonEdit != null && isHasButtonEdit) {
        me.listButton = me.listButtonEdit;
        me.isAcceptEdit = true;
        me.$refs.msControlField.$el.querySelector("input, textarea").focus();
      }
    },

    /**
     * @author TVLoi 06.07.2021 _ Bắt thêm eventSelected cho những trường hợp chọn từ combo
     */
    selected(e) {
      const me = this;
      if (e.newData) {
        me.controlField.selectedItem = e.newData;
      } else {
        me.controlField.selectedItem = null;
      }
      me.$emit("selected", e);
    },

    /**
     * @author tlminh
     */

    change(e) {
      const me = this;
      if (typeof e == "boolean") {
        e = !e;
        me.controlField.value = e;
      }
      me.$emit("change", e);
    },

    /**
     * @author TVLoi 06.07.2021 _ Bắt thêm eventSelected cho những trường hợp chọn từ combo
     */
    onChange(e) {
      const me = this;
      if (!e) {
        me.controlField.value = null;
      }
    },

    /*
     * pvduy thêm sự kiện load data
     */
    loadData(e) {
      const me = this;
      me.$emit("loadData", e);
    },

    focusOut(e) {
      const me = this;
      me.listButton = me.listButtonView;
      me.isAcceptEdit = false;
    },

    fieldActionClick(command, event) {
      const me = this;
      switch (command) {
        case "edit":
          me.$nextTick(() => {
            me.$emit(
              "fieldActionClick",
              command,
              me.fieldName,
              me.controlField.value,
              me
            );
          });
          break;
        case "cancelEditField":
          me.listButton = me.listButtonView;
          me.isAcceptEdit = false;
          me.$nextTick(() => {
            me.$emit(
              "fieldActionClick",
              command,
              me.fieldName,
              me.controlField.value,
              event
            );
          });
          break;
        case "copy":
          me.copyText();
          break;
        case "save":
          me.$nextTick(() => {
            me.$emit(
              "fieldActionClick",
              command,
              me.fieldName,
              me.controlField.value,
              event,
              me.controlField.selectedItem,
              function() {
                me.isAcceptEdit = false;
                me.listButton = me.listButtonView;
              }
            );
          });
          break;
      }
    },

    //Lấy lại control editor
    //Created by LTDAT (17.06.2020)
    getEditorType(controlField) {
      const me = this;
      switch (controlField.type) {
        case me.$ms.enum.ColumnType.Combobox:
          return "msCombobox";
        case me.$ms.enum.ColumnType.Number:
          return "msNumber";
        case me.$ms.enum.ColumnType.Checkbox:
          return "msCheckbox";
        case me.$ms.enum.ColumnType.Datepicker:
          return "msDatepicker";
        case me.$ms.enum.ColumnType.Dropdown:
          return "msDropdown";
        case me.$ms.enum.ColumnType.Template:
          return controlField.template;
        case me.$ms.enum.ColumnType.TextArea:
          return "MsTextarea";
        default:
          return "msInput";
      }
    },

    /*
     *  thực hiện copy text
     *  pvduy 18/03/2021
     */
    copyText() {
      const me = this;
      var copyText = me.$refs.msControlField.$refs.input;
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      document.execCommand("copy");
      me.$toast.success(me.$t("i18nBaseForm.Message.CopySuccess"));
    },

    /**
     * Thực hiện khi click
     * @author vvkiet - 26.08.2021
     */
    fieldActionClickCustom() {
      const me = this;

      me.$emit("fieldActionClickCustom");
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msControlField.scss";
</style>