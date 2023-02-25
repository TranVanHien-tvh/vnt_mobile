<template>
  <div class="color-picker-container" v-click-outside="hiddenPalette">
    <ms-button type="secondary" left-icon="refresh" @click="togglePalette" />

    <ul class="pallette" role="listbox" v-show="isShowPalette">
      <li
        class="color-item"
        v-for="(color, index) in colorList"
        :key="index"
        :style="{ background: color }"
        :class="{ active: color === colorPicked }"
        @click="selectColor(color)"
      ></li>
    </ul>
  </div>
</template>

<script>
const defaultColors = [
  "#4D4D4D",
  "#999999",
  "#FFFFFF",
  "#F44E3B",
  "#FE9200",
  "#FCDC00",
  "#DBDF00",
  "#A4DD00",
  "#68CCCA",
  "#73D8FF",
  "#AEA1FF",
  "#FDA1FF",
  "#333333",
  "#808080",
  "#CCCCCC",
  "#D33115",
  "#E27300",
  "#FCC400",
  "#B0BC00",
  "#68BC00",
  "#16A5A5",
  "#009CE0",
  "#7B64FF",
  "#FA28FF",
  "#000000",
  "#666666",
  "#B3B3B3",
  "#9F0500",
  "#C45100",
  "#FB9E00",
  "#808900",
  "#194D33",
  "#0C797D",
  "#0062B1",
  "#653294",
  "#AB149E",
];

export default {
  props: {
    pallete: {
      type: Array,
      default() {
        return defaultColors;
      },
    },
    value: {
      type: String,
    },
  },

  data() {
    return {
      colorList: this.pallete.map((color) => color.toUpperCase()),
      colorPicked: this.value ? this.value.toUpperCase() : "#000000",
      isShowPalette: false,
    };
  },

  methods: {
    /**
     * Ẩn hiện bảng màu
     * NMTUAN3 5/4/2022
     */
    togglePalette() {
      this.isShowPalette = !this.isShowPalette;
    },

    /**
     * Sự kiện chọn màu
     * NMTUAN3 5/4/2022
     */
    selectColor(color) {
      this.colorPicked = color;
      this.$emit("input", color);
      this.isShowPalette = false;
    },

    /**
     * Ẩn bảng màu khi click ra ngoài
     * NMTUAN3 5/4/2022
     */
    hiddenPalette(event) {
      let me = this;

      if (
        typeof event.target.className.contains == "function" &&
        !event.target.className.contains("color-picker-container")
      ) {
        me.isShowPalette = false;
      }
    },
  },
};
</script>

<style lang="scss">
.color-picker-container {
  position: relative;

  .pallette {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    list-style: none;
    padding: 0;
    margin: 0;
    width: 240px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 24%);
    padding-top: 4px;
    z-index: 10;
    background-color: #fff;
  }

  .color-item {
    height: 16px;
    width: 16px;
    margin: 2px;
    display: inline-grid;
    cursor: pointer;

    &:hover {
      border: 2px solid #ccc;
    }

    &.active {
      border: 2px solid #f00;
    }
  }
}
</style>