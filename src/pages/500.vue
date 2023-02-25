<template>
  <div class="h-screen flex w-full">
    <div class="vx-col flex items-center justify-center flex-col sm:w-1/2 md:w-3/5 lg:w-3/4 xl:w-1/2 mx-auto text-center">
      <img
        src="@/assets/images/pages/bg_Error500.svg"
        class="mx-auto mb-4"
      >
      <h1 class="page--title">
        {{ $t('i18nPages.Error.500') }}
      </h1>
      <p
        v-if="message.length>0"
        class="mb-16 d-theme-text-inverse"
      >
        <!-- {{message}} -->
        {{ $t("i18nPages.Error.500_sub") }}
      </p>
      <ms-button
        :text="$t('i18nCommon.command.Back')"
        class="detail-button mr-2"
        @click="goBack"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: ''
    };
  },
  computed: {},
  watch: {},
  mounted() {
    const me = this;

    // let msg = sessionStorage.getItem("500msg");
    // if (me.$route.params && me.$route.params.error) {
    //   msg = me.$route.params.error;
    //   sessionStorage.setItem("500msg", msg);
    // }

    // me.message = msg || me.$t("i18nPages.Error.500_sub");
  },
  methods: {
    /**
     * Quay lại.
     * Nếu trang trước đó vẫn là trang của AMIS Kế toán thì quay lại trang trước đó.
     * VD: KH đang mở dữ liệu theo TT133, danh sách kỳ tính giá thành, KH copy link tính năng kết chuyển chi phí theo TT200 ở 1 trang khác paste vào thì sẽ hiển thị màn hình thông báo này,
     * khi nhấn quay lại thì vẫn quay lại kỳ tính giá thành của TT133 trước đó
     * Nếu trang trước đó không phải là của AMIS Kế toán thì về màn hình dashboard (giống như bấm vào nút Back to home hiện nay)
     * @author NVLAM 05.08.2020
     */
    goBack() {
      this.$router.push("/");
    }
  }
};
</script>

<style lang="scss" scoped>
.page--title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
::v-deep.btn .text {
  padding-right: 16px;
}
.h-screen {
  height: 100vh;
  display: flex;
  background: #fff;
  .items-center {
    height: 50vh;
    width: 50%;
    margin: auto;
  }
  .d-theme-text-inverse {
    margin-bottom: 30px;
  }
}
</style>