<template>
  <div>
    <!-- <ms-tooltip :tooltip="tooltip"> -->
    <div
      v-if="title"
      class="flex"
    >
      <div
        v-if="title"
        class="ms-input-title"
      >
        {{ title }}
      </div>
    </div>
    <!-- </ms-tooltip> -->
    <div :class="['ms-radio-group',`ms-radio-is-vertical-${isVertical}`]">
      <ms-radio
        v-for="(item,index) in radioDatas"
        :key="index"
        v-model="msValueRadio"
        class="m-r-20"
        :ms-value="item.value"
        :disabled="disabled || item.disabled"
        :tooltip="item.tooltip"
        @changeValue="onChange"
        @beforeChange="onBeforeChange"
      >
        {{ item.title }}
      </ms-radio>
    </div>
  </div>
</template>

<script>
import { type } from 'os';
export default {
  name:'MsRadioGroup',
  props:{
    radioDatas:{
      type:Array,
      default: null,
    },
    value:{


    },
    isVertical:{
      type:Boolean,
      default:false,
    },
    disabled:{
      type:Boolean,
      default:false,
    },
    title: {
			type: String
		},
		tooltip: {
			type: String
		},
  },
  data(){
    return {
      msValueRadio:this.value?this.value:'',
    }
  },
  computed:{

  },
  watch:{
    value(cur){
      if(cur!=this.msValueRadio){
        this.msValueRadio=cur;
      }
    },
  },
  methods:{
    onChange(){
      this.$emit("input",this.msValueRadio);
      this.$emit("changeValue",this.msValueRadio);
    },
    /**
		 * TTHuyen 21.09.2020
		 * Thêm sự kiện beforeChange trước khi thay đổi
		 */
    onBeforeChange(value,eventCustom){
      this.$emit("beforeChange",value,eventCustom);
    }
  },
}
</script>

<style lang="scss" scoped>
.ms-radio-group{
  display: flex;
}

.ms-radio-is-vertical-true{
  display: grid;
}
.ms-radio-is-vertical-true .con-ms-radio{
  margin-bottom: 12px;

}
.ms-radio-is-vertical-false{

}
.ms-radio-is-vertical-false .con-ms-radio
{
   margin-right: 20px;
}
	.ms-input-title {
		font-size: 12px;
		font-weight: bold;
		padding-bottom: 6px;
		white-space: nowrap;
	}
</style>

