<template>
  <div>
    <div class="flex-row">
      <div
        :class="[
          'text-left',
          'text-overflow',
          { notPermission: IsPermissioned },
          { Permission: !IsPermissioned },
        ]"
        :title="data[column.dataField]"
      >
        {{
          data[column.dataField]
            | formatData({
              formatType: column.formatType,
              enumName: column.enum,
              dataRow: data,
            })
        }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RoleName",
  props: {
    // eslint-disable-next-line vue/require-default-prop
    data: {},
    // eslint-disable-next-line vue/require-default-prop
    column: {},
  },
  computed: {
    IsPermissioned: function () {
      return this.data[this.column.dataField] == "Chưa phân quyền";
    },
  },
};
</script>

<style lang="scss" scoped>
.notPermission {
  color: #ff9152;
}

.Permission {
  color: #14aa8a;
}

.text-overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
