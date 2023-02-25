<template>
  <button
    class="ms-button btn"
    :class="[type, text ? '' : 'only-icon']"
    :disabled="disabled || processing"
    v-on="listeners"
  >
    <div v-if="leftIcon" :class="['icon24 icon left', leftIcon]" />
    <div
      v-if="text"
      class="text"
      :class="[{ 'pl-0': leftIcon, 'pr-0': rightIcon }]"
    >
      {{ text }}
    </div>
    <div v-if="rightIcon" :class="['icon24 icon right', rightIcon]" />
  </button>
</template>
<script>
export default {
  name: "MsButton",
  props: {
    //Text hiển thị
    text: {
      default: null,
      type: String,
    },
    //Icon trái
    leftIcon: {
      default: null,
      type: String,
    },
    //Icon phải
    rightIcon: {
      default: null,
      type: String,
    },
    //Loại button gồm 3 loại primary/secondary/third/four để hiện thị style tương ứng
    type: {
      default: "primary",
      type: String,
    },
    /**
     * Trạng thái button disabled
     */
    disabled: {
      default: false,
      type: Boolean,
    },
    /**
     * Cờ đánh dấu đang xử lý
     */
    processing: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {};
  },
  computed: {
    //Sự kiện từ 1 dòng dữ liệu emit ra ngoài
    listeners() {
      const me = this;
      return {
        click: (event) => {
          let deplay = window._appConfig.buttonClickDeplayMilliseconds;
          if (deplay && deplay > 0) {
            if (me._clicking) {
              return;
            }

            me._clicking = true;
            setTimeout(() => {
              delete me._clicking;
            }, deplay);
          }

          me.$emit("click", event);
        },
        mousedown: (event) => {
          event.preventDefault();
        },
        keydown: (event) => {
          me.$emit("keydown", event);
        },
        focus: (event) => {
          me.$emit("focus", event);
        },
      };
    },
  },
};
</script>
<style scoped lang="scss">
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msButton.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msButton.scss';
// }

@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msButton.scss";

.ms-button.round-btn {
  border-radius: 50%;
  background-color: transparent;
  min-height: 30px;
  min-width: 30px;
  &:hover {
    background-color: #fff;
    box-shadow: 0 3px 16px rgb(0 0 0 / 16%);
  }
  .icon24 {
    height: 10px;
    margin-bottom: 0px;
    &.more:before {
      height: 10px;
      background-position: -168px -55px;
    }
  }
}

.ms-button.green-btn {
  background-color: #00c853;
  color: #fff;
  &:hover {
    background-color: #00c853;
  }
}
</style>

