<template>
  <div
    v-if="isShow"
    class="condition-container enum"
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
        <div class="filter-value">
          <ms-combobox
            ref="cboFilter"
            v-model="filterValue"
            query-mode="local"
            :display-field="filterDisplayField"
            :value-field="filterValueField"
            :data="dataSource"
            :placeholder="$t('i18nComponent.i18nHeaderOption.InputEmptyText')"
            :title="col.tooltip || col.title || col.definition || col.caption"
            :is-show-text="false"
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
import MSStore from "@/stores/msstore";
export default {
  name: "MsThOptionEnum",
  components: {msValidate},
  extends: msThOptionBase,
  props: {},
  data() {
    let me = this, operators;

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
        me.$ms.enum.FilterHeader.NotEquals
      ];
    }

    return {
      filterOperator: me.$ms.enum.FilterHeader.Equals,
      defaultFilterOperator: me.$ms.enum.FilterHeader.Equals,
      operators: operators,
      filterStore:new MSStore(),
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
    }
  },
  created() {
    this.storeEnums = {};
  },
  methods: {
    /**
     * Hi???n th??? option
     */
    beforeShow() {
      const me = this;
      //C???p nh???t store theo enum
      if(this.col.hasActionFilter){
        me.filterValue = me.col.filter.value;
        me.filterOperator = me.col.filter.operator;
      }else{
         me.filterValue = me.defaultFilterValue;
         me.filterOperator = me.defaultFilterOperator;
      }
      if (typeof me.col.customEnumData === "function") {
        me.storeEnums[me.col.enumName || me.col.enum] = me.col.customEnumData();
      } else if (typeof me.col.customEnumSource === "function") {
        let temp = me.col.customEnumSource();
        me.storeEnums[me.col.enumName || me.col.enum] = temp.getData();
      } else if (!me.storeEnums[me.col.enumName || me.col.enum]) {
        let data = me.$ms.commonFn.getEnumSource(me.col.enumName || me.col.enum),
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
      //me.callParent("beforeShow");

      // me.filterOperator = me.col.filter.operator;
      // me.filterValue = me.col.filter.value;
      // //N???u enum c?? gi?? tr??? All -> g??n l???i m???c ?????nh = all thay v?? null
      // let enu = me.$ms.enum[me.col.enumName];
      // if (enu && enu.hasOwnProperty('All')) {
      // 	me.isDefaultAll = true;
      // 	me.defaultFilterValue = enu.All;

      // 	if (me.col.filter.value === null) {
      // 		me.filterValue = me.defaultFilterValue;
      // 	}
      // } else {
      // 	me.defaultFilterValue = null;
      // }
    },
    // /**
    //  * Ki???m tra c?? thay ?????i filter so v???i l??c m??? form l??n kh??ng
    //  * Th??m x??? l?? ??i???u ki???n all v?? null
    //  */
    // checkChangeFilter() {
    // 	const me = this;
    // 	if (me.col.filter.operator !== me.filterOperator) {
    // 		return true;
    // 	}

    // 	if (me.col.filter.value !== me.filterValue) {
    // 		if (!me.isDefaultAll) {
    // 			return true;
    // 		}

    // 		if ((me.col.filter.value !== null || me.col.filter.value !== me.defaultFilterValue)
    // 			&& me.filterValue !== me.defaultFilterValue) {
    // 				return true;
    // 			}
    // 	}

    // 	return false;
    // },
    /**
     * C???p nh???t gi?? tr??? filter khi click v??o n??t l???c
     * N???u enum c?? gi?? tr??? all v?? ??ang ch???n th?? set = null ????? kh??ng l???c
     */
    submitFilter() {
      const me = this;
      me.col.filter.operator = me.filterOperator;

      let enu = me.$ms.enum[me.col.enumName || me.col.enum];
      if (
        enu &&
        (enu.hasOwnProperty("All") && enu.All === me.filterValue)
        // || me.filterValue === -1
      ) {
        me.col.filter.value = null;
      } else {
        me.col.filter.value = me.filterValue;
      }
    },

    /**
     * Ki???m tra d??? li???u nh???p v??o c?? h???p l??? kh??ng
     */
    isValid() {
      return this.$refs.cboFilter.validate();
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msThOption.scss";
</style>
