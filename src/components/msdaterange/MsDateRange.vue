<!-- giá trị trả vè fromDate  và toDate-->
<template>
  <div class="ms-date-range">
    <div v-if="showDatePicker" class="flex-row">
      <ms-datepicker
        ref="fromDate"
        v-model="innerFromDate"
        :show-title="false"
        :title="$t('i18nCommon.FromDate')"
        rules="required"
        :disabled="isDisabled"
        @change="changeFromDate"
        class="flex"
      />
      <div class="separate" style="width: 14px"></div>

      <ms-datepicker
        ref="toDate"
        v-model="innerToDate"
        rules="required"
        :title="$t('i18nCommon.ToDate')"
        :show-title="false"
        :disabled="isDisabled"
        @change="changeToDate"
        class="flex"
      />
    </div>
  </div>
</template>

<script>
import MsBaseComponent from "@/components/msbase/msBaseComponent.vue";
import { MSEnum } from "@/commons/enumeration";

// import VeeValidate, { ValidationObserver } from 'vee-validate';
import DateRange from "./DateRange.js";
//   import { ValidationProvider } from 'vee-validate';
let Period = MSEnum.Period;
export default {
  name: "MsDateRange",
  // components: { ValidationObserver,ValidationProvider },
  extends: MsBaseComponent,
  props: {
    classPeriod: {
      default: "flex-1",
    },
    classDate: {
      // default: 'is-horizontal-item'
      default: "",
    },
    toDate: {
      type: [Date, String],
    },
    fromDate: {
      type: [Date, String],
    },
    showDatePicker: {
      type: Boolean,
      default: true,
    },
    /**
     * Validate khi blur
     * @author NDHUY 06.01.2021
     */
    validateOnBlur: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      innerFromDate: this.fromDate,
      innerToDate: this.toDate,
      selected: "",
    };
  },
  computed: {},
  watch: {
    fromDate: {
      immediate: true,
      handler(newVal, oldVal) {
        this.innerFromDate = newVal;
      },
    },
    toDate: {
      immediate: true,
      handler(newVal, oldVal) {
        this.innerToDate = newVal;
      },
    },
  },
  mounted() {},
  methods: {
    /**
     * Valid range date
     */
    validFromData(field) {
      // this.$refs.toDate.$refs.provider.setErrors(['this is a backend error']);
      let required = false;
      if (!this.innerFromDate) {
        this.$refs.fromDate.setError(
          this.$t("i18nValidate").messages.required(this.$refs.fromDate.title)
        );
        required = true;
      } else {
        this.$refs.fromDate.resetValidate();
      }
    },

    /**
     * Valid range date
     */
    validToData(field) {
      // this.$refs.toDate.$refs.provider.setErrors(['this is a backend error']);
      let required = false;
      if (!this.innerToDate) {
        this.$refs.toDate.setError(
          this.$t("i18nValidate").messages.required(this.$refs.toDate.title)
        );
        required = true;
      } else {
        this.$refs.toDate.resetValidate();
      }
      if (!required) {
        var from = new Date(this.innerFromDate).toDateString();
        var to = new Date(this.innerToDate).toDateString();
        if (new Date(from).getDateOnly() > new Date(to).getDateOnly()) {
          if (field == this.$t("i18nCommon.FromDate")) {
            this.$refs.fromDate.setError(
              this.$t("i18nComponent.ValidateFromDate")
            );
          } else {
            this.$refs.toDate.setError(this.$t("i18nComponent.ValidateToDate"));
          }
        } else {
          //btanh1 29/1/2020 mở lại đoạn này để sửa lỗi validate ngày. (không rõ vì sao vvkiet lại rem lai doan này)
          // this.$refs.toDate.$refs.provider.applyResult({
          // 	errors: [],
          // 	valid: true,
          // 	failedRules: {}
          // });
        }
      }
    },

    /**
     * TThuyen
     * Thay đổi Khoảng thời gian
     * Sửa: cập nhật fromDate khi vừa nhập xong NTTHANH1
     */
    changeFromDate(newVal, oldDate) {
      let me = this;
      this.selected = 0;
      let isChangeFromDate = false;//Đã cập nhật chưa
      //Update fromDate
      if (
        new Date(me.innerFromDate).toDateString() !=
        new Date(me.fromDate).toDateString()
      ) {
        me.$emit("update:fromDate", new Date(me.innerFromDate));
        isChangeFromDate = true;
        if (me.validateOnBlur) {
          me.validFromData(this.fromDateTitle);
        }
      }
      
      if(!isChangeFromDate && newVal) {//Chưa cập nhật và có dữ liêu mới
        me.$emit("update:fromDate", new Date(newVal));
        this.innerFromDate = new Date(newVal);
        if (me.validateOnBlur) {
          me.validFromData(this.fromDateTitle);
        }
      }
    },

    /**
     * Cập nhật toDate khi vừa nhập xong NTTHANH1
     */
    changeToDate(newVal, oldDate) {
      let me = this;
      this.selected = 0;
      let isChangeFromDate = false;//Đã cập nhật chưa
      //Update toDate
      if (
        new Date(me.innerToDate).toDateString() !=
        new Date(me.toDate).toDateString()
      ) {
        me.$emit("update:toDate", new Date(me.innerToDate));
        isChangeFromDate = true;
        if (me.validateOnBlur) {
          me.validToData(this.toDateTitle);
        }
      }

      if(!isChangeFromDate && newVal) {//Chưa cập nhật và có dữ liêu mới
        me.$emit("update:toDate", new Date(newVal));
        this.innerToDate = new Date(newVal);
        if (me.validateOnBlur) {
          me.validToData(this.fromDateTitle);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/msDateRange.scss";
</style>
<style lang="scss" scoped>
.ms-date-range {
  width: 100%;
}
.mr-15-px {
  margin-right: 15px;
}
.flex-1 {
  flex-grow: 1;
}
.mb-8-px {
  margin-bottom: 8px;
}
.mt-8-px {
  margin-top: 8px;
}
</style>
