<!-- =========================================================================================
	Thỏa thuận sử dụng
========================================================================================== -->

<template>
  <ms-popup
    :active.sync="isShowAgreement"
    class="detail-popup emulation-slide-detail"
    classListContent="flex"
    :flex="true"
    :loading="loading"
    :width="800"
    :height="600"
    :show-modal="true"
    :is-right="false"
    :showCloseIcon="false"
    :showFooter="!isShowFormConfirm"
    @close="close"
    @shortkeyAction="shortkeyAction"
  >
    <!-- Header -->
    <template slot="header">
      <div class="title">
        <div class="d-flex toolbar-step">
          <!-- Bước 1 -->
          <div
            class="step"
            :class="{ active: !isShowFormConfirm, finish: isShowFormConfirm }"
          >
            Đọc thỏa thuận sử dụng phần mềm
          </div>
          <div
            class="line flex"
            :class="{ active: !isShowFormConfirm, finish: isShowFormConfirm }"
          />
          <!-- Bước 2 -->
          <div
            class="step step2"
            :class="{ inactive: !isShowFormConfirm, active: isShowFormConfirm }"
          >
            Điền thông tin người xác nhận thỏa thuận
          </div>
        </div>
      </div>
    </template>

    <!-- Content -->
    <template slot="content">
      <!-- Step1 -->
      <div v-if="!isShowFormConfirm" class="agreement-file flex">
        <iframe
          ref="iframeAgreement"
          :src="srcIframeAgreement"
          frameborder="0"
          style="width: 100%; height: 100%"
          @load="checkLoaded"
        ></iframe>
      </div>
      <!-- Step2 -->
      <ms-validate v-else ref="validateObserver">
        <div class="flex-row agreement-step2">
          <!-- Ảnh thỏa thuận -->
          <div class="agreement-img"></div>

          <!-- Nội dung nhập xác nhận -->
          <div class="agreement-form flex-column flex">
            <div class="agreement-form-top flex-row">
              <div class="icon-form-top"></div>
              <span
                >Thông tin này để xác nhận thỏa thuận sử dụng hợp đồng với
                MISA.</span
              >
            </div>
            <div class="agreement-form-content">
              <div class="form-group slide-detail">
                <label class="form-group-label d-flex">
                  Họ tên
                  <span class="required">*</span>
                </label>
                <div class="flex">
                  <ms-input
                    v-model="inforConfirmAgreement.AccountObjectName"
                    :max-length="255"
                    rules="required|full_name"
                    placeholder="Nhập họ tên"
                  />
                </div>
              </div>
              <div class="form-group slide-detail">
                <label class="form-group-label d-flex">
                  Chức vụ
                  <span class="required">*</span>
                </label>
                <div class="flex">
                  <ms-input
                    v-model="inforConfirmAgreement.ContactTitle"
                    :max-length="255"
                    rules="required"
                    placeholder="Nhập chức vụ"
                  />
                </div>
              </div>
              <div class="form-group slide-detail">
                <label class="form-group-label d-flex">
                  Số điện thoại
                  <span class="required">*</span>
                </label>
                <div class="flex">
                  <ms-input
                    v-model="inforConfirmAgreement.ContactMobile"
                    :max-length="255"
                    rules="phone_agreement"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
              <div class="form-group slide-detail">
                <label class="form-group-label d-flex">
                  Email
                  <span class="required">*</span>
                </label>
                <div class="flex">
                  <ms-input
                    v-model="inforConfirmAgreement.ContactEmail"
                    :max-length="255"
                    rules="required|email"
                    placeholder="Nhập email"
                  />
                </div>
              </div>
            </div>
            <div class="agreement-form-bottom">
              <div class="flex-rtl">
                <ms-button
                  type="primary"
                  text="Xác nhận"
                  @click="confirmAgreement"
                />
              </div>
            </div>
          </div>
        </div>
      </ms-validate>
    </template>

    <!-- Footer -->
    <template slot="footer">
      <div class="flex-row agreement-footer">
        <!-- Hủy -->
        <ms-button
          type="secondary"
          :text="$t('i18nCommon.command.cancel')"
          class="mr-2"
          @click="cancel"
        />
        <!-- Tôi đã đọc và ... -->
        <ms-button
          type="primary"
          text="Tôi đã đọc và đồng ý với thỏa thuận sử dụng"
          class="mr-2"
          @click="nextStep"
        />
      </div>
    </template>
  </ms-popup>
</template>

<script>
import BaseDetailPopup from "@/views/base/BaseDetailPopup";
import msValidate from "@/components/msValidate/msValidate.vue";
import AgreementLicenseAPI from "@/apis/agreementlicense/agreementLicenseAPI.js";

