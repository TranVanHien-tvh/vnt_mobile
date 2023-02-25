<template>
  <div class="login-container" style="height: 100%">
    <ms-sync-loading :active-loading="loading" />

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="vnt-logo"></div>
    </nav>
    <div class="container login col-md-6">
      <div class="login-title">
        <p>Đăng nhập</p>
      </div>
      <ms-validate ref="validateObjServer">
        <div class="login-content">
          <div class="login-info">{{ $t("i18nLogin.label.userName") }}</div>
          <ms-input
            v-model="phone"
            :max-length="255"
            :placeholder="$t('i18nLogin.label.userNamePlaceholder')"
            rules="required|phone_agreement"
            :custom-warring="{
              rules: 'required',
              mes: 'Vui lòng nhập số điện thoại',
            }"
            type="number"
            name="Số điện thoại"
            :right-icon="''"
            :is-errorlogin="isErrorLogin"
          />
          <!-- <span class="warningErrorLogin-text" v-show="isErrorPhone">{{
            warningErrorLoginPhone
          }}</span> -->

          <div class="error-text" v-show="isErrorPhone">
            {{ warningErrorLoginPhone }}
          </div>
        </div>
        <div class="login-content">
          <div class="login-info">{{ $t("i18nLogin.label.password") }}</div>
          <ms-input
            ref="txtPassword"
            v-model="password"
            :max-length="255"
            :placeholder="$t('i18nLogin.label.passwordPlaceholder')"
            :type="txtPassword_Type"
            rules="required"
            :custom-warring="{
              rules: 'required',
              mes: 'Nhập mật khẩu',
            }"
            :is-errorlogin="isErrorLogin"
            :right-icon="txtPassword_rightIcon"
            @toggleContext="txtPassword_rightIcon_onClick"
          />
          <div class="error-text" v-show="isErrorPass">
            {{ warningErrorLoginPass }}
          </div>
        </div>
        <div v-if="errorUserNameOrPass" class="error-text">
          Bạn đã nhập sai mật khẩu hoặc tài khoản
        </div>
        <div class="login-content">
          <div class="forgot-password-container">
            <div class="forgot-password-content flex">
              <span>Đăng nhập bằng QR</span>
              <div class="forgot-password-text" @click="forgotPassword">Quên mật khẩu?</div>
            </div>
            <ms-button
              class="vnt-btn vnt-login-btn"
              type="four"
              :text="$t('i18nLogin.label.loginButton')"
              :processing="loading"
              @click="login()"
            />
            <ms-button
              class="vnt-btn fb-login"
              type="four"
              left-icon="fb-icon"
              :text="$t('Đăng nhập bằng Facebook')"
              :processing="loading"
              @click="facebookLogin()"
            />
            <ms-button
              class="vnt-btn gg-login"
              type="four"
              left-icon="gg-icon"
              :text="$t('Đăng nhập bằng Google')"
              :processing="loading"
              @click="googleLogin()"
            />
            <div class="register-content flex">
              <span>Bạn chưa có tài khoản?&nbsp;</span>
              <a href="/register">Đăng ký ngay</a>
            </div>
          </div>
        </div>
      </ms-validate>
    </div>
  </div>
</template>
<script>
// import component
import msValidate from "@/components/msValidate/msValidate.vue";
import popupUtil from "@/commons/popupUtil";
// import module
import { ModuleContext, ModuleAuthen } from "@/stores/module-const";
import MsSyncLoading from "@/components/mssyncloading/MsSyncLoading.vue";
import { validate } from "autonumeric";
import { flatten } from "@amcharts/amcharts4/.internal/core/utils/Iterator";
import { stringify } from "@amcharts/amcharts4/.internal/core/utils/Utils";

