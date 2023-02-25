<template>
  <div class="text-center">
    <div
      v-visible="dataRow.type == $ms.enum.CustomFieldType.List"
      class="d-inline-block icon24 edit pointer mr-2"
      :title="$t('i18nCommon.command.edit')"
      @click="itemClick('edit', $event)"
    />
    <div
      class="d-inline-block icon24 delete pointer" 
      :title="$t('i18nCommon.command.delete')"
      @click="itemClick('delete', $event)"
    />
  </div>
</template>
<script>
export default {
  name: "MsCustomFieldEditWidget",
  props: {
    dataRow: {}
  },
  methods: {
    /**
     * hàm dowload mẫu
     */
    itemClick(command, event) {
      const me = this;
      let data = {
        command: command,
        dataRow: me.dataRow
      };

      me.$emit("widgetEvent", data, event);
    }
  }
};
</script>
<style>

</style>