export default {
  name: "AgreementLicense",
  components: {
    msValidate,
  },
  extends: BaseDetailPopup,
  created() {
    //Kiểm tra thỏa thuận sử dụng
    AgreementLicenseAPI.checkAgreementApp(window._appConfig.appCode)
      .then((res) => {
        this.isShowAgreement = !res.ConfirmAgreement;
        //Nếu chưa xác nhận -> build service để preview file thỏa thuận
        if (!res.ConfirmAgreement) {
          const param = new URLSearchParams({
            name: res.FileName,
            downloadName: res.DownloadName,
          });
          this.srcIframeAgreement =
            AgreementLicenseAPI.getAPIUrl() + `/preview?${param.toString()}`;
        }
      })
      .catch((error) => {
        //Lỗi thì không hiện popup thỏa thuận
        this.isShowAgreement = false;
      });
  },
  data() {
    return {
      isShowAgreement: false, //Trạng thái ẩn hiện popup
      isShowFormConfirm: false, //Trạng thái hiển thị form xác nhận (step2)
      srcIframeAgreement: null,
      //Thông tin xác nhận thỏa thuận
      inforConfirmAgreement: {
        AccountObjectName: "", //họ têm
        ContactTitle: "", //chức vụ
        ContactMobile: "", //sđt
        ContactEmail: "", //email
        Language: "vi",
        ApplicationCode: window._appConfig.appCode,
      },
    };
  },

  methods: {
    /**
     * Chuyển sang bước 2 (Điền thông tin xác nhận)
     */
    nextStep() {
      this.isShowFormConfirm = true;
    },

    /**
     * Hủy (tạm đóng popup)
     */
    cancel() {
      this.isShowAgreement = false;
    },

    /**
     * Kiểm tra xem file đã được load lên chưa
     * Cho hiện mask loading khi đang tải tệp lên
     */
    checkLoaded() {
      const me = this;
      let src = me.$refs.iframeAgreement.src;
      me.loading = src ? false : true;
    },

    /**
     * Xác nhận thỏa thuận
     * NTTHANH1
     */
    confirmAgreement() {
      const me = this;

      //validate
      if (me.$refs.validateObserver.validate()) {
        me.loading = true;

        //custom dữ liệu trc khi gửi lên
        me.inforConfirmAgreement.AgreementContactName =
          me.inforConfirmAgreement.AccountObjectName;
        //trim dữ liệu
        for (var key in me.inforConfirmAgreement) {
          if (me.inforConfirmAgreement.hasOwnProperty(key)) {
            me.inforConfirmAgreement[key] = me.inforConfirmAgreement[
              key
            ].trim();
          }
        }

        //Gọi api lưu
        AgreementLicenseAPI.saveAgreementLicense(me.inforConfirmAgreement)
          .then((res) => {
            if (res && res.Success) {
              me.$toast.success("Xác nhận thỏa thuận thành công");
            } else {
              me.$toast.error("Xác nhận thỏa thuận không thành công");
            }
          })
          .catch((error) => {
            me.$toast.error("Xác nhận thỏa thuận không thành công");
          })
          .finally(() => {
            this.isShowAgreement = false;
            me.loading = false;
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

::v-deep .title {
  .toolbar-step {
    height: 20px;
    align-items: center;
    font-size: 14px;
    // margin-left: 100px;
    .line {
      width: 118px;
      border-top: 1px solid #e0e1ef;
      height: 1px;
      border-style: dashed;
      border-bottom: none;
      border-left: none;
      border-right: none;
      margin: 0 13px 0;
      &.active {
        border-color: #ff5722;
      }
      &.inactive {
        border-color: #1f1f23;
      }
      &.finish {
        border-color: #2979ff;
      }
    }
    .step {
      cursor: pointer;
      &.active {
        font-weight: 600;
        padding-left: 24px;
        background-position-x: 0px;
        color: #ff5722;
        background: url("~@/assets/images/icons/ic_step_active.svg") no-repeat;
        margin-top: 2px;
      }
      &.inactive {
        font-weight: lighter;
        padding-left: 24px;
        background-position-x: 0px;
        color: #1f1f23;
        background: url("~@/assets/images/icons/ic_step_inactive.svg") no-repeat;
      }
      &.finish {
        padding-left: 24px;
        background-position-x: 0px;
        font-weight: 600;
        color: #2979ff;
        background: url("~@/assets/images/icons/ic_step_finish.svg") no-repeat;
        margin-top: 2px;
      }
    }
  }
}

.agreement-step2 {
  margin: 0 20px;
}

.agreement-form {
  margin-left: 60px;
}

.agreement-img {
  margin: auto;
  background: url($ms-image-agreement-license) no-repeat;
  width: 323px;
  height: 280px;
}

.agreement-form-top {
  align-items: center;
  margin-bottom: 14px;
}

.icon-form-top {
  background: transparent url($ms-image-ic_infor_agreement) no-repeat 0px 0px;
  width: 26px;
  height: 18px;
  margin-right: 2px;
  cursor: pointer;
}

.agreement-file {
  border: 1px solid #dddddd;
  border-radius: 4px;
}

.agreement-form-bottom button {
    width: 100% !important;
}

::v-deep .form-group.slide-detail label.form-group-label {
  margin-bottom: 4px;
}

::v-deep input::placeholder {
  margin: 0;
  padding: 0;
}

::v-deep .popup-content {
  padding: 20px 22px 22px !important;
}

::v-deep .popup-header {
  padding: 24px 40px 6px 40px !important;
}

.content-step1 {
  height: calc(100% - 1px);
  padding: 24px 0;
  background-color: white;
}

.content-step2 {
  height: 100%;
  background-color: white;
  margin-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.title-custom {
  margin-left: 6px;
  color: #0d1a3e;
  font-size: 20px;
  font-weight: bold;
}

.agreement-footer {
    justify-content: flex-end;
}
</style>
