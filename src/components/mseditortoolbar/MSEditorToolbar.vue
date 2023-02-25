<template>
  <div class="editor-toolbar-container">
    <div class="main-toolbar">
      <!-- Font chữ -->
      <div style="width: 170px">
        <ms-combobox
          v-model="value.FontFamily"
          class="input-editor"
          value-field="value"
          display-field="text"
          :data="fontFamilyList"
          :force-selection="true"
          :validate-on-focus="true"
        />
      </div>

      <!-- Cỡ chữ -->
      <div class="flex-row align-center">
        <div class="mr-2">Cỡ</div>
        <div style="width: 70px">
          <ms-number
            v-model="value.FontSize"
            :spin="true"
            :min="0"
            :max="72"
            :max-length="2"
            :allow-digit-group-separator="false"
            @input="setToolbarValue"
          />
        </div>
      </div>

      <!-- Màu chữ -->
      <MSColorPicker v-model="value.Color" />

      <!--  -->
      <div style="width: fit-content" class="flex-row">
        <ActiveButton
          v-model="value.IsBold"
          icon="ic-bold"
          class="mr-4"
          :value-checked="true"
          :value-un-checked="false"
        />
        <ActiveButton
          v-model="value.IsItalic"
          icon="ic-italic"
          class="mr-4"
          :value-checked="true"
          :value-un-checked="false"
        />
        <ActiveButton
          v-model="value.IsUnderline"
          icon="ic-underline"
          :value-checked="true"
          :value-un-checked="false"
        />
      </div>

      <div style="width: fit-content" class="flex-row">
        <ActiveButton
          v-model="value.Transform"
          icon="ic-uppercase"
          class="mr-4"
          value-checked="uppercase"
          value-un-checked="none"
        />
        <ActiveButton
          v-model="value.Transform"
          icon="ic-lowercase"
          class="mr-4"
          value-checked="lowercase"
          value-un-checked="none"
        />
        <ActiveButton
          v-model="value.Transform"
          icon="ic-titlecase"
          value-checked="capitalize"
          value-un-checked="none"
        />
      </div>

      <!-- Căn lề -->
      <div style="width: fit-content" class="flex-row">
        <ActiveButton
          v-model="value.HorAlignment"
          icon="ic-align-left"
          class="mr-4"
          value-checked="left"
        />
        <ActiveButton
          v-model="value.HorAlignment"
          icon="ic-align-center"
          class="mr-4"
          value-checked="center"
        />
        <ActiveButton
          v-model="value.HorAlignment"
          icon="ic-align-right"
          value-checked="right"
        />
      </div>

      <!-- Giãn dòng -->
      <div class="flex-row align-center">
        <div class="mr-2">Giãn dòng</div>
        <div style="width: 70px">
          <ms-number
            v-model="value.LineHeight"
            :spin="true"
            :min="0"
            :max="72"
            :max-length="2"
            :allow-digit-group-separator="false"
            @input="setToolbarValue"
          />
        </div>
      </div>
    </div>

    <div class="custom-group-button">
      <slot name="extra" />
    </div>
  </div>
</template>
<script>
import MSColorPicker from "@/components/mscolorpicker/MSColorPicker.vue";
import ActiveButton from "@/components/msbutton/msActiveButton.vue";

export default {
  components: {
    MSColorPicker,
    ActiveButton,
  },
  props: {
    toolbarValue: {
      default: () => {
        return {
          FontFamily: null,
          FontSize: null,
          Color: "#000000",
          IsItalic: null,
          IsBold: null,
          IsUnderline: null,
          HorAlignment: null,
          LineHeight: null,
        };
      },
      type: [Object, Array],
    },
  },

  data() {
    return {
      fontFamilyList: [
        {
          text: "Times New Roman",
          value: "Times New Roman",
        },
        {
          text: "Roboto",
          value: "Roboto",
        },
        {
          text: "Arial",
          value: "Arial",
        },
      ],

      value: {
        FontFamily: null,
        FontSize: null,
        Color: null,
        IsItalic: null,
        IsBold: null,
        IsUnderline: null,
        HorAlignment: null,
        LineHeight: null,
        Transform: "none", // text-transform
      },
    };
  },
  watch: {
    toolbarValue() {
      this.toolbarValue;
      if (this.toolbarValue.length === 1) {
        this.value = this.toolbarValue[0];
      } else if (this.toolbarValue.length > 1) {
        this.value = {
          ID: null,
          FontFamily: null,
          FontSize: null,
          Color: null,
          IsItalic: null,
          IsBold: null,
          IsUnderline: null,
          HorAlignment: null,
          LineHeight: null,
          Transform: "none",
        };
      } else if (this.toolbarValue.length === 0) {
        this.value = {
          ID: null,
          FontFamily: null,
          FontSize: null,
          Color: null,
          IsItalic: null,
          IsBold: null,
          IsUnderline: null,
          HorAlignment: null,
          LineHeight: null,
          Transform: "none",
        };
      }
    },
  },

  methods: {
    setToolbarValue(value) {
      this.$emit("changeStyle", this.value);
    },
  },
};
</script>
<style lang="scss">
.mr-4 {
  margin-right: 4px;
}

.align-center {
  align-items: center;
}

.editor-toolbar-container {
  display: flex;
  justify-content: space-between;
  padding: 10px 24px;

  .main-toolbar {
    display: flex;
    justify-content: space-between;
    width: 876px;
  }
}
// .custom-group-button {
// }
</style>
