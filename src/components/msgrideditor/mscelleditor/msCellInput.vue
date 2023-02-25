<template>
  <div class="ms-cell-editor text">
    <div
      v-show="!isSelected || readOnly"
      :class="{ 'edit-disabled': readOnly, 'ms-editor-text': editable }"
    >
      <div
        class="editor-display"
        :class="[
          col.isShowText ? `text-${col.align || 'left'}` : '',
          col.cssClass,
        ]"
      >
        <span>{{
          dataRow[col.dataField]
            | formatData({ formatType: col.formatType, enumName: col.enum })
        }}</span>
      </div>

      <div
        v-show="errorProvider.isValid && !isShowText && !readOnly"
        v-tooltip="{ content: errorProvider.message, classes: 'error' }"
        class="icon-input float-right"
      >
        <div class="icon24 error error-icon mi-icon-error" />
      </div>
    </div>
    <div
      v-show="isSelected && !readOnly && editable"
      ref="editor"
      :class="{ error: errorProvider.isValid }"
      class="ms-editor"
    />
  </div>
</template>
<script>
import msBaseComponent from "@/components/msbase/msBaseComponent.vue";
import msInput from "@/components/msinput/msInput.vue";
import Vue from "vue";
export default {
  name: "MsCellInput",
  extends: msBaseComponent,
  props: {
    col: {},
    dataRow: {},
    rowIndex: {
      default: 0,
      type: Number,
    },
    colIndex: {
      default: 0,
      type: Number,
    },
    //Thuộc tính để cấu hình cho phép sửa trên grid hay không
    editable: {
      default: true,
      type: Boolean,
    },
    rowSelected: {
      default: null,
    },
    // errorProvider:{
    //   default: null
    // }
    readOnly: {
      default: false,
      type: Boolean,
    },
    //có cho phép show text validate bên dưới cell k
    isShowText: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isSelected: false,
      errorProvider: {},
    };
  },
  computed: {
    // readOnly() {
    //   const me = this;
    //   if (!me.editable) {
    //     return true;
    //   }
    //   if (me.col && typeof me.col.readOnly == "function") {
    //     return me.col.readOnly(me.dataRow);
    //   } else {
    //     return me.col.readOnly;
    //   }
    // }
    // checkDataEmpty() {
    // 	const me = this;
    // 	return me.$ms.commonFn.objectHasDataEmpty(me.dataRow, ['__vKeyValue']);
    // }
  },
  watch: {
    isSelected: {
      handler(newVal, oldVal) {
        const me = this;
        if (newVal == false) {
          if (me.col.__editor) {
            if (me.col.__editor.errorProvider) {
              me.col.__editor.errorProvider = {};
            }
          }
          //me.$nextTick(() => {
          //me.validateCell();
          //});
        } else {
          if (me.$el) {
            let content = me.$el.closest(".ms-content--table");
            if (content) {
              if (
                me.$el.getBoundingClientRect().right >=
                content.getBoundingClientRect().right
              ) {
                // content.scrollLeft += me.$el.getBoundingClientRect().x - 20;
              }
            }
          }
        }
      },
    },
    "col.rules": {
      handler(newVal, oldVal) {
        const me = this;
        if (!newVal) {
          me.$nextTick(() => {
            me.validateCell();
          });
        }
      },
    },
  },
  mounted() {
    const me = this;
    if (!me.dataRow.hasOwnProperty(me.col.dataField)) {
      me.$set(me.dataRow, me.col.dataField, undefined);
    }
    let watchName = "dataRow." + me.col.dataField;
    me.$watch(watchName, function (newVal, oldVal) {
      me.$nextTick(() => {
        me.validateCell();
      });
    });
  },
  methods: {
    //Hàm validate trên từng cell
    validateCell() {
      const me = this;
      // if (me.checkDataEmpty) {
      // 	return;
      // }
      if (!me.readOnly) {
        let col = me.col,
          rulesValidate = null,
          ret = false;
        if (col.__editor) {
          col.__editor.customMessage = null;
        }
        let rules = col.rules;
        if (col.rules && typeof col.rules == "function") {
          rules = col.rules(me.dataRow);
        }
        if (rules) {
          let listRules = rules.split("|");
          for (let i = 0; i < listRules.length; i++) {
            let data = me.dataRow[me.initField] || me.dataRow[col.dataField];
            let editor = {};
            let dataRowCol =
              col.__editor && col.__editor.$cell
                ? col.__editor.$cell.dataRow
                : {};
            if (me.dataRow == dataRowCol) {
              editor = col.__editor;
            } else {
              editor = { $cell: { dataRow: me.dataRow } };
            }
            ret = !me.validateRule(listRules[i], data, editor);
            if (ret) {
              rulesValidate = listRules[i];
              break;
            }
          }
          if (ret) {
            if (col.__editor && col.__editor.customMessage) {
              me.$set(me.errorProvider, "message", col.__editor.customMessage);
            } else {
              if (me.$t("i18nValidate").messages[rulesValidate]) {
                me.$set(
                  me.errorProvider,
                  "message",
                  me.$t("i18nValidate").messages[rulesValidate](col.title)
                );
              }
            }
            me.$set(me.errorProvider, "isValid", true);
            me.$set(me.errorProvider, "rules", rulesValidate);
            me.$set(me.errorProvider, "element", me);
            me.col.__editor.errorProvider = me.errorProvider;
            me.col.__editor.$set(
              me.col.__editor.errorProvider,
              "element",
              me.col.__editor
            );
          } else {
            me.errorProvider = {};
          }
        } else {
          me.errorProvider = {};
        }
      }
    },
    //Khởi tạo editor
    //Created by LTDAT(17.06.2020)
    createdEditor() {
      const me = this;

      let editorControl = me.getEditorControl(),
        col = me.col;
      if (editorControl.props) {
        editorControl.props.isShowText = false; // không show text error như ở form control mà ẩn đi và show tooltip
      }
      let editorExtend = Vue.extend(editorControl),
        editorProperty = me.getEditorProperty();
      if (editorProperty) {
        editorProperty.propsData.isShowText = false;
        editorProperty.propsData.dataRow = me.dataRow;
        editorProperty.propsData.col = me.col;
      } else {
        editorProperty = {
          propsData: {
            isShowText: false,
            rules: col.rules,
            dataRow: me.dataRow,
            col: col,
          },
        };
      }
      let instance = new editorExtend(editorProperty);
      instance.vm = instance.$mount();
      instance.$cell = me;
      // ĐVThi gắn giá trị để phân biệt combox dùng trên grid
      instance.$editorClass = "grid-editor";
      instance.errorProvider = me.errorProvider;
      col.__editor = instance;
      me.addHandler(instance);
      return instance;
    },
    //Điều hướng đến đúng cell cần edit
    directEventInput() {
      let me = this,
        col = me.col,
        editor = me.col.__editor;
      if (editor) {
        if (editor.validateCell) {
          editor.validateCell();
        }
        editor.$cell.inputHandler(...arguments);
      }
    },
    //Điều hướng đến đúng cell cần edit
    directEventChange() {
      let me = this,
        col = me.col,
        editor = me.col.__editor;
      if (editor) {
        editor.$cell.changeHandler(...arguments);
      }
    },
    //Điều hướng cho sự kiện change
    changeHandler(value, selectedItem, oldSelectedItem) {
      const me = this;

      let metaData = {
        dataRow: me.dataRow,
        column: me.col,
        newValue: value,
        oldValue: me.dataRow[me.col.dataField],
        cell: me,
        selectedItem: selectedItem,
        oldSelectedItem: oldSelectedItem,
      };

      me.$emit("change", metaData);
    },
    //Hàm xử lý sự kiện editor input
    inputHandler(value) {
      const me = this;
      let dataRow = me.dataRow,
        col = me.col;
      me.$set(dataRow, col.dataField, value);
      // dataRow[col.dataField] = value;
    },
    //Xử lý sự kiện từ editor raise ra ngoài
    addHandler(editor) {
      const me = this;
      editor.$on("input", me.directEventInput);
      editor.$on("change", me.directEventChange);
      me.addCustomHandler(editor);
    },
    //Các loại control khác có event có thể Overide hàm này
    //Created by LTDAT(18.06.2020)
    addCustomHandler(editor) {},
    //Lấy loại control
    //Created by LTDAT(17.06.2020)
    getEditorControl() {
      return msInput;
    },
    //Lấy thuộc tính truyền vào trong editor
    //Created by LTDAT(17.06.2020)
    getEditorProperty() {
      const me = this;
      let col = me.col;
      if (me.customEditProperty && typeof me.customEditProperty == "function") {
        me.customEditProperty(col.editorProperty);
      }
      return col.editorProperty;
    },
    //Sự kiện click vào cell editor
    cellSelected(thisEditor) {
      const me = this;
      if (me.col.editable === false) {
        return;
      }
      if (me.readOnly == true) {
        return;
      }

      let editor = me.col.__editor;
      me.isSelected = true;
      if (!editor && me.$refs.editor) {
        editor = me.createdEditor();
      }
      if (editor) {
        editor.$cell = me;
        me.$nextTick(() => {
          me.beforeEdit(editor);

          //TDNGHIA 13/4/2022: Cần xem thì bảo TDNGHIA,DHPHI về đoạn combo đánh giá ở list tập thể cá nhân thẩm định theo đơn vị
          if (me.col && me.col.readOnlyOption) {
            if (me.dataRow[me.col.dataField]) {
              //TDNGHIA 13/4/2022: kiểm tra nếu đã append combo vào editor rồi thì thôi k append nữa
              let combo = me.$refs.editor.children.item(function (i) {
                return i.className == "ms-combobox ms-editor";
              });

              if (!combo) {
                me.$refs.editor.appendChild(editor.$el);
              }
            }
          } else {
            //TDNGHIA 13/4/2022: kiểm tra nếu đã append combo vào editor rồi thì thôi k append nữa
            let combo = me.$refs.editor.children.item(function (i) {
              return i.className == "ms-combobox ms-editor";
            });

            if (!combo) {
              me.$refs.editor.appendChild(editor.$el);
            }
          }

          me.focusEditor(thisEditor);
        });
      }
    },

    //Focus vào editor
    focusEditor(thisEditor) {
      const me = this;
      if (thisEditor) {
        let input = thisEditor.$el
          ? thisEditor.$el.querySelector("input,textarea")
          : null;
        // setTimeout(() => {
        if (input) {
          input.focus();
          input.select();
        }
      }
      // }, 100);
    },
    //Hàm xử lý trước khi edit reset lại các giá trị trong editor cũ
    //Created by LTDAT(17.06.2020)
    beforeEdit(editor) {
      const me = this;
      let dataRow = me.dataRow,
        col = me.col;
      if (editor) {
        me.customBeforeEdit();
        if (typeof editor.reset === "function") {
          editor.reset();
        }
        if (typeof editor.setValue === "function") {
          editor.setValue(dataRow[col.dataField]);
        }
        if (editor.applyValidate && typeof editor.applyValidate == "function") {
          me.$nextTick(() => {
            editor.applyValidate(me.errorProvider.message);
          });
        }
      }
      me.$emit("rowSelected", me.dataRow);
    },
    customBeforeEdit() {},
  },
};
</script>
<style lang="scss" scoped>
.editor-display {
  // padding: 6px 8px;
  //flex: 1;
  // width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mi-icon-error {
  margin-right: 8px;
}
</style>
