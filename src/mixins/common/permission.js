import messageBox from '@/commons/messageBox';
import { mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
import commonFn from "@/commons/commonFunction";

export const permission = {
  data() {
    return {
      /**
       * mã phân hệ để kiểm tra phân quyền
       */
      subSystemCode: null,
    }
  },
  computed: {
    ...mapGetters({
      _permissionData: ModuleContext + "/Permission"
    }),
  },

  methods: {
    /**
     * Kiểm tra action command có quyền thực hiện không
     * Dùng để kiểm tra khi click vào các nút trên form
     */
    checkActionPermission(command, sub) {
      const me = this;
      // var user = commonFn.getLocalStorage("User");
      // if(user){
      //   user = JSON.parse(user);
      //   if(user.IsAdmin){
      //     return true;
      //   }
      // }
      // if (!sub) {
      //   sub = me.subSystemCode;
      // }
      //  // bỏ qua check quyền
      // if(sub && sub === "PASS"){
      //   return true;
      // }
      // let permissions = me._permissionData[sub];
      // if (Array.isArray(permissions)) {
      //   var f = permissions.find(i => i.code.toLowerCase() === command.toLowerCase());
      //   if (f && f.selected == true) {
      //     return true;
      //   }
      // }
      // return false;

      //Tạm thời chưa check quyền
      return true;
    },

    /**
     * Kiểm tra quyền có cảnh báo
     */
    checkActionPermissionAlert(command, sub) {

      const res = this.checkActionPermission(command, sub);

      if (!res) {
        messageBox.showError(this.$t("i18nBaseForm.Validate.NotPermission"));
      }

      return res;
    },

   /**
     * Kiểm tra list action command có quyền thực hiện không
     * Dùng để kiểm tra khi click vào các nút trên form
     */
    checkListActionPermission(listAction,subSystemCode) {
      const me = this;
      var i=0,j=0;
      let arrayAction=listAction.toString().split(",")

      if (subSystemCode) {
        let permissions = me._permissionData[subSystemCode];
        if (permissions)
        {
          for (i = 0; i < arrayAction.length; i++)
          {
            for (j = 0; j < permissions.length; j++)
                {
                  if (permissions[j].code==arrayAction[i] && permissions[j].selected==true) {
                    return true
                  }
                }
          }
        }
      }
      return false;
    },
  }
};
