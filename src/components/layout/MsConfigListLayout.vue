<template>
  <ms-popup
    :active.sync="active"
    class="detail-popup is-right"
    :width="720"
    :is-right="true"
    :is-resizable="true"
    @close="hide"
    @shortkeyAction="shortkeyAction"
  >
    <template slot="header">
      {{ title }}
    </template>
    <template slot="sub-header" />
    <template slot="content">
      <div
        v-if="!isBuildLayout"
        id="loading-bg"
      >
        <div class="loading">
          <div class="effect-1 effects" />
        </div>
      </div>
      <div
        v-show="isBuildLayout"
        class="container-body"
      >
        <div
          v-if="!hasCustomFieldConfig"
          class="popup-data flex"
        >
          <div
            v-show="isBuildLayout"
            class="flex popup-util"
          >
            <div class="w-50 mrb">
              <!-- <div class="title-layout">{{title}}</div> -->
              <div class="flex search">
                <ms-input
                  v-model="textInputSearch"
                  :placeholder="$t('i18nSY.SearchByKeyWord')"
                  left-icon="search"
                  class="w-1/2 remain-focus-when-enter"
                  @change="onChangeSearch"
                />
              </div>
            </div>
            <div
              v-if="false"
              class="w-50 button-showLayout"
            >
              <div
                class="show-layout-info text-right"
                @click="showLayoutInfo"
              >
                {{ $t('i18nSY.EditColumnNameAndWidth') }}
              </div>
            </div>
          </div>
          <div class="grid flex-grow content-grid">
            <ms-grid-editor
              ref="grdConfig"
              :columns="gridPropertiesColumns"
              :data="gridColumnConfigStore"
              :resize-col="false"
              :data-dragable="true"
            />
          </div>
          <div
            v-show="false"
            class="layout-setting-btn"
          >
            <div class="show-more">
              <span
                v-if="isShowLimitData"
                class="show-more-btn"
              >{{ labelLimitData }}</span>
            </div>
            <!-- <div class="custom-field-setting-btn" @click="openSetting(true)">
							{{$t('i18nSY.CustomFieldDataFormatSetting')}}
						</div> -->
          </div>
        </div>
        <ms-collapse v-if="hasCustomFieldConfig">
          <ms-collapse-item open>
            <div
              slot="header"
              class="font-bold"
            >
              {{ $t('i18nColumn.CustomFieldBase') }}
            </div>
            <div class="popup-data flex">
              <div
                v-show="isBuildLayout"
                class="flex popup-util"
              >
                <div class="w-50 mrb">
                  <!-- <div class="title-layout">{{title}}</div> -->
                  <div class="flex search">
                    <ms-input
                      v-model="textInputSearch"
                      :placeholder="$t('i18nSY.SearchByKeyWord')"
                      left-icon="search"
                      class="w-1/2 remain-focus-when-enter"
                      @change="onChangeSearch"
                    />
                  </div>
                </div>
                <div
                  v-if="false"
                  class="w-50 button-showLayout"
                >
                  <div
                    class="show-layout-info text-right"
                    @click="showLayoutInfo"
                  >
                    {{ $t('i18nSY.EditColumnNameAndWidth') }}
                  </div>
                </div>
              </div>
              <div class="grid flex-grow content-grid">
                <ms-grid-editor
                  ref="grdConfig"
                  :columns="gridPropertiesColumns"
                  :data="gridColumnConfigStore"
                  :resize-col="false"
                  :data-dragable="true"
                  class="grdConfig"
                />
              </div>
              <div
                v-show="false"
                class="layout-setting-btn"
              >
                <div class="show-more">
                  <span
                    v-if="isShowLimitData"
                    class="show-more-btn"
                  >{{ labelLimitData }}</span>
                </div>
                <!-- <div class="custom-field-setting-btn" @click="openSetting(true)">
									{{$t('i18nSY.CustomFieldDataFormatSetting')}}
								</div> -->
              </div>
            </div>
          </ms-collapse-item>
          <ms-collapse-item>
            <div
              slot="header"
              class="font-bold"
            >
              {{ $t('i18nColumn.CustomField') }}
            </div>
            <div class="popup-data flex">
              <div
                v-show="isBuildLayout"
                class="flex popup-util"
              >
                <div class="w-50 mrb">
                  <!-- <div class="title-layout">{{title}}</div> -->
                  <div class="flex search">
                    <ms-input
                      v-model="textInputSearchCustomField"
                      :placeholder="$t('i18nSY.SearchByKeyWord')"
                      left-icon="search"
                      class="w-1/2 remain-focus-when-enter"
                      @change="onChangeSearchCustomField"
                    />
                  </div>
                </div>
                <div
                  v-if="false"
                  class="w-50 button-showLayout"
                >
                  <div
                    class="show-layout-info text-right"
                    @click="showLayoutInfo"
                  >
                    {{ $t('i18nSY.EditColumnNameAndWidth') }}
                  </div>
                </div>
              </div>
              <div class="grid flex-grow content-grid">
                <ms-grid-editor
                  ref="grdConfigCustomField"
                  :columns="gridPropertiesColumns"
                  :data="gridColumnCustomFieldConfigStore"
                  :resize-col="false"
                  :data-dragable="true"
                  pagination
                  query-mode="local"
                  :page-size="20"
                  :page-total="gridColumnCustomFieldConfigStore.length"
                  @datasorted="datasortedDataCustomField"
                />
              </div>
              <div
                v-show="false"
                class="layout-setting-btn"
              >
                <div class="show-more">
                  <span
                    v-if="isShowLimitData"
                    class="show-more-btn"
                  >{{ labelLimitData }}</span>
                </div>
                <!-- <div class="custom-field-setting-btn" @click="openSetting(true)">
									{{$t('i18nSY.CustomFieldDataFormatSetting')}}
								</div> -->
              </div>
            </div>
          </ms-collapse-item>
        </ms-collapse>
      </div>
    </template>
    <template slot="footer">
      <div class="flex-row">
        <div class="flex-grow">
          <div class="left-group-button-popup flex">
            <ms-button
              type="secondary"
              style="margin-right: 10px"
              :text="$t('i18nCommon.command.cancel')"
              @click="hide"
            />
            <!-- <template v-if=" _env === 'development'">
							<ms-button type="secondary" @click="toggleDevMode">Đang ở chế độ {{ mode }}</ms-button>
							<ms-checkbox v-model="isAutoGenScript" class="m-l-8">Tự tạo script khi cất</ms-checkbox>
						</template> -->
          </div>
        </div>
        <div class="flex" />
        <div class="right-group-button-popup flex-row">
          <div class="first-right-button mr-5">
            <ms-button
              type="secondary"
              :text="$t('i18nSY.GetDefaultLayout')"
              @click="getDefaultLayout"
            />
          </div>
          <div class="second-right-button">
            <ms-button
              v-tooltip="mapShortkeyTooltip('Save')"
              radius="2px"
              shortkey-target="Save"
              :text="$t('i18nCommon.command.save')"
              @click="saveLayout"
            />
          </div>
        </div>
      </div>
    </template>
  </ms-popup>
