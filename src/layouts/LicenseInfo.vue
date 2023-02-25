<!-- =========================================================================================
	Màn hình popup thong tin license
	Created by: nmsinh
========================================================================================== -->
<template>
  <ms-popup
    class="detail-popup"
    :width="450"
    :show-help-icon="false"
    @close="close"
    @shortkeyAction="shortkeyAction"
  >
    <template slot="header">
      <img
        src="@/assets/images/pages/bg_TaiNguyen.svg"
        class="im-logo-info"
      >
    </template>
    <template slot="content">
      <div class="row gr-info">
        <div class="flex gr-content">
          <label class="lb-title-info">{{ $t("i18nMain.LeftMenu.license.licenseInfo") }}</label>
          <div class="form-group flex-row">
            <label class="lb-info">{{ $t("i18nMain.LeftMenu.license.packageName") }}</label>
            <span class="sp-info"> {{ packageName }}</span>
          </div>
          <div class="form-group flex-row">
            <label class="lb-info">{{ $t("i18nMain.LeftMenu.license.startDate") }}</label>
            <span class="sp-info"> {{ startDate }}</span>
          </div>
          <div class="form-group flex-row">
            <label class="lb-info">{{ $t("i18nMain.LeftMenu.license.endDate") }}</label>
            <span class="sp-info"> {{ endDate }}</span>
          </div>
          <div
            v-show="licenseType > 0"
            class="form-group flex-row"
          >
            <label class="lb-info">{{ $t("i18nMain.LeftMenu.license.numAccount") }}</label>
            <span class="sp-info"> {{ numAccount }}</span>
          </div>
        </div>
      </div>
    </template>
    <template slot="footer">
      <div class="flex" />
      <div class="flex-rtl">
        <ms-button
          type="primary"
          :text="buyLicense"
          class="detail-button-primary"
          @click="buyNow()"
        />
      </div>
      <div class="flex" />
    </template>
  </ms-popup>
</template>
<script>
import BaseDetailPopup from "@/views/base/BaseDetailPopup";
import { mapState, mapActions, mapGetters } from "vuex";
import MSJson from '@/commons/json';
import messageBox from '@/commons/messageBox';

export default {
  components: {},
  extends: BaseDetailPopup,
  data() {
    let me = this;
    return {
        packageName: '',
        startDate: '',
        endDate: '',
        numAccount: null,
        licenseType: 0,
        buyLicense: this.$t("i18nMain.LeftMenu.license.activeLicense")
    };
  },
  computed: {

  },
  watch: {},
  created() {
    let me = this;
  },
  methods: {

    add(param) {
      const me = this;
      me.$nextTick(()=>{
        if(param.data && param.data.licenseInfo){
          var license =  param.data.licenseInfo;
          me.licenseType = license.LicenseType;
          if( me.licenseType == 0){
            me.packageName = me.$t("i18nMain.LeftMenu.license.trial");
          }else if( me.licenseType == 0){
            me.packageName = "Test";
          }else {
            me.packageName = license.PackageName;
          }
          me.startDate = license.StartDate;
          me.endDate = license.EndDate;
          me.numAccount = license.Account;
        }
      })
    },
    buyNow(){
      window.open(window._external.misaStore.linkBuy, '_blank').focus();
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep.btn {
    min-height: 35px;
    align-items: center;
    border: none;
    box-shadow: none;
    position: relative;
    overflow: hidden;
    padding: 0;
    border-radius: 17px;
    white-space: nowrap;
}
::v-deep.flex-rtl {
    display: flex;
    flex-direction: rtl;
    direction: rtl;
    justify-content: center;
}
.gr-info{
  border: 1px solid #e0e0e0;
  background: #f6f6f6;
  border-radius: 5px;
}
.lb-info{
  width: 150px;
}
.gr-content{
  padding: 20px;
}
.lb-title-info{
  font-size: 16px;
    font-weight: 600;
    padding-bottom: 10px;
    display: block;
}
.sp-info{
    padding: 8px 8px 0 0;
    font-weight: 600;
}
::v-deep.form-group:not(.top) {
    margin-bottom: 5px;
}
::v-deep.popup-footer {
    padding: 12px 24px;
    border-top: none;
}
.im-logo-info {
  display: flex;
  padding-left: 120px;
}
</style>


