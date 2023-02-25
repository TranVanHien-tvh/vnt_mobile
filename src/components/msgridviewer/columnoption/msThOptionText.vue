<template>
  <div
    v-if="isShow"
    ref="thFilter"
    class="condition-container text"
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
        <!-- <div class="filter-value">
					<ms-input
						:readOnly="operatorValueReadonly"
						v-model="filterValue"
						:placeholder="$t('i18nComponent.i18nHeaderOption.InputEmptyText')"
						@keydown.enter="inputEnter"
						class="w-full" />
				</div> -->
        <div class="filter-value">
          <autocomplete
            ref="autocomplete"
            v-model="filterValue"
            class="w-full"
            :placeholder="$t('i18nComponent.i18nHeaderOption.InputEmptyText')"
            :source="distributionGroupsEndpoint"
            input-class="form-control"
            :results-property="resultsProperty"
            :results-display="col.displayField?col.displayField:col.dataField"
            :results-value="col.dataField"
            :initial-display="filterValueDisplay?filterValueDisplay:filterValue"
            :initial-value="filterValue"
            :method="method"
            :request-headers="requestHeaders"
          >
            <!-- <template slot="lastResult">
							<li
								v-for="(result, key) in results"
								:key="key"
								@click.prevent="select(result)"
								class="autocomplete__results__item"
								:class="{'autocomplete__selected' : isSelected(key) }"
								v-html="formatDisplay(result)">
							</li>
						</template> -->
          </autocomplete>
        </div>
      </div>
    </div>

    <div
      v-show="filterable"
      class="buttons flex-row"
    >
      <ms-button
        class="btn primary ml-10"
        :text="$t('i18nComponent.i18nHeaderOption.FilterBtn')"
        @click="filterClick"
      />
      <ms-button
        class="btn secondary"
        :text="$t('i18nComponent.i18nHeaderOption.ResetBtn')"
        @click="resetClick"
      />
    </div>
  </div>
