<template>
  <div v-if="isShow" class="condition-container enum" :style="stylex">
    <div v-if="isShowPin" @click="lockClick">
      <div v-if="!isLock" class="lock">
        {{ $t("i18nComponent.i18nHeaderOption.Pin") }}
      </div>
      <div v-else class="lock unlock">
        {{ $t("i18nComponent.i18nHeaderOption.Unpin") }}
      </div>
    </div>

    <div v-show="filterable" class="filter-container">
      <div class="arrow"></div>

      <div class="view-fitler-text">
        <!-- <div class="column-filter">
          {{ $t("i18nComponent.i18nHeaderOption.ColumnLabel") }}
        </div> -->
        <div v-show="false" class="filter-op">
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
        <div class="filter-value">
          <!-- <ms-combobox
            ref="cboFilter"
            v-model="filterValue"
            query-mode="local"
            :display-field="filterDisplayField"
            :value-field="filterValueField"
            :data="dataSource"
            :placeholder="$t('i18nComponent.i18nHeaderOption.InputEmptyText')"
            :title="col.tooltip || col.title || col.definition || col.caption"
            :is-show-text="false"
          /> -->
          <div v-for="(item, index) in dataSource" :key="index">
            <div
              class="state-item"
              @click="itemOnClick(item)"
              :class="{ active: isSelected(item) }"
            >
              {{ item[filterDisplayField] }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div v-show="filterable" class="buttons flex-row">
      <button class="btn primary ml-10" @click="filterClick">
        {{ $t("i18nComponent.i18nHeaderOption.FilterBtn") }}
      </button> -->
    <!-- <div class="flex"></div> -->
    <!-- <button class="btn secondary" @click="resetClick">
        {{ $t("i18nComponent.i18nHeaderOption.ResetBtn") }} -->
    <!-- </button>
    </div> -->
  </div>
</template>
<script>
import msThOptionBase from "@/components/msgridviewer/columnoption/msThOptionBase.js";
import msValidate from "@/components/msValidate/msValidate.vue";
import MSStore from "@/stores/msstore";
export default {
  name: "MsThOptionEnum",
  components: { msValidate },
  extends: msThOptionBase,
  props: {},
  data() {
    let me = this,
      operators;

    // nnlam - 17/03/2021
    if (
      me.col &&
      me.col.hasOwnProperty("operators") &&
      Array.isArray(me.col.operators) &&
      me.col.operators.length > 0
    ) {
      operators = me.col.operators;
    } else {
      operators = [
        me.$ms.enum.FilterHeader.Equals,
        me.$ms.enum.FilterHeader.NotEquals,
      ];
    }

    return {
      filterOperator: me.$ms.enum.FilterHeader.Equals,
      defaultFilterOperator: me.$ms.enum.FilterHeader.Equals,
      operators: operators,
      filterStore: new MSStore(),
      dataSource: null,
    };
  },
  computed: {
    filterValueField() {
      if (this.col && this.col.filterValueField) {
        return this.col.filterValueField;
      }
      return "enumValue";
    },
    filterDisplayField() {
      if (this.col && this.col.filterDisplayField) {
        return this.col.filterDisplayField;
      }

      return "enumText";
    },
  },
  created() {
    this.storeEnums = {};
  },
  methods: {
    /**
     * Hi???n th??? option
     * TDNGHIA 15/10/2021
     */
    beforeShow() {
      const me = this;

      //C???p nh???t store theo enum
      if (this.col.hasActionFilter) {
        me.filterValue = me.col.filter.value;
        me.filterOperator = me.col.filter.operator;
      } else {
        me.filterValue = me.defaultFilterValue;
        me.filterOperator = me.defaultFilterOperator;
      }
      if (typeof me.col.customEnumData === "function") {
        me.storeEnums[me.col.enumName || me.col.enum] = me.col.customEnumData();
      } else if (typeof me.col.customEnumSource === "function") {
        let temp = me.col.customEnumSource();
        me.storeEnums[me.col.enumName || me.col.enum] = temp.getData();
      } else if (!me.storeEnums[me.col.enumName || me.col.enum]) {
        let data = me.$ms.commonFn.getEnumSource(
            me.col.enumName || me.col.enum
          ),
          source = [];

        //c?? 1 s??? enum thi??u resource ho???c nh?? enum refType kh??ng ph???i m??n h??nh n??o c??ng hi???n th??? h???t -> ch??? l???c hi???n th??? nh???ng c??i n??o c?? resource th??i
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          if (item.enumText.indexOf("i18nEnum.") === 0) {
            continue;
          }

          source.push(item);
        }
        me.storeEnums[me.col.enumName || me.col.enum] = source;
      }
      me.dataSource = me.storeEnums[me.col.enumName || me.col.enum];
      me.filterStore.loadData(me.dataSource);
    },

    /**
     * C???p nh???t gi?? tr??? filter khi click v??o n??t l???c
     * N???u enum c?? gi?? tr??? all v?? ??ang ch???n th?? set = null ????? kh??ng l???c
     * TDNGHIA 15/10/2021
     */
    submitFilter() {
      const me = this;
      me.col.filter.operator =
        me.filterValue == -1
          ? me.$ms.enum.FilterHeader.NotEquals
          : me.filterOperator;

      let enu = me.$ms.enum[me.col.enumName || me.col.enum];

      me.col.filter.value = me.filterValue;
    },

    /**
     * Ki???m tra d??? li???u nh???p v??o c?? h???p l??? kh??ng
     * TDNGHIA 15/10/2021
     */
    isValid() {
      const me = this;

      //   if (me.filterValue == null) {
      //     return false;
      //   }
      //  Gi?? tr??? chu???n r???i kh??ng c???n validate n???a
      //   return this.$refs.cboFilter.validate();
      return me.filterValue == null ? false : true;
    },

    /**
     * click v??o 1 b???n ghi g???i filter
     * TDNGHIA 15/10/2021
     */
    itemOnClick(selected) {
      const me = this;

      me.filterValue = selected[me.filterValueField];

      me.filterClick();
    },

    /**
     * Check xem c?? ??ang ch???n item n??y kh??ng
     * TDNGHIA 15/10/2021
     */
    isSelected(selected) {
      const me = this;

      return me.filterValue === selected[me.filterValueField] ? true : false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msThOption.scss";

::v-deep .arrow {
  background-color: white;
  height: 15px;
  width: 15px;
  position: absolute;
  box-shadow: -3px -11px 11px rgb(0 0 0 / 8%);
  top: -8px;
  left: 33px;
  transform: rotate(45deg);
}

::v-deep.condition-container {
  padding: 10px 6px;
  width: 150px;
  .filter-container {
    margin-top: 0;
    .filter-value {
      margin-top: 0;
    }
  }
}

::v-deep .state-item {
  height: 36px;
  border-radius: 4px;
  padding: 10px 14px;
  &.active {
    background-color: #eff1f6;
  }
  &:hover {
    cursor: pointer;
    background-color: #eff1f6;
  }
}
</style>
