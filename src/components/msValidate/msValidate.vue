<template>
  <div class="w-full flex flex-column">
    <slot />
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
export default {
  name: "MsValidate",
  data() {
    return {
      listInput: [],
      isWarning: false,
    };
  },
  computed: {
    ...mapGetters(ModuleContext, ["OptionsData"]),  
  },
  mounted() {
    const me = this;
    me.listInput = me.getListInput();
    // me.isWarning = me.checkIsShowWarningMessage();
    if (me.isWarning) {
      me.listInput.forEach((item) => {
        item.$on("selected", me.updateUserAction);
        item.$on("change", me.updateUserAction);
      });
    }
  },
  beforeDestroy() {
    const me = this;
    // me.isWarning = me.checkIsShowWarningMessage();
    if (me.isWarning) {
      me.listInput.forEach((item) => {
        item.$off("selected", me.updateUserAction);
        item.$off("change", me.updateUserAction);
      });
    }
  },
  methods: {
    getListInput() {
      const me = this;
      let editors = me.$el.querySelectorAll(".ms-editor");
      if (editors && editors.length > 0) {
        let vueEditors = [];
        editors.forEach((item) => {
          if (item.getVueInstance && typeof item.getVueInstance == "function") {
            let vueObj = item.getVueInstance();
            //bỏ qua control editor trên grid
            if (vueObj.$cell) {
              let offset = item.getClientRects();
              if (
                (!offset || offset.length == 0) &&
                !vueObj.$cell.errorProvider.isValid
              ) {
                return;
              }
            }

            vueEditors.push(vueObj);
          }
        });
        return vueEditors;
      }
      return [];
    },
    checkIsShowWarningMessage() {
      const me = this;
      if (me.OptionsData && me.OptionsData.length > 0) {
        let dataCheck = me.OptionsData.filter(function (i) {
          return i.OptionKey === "ChangedDataIsNotSaved" && i.IsUse;
        });
        if (dataCheck && dataCheck.length > 0) {
          return true;
        }
      }
      return false;
    },
    updateUserAction() {
      const me = this;
      me.$emit("userAction");
    },
    /**
     * Hàm duyệt qua các control input gọi hàm validate của từng control rồi push vào trong listError;
     * Created by LTDAT(22.06.2020)
     */
    validate(force) {
      const me = this;
      me.listError = [];
      me.listInput = me.getListInput();
      me.listInput.forEach((item) => {
        if (
          item.validate &&
          typeof item.validate == "function" &&
          !item.disabled
        ) {
          let validateProvider = item.errorProvider || {};
          if (item.$cell && !validateProvider.isValid) {
            validateProvider = item.$cell.errorProvider;
          }
          if (!validateProvider.isValid || force) {
            validateProvider = item.validate(item);
          }
          if (Array.isArray(validateProvider)) {
            validateProvider.forEach((valid) => {
              me.listError.push(valid);
            });
          } else if (validateProvider && validateProvider.isValid) {
            me.listError.push(validateProvider);
          }
        }
      });
      if (me.listError.length > 0) {
        me.$nextTick(() => {
          me.focusFirstError();
        });
        return false;
      }
      return true;
    },
    /**
     * Hàm dùng để focus vào ô lỗi đầu tiên
     * Created by LTDAT(22.06.2020)
     *  */
    focusFirstError() {
      const me = this;
      let listError = me.getListError();
      if (listError[0].gridIns) {
        listError[0].gridIns.cellSelected(listError[0].element);
      } else if (typeof listError[0].element.focusEditor == "function") {
        listError[0].element.cellSelected(listError[0].element);
      } else if (typeof listError[0].element.focus == "function") {
        listError[0].element.focus();
      }
    },
    /**
     * Lấy ra list control bị lỗi
     * Created by LTDAT(22.06.2020)
     */
    getListError() {
      const me = this;
      return me.listError;
    },
    /**
     * Xóa toàn bộ trạng thái validate về ban đầu
     * created by LTDAT(22.06.2020)
     */
    reset() {
      const me = this;
      me.$nextTick(() => {
        me.listInput.forEach((item) => {
          item.errorProvider = {};
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.w-full {
  height: 100%;
  width: 100%;
}
</style>