</template>
<script>
import msThOptionBase from "@/components/msgridviewer/columnoption/msThOptionBase.js";
import Autocomplete from 'vuejs-auto-complete';
import BaseAPI from '@/apis/base/baseAPI';
import MSStore from "@/stores/msstore";
import storeToken from '@/stores/store';
import { log } from 'util';
import msValidate from "@/components/msValidate/msValidate.vue";
export default {
	name: "MsThOptionText",
  	components: {
    	Autocomplete,msValidate
  	},
  	extends: msThOptionBase,
	props: {},
	data() {
		let me = this,
		operators;

		// nnlam - 17/17/2021
		if (me.col && me.col.hasOwnProperty("operators") && Array.isArray(me.col.operators) && me.col.operators.length > 0) {
			operators = me.col.operators;
		} else {
			operators = [
				me.$ms.enum.FilterHeader.Null,
				me.$ms.enum.FilterHeader.NotNull,
				me.$ms.enum.FilterHeader.Equals,
				me.$ms.enum.FilterHeader.NotEquals,
				me.$ms.enum.FilterHeader.Contains,
				me.$ms.enum.FilterHeader.Notcontains,
				me.$ms.enum.FilterHeader.StartsWith,
				me.$ms.enum.FilterHeader.EndsWith
			];
		}

		return {
			filterValue: '',
			filterOperator: '',
			defaultFilterOperator: me.$ms.enum.FilterHeader.Contains,
			operators: operators,
			requestHeaders: {
				'Content-Type': 'application/json'
			},
			method: 'post',
			resultsProperty: 'PageData',
			// store: new MSStore(
			// {
			// 	proxy: {
			// 		apiUrl: assetAPI.getAPIUrl() + '/list',
			// 		method: 'POST'
			// 	},
			// 	columns: 'AssetCode',
			// 	autoLoad: true,
			// 	remoteFilter: true,
			// })
		};
	},
	computed: {

	},
	watch:{
		operatorValueReadonly(newValue) {
			if(newValue){
				if(this.$refs.autocomplete){
					this.$refs.autocomplete.$el.querySelector('input').setAttribute('readOnly',true);
				}
			}else{
				if(this.$refs.autocomplete){
					this.$refs.autocomplete.$el.querySelector('input').removeAttribute('readOnly');
				}
			}
		}
	},
	created(){
		let me = this;
	},
	updated(){
		let that = this;

		//đây là đoạn custom event của thư viện autocomplete, cụ thể hãy đọc code tại https://github.com/charliekassel/vuejs-autocomplete/blob/master/src/components/Autocomplete.vue
		if(that.$refs.autocomplete){

			that.$refs.autocomplete.search =  _.debounce(function() {
				let me = that.$refs.autocomplete;
				me.selectedIndex = null;
				me.$emit('input', me.value);
				me.selectedDisplay = me.display;
				console.log(me.display);
				//me.selectedIndex = null
				switch (true) {
					case typeof me.source === 'string':
						return me.resourceSearch(me.source)
					case typeof me.source === 'function':
						// No resource search with no input
						return me.resourceSearch(me.source(me.display))
					case Array.isArray(me.source):
						return me.arrayLikeSearch()
					default:
						throw new TypeError()
				}
			},300);
			that.$refs.autocomplete.resourceSearch = function (url) {
				let me = this || that.$refs.autocomplete;
				if(that.ownerForm.$parent.queryMode == 'local'){
					me.arrayLikeSearch();
				}else{
					that.filterValue = me.display;
					me.value = me.display;
					// if (!me.display) {
					// 	me.results = []
					// 	return
					// }
					me.loading = true
					me.setEventListener()
					me.request(url)
				}
			},
			that.$refs.autocomplete.arrayLikeSearch  = function (url) {
				let me = this || that.$refs.autocomplete;
				me.setEventListener()

				if (!me.display) {
					me.results = me.source;
					me.$emit('results', {results: me.results});
					me.loading = false;
					return true;
				}
				me.results = me.source().filter((item) => {
					return me.formatDisplay(item).toLowerCase().includes(me.display.toLowerCase())
				})
				me.$emit('results', {results: me.results})
				me.loading = false
			},
			that.$refs.autocomplete.request = function(url){
				let me = this || that.$refs.autocomplete;
				
				let promise = fetch(url, {
					method: me.method,
					headers: {
						'Content-Type': 'application/json',
					},
					body: that.getPayload(me.display)
				})
				return promise
					.then(response => {
						if (response.ok) {
							me.error = null
							return response.json()
						}
						throw new Error('Network response was not ok.')
					})
					.then(response => {
						me.results = me.setResults(response)
						me.emitRequestResultEvent()
						me.loading = false
					})
					.catch(error => {
						me.error = error.message
						me.loading = false
					})
			};
			that.$refs.autocomplete.enter = function(){
				let me = this || that.$refs.autocomplete;
				if (me.selectedIndex === null) {
					me.close();
					me.$emit('close');
					return
				}
				me.select(me.results[me.selectedIndex]);
				me.$emit('enter', me.display);
				me.selectedIndex = null;
			};
			/**
			 * Select a result
			 * @param {Object}
			 */
			that.$refs.autocomplete.select   = function(obj) {
				let me = this || that.$refs.autocomplete;
				if (!obj) {
					return
				}
				me.value = (me.resultsValue && obj[me.resultsValue]) ? obj[me.resultsValue] : obj.id
				me.display = me.formatDisplay(obj).replace("&lt;","<").replace("&gt;",">");
				me.selectedDisplay = me.display
				me.$emit('selected', {
					value: me.value,
					display: me.display,
					selectedObject: obj
				})
				me.$emit('input', me.value)
				me.close()
			};
			/**
			 * Clear all values, results and errors
			 */
			// that.$refs.autocomplete.clear = function() {
			// 	let me = this || that.$refs.autocomplete;
			// 	me.display = null;
			// 	me.value = null;
			// 	me.results = null;
			// 	me.error = null;
			// 	that.filterValue = null;
			// 	me.$emit('clear');
			// 	me.focus();
			// };
		}
	},

 	methods: {

		// beforeShow() {
		// 	this.store.loadPage(1);
		// },
		distributionGroupsEndpoint(){
			const me = this;
			if(me && me.ownerForm.$parent.queryMode == 'local'){
				me.resultsProperty = null;
				let data = [], source = [];
				if(me.ownerForm && me.ownerForm.$parent){
					source = me.ownerForm.$parent.datax || me.ownerForm.$parent.internalDataSource || [];
				}
				source.forEach(item=>{
					if(me.col.filter.value){
						if(item[me.col.dataField] && item[me.col.dataField].toLowerCase().contains(me.col.filter.value.toLowerCase())){
							let check = data.filter(i=>i[me.col.dataField] == item[me.col.dataField]);
							if(check.length == 0){
								data.push(item);
							}
						}
					}else{
						if(item[me.col.dataField]){
							let check = data.filter(i=>i[me.col.dataField] == item[me.col.dataField]);
							if(check.length == 0){
								data.push(item);
							}
						}
					}
				})
				return data;
			}
			let moduleDefault = me.ownerForm.$parent.$parent.module ? me.ownerForm.$parent.$parent.module : 'asset';
			if(me.moduleAutocomplete){
				moduleDefault = me.moduleAutocomplete;
			}
			return window._apis['Business'] + '/'+ moduleDefault + '/autocomplete';
		},

		getPayload(display){
			let me = this,payload = {};
			payload.take = 20;
			payload.Sort = me.col.dataField +" ASC";
			payload.columns = me.col.dataField;
			payload.mappingSearch = me.col.mappingSearch;
			payload.viewName = me.col.viewName;
			if(display){
				payload.filter = '[["' + me.col.dataField + '","contains","' + display + '"]]';
			}else{
				payload.filter = '[["' + me.col.dataField + '","is not null",""]]';
			}
			return JSON.stringify(payload);
		}
  	}
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msThOption.scss";
</style>
