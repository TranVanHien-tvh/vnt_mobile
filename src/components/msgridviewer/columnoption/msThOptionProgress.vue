<template>
  <div
    v-if="isShow"
    class="condition-container boolean"
    :style="stylex"
  >
    <div
      v-if="isShowPin"
      @click="lockClick"
    >
      <div
        v-if="!isLock"
        class="lock"
      >
        {{ $t('i18nComponent.i18nHeaderOption.Pin') }}
      </div>
      <div
        v-else
        class="lock unlock"
      >
        {{ $t('i18nComponent.i18nHeaderOption.Unpin') }}
      </div>
    </div>

    <div
      v-show="filterable"
      class="filter-container"
    >
      <div class="view-fitler-text">
        <div class="column-filter">
          {{ $t('i18nComponent.i18nHeaderOption.ColumnLabel') }}
        </div>

        <div class="filter-value">
          <div class="flex-row">
            <div class="full-progress">
              <div class="progress" />
            </div>
            <div>100</div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-show="filterable"
      class="buttons flex-row"
    >
      <button
        class="btn primary ml-10"
        @click="filterClick"
      >
        {{ $t('i18nComponent.i18nHeaderOption.FilterBtn') }}
      </button>
      <!-- <div class="flex"></div> -->
      <button
        class="btn secondary"
        @click="resetClick"
      >
        {{ $t('i18nComponent.i18nHeaderOption.ResetBtn') }}
      </button>
    </div>
  </div>
</template>
<script>
import msThOptionBase from "@/components/msgridviewer/columnoption/msThOptionBase.js";
export default {
  name: "MsThOptionProgress",
  extends: msThOptionBase,
  props: {},
  data() {
	const me = this;
    return {
      defaultFilterOperator: me.$ms.enum.FilterHeader.Equals,
      operators: [
        me.$ms.enum.FilterHeader.Equals,
        me.$ms.enum.FilterHeader.NotEquals,
		me.$ms.enum.FilterHeader.Between,
        me.$ms.enum.FilterHeader.LessThan,
        me.$ms.enum.FilterHeader.LessThanEquals,
        me.$ms.enum.FilterHeader.GreaterThan,
        me.$ms.enum.FilterHeader.GreaterThanEquals,
        me.$ms.enum.FilterHeader.Null,
        me.$ms.enum.FilterHeader.NotNull
      ]
    };
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msThOption.scss";
.full-progress{
  height: 6px;
  width: 100px;
  border-radius: 3px;
  background-color: aqua
}
.filter-value{
  display: flex;
  .ck-type{
    margin-right: 50px
  }
}
</style>
