
<template>
  <transition>
    <div
      v-if="active"
      class="ms-tour-main"
    >
      <div class="tour-modal">
        <div
          class="tour-close"
          @click="close"
        />

        <div
          class="box-select box-select1"
          :style="{top: topBoxSelect1, left: leftBoxSelect1, width: widthBoxSelect1, minWidth: widthBoxSelect1}"
        >
          <img
            class="arrow-guide arrow-guide1"
            src="@/assets/images/icons/bg_arrow1.svg"
          >
          <span class="text-guide text-guid1">{{ $t('i18nAudit.AuditGuide.TitleGuide1') }}</span>
        </div>

        <div
          class="box-select box-select2"
          :style="{top: topBoxSelect2, left: leftBoxSelect2, width: widthBoxSelect2, minWidth: widthBoxSelect2}"
        >
          <img
            class="arrow-guide arrow-guide2"
            src="@/assets/images/icons/bg_arrow1.svg"
          >
          <span class="text-guide text-guide2">{{ $t('i18nAudit.AuditGuide.TitleGuide2') }}</span>
        </div>

        <div
          class="box-select box-select3"
          :style="{top: topBoxSelect3, left: leftBoxSelect3, width: widthBoxSelect3, minWidth: widthBoxSelect3}"
        >
          <img
            class="arrow-guide arrow-guide3"
            src="@/assets/images/icons/bg_arrow1.svg"
          >
          <span class="text-guide text-guide3">{{ $t('i18nAudit.AuditGuide.TitleGuide3') }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import i18n from '@/i18ns/i18n';
export default {
  name: "MsAuditTour",

  props: {},

  data() {
    return {
      topBoxSelect1: "0px",
      leftBoxSelect1: "0px",
      widthBoxSelect1: "0px",
      topBoxSelect2: "0px",
      leftBoxSelect2: "0px",
      widthBoxSelect2: "0px",
      topBoxSelect3: "0px",
      leftBoxSelect3: "0px",
      widthBoxSelect3: "0px",
      active: true
    };
  },

  computed: {},

  created() {},

  mounted() {
    let me = this;

    // Thêm sự kiện thay đổi của sổ window
    window.addEventListener('resize', me.onWindowResize);

    // Ẩn nút close của popup do bị lệch màu sắc
    document.getElementsByClassName('close-yet-audit-detail')[0].style.display = "none";

    // Tính vị trí các box
    me.calPostBox();
  },

  beforeDestroy() {
    const me = this;

    // Xóa sự kiện thay đổi kích thước của sổ window
    window.removeEventListener('resize', me.onWindowResize);
  },

  methods: {
    /**
     * @author vvkiet - 07.05.2021
     * Hàm thực hiện đóng guide
     */
    close(){
      const me = this;

      // Đóng guide
      me.active = !me.active

      // Hiển thị lại nút đóng form popup
      document.getElementsByClassName('close-yet-audit-detail')[0].style.display = "block";
    },

    /**
     * @author vvkiet - 07.05.2021
     * Sự kiện thay đổi kích thước của sổ window
     */
    onWindowResize(){
      const me = this;

      if(me.active){
        me.calPostBox();
      }
    },

    /**
     * @author vvkiet - 07.05.2021
     * Hàm tính vị trí các box
     */
    calPostBox(){
      const me = this;

      me.$nextTick(() => {
        me.topBoxSelect1 = document.getElementsByClassName('audit-member')[0].getBoundingClientRect().top - 20 + "px";
        me.leftBoxSelect1 = document.getElementsByClassName('audit-member')[0].getBoundingClientRect().left + "px";
        me.widthBoxSelect1 = document.getElementsByClassName('audit-member')[0].getBoundingClientRect().width + "px";

        me.topBoxSelect2 = document.getElementsByClassName('btn-export-asset')[0].getBoundingClientRect().top - 4 + "px";
        me.leftBoxSelect2 = document.getElementsByClassName('btn-export-asset')[0].getBoundingClientRect().left - 5 + "px";
        me.widthBoxSelect2 = document.getElementsByClassName('btn-export-asset')[0].getBoundingClientRect().width + 10 + "px";

        me.topBoxSelect3 = document.getElementsByClassName('btn-start-audit')[0].getBoundingClientRect().top - 4 + "px";
        me.leftBoxSelect3 = document.getElementsByClassName('btn-start-audit')[0].getBoundingClientRect().left - 5 + "px";
        me.widthBoxSelect3 = document.getElementsByClassName('btn-start-audit')[0].getBoundingClientRect().width + 10 + "px";
      });
    }
  }
};
</script>
<style lang="scss" scoped>

.ms-tour-main {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1100;
}

.tour-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  // z-index: 1001;
  -moz-opacity: 0.4;
  opacity: 0.4;
}

.box-select{
  position: fixed;
  z-index: 110000;
  background: #fff;
  transition: all .3s ease;
}

.box-select1{
  height: 53px;
}

.box-select2{
  height: 43px;
}

.box-select3{
  height: 43px;
}

.text-guide{
  position: absolute;
  color: #fff;
}

.text-guid1{
  width: 220px;
  top: -16px;
  left: 215px;
}

.text-guide2{
  width: 136px;
  top: -50px;
  left: -180px;
}

.text-guide3{
  width: 143px;
  top: -85px;
  left: -70px;
}

.arrow-guide{
  position: absolute;
  width: 77px;
}

.arrow-guide1{
  top: -40px;
  left: 125px;
  transform: rotate(27deg) scaleX(-1);
}

.arrow-guide2{
  top: -55px;
  left: -45px;
}

.arrow-guide3{
  top: -55px;
  left: 40px;
}

.tour-close{
  background: url('~@/assets/images/sprites.svg') no-repeat;
  background-position: -264px -280px;
  width: 16px;
  height: 16px;
  padding: 13px;
  position: fixed;
  right: 12px;
  top: 16px;
  cursor: pointer;
}
</style>
