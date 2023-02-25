<template>
<footer class="bg-light text-center text-lg-start vnt-footer">
  <div class="container p-4">
    <div class="row">
      <div class="col-lg-3 col-md-6 mb-4 mb-md-0">
        <div class="footer-title">Kết nối với chúng tôi tại:</div>
        <ul class="list-unstyled footer-session">
          <li>
            <a href="#!" class="store-icon google-icon"><img src="~@/assets/images/icons/vnt/logos_google-play-icon.png" alt=""></a>
            <a href="#!" class="store-icon apple-icon"><img src="~@/assets/images/icons/vnt/cib_apple.png" alt=""></a>

          </li>
        </ul>
      </div>
      <!--Grid column-->

      <!--Grid column-->
      <div class="col-lg-3 col-md-6 mb-4 mb-md-0">
        <div class="footer-title">Hỗ trợ</div>
        <ul class="list-unstyled footer-session">
          <li>
            <a href="#!" class="footer-content">Chăm sóc khách hàng</a>
          </li>
          <li>
            <a href="#!" class="footer-content">Gọi điện tổng đài</a>
          </li>
          <li>
            <a href="#!" class="footer-content">Gửi khiếu nại qua Email</a>
          </li>
        </ul>
      </div>
      <!--Grid column-->

      <!--Grid column-->
      <div class="col-lg-3 col-md-6 mb-4 mb-md-0">
        <div class="footer-title">Về VNT</div>

        <ul class="list-unstyled footer-session">
          <li>
            <a href="#!" class="footer-content">Giới thiệu về chúng tôi</a>
          </li>
          <li>
            <a href="#!" class="footer-content">Liên hệ</a>
          </li>
          <li>
            <a href="#!" class="footer-content">Chính sách</a>
          </li>
        </ul>
      </div>
      <div class="col-lg-3 col-md-6 mb-4 mb-md-0">
        <div class="footer-title">Địa chỉ</div>

        <ul class="list-unstyled footer-session">
          <li>
            <a href="#!" class="footer-content">123 Giải Phóng, Hoàng Mai, Hà Nội</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="text-center p-5">
    All right Reserved @vietnamtogether.2022
  </div>
</footer>
</template>

<script>

export default {
  components: {},
  props: {
    collapse: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {};
  },

  watch: {},

  computed: {},
  created() {
    const me = this;
  },

  mounted() {
    const me = this;
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/layouts/footer.scss";
</style>
