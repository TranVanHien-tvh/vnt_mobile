<template>
  <ms-popup
    :loading="loading"
    :active.sync="active"
    class="detail-popup"
    :width="400"
    :auto-close="true"
    @shortkeyAction="shortkeyAction"
  >
    <template slot="header">
      {{ $t('i18nComponent.CustomField.Option.Title') }}
    </template>
    <template slot="content">
      <div class="mb-2">
        <ms-textarea
          ref="input"
          v-model="optionValue"
          :rows="8"
        />
      </div>
    </template>
    <template slot="footer"> 
      <div class="flex-row">
        <div class="flex" />
        <div class="flex-rtl">
          <ms-button
            type="primary"
            :text="$t('i18nCommon.command.save')"
            @click="save"
          />
          <ms-button
            type="secondary-outline"
            :text="$t('i18nCommon.command.cancel')"
            class="mr-2"
            @click="hide"
          />
        </div>
      </div>   
    </template>
  </ms-popup>
</template>

<script>
import { popup } from "@/mixins/common/popup";
export default {
  name: "MsCustomFieldEditOption",
  mixins: [popup],
  data() {
    const me = this;
    return {
      /**
       * Dữ liệu binding của danh sách giá trị
       */
      optionValue: null
    };
  },
  watch: {},
  created() {
    const me = this;
  },
  methods: {
    /**
     * Hiển thị
     */
    show(param, option) {
      const me = this;

      //giữ lại option
      me._option = option;

      //binding
      me.optionValue = Array.isArray(param) ? param.join("\n") : "";

      //focú first control
      me.$nextTick(() => {
        me.$ms.commonFn.focusFirstControlInput(me.$el, false);
      });
    },
    /**
     * submit giá trị
     */
    save() {
      const me = this,
        value = [];

      if (me.optionValue) {
        let hasEmpty = false;
        me.optionValue.split("\n").forEach(item => {
          if (!item) {
            if (hasEmpty) {
              return;
            }
            hasEmpty = true;
          }
          value.push(item);
        });
      }

      me.hide();
      me._option.submit(value);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/MsCustomFieldEdit.scss";
</style>