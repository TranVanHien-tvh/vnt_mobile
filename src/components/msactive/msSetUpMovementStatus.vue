<template>
  <div>
    <div v-if="data[column.dataField] == 2" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-Unregistered" />
      </div>
      <div class="text icon-Unregistered">
        {{ $t("i18nEnum.MovementActionRegister.Unregistered") }}
      </div>
    </div>
    <div v-else-if="data[column.dataField] == 3" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-Unsent" />
      </div>
      <div class="text icon-Unregistered">
        {{ $t("i18nEnum.MovementActionRegister.Unsent") }}
      </div>
    </div>
    <div v-else-if="data[column.dataField] == 4" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-Pending" />
      </div>
      <div class="text icon-Unregistered">
        {{ $t("i18nEnum.MovementActionRegister.Pending") }}
      </div>
    </div>
    <div v-else-if="data[column.dataField] == 5" class="flex-row">
      <div class="icon">
        <div class="icon-image icon-Approved" />
      </div>
      <div class="text icon-Unregistered">
        {{ $t("i18nEnum.MovementActionRegister.Approved") }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "msSetUpMovementStatus",
  props: {
    data: {},
    column: {},
  },
};
</script>

<style lang="scss" scoped>
.icon {
  background-color: rgba(252, 189, 189, 0);
  width: 16px;
  height: 16px;
  position: relative;
  margin-right: 3px;

  .icon-image {
    border-radius: 50%;
    width: 10px;
    height: 10px;
    overflow: hidden;
    position: absolute;
    top: 5px;
    left: 1px;
  }

  .icon-Unsent {
    background-color: #ffda63;
  }

  .icon-Pending {
    background-color: #f38d15;
  }

  .icon-Unregistered {
    background-color: #9e9fab;
  }
  .icon-Approved {
    background-color: #2979ff;
  }
  .icon-Denied {
    background-color: black;
  }
}
</style>
