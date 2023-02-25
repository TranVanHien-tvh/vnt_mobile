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
          <!-- <ms-radio-group
						v-model="filterValue"
						:radioDatas="[
							{ title: $t('i18nComponent.i18nHeaderOption.Boolean.True'), value: 'Yes' },
							{ title: $t('i18nComponent.i18nHeaderOption.Boolean.False'), value: 'No' }
						]"
					></ms-radio-group> -->
          <div class="ck-type">
            <ms-radio
              v-model="filterValue" 
              name="demoType" 
              :text="$t('i18nComponent.i18nHeaderOption.Boolean.True')"
              key-value="Yes"
            />
          </div>
          <div class="ck-type">
            <ms-radio
              v-model="filterValue" 
              name="demoType" 
              :text="$t('i18nComponent.i18nHeaderOption.Boolean.False')"
              key-value="No"
            />
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
  name: "MsThOptionBoolean",
  extends: msThOptionBase,
  props: {},
  data() {
    return {
      defaultFilterOperator: this.$ms.enum.FilterHeader.Equals
    };
  },
  methods: {
    /**
     * Thay đổi nội dung filter
     */
    beforeShow() {
      switch (this.col.filter.value) {
        case true:
          this.filterValue = "Yes";
          break;
        case false:
          this.filterValue = "No";
          break;
        default:
          this.filterValue = null;
          break;
      }
    },
    /**
     * Bấm lọc
     */
    submitFilter() {
      this.col.filter.operator = this.defaultFilterOperator;

      switch (this.filterValue) {
        case "Yes":
          this.col.filter.value = true;
          break;
        case "No":
          this.col.filter.value = false;
          break;
        default:
          this.col.filter.value = null;
          break;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msThOption.scss";
.filter-value{
  display: flex;
  .ck-type{
    margin-right: 50px
  }
}
</style>
