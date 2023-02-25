<template>
  <div class="percent">
    <div class="cont">
      {{ percent }}%
    </div>
    <svg
      width="40"
      height="40"
    >
      <circle
        r="18"
        cx="20"
        cy="20"
        class="track"
      />
      <circle
        r="18"
        cx="20"
        cy="20"
        class="progress"
      />
    </svg>
  </div>
</template>
<script>
export default {
  name: "MsCircleProgressBar",
  props: {
    // % tương ứng
    percent: {
      default: 0,
      type: Number
    }
  },
  data() {
    return {};
  },
  computed: {},
  watch: {
    percent(valNew, valOld){
      this.setProgress(valNew);
    }
  },
  created() {},
  mounted() {
    let me = this;
    me.$nextTick(() => {
      me.setProgress(me.percent);
    });
  },
  beforeDestroy() {},
  methods: {
    setProgress(percent) {
      let me = this;
      // let selector = me.$el.getElementsByClassName('progress')[0];
      let progressCircle = me.$el.getElementsByClassName('progress')[0];
      let radius = progressCircle.r.baseVal.value;
      // circumference of a circle = 2πr;
      let circumference = radius * 2 * Math.PI;
      progressCircle.style.strokeDasharray = circumference;

      progressCircle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    }
  }
};
</script>

<style lang="scss" scoped>
.track {
  stroke-width: 2;
  stroke: #14aa8a33;
  fill: none;
}

.progress {
  stroke-width: 2;
  stroke: #14AA8A;
  stroke-linecap: round;
  fill: #F6F6F6;
  transform: rotate(270deg);
  transform-origin: center;
}

.cont {
  color: #14AA8A;
  position: absolute;
  display: block;
  text-align: center;
  width: 40px;
  top: 32%;
  font-size: 12px;
  font-weight: bold;
}

.percent{
    margin: 0 12px;
    position: relative;
}
</style>