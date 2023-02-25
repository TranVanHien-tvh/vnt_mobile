<!-- =========================================================================================
	Cột custom hiển thị mỗi icon (class icon truyền vào) hoặc nếu có hasTitle thì mình thêm hàm
    để xử lý lấy title từ các i18n
    TDNGHIA 10/10/2021
========================================================================================== -->

<template>
  <div>
    <div v-if="data[column.dataField]" class="flex-row align-items-center">
      <!-- case true -->
      <div
        v-if="column.iconCls"
        class="icon"
        :class="{ 'm-auto': !column.enum, 'mr-2': column.enum }"
      >
        <div class="icon-16" :class="column.iconCls" />
      </div>
      <div v-if="column.enum" class="text" :class="customCls">
        {{ description }}
      </div>
    </div>
    <div v-else class="flex-row">
      <!-- case false -->
      <div
        v-if="column.iconCls"
        class="icon"
        :class="{ 'm-auto': !column.enum, 'mr-2': column.enum }"
      >
        <div class="icon-16" :class="column.iconCls + '-inactive'" />
      </div>
      <div v-if="column.enum" class="text" :class="customCls">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script>
import commonFn from "@/commons/commonFunction";
import { MSEnum } from "@/commons/enumeration";

export default {
  name: "msActiveCustomIcon",
  props: {
    data: {},
    column: {},
  },

  computed: {
    /**
     * Hiển thị dòng label sau icon
     */
    description() {
      const me = this;

      let subTitle = commonFn.getEnumResource(
        me.data[me.column.dataField],
        me.column.enum
      );

      return subTitle;
    },

    /**
     * Custom lại các style của dòng tilte: nghiêng, đậm, màu sắc,...
     */
    customCls() {
      const me = this;
      let cls = "";

      switch (me.column.enum) {
        case "DocumentaryState":
          if (me.data[me.column.dataField] == MSEnum.DocumentaryState.Sent) {
            cls = "blue-text";
          }
          break;
        case "SubmitState":
          if (me.data[me.column.dataField] == MSEnum.SubmitState.Created) {
            cls = "blue-text";
          }
          break;
        case "RegisterStatus":
          if (me.data[me.column.dataField] == MSEnum.RegisterStatus.UnFinish) {
            cls = "gray-text";
          }
          break;
      }

      return cls;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.align-items-center {
  align-items: center;
}

.icon {
  background-color: rgba(31, 31, 31, 0);
  width: 16px;
  height: 16px;
  &.m-auto {
    margin: 0 auto;
  }
  .icon-16 {
    width: 16px;
    height: 16px;
    overflow: hidden;
    background: url($ms-image-CeGo_Sprites) no-repeat;
  }
  .icon-green {
    background-position: -112px -144px;
  }
  .icon-green-inactive {
    background-position: -80px -144px;
    height: 18px;
  }
  .icon-blue {
    background: url($ms-image-ic_blue_check) no-repeat;
    background-size: cover;
  }
  .icon-blue-inactive {
    background: url($ms-image-ic_blue_uncheck) no-repeat;
    background-size: cover;
  }
  .icon-is-lead {
    background-position: -64px -144px;
  }
  .icon-is-lead-inactive {
    background-position: -96px -144px;
  }
}

.text {
  &.green-text {
    color: #00c853;
  }
  &.blue-text {
    color: #2979ff;
  }
  &.gray-text {
    color: #9e9fab;
  }
}
</style>
