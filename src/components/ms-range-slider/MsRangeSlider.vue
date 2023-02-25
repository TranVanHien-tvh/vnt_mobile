<!-- =========================================================================================
	Màn hình thanh range-slider
	Created by: nnlam - 22/04/2021
  Css nếu bị vỡ thì đề nghị sang màn editTemplateBarCode.scss để cắt css về nhé
========================================================================================== -->
<template lang="html">
  <div
    class="range-slider"
    :class="{ disabled }"
  >
    <drag-helper
      :disabled="disabled"
      @dragstart="dragStart"
      @drag="drag"
      @dragend="dragEnd"
    >
      <div
        ref="inner"
        class="range-slider-inner"
      >
        <div
          v-if="isDisplayValuePercent && !isDisplayValuePercentRight"
          class="range-value ml-6"
        >
          {{ showActualValue? actualValue: valuePercent }} %
        </div>
        <input
          class="range-slider-hidden"
          type="text"
          :name="name"
          :value="actualValue"
          :disabled="disabled"
        >
        <div
          v-if="hasIconRight"
          class="no-border ml-20 radius-50 float-left decrement icon24 decrement"
          @click="deCrement"
        />
        <div class="range-slider-component">
          <div class="range-slider-rail" />
          <div
            class="range-slider-fill"
            :style="{ width: valuePercent + '%' }"
          />
          <div
            ref="knob"
            class="range-slider-knob"
            :style="{ left: valuePercent + '%' }"
          >
            <slot name="knob" />
          </div>
        </div>
        <div
          v-if="hasIconLeft"
          class="no-border ml-20 radius-50 float-left increment icon24 add-increment"
          @click="inCrement"
        />
        <div
          v-if="isDisplayValuePercentRight && isDisplayValuePercent"
          class="range-value ml-6"
        >
          {{ showActualValue? actualValue: valuePercent }} %
        </div>
      </div>
    </drag-helper>
  </div>
</template>

<script>
// @flow

import DragHelper from './DragHelper'
import { round } from './utils'

export default {
  name: 'MsRangeSlider',
  components: {
    DragHelper
  },
  props: {
    name: String,
    value: [String, Number],
    disabled: {
      type: Boolean,
      default: false
    },
    min: {
      type: [String, Number],
      default: 0
    },
    max: {
      type: [String, Number],
      default: 100
    },
    step: {
      type: [String, Number],
      default: 1
    },
    isDisplayValuePercent:{
      type: Boolean,
      default: true
    },
    isDisplayValuePercentRight:{
      type: Boolean,
      default: true
    },
    hasIconRight:{
      type: Boolean,
      default: false
    },
    hasIconLeft:{
      type: Boolean,
      default: false
    },
    // hiển thị tỷ lệ hay giá trị thật
    showActualValue:{
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      actualValue: null,
      dragStartValue: null
    }
  },

  computed: {
    _min () {
      return Number(this.min);
    },

    _max () {
      return Number(this.max);
    },

    _step () {
      return Number(this.step);
    },

    valuePercent () {
      return parseInt((this.actualValue - this._min) / (this._max - this._min) * 100, 10);
    }
  },

  watch: {
    value (newValue) {
      const value = Number(newValue)
      if (newValue != null && !isNaN(value)) {
        this.actualValue = this.round(value);
      }
    },
    min () {
      this.actualValue = this.round(this.actualValue);
    },
    max () {
      this.actualValue = this.round(this.actualValue);
    }
  },

  created () {
    const { _min: min, _max: max } = this;
    let defaultValue = Number(this.value);

    if (this.value == null || isNaN(defaultValue)) {
      if (min > max) {
        defaultValue = min;
      } else {
        defaultValue = (min + max) / 2;
      }
    }

    this.actualValue = this.round(defaultValue);
  },

  methods: {
    dragStart (event, offset) {
      if(event.target.closest(".icon24")){
        return;
      }
      this.dragStartValue = this.actualValue;
      if (event.target === this.$refs.knob ) {
        return;
      }
      // If the click is out of knob, move it to mouse position
      this.drag(event, offset);
    },

    drag (event, offset) {
      if(event.target.closest(".icon24")){
        return;
      }
      const { offsetWidth } = this.$refs.inner;
      this.actualValue = this.round(this.valueFromBounds(offset.left, offsetWidth));
      this.emitInput(this.actualValue);
    },

    dragEnd (event, offset) {
      if(event.target.closest(".icon24")){
        return;
      }
      const { offsetWidth } = this.$refs.inner;
      this.actualValue = this.round(this.valueFromBounds(offset.left, offsetWidth));

      if (this.dragStartValue !== this.actualValue) {
        this.emitChange(this.actualValue);
      }
    },

    emitInput(value) {
      this.$emit('input', value);
    },

    emitChange(value) {
      this.$emit('change', value);
    },

    valueFromBounds (point, width) {
      return (point / width) * (this._max - this._min) + this._min;
    },

    round (value) {
      return round(value, this._min, this._max, this._step);
    },
    /**
     * Tăng giá trị
     */
    inCrement(e){
      e.preventDefault();
			e.stopPropagation();
      this.actualValue = this.actualValue != this.max? this.actualValue + this.step : this.max;
      this.emitInput(this.actualValue);
    },
    /**
     * Giảm giá trị
     */
    deCrement(e){
      e.preventDefault();
			e.stopPropagation();
      this.actualValue = this.actualValue != this.min? this.actualValue - this.step : this.min;
      this.emitInput(this.actualValue);
    }
  }
}
</script>

<style lang="scss" scoped>
$slider-height: 20px !default;
$slider-width: 130px !default;
$rail-height: 4px !default;
$knob-size: 20px !default;

$rail-color: #E6E6E6 !default;
$rail-fill-color: #2CA01C !default;
$knob-color: #fff !default;

$knob-border: 1px solid #f5f5f5 !default;
$knob-shadow: 1px 1px rgba(0, 0, 0, 0.2) !default;

.range-slider {
  display: inline-block;
  height: $slider-height;
  width: 100%;
}

.range-slider.disabled {
  opacity: 0.5;
}

.range-slider-inner {
  display: flex;
  position: relative;
  height: 100%;
  width: 100%;

  .range-slider-component {
    position: relative;
    width: 100%;
    height: 100%;
  }
}

.range-value {
  width: 45px;
}

.range-slider-rail,
.range-slider-fill {
  display: block;
  position: absolute;
  top: 50%;
  left: 0;
  height: $rail-height;
  border-radius: $rail-height / 2;
  transform: translateY(-50%);
}

.range-slider-rail {
  width: 100%;
  background-color: $rail-color;
}

.range-slider-fill {
  background-color: $rail-fill-color;
}

.range-slider-knob {
  display: block;
  position: absolute;
  top: 50%;
  left: 0;
  box-sizing: border-box;
  height: 24px;
  width: 24px;
  border: 3px solid #FFFFFF;
  border-radius: 50%;
  padding: 1px;
  background-color: #2CA01C;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.range-slider-hidden {
  display: none;
}
</style>
