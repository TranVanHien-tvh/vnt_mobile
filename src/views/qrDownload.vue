<template>
  <ms-popup
    :active.sync="active"
    class="detail-popup qr-popup full-detail-form"
    :full-main-view="false"
    :fullScreen="false"
    :show-close-icon="true"
    :show-modal="true"
    :width="300"
    :flex="true"
    :show-footer="false"
    :loading="loading"
    @close="close"
  >
    <!-- Phần header title các kiểu -->
    <template slot="header"> </template>
    <!-- Phần content chính -->
    <template slot="content">
      <div class="qr-download-container">
        <div class="close-icon-container"></div>
        <div class="qr-download-header">
          Chức năng hiện chưa hỗ trợ, bạn vui lòng tải ứng dụng để trải nghiệm
          tính năng này cũng như được hỗ trợ kịp thời.
        </div>
        <div class="qr-download-QR">
          <img
            src="../assets/images/qrPopup/QRImage.svg"
            alt="QR-code"
            class="img-fluid"
          />
        </div>
        <div class="qr-download-highline">Quét QR hoặc tải ứng dụng tại</div>
        <div class="row qr-download-container-btn">
          <div class="col qr-download-btn">
            <img
              src="../assets/images/qrPopup/AppleStore.png"
              alt="Apple Store"
              class="img-fluid"
              @click="handleApplestore(linkToAppstore)"
            />
          </div>
          <div class="col qr-download-btn">
            <img
              src="../assets/images/qrPopup/CHPlay.png"
              alt="CH Play"
              class="img-fluid"
              @click="handleCHplay(linkToCHplay)"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Phần footer -->
    <template slot="footer" class="footer-custom"> </template>
  </ms-popup>
</template>
<script>
import BaseDetailPopup from "@/views/base/BaseDetailPopup";
export default {
  extends: BaseDetailPopup,
  data() {
    return {
      //lay QR va link app tai public/cfg
      qrImage: window._qrcode.imageQR,
      linkToAppstore: window._qrcode.appstoreQR,
      linkToCHplay: window._qrcode.chplayQR,
      data: {},
      active: false,
    };
  },
  mounted() {},
  methods: {
    handleApplestore: function (link) {
      window.open(link, "_blank");
    },
    handleCHplay: function (link) {
      window.open(link, "_blank");
    },
    async loadData(action, param) {},
  },
};
</script>


<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.qr-download-container {
  background-color: #fff;
  width: 300px;
  max-width: 100%;
  height: fit-content;
  border-radius: 9px;
  text-align: center;
  padding: 0 10px;
  .qr-download-header {
    margin: 0 auto;
    margin-top: 32px;
    text-align: center;
    max-width: 100%;
    font-size: 14px;
  }
  .qr-download-QR {
    margin: 20px auto;
    width: 100px;
    height: 100px;
  }
  .qr-download-highline {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: bold;
    line-height: 32px;
  }
  .qr-download-container-btn {
    margin: 0 auto;
    margin-bottom: 28px;
    max-width: 100%;
    height: fit-content;
    .qr-download-btn {
      margin: 4px 4px;
      border-radius: 51px;
      padding: 0;
      > img:hover {
        cursor: pointer;
      }
    }
  }
}
</style>