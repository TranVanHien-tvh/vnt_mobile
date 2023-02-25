<template>
  <div class="progress-bar">
    <div class="loader"></div>
    <div class="wrapper">
      <div class="current-loading"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MsStraightLineLoader",

  props: {
    /**
     * Tự động chạy tới bao nhiêu %
     */
    autoRunMax: {
      type: Number,
      default: 95,
    },

    /**
     * Thời gian load 1% (ms)
     */
    timeSpendPercent: {
      type: Number,
      default: 10, // 1s load 100%
    },

    height: {
      type: Number,
      default: 24,
    },

    width: {
      type: Number,
      default: 232,
    },

    isFinish: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isDoneAutoRun: false, // true thì mới load tiếp
    };
  },

  computed: {},

  watch: {
    /**
     * Xử lý khi service chạy xong
     */
    isFinish(newVal, oldVal) {
      const me = this;

      // service xong mà UI chưa chạy xong thì tí sẽ vào cờ của UI
      if (newVal && me.isDoneAutoRun) {
        me.setProgress(true);
        me.isFinish = false; // tắt để không chạy lại ở cờ UI
      }
    },

    /**
     * xử lý khi UI chạy xong
     */
    isDoneAutoRun(newVal, oldVal) {
      const me = this;

      // service xong mà UI chưa chạy xong thì tí sẽ vào cờ của UI
      if (newVal && me.isFinish) {
        me.setProgress(true);
        me.isDoneAutoRun = false; // tắt để không chạy lại ở cờ service
      }
    },
  },

  created() {},

  mounted() {
    let me = this;

    me.$nextTick(() => {
      me.setProgress(false);
    });
  },

  methods: {
    setProgress(isFinish) {
      let me = this;
      let progressBar = me.$el,
        loader = progressBar.getElementsByClassName("loader")[0],
        wrapper = progressBar.getElementsByClassName("wrapper")[0],
        loading = progressBar.getElementsByClassName("current-loading")[0];
      let loadingFunc = function (cur, delayCount) {
        let per = cur;

        setTimeout(() => {
          loading.style.width = per + "%";

          if (per == me.autoRunMax) {
            me.isDoneAutoRun = true;
          }

          if (per == 100) {
            me.$emit("loadingDone", true);
          }
        }, me.timeSpendPercent * delayCount);
      };

      if (isFinish) {
        if (me.isDoneAutoRun) {
          for (let cur = me.autoRunMax + 1; cur <= 100; cur++) {
            loadingFunc(cur, (cur - me.autoRunMax) * 5);
          }
        }
      } else {
        progressBar.style.width = "{0}px".format(me.width);
        progressBar.style.height = "{0}px".format(me.height);

        loader.style.width = "{0}px".format(me.width);
        loader.style.height = "{0}px".format(me.height);

        wrapper.style.width = "{0}px".format(me.width);
        wrapper.style.height = "{0}px".format(me.height);

        me.isDoneAutoRun = false;

        for (let cur = 1; cur <= me.autoRunMax; cur++) {
          loadingFunc(cur, cur - 1);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-bar {
  position: relative;

  .loader {
    position: relative;
    background: #fff;
    overflow: hidden;
    border: 1px solid #d5d5d5;
    border-radius: 4px;
  }

  .wrapper {
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 4px;

    .current-loading {
      height: 100%;
      width: 0%;
      background-image: linear-gradient(to right, #2979ff, #5b4dff);
    }
  }
}
</style>