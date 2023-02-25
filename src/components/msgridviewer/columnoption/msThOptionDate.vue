<template>
  <div
    v-if="isShow"
    ref="datefilter-container"
    class="condition-container date"
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
        <div class="filter-op">
          <ms-validate ref="validateObserver">
            <ms-combobox
              v-model="filterOperator"
              value-field="enumValue"
              display-field="enumText"
              :data="opSource"
              rules="required|forceSelection"
              :is-show-text="false"
              :title="$t('i18nComponent.i18nHeaderOption.ColumnLabel')"
            />
          </ms-validate>
        </div>

        <div v-if="filterOperator === $ms.enum.FilterHeader.Between">
          <div class="filter-value">
            <ms-datepicker
              v-model="filterFrom"
              :read-only="operatorValueReadonly"
              class="datepicker w-full"
              :placeholder="$t('i18nComponent.i18nHeaderOption.InputEmptyFrom')"
              @keydown.enter="inputEnter"
              @focus="inputFocus"
              @triggerClick="inputPickerClick"
            />
          </div>
          <div class="filter-value">
            <ms-datepicker
              v-model="filterTo"
              :read-only="operatorValueReadonly"
              class="datepicker w-full"
              :placeholder="$t('i18nComponent.i18nHeaderOption.InputEmptyTo')"
              @keydown.enter="inputEnter"
              @focus="inputFocus"
              @triggerClick="inputPickerClick"
            />
          </div>
        </div>
				
        <div
          v-else
          class="filter-value"
        >
          <ms-datepicker
            v-model="filterValue"
            :read-only="operatorValueReadonly"
            class="datepicker w-full"
            :placeholder="$t('i18nComponent.i18nHeaderOption.InputEmptyText')"
            @keydown.enter="inputEnter"
            @focus="inputFocus"
            @triggerClick="inputPickerClick"
          />
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
import msValidate from "@/components/msValidate/msValidate.vue";
export default {
  name: "MsThOptionDate",
  components: {msValidate},
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
      ],
    };
  },
  methods: {
    inputFocus() {
      me.$refs["datefilter-container"].click();
    },
    inputPickerClick() {
      me.$refs["datefilter-container"].click();
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msThOption.scss";
</style>
