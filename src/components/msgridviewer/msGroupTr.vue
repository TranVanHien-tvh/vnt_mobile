<template>
  <tr
    class="ms-tr"
    tabindex="0"
  >
    <td
      v-if="serial"
      class="ms-td serial text-center"
    >
      {{ index+1 | formatRomanize }}
    </td>
    <td
      v-for="(col,colIndex) in columns"
      :key="col.dataField"
      class="ms-td"
      :style="styleWidth(col,false)"
    >
      <div
        v-if="colIndex == 0"
        class="flex items-center"
      >
        <div
          class="mi mi-16"
          :class="{'mi-expand':!expanded,'mi-collspan':expanded}"
          @click="expand"
        />
        <div>{{ dataRow[groupField] }}</div>
      </div>
    </td>
    <td
      v-if="widgetOptions"
      class="ms-td widget-item"
      :style="styleWidth(widgetOptions,true)"
    />
  </tr>
</template>
<script>
import msTr from './msTr';
import Vue from 'vue';
import i18n from '@/i18ns/i18n';

export default {
	name: 'MsTr',
	props: {
		//Lưu thông tin của các cột
		columns: {},
		//Lưu dữ liệu của dòng
		dataRow: {},
		//Lưu cấu hình của cột chức năng
		widgetOptions: {},
		//Ẩn/hiện cột checkbox tích chọn nhiều cột
		multiple: {
			default: false,
			type: Boolean
		},
		//Trạng thái tích chọn ở cột multiple
		isSelected: {
			default: false,
			type: Boolean
		},
		index: {
			default: null,
			type: Number
		},
		serial: {
			default: false,
			type: Boolean
		},
		isChart: {
			default: false,
			type: Boolean
		},
		currentPage: {
			default: 1,
			type: Number
		},
		pageSize: {
			default: 20,
			type: Number
		},
		groupField: {
			default: null,
			type: String
		},
		loadChildrenData: {
			default: null
		}
	},
	data() {
		return {
			expanded: false,
			childrenData: [],
			childrenInstance: []
		};
	},
	computed: {},
	updated() {
		const me = this;
	},
	methods: {
		styleWidth(col, widget) {
			const me = this;
			let width = col._width;
			if (widget) {
				width = col.width;
				if (me.columns && me.columns.length == 0) {
					return { 'min-width': `${width}px` };
				}
				return { width: `${width}px`, 'min-width': `${width}px` };
			} else {
				if (col.autoResize || (me.columns && me.columns.length <= 1)) {
					return { 'min-width': `${width}px` };
				} else {
					return { width: `${width}px`, 'min-width': `${width}px` };
				}
			}
		},
		async expand() {
			const me = this;
			await me.buildChildRow();
			me.expanded = !me.expanded;
			if (me.expanded == true) {
				me.childrenInstance.forEach(ins => {
					ins.isRender = true;
				});
			} else {
				me.childrenInstance.forEach(ins => {
					ins.isRender = false;
				});
			}
		},
		async buildChildRow() {
			const me = this;
			if (me.childrenData && me.childrenData.length == 0) {
				let params = {};
				params[me.groupField] = me.dataRow[me.groupField];
				if (me.loadChildrenData && typeof me.loadChildrenData == 'function') {
					me.childrenData = await me.loadChildrenData(params);
				}
				for (let i = me.childrenData.length - 1; i >= 0; i--) {
					let TrChild = Vue.extend(msTr);
					let insTr = new TrChild({
						propsData: {
							...me.$props,
							dataRow: me.childrenData[i],
							index: i
						},
						i18n
					});
					insTr.vm = insTr.$mount();
					insTr.isRender = false;
					me.addEventHandler(insTr);
					me.$el.parentNode.insertBefore(insTr.$el, me.$el.nextSibling);
					me.childrenInstance.push(insTr);
				}
			}
		},
		addEventHandler(insTr) {
			const me = this;
			insTr.$on('widgetEvent', me.widgetEvent);
			insTr.$on('row_click', me.row_click);
			insTr.$on('row_focus', me.row_focus);
			insTr.$on('row_dblclick', me.row_dblclick);
			insTr.$on('row_keydown', me.row_keydown);
			insTr.$on('checkMultiple', me.checkMultiple);
		},
		//Emit sự kiện từ widget ra ngoài
		// Created by LTDAT (16.06.2020)
		widgetEvent(data, event) {
			const me = this;
			me.$emit('widgetEvent', data, event);
		},
		//Emit sự kiện click row ra ngoài grid
		//Created by LTDAT(13/06/2020)
		row_click(e) {
			const me = this;
			me.$emit('click', me.dataRow, e);
		},
		row_focus(e) {
			const me = this;
			me.$emit('focus', me.dataRow, e);
		},
		//Emit sự kiện dblclickRow ra ngoài grid
		//Created by LTDAT(13/06/2020)
		row_dblclick(e) {
			const me = this;
			me.$emit('dblclick', me.dataRow, e);
		},
		//Emit sự kiện ấn phím ra ngoài grid
		//Created by LTDAT(13/06/2020)
		row_keydown(e) {
			const me = this;
			me.$emit('keydown', me.dataRow, e);
		},
		//Sự kiện click vào nút chọn ở cột multiple
		//Created by LTDAT (28.05.2020)
		checkMultiple(event) {
			const me = this;
			me.$emit('clickMultiple', me.dataRow);
		}
	}
};
</script>
<style lang="scss" scoped>
// @media screen and (max-width: 1366px) {
// 	@import '@/assets/scss/_sm-variables.scss';
// 	@import '@/assets/scss/components/msTrViewer.scss';
// }
// @media screen and (min-width: 1367px) {
// 	@import '@/assets/scss/_variables.scss';
// 	@import '@/assets/scss/components/msTrViewer.scss';
// }

@import '@/assets/scss/_variables.scss';
	@import '@/assets/scss/components/msTrViewer.scss';
</style>