export default {
  components: {
    msValidate,
    MsSyncLoading,
  },

  data() {
    return {
      module: ModuleAuthen,
      loading: false,
      phone: "",
      password: "",
      errorUserNameOrPass: false,
      txtPassword_rightIcon: "show-password",
      txtPassword_Type: "password",
      warningErrorLoginPhone: "",
      warningErrorLoginPass: "",
      isErrorLogin: false,
      isErrorPhone: false,
      isErrorPass: false,
    };
  },

  watch: {
    phone(newvalue, oldvalue) {
      if (newvalue !== oldvalue) {
        this.isErrorLogin = false;
        this.isErrorPhone = false;
        this.isErrorPass = false;
      }
    },
    password(newvalue, oldvalue) {
      if (newvalue !== oldvalue) {
        this.isErrorLogin = false;
        this.isErrorPhone = false;
        this.isErrorPass = false;
      }
    },
  },

  methods: {
    /**
     * Hàm validate
     * Chạy qua hàm validate cho control và validate cho nghiệp vụ
     * @return trả về true/false
     * Created by LTDAT (22.06.2020)
     */
    validate() {
      const me = this;
      return me.validateComponents();
    },

    /**
     * Hàm validate các control input
     * Hàm này sử dụng component ms-validate
     * để bao ngoài vùng được validate
     * @Chú ý:ref của ms-validate phải là validateObserver
     */
    validateComponents() {
      const me = this;
      if (me.$refs.validateObserver) {
        return me.$refs.validateObserver.validate();
      }
      return true;
    },

    /**
     * Cập nhật lại trạng thái validate về ban đầu
     */
    resetValidate() {
      const me = this;

      if (me.$refs.validateObserver) {
        me.$refs.validateObserver.reset();
      }
    },
    /**
     * Đăng nhập
     */
    login() {
      const me = this;
      //ckeck validate
      let oRegex =
        /^(0|\+84)(\s|\.)?((2[0-9][0-9])|(3[2-9])|(5[689])|(7[06-9])|(8[1-9])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
      if (me.password == "" && me.phone == "") {
        me.isErrorLogin = true;
        me.isErrorPhone = true;
        me.warningErrorLoginPhone = "Vui lòng nhập số điện thoại";
        me.isErrorPass = true;
        me.warningErrorLoginPass = "Nhập mật khẩu";
      } else if (!oRegex.test(me.phone.trim())) {
        me.isErrorLogin = true;
        me.isErrorPhone = true;
        me.warningErrorLoginPhone =
          "Vui lòng nhập SĐT gồm 10 số (Ví dụ: 0981234567)";
      } else if (me.phone == "") {
        me.isErrorLogin = true;
        me.isErrorPhone = true;
        me.warningErrorLoginPhone = "Vui lòng nhập số điện thoại";
      } else if (me.password == "") {
        me.isErrorLogin = true;
        me.isErrorPass = true;
        me.warningErrorLoginPass = "Nhập mật khẩu";
      }
      //call API
      else {
        //Nếu không có lỗi từ client mới cho gọi lên server
        if (!me.isErrorLogin) {
          me.loading = true;
          me.$store
            .dispatch(`${ModuleAuthen}/login`, {
              phone: me.phone,
              password: me.password,
            })
            .then((res) => {
              // Nếu res không có lỗi đẩy vào activities
              if (!res.errors) {
                localStorage.setItem("currentUser", JSON.stringify(res.data));
                me.$router.push("/activities");
                //   // NMTUAN3 5/1/2022: Chỉ phục vụ cho dev, không được dùng trên site
                //   // if (process.env.NODE_ENV === "development") {
                //   //   let profile = this.$store.state.context.ConfigInfo.Config[
                //   //     "Profile"
                //   //   ];
                //   //   switch (profile){
                //   //     case 0:
                //   //       this.$router.push("/getting-started");
                //   //       break;
                //   //     case 1:
                //   //     case 3:
                //   //       this.$router.push("/employee");
                //   //       break;
                //   //     case 2:
                //   //       this.$router.push("/group-employee");
                //   //       break;
                //   //     default:
                //   //       break;
                //   //   }
                //   // }
                //   this.errorEmailOrPass = false;
                // } else {
                //   this.errorEmailOrPass = true;
              } // Nếu có lỗi, hiện cảnh báo
              else {
                this.isErrorLogin = true;
                if (res.errors.length == 1) {
                  if (
                    res.errors[0].message === "Mật khẩu không chính xác" ||
                    res.errors[0].message ===
                      "Số điện thoại chưa đăng nhập hệ thống"
                  ) {
                    this.isErrorPass = true;
                    this.warningErrorLoginPass =
                      "Bạn đã nhập sai mật khẩu hoặc tài khoản.";
                  }
                }
              }
            })
            .catch((err) => {
              console.log(err);
              throw new Error("Error text.");
            });
        }
      }
    },

    //#region Events
    /**
     * Sự kiện của show/disale password
     * DLHuy 11.01.2021
     */
    txtPassword_rightIcon_onClick(e) {
      const me = this;

      if (me.txtPassword_Type == "text") {
        me.txtPassword_Type = "password";
        me.txtPassword_rightIcon = "disabled-password";
      } else {
        me.txtPassword_Type = "text";
        me.txtPassword_rightIcon = "show-password";
      }
    },

    /**
     * Xử lý khi chọn đăng nhập bằng facebook
     * npcuong 12.05.2022
     */
    facebookLogin() {
      const me = this;
      // alert('Tính năng fb nâng cao, tải app pls');
      // me.$ms.msgBox.showInfo(me.$t("i18nCommon.FeaturesIsDeveloping"));
      me.showAppDownloadGuide("EmployeeProfileDetail");
    },

    /**
     * Xử lý khi chọn đăng nhập bằng Google
     */
    googleLogin() {
      const me = this;
      // alert("Tính năng gg nâng cao, tải app pls");
      // me.$ms.msgBox.showInfo(me.$t("i18nCommon.FeaturesIsDeveloping"));
      me.showAppDownloadGuide("DownloadAppGuide");
    },

    /**
     * Xử lý hiển thị popup
     */
    showAppDownloadGuide(path) {
      const me = this;
      let param = {
        data: null,
        mode: me.$ms.enum.FormState.Edit,
      };
      let pop = popupUtil._visible[path];

      if (pop) {
        pop.active = false;
      }
      //dùng showdetail để cập nhật luôn số lượng
      me.showDetail(path, me.$ms.enum.FormState.Edit, param);
    },

    /**
     * Hàm show các popup
     * @param name tên của component
     */
    showDetail(name, mode, data, option) {
      const me = this;
      popupUtil.show(me, name, data, option);
    },

    /**
     * chuyển sang màn quên mật khẩu
     */
    forgotPassword() {
      const me = this;
      me.$router.push({
        path: "/changepassword",
      });
    },
    //#endregion
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/views/login.scss";
</style>