</template>
<script>
import BaseDetailPopup from "@/views/base/BaseDetailPopup";
import { mapState, mapActions, mapGetters } from "vuex";
import msGridEditor from "@/components/msgrideditor/msGridEditor.vue";
import api from "@/apis/system/layoutTemplateAPI";
import msJson from '@/commons/json';
import { ModuleLayoutTemplate } from "@/stores/module-const";
import { shortkeyStatusbar } from '@/mixins/common/shortkeyStatusbar';
import MsCollapse from '@/components/ms-collapse/MsCollapse.vue';
import MsCollapseItem from '@/components/ms-collapse/MsCollapseItem.vue';
import customFieldApi from "@/apis/system/customFieldAPI";

export default {
    components: {msGridEditor,MsCollapse,MsCollapseItem},
	mixins: [shortkeyStatusbar],
	props: {
		customLayout: {}
	},
    data() {
        const me = this;

        return {
			module: ModuleLayoutTemplate,
			title: me.$t("i18nCommon.layoutConfig"),
            /**
			 * Hiển thị hướng dẫn dùng layout
			 */
			isShowGuide: false,
			/**
			 * Tự động sinh script khi cất
			 */
			isAutoGenScript: true,
			/**
			 * Hiện nút Ẩn bớt hay Hiển thị thêm
			 */
			isShowLimitData: true,
			/**
			 * Bật tắt popup sửa mẫu
			 */
			active: false,

			/**
			 * Danh sách cấu hình các cột
			 */
			gridListColumns: [],

			/**
			 * Bật tắt chế độ dev/customer cho custom layout
			 * mặc định false là chế độ khách hàng
			 */
			devMode: false,
			/**
			 * Biến xác định là Layout của Grid đã được build xong chưa?
			 */
			isBuildLayout: true,

			/**
			 * Biến lưu template mẫu để gửi lên server
			 */
			layout: {},
			/**
			 * Biến hiển thị tên cột hiển thị và độ rộng.
			 * Mặc định là ẩn đi
			 */
			isShowLayoutInfo: false,

			/**
			 * Biến xem có phải là nút lấy mẫu mặc định không
			 */
			isGetDefaultLayout: false,

			/**
			 * Label cho chức năng giới hạn data
			 */
			labelLimitData: this.$t('i18nSY.ShowMoreData'),
			/**
			 * Giá trị cột cần tìm kiếm
			 */
			textInputSearch: '',
			/**
			 * Giá trị cột cần tìm kiếm (đối với tìm thông tin khác)
			 */
			textInputSearchCustomField: '',
			/**
			 * Cấu hình data của grid layout trên popup
			 * (Đồng thời là cấu hình column của grid list voucher)
			 */
			gridColumnConfigStore: [],
			/**
			 * Cấu hình data của grid layout trên popup (thông tin khác)
			 */
			gridColumnCustomFieldConfigStore: [],
			gridColumnCustomFieldConfigStoreClone: [],
			/**
			 * Xác định môi trường layout hiện tại
			 */
			mode: 'dev',
			/**
			 * Tag định nghĩa layout
			 */
			layoutTag: null,
			/**
			 * Grid cần config layout
			 */
			parentGrid: null,

			/**
			 * form list
			 */
			parent: null,

			/**
			 * Column full của Grid form cấu hình
			 */
			gridPropertiesColumnsShowFull:
			[
				{
					columnType: me.$ms.enum.ColumnType.Checkbox,
					dataField: 'visible',
					titleAlign: 'center',
					caption: this.$t('i18nSY.ColumnView'),
					hasCheckAll: true,
					width: 20,
					isResize: false,
					dataFormat: 'checkbox',
					tooltip: this.$t('i18nSY.ColumnView'),
					visible: true,
				},

				{
					caption: this.$t('i18nSY.ColumnDataName'),
					dataField: 'definition',
					width: 150,
					isResize: true,
					columnType: me.$ms.enum.ColumnType.Text,
					tooltip: this.$t('i18nSY.ColumnDataName'),
					visible: true,
					readOnly: true,
				},
				{
					caption: this.$t('i18nSY.ColumnInUI'),
					dataField: 'caption',
					width: 150,
					isResize: false,
					columnType: me.$ms.enum.ColumnType.Text,
					tooltip: this.$t('i18nSY.ColumnInUI'),
					visible: true,
				},
				{
					dataField: 'width',
					caption: this.$t('i18nSY.ColumnWidth'),
					width: 120,
					isResize: false,
					columnType: me.$ms.enum.ColumnType.Number,
					min:30,
					max:1000,
					tooltip: this.$t('i18nSY.ColumnWidth'),
					visible: true,
				},
				{
					dataField: 'isLock',
					columnType: me.$ms.enum.ColumnType.Checkbox,
					caption: this.$t('i18nSY.ColumnFixed'),
					isResize: false,
					width: 50,
					align: 'center',
					tooltip: this.$t('i18nSY.ColumnFixed'),
					visible: true,
				},
			],
			hasCustomFieldConfig: false
        }
    },
    computed: {

    },
    watch: {

    },
    created() {
        const me = this;
        me.gridPropertiesColumns = [
			{
				columnType: me.$ms.enum.ColumnType.Checkbox,
				dataField: 'visible',
				titleAlign: 'center',
				caption: this.$t('i18nSY.ColumnView'),
				hasCheckAll: true,
				width: 20,
				isResize: false,
				dataFormat: 'checkbox',
				tooltip: this.$t('i18nSY.ColumnView'),
				visible: true,
			},
			{
				caption: this.$t('i18nSY.ColumnInUI'),
				dataField: 'caption',
				width: 200,
				isResize: false,
				columnType: me.$ms.enum.ColumnType.Text,
				tooltip: this.$t('i18nSY.ColumnInUI'),
				visible: true,
			},
			{
				dataField: 'width',
				caption: this.$t('i18nSY.ColumnWidth'),
				width: 100,
				isResize: false,
				columnType: me.$ms.enum.ColumnType.Number,
				editorProperty:{
					propsData: {
						min:0,
						max:9999,
					}
				},
				align: 'right',
				tooltip: this.$t('i18nSY.ColumnWidth'),
				visible: true,
			},
			{
				dataField: 'lock',
				columnType: me.$ms.enum.ColumnType.Checkbox,
				caption: this.$t('i18nSY.ColumnFixed'),
				isResize: false,
				width: 50,
				align: 'center',
				tooltip: this.$t('i18nSY.ColumnFixed'),
				visible: true,
			},
		];
    },
    methods: {
		...mapActions({
			loadApplyLayout: ModuleLayoutTemplate + "/loadApplyDefault"
		}),
		...mapActions({
			updateLayout: ModuleLayoutTemplate + "/updateLayout"
		}),
		show(param, options){
			let me = this;
			me.isBuildLayout = false;
			//giữ lại option cho các tình huống cần sử dụng
			me.options = options;
			me.param = {};
			if (param) {
				Object.assign(me.param, param);
			}

			//reset cờ có dữ liệu thay đổi
			me.isChangeData = false;

			//show popup và gán data
			me.active = true;
			me.layout = param.layout;
			me.layoutTag = param.layout.LayoutTag;
			if(param.hasCustomFieldConfig){
				me.hasCustomFieldConfig = param.hasCustomFieldConfig;
			}
			let configColumns = [];
			let configColumnCustomField = [];
			if(param.layout.LayoutConfig){
				configColumns = msJson.deserialize(param.layout.LayoutConfig);
			}
			configColumns = configColumns || [];
			me.gridColumnConfigStore = configColumns.filter(i=>!i.dataField.contains('Custom_Field') && !i.customFieldType);
			configColumnCustomField = configColumns.filter(i=>i.dataField.contains('Custom_Field') && i.customFieldType);
			me.parent = param.parent;
			me.parentGrid = param.parent.grid;
			me.prepareBuildData();
			me.gridColumnConfigStoreClone = me.gridColumnConfigStore;
			//xử lý trước khi hiển thị
      		me.beforeShowPopup();
			me.isBuildLayout = true;
			let gridColumnCustomFieldConfigStore = [];

			customFieldApi.getListCustomfield().then(res=>{
				if(res && res.length > 0){
					res.forEach(item=>{
						gridColumnCustomFieldConfigStore.append(JSON.parse(item.CustomField));
					})
					gridColumnCustomFieldConfigStore = gridColumnCustomFieldConfigStore.filter(i=>!i.isDelete);
					if(configColumnCustomField && configColumnCustomField.length >0){
						configColumnCustomField.forEach(item=>{
							let check = gridColumnCustomFieldConfigStore.filter(i=>i.dataField == item.dataField);
							if(check && check.length >0){
								check[0].visible = item.visible;
								check[0].width = item.width;
								check[0].lock = item.lock;
								check[0].mappingSearch = item.mappingSearch;
								check[0].isExtData = item.isExtData;
								check[0].sort_order = item.sort_order;
								if(item.formatType == me.$ms.enum.FormatType.Date){
									check[0].align = "center";
								}
							}
						});
					}else{
						gridColumnCustomFieldConfigStore.forEach((item, index)=>{
							item.visible = false;
							item.width = item.formatType == me.$ms.enum.FormatType.Checkbox? 150: 200;
							item.lock = false;
							item.mappingSearch= `Asset|JSON_UNQUOTE(JSON_EXTRACT(ExtData, '$.${item.dataField}'))`;
							item.isExtData = true;
							item.sort_order = me.gridColumnConfigStore.length + index + 1;
							if(item.formatType == me.$ms.enum.FormatType.Date){
								item.align = "center";
							}
						})
					}
					gridColumnCustomFieldConfigStore.sort(function (a, b) { return a.sort_order - b.sort_order; });
					me.gridColumnCustomFieldConfigStore = gridColumnCustomFieldConfigStore;
					me.gridColumnCustomFieldConfigStoreClone = me.gridColumnCustomFieldConfigStore;
				}
			})
		},

		/**
		 * Hàm thực hiện trước khi showpopup
		 * Dùng để form tự overide lại theo nghiệp vụ tương ứng
		 * Created by NNLAM 22.02.2021
		 */
		beforeShowPopup() {
			let me = this;
			//todo
		},
		/**
		 * Hàm thực hiện compare data trước khi mở form
		 * Created by NNLAM 22.02.2021
		 */
		prepareBuildData(){
			let me = this;
			if(me.gridColumnConfigStore && Array.isArray(me.gridColumnConfigStore)){
				me.gridColumnConfigStore.forEach((item, index)=>{
					if(!item.definition){
						item.definition = item.caption;
					}
					item.sort_order = index;

					// nnlam: xóa các properties thừa
					delete item.IsSelected;
					delete item.__vKeyValue;
				})
			}
			// if(me.isShowLimitData){
			// 	me.gridColumnConfigStore
			// }
		},

		/**
		 * Tìm kiếm giá trị tên cột hiển thị ở trên popup
		 */
		onChangeSearch: _.debounce(function() {
			 const me = this;
			if (me.textInputSearch) {
				//me.$refs.grdConfig._props.loading = true
				let res = [];
				me.gridColumnConfigStoreClone.forEach(item => {
					var filterSearch = item.caption != null && item.caption.toLowerCase().includes(me.textInputSearch.toLowerCase().trim())
				if (filterSearch) {
					res.push(item);
				}
				});

				me.gridColumnConfigStore = res;
			} else {
				me.gridColumnConfigStore = me.gridColumnConfigStoreClone;
			}
			//me.$refs.grdConfig._props.loading = false
		}, 100),

		/**
		 * Tìm kiếm giá trị tên cột hiển thị ở trên popup (đối vs thông tin khác)
		 */
		onChangeSearchCustomField: _.debounce(function() {
			 const me = this;
			if (me.textInputSearchCustomField) {
				//me.$refs.grdConfig._props.loading = true
				let res = [];
				me.gridColumnCustomFieldConfigStoreClone.forEach(item => {
					var filterSearch = item.caption != null && item.caption.toLowerCase().includes(me.textInputSearchCustomField.toLowerCase().trim())
				if (filterSearch) {
					res.push(item);
				}
				});

				me.gridColumnCustomFieldConfigStore = res;
			} else {
				me.gridColumnCustomFieldConfigStore = me.gridColumnCustomFieldConfigStoreClone;
			}
			//me.$refs.grdConfig._props.loading = false
		}, 100),

		/**
		 * Lấy dữ liệu thông tin khác
		 */
		// async loadDataCustomField(payload, isCheckDone) {
		// 	let me = this;
		// 	customFieldApi.getListCustomfield().then(res=>{
		// 		if(res && res.length > 0){
		// 			res.forEach(item=>{
		// 				me.gridColumnCustomFieldConfigStore.append(JSON.parse(item.CustomField));
		// 				me.gridColumnCustomFieldConfigStoreClone.append(JSON.parse(item.CustomField));
		// 			})
		// 		}
		// 	})
		// },

		/**
		 * Hiển thị  thêm các cột để cấu hình cột
		 */
		showLayoutInfo() {
			this.isShowLayoutInfo = !this.isShowLayoutInfo;
			this.showColumnByLayoutInfoFn();
		},

		/**
		 * Ẩn hiện cột theo chức năng sửa tên cột hiện thị và độ rộng
		 * Created by NNLAM 22/02/2021
		 */
		showColumnByLayoutInfoFn() {
			let me = this;
			me.$refs.grdConfig.initColumns(me.isShowLayoutInfo?me.gridPropertiesColumnsShowFull: me.gridPropertiesColumns);
		},
		/**
		 * Lấy về mẫu ngầm định
		 * Created by NNLAM 22/02/2021
		 */
		async getDefaultLayout(){
			let me = this;
			me.isBuildLayout = false;
			let layout = await me.loadApplyLayout(me.layoutTag);
			if(layout){
				// Thực hiện deserialize về dạng array list
				me.gridColumnConfigStore = msJson.deserialize(layout.Columns);
				// Prepare lại data tránh trường hợp trường definition là null
				me.prepareBuildData();
				me.gridColumnConfigStoreClone = me.gridColumnConfigStore;
				// Gán lại data vào grid
				me.$refs.grdConfig.initData(me.gridColumnConfigStore);
				// Reset lại column form cấu hình
				me.isShowLayoutInfo = false;
				me.showColumnByLayoutInfoFn();
			}else{
				me.$toast.error(me.$t("i18nlayoutColumn.Error"));
			}
			let gridColumnCustomFieldConfigStore = [];
			customFieldApi.getListCustomfield().then(res=>{
				if(res && res.length > 0){
					res.forEach(item=>{
						gridColumnCustomFieldConfigStore.append(JSON.parse(item.CustomField));
					})
					gridColumnCustomFieldConfigStore.forEach((item, index)=>{
						item.visible = false;
						item.width = item.formatType == me.$ms.enum.FormatType.Checkbox? 150: 200;
						item.lock = false;
						item.mappingSearch= `Asset|JSON_UNQUOTE(JSON_EXTRACT(ExtData, '$.${item.dataField}'))`;
						item.isExtData = true;
						item.sort_order = me.gridColumnConfigStore.length + index + 1;
						if(item.formatType == me.$ms.enum.FormatType.Date){
							item.align = "center";
						}
					})
					me.gridColumnCustomFieldConfigStore = gridColumnCustomFieldConfigStore;
					me.gridColumnCustomFieldConfigStoreClone = gridColumnCustomFieldConfigStore;
				}
			})
			me.isBuildLayout = true;
		},
		datasortedDataCustomField(data){
			let me = this;
			data.forEach((item, index)=>{
				item.sort_order = me.gridColumnConfigStore.length + index + 1;
			})
		},
		/**
		 * Cất layout
		 * Created by NNLAM 22/02/2021
		 */
		async saveLayout(){
			let me = this;
			let columnsCustomField = [];
			let layoutCustomField = {};
			if(me.hasCustomFieldConfig){
				columnsCustomField = me.$refs.grdConfigCustomField.internalDataSource;
				columnsCustomField = me.compareColumnCustomFieldBeforeSave(columnsCustomField);
				layoutCustomField.LayoutConfig = msJson.serialize(columnsCustomField);
				layoutCustomField.Columns = layoutCustomField.LayoutConfig;
				columnsCustomField = me.parent.getLayoutColumn(layoutCustomField);
			}

			let columns  = me.$refs.grdConfig.datax;
			columns = me.compareColumnBeforeSave(columns);
			columns = columns.filter(i=>!i.dataField.contains('Custom_Field'));
			if(columnsCustomField.length>0){
				columns.append(columnsCustomField);
			}
			me.layout.LayoutConfig = msJson.serialize(columns);
			me.layout.Columns = me.layout.LayoutConfig;
			me.layout.UserID = me.layout.UserID||this.Context.UserID;
			columns = me.parent.getLayoutColumn(me.layout);

			me.parentGrid.initColumns(columns);
			let res = await me.updateLayout(me.layout);
			me.hide();
			me.parent.reload()

			//ntphong 13/5/2021 - xóa cache layout cũ
			if (me.parent && typeof me.parent.getCacheLayoutTemplateKey === 'function') {
				let cacheKey = me.parent.getCacheLayoutTemplateKey();
				if (cacheKey) {
					me.$ms.commonFn.removeLocalStorage(cacheKey);
				}
			}
		},
		/**
		 * Hàm compare
		 * thực hiện compare column trước khi cất
		 * Created by NNLAM 22.02.2021
		 *  */
		compareColumnBeforeSave(columns){
			let me = this;
			//nếu trường hợp search không ra bản ghi nào thì trả về column lúc đầu
			if(columns.length == 1 && !columns.dataField){
				return me.gridColumnConfigStoreClone;
			}
			//nếu search có ra bản ghi và chưa phải tất cả bản ghi thì compare
			if(columns.length != me.gridColumnConfigStoreClone.length){
				me.gridColumnConfigStoreClone.forEach(item=>{
					let mapColumn = columns.find(i=> i.dataField = item.dataField);
					if(mapColumn){
						item.visible = mapColumn.visible;
					}
				})
				columns = me.gridColumnConfigStoreClone;
			}
			return columns;
		},

		/**
		 * Hàm compare
		 * thực hiện compare column trước khi cất
		 * Created by NNLAM 22.02.2021
		 *  */
		compareColumnCustomFieldBeforeSave(columns){
			let me = this;
			//nếu trường hợp search không ra bản ghi nào thì trả về column lúc đầu
			if(columns.length == 1 && !columns.dataField){
				return me.gridColumnCustomFieldConfigStoreClone;
			}
			//nếu search có ra bản ghi và chưa phải tất cả bản ghi thì compare
			if(columns.length != me.gridColumnCustomFieldConfigStoreClone.length){
				me.gridColumnCustomFieldConfigStoreClone.forEach(item=>{
					let mapColumn = columns.find(i=> i.dataField = item.dataField);
					if(mapColumn){
						item.visible = mapColumn.visible;
					}
				})
				columns = me.gridColumnCustomFieldConfigStoreClone;
			}
			return columns;
		},

		/**
		 * Hàm đóng popup
		 * thực hiện chuyển giá trị hiện thị cho popup thành false
		 * Created by NNLAM 22.02.2021
		 *  */
		hide() {
			const me = this;
			me.active = false;

			me.$emit("close", this.isChangeData);
		},

    },
}
</script>

<style lang="scss" scoped>
    label {
        width: 180px;
    }
    .input-content{
        width: 315px;
    }
	.is-right{
		justify-content: flex-end;
		height: 100%;
		right: 0;
		left: auto;
	}
	::v-deep.right-menu-view{
		justify-content: flex-end;
		height: 100% !important;
		right: 0 !important;
		top: 0 !important;
		left: auto !important;
	}
	::v-deep.right-menu-view .ms-popup{
		height: 100%!important;
	}
	::v-deep.popup-content{
		height: calc(100% - 127px);
		overflow: hidden;
		position: relative;
		display: flex;

	}
	::v-deep.popup-content .container-body{
		flex: 1;
		width: 100%;
		height: 100%;
		display: flex;
		// overflow: auto;
	}
	.content-grid{
		display: flex;
		flex: 1;
		overflow: auto;
		height: calc(100% - 59px);
	}
	.popup-util{
		display: flex;
		.button-showLayout{
			vertical-align: middle;
			align-items: center;
			display: flex;
			align-content: center;
			margin-left: auto;
			.show-layout-info{
				margin-left: auto;
				color: #0075c0;
    			cursor: pointer;
			}
		}
	}
	.w-50{
		width: 50%;
	}
	.mr-5{
		margin-right: 5px;
	}
	::v-deep.ms-td.drag-data .move:before{
		cursor: move;
		cursor: grab;
		cursor: -moz-grab;
		cursor: -webkit-grab;
	}
	::v-deep.ms-td.drag-data .move:active{
		cursor: grabbing;
		cursor: -moz-grabbing;
		cursor: -webkit-grabbing;
	}
	.mrb{
		margin-bottom: 23px;
	}
	::v-deep.ms-td .editor-display {
		flex: 1;
		padding: 0 6px;
	}
	//@media (max-height: 768px) {
		::v-deep.ms-grid-viewer.grdConfig{
			max-height: 420px;
		}
		.ms-collapse{
			overflow: auto;
		}
	//}

</style>