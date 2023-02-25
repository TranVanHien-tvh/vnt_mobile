<template>
  <div class="print-parameter">
    <!-- popup tham số mẫu in -->
    <ms-popup
      :active.sync="isShow"
      width="350px"
      style="z-index: 101"
      :show-help="false"
      @closePopup="closePopup"
    >
      <!-- @shortkeyAction="shortkeyAction" -->
      <template slot="header">
        <div class="header-popup">
          <div class="title-popup">
            {{ $t('I18nRP.PrintPreview.ChooseParam') }}
          </div>
        </div>
      </template>
      <template slot="content">
        <div class="right-popup-content">
          <div class="choose-parameter-container">
            <div class="flex">
              <ms-combo-box2
                ref="storeUnitCombo"
                v-model="p_unit_type"
                class="cbb-unit-type"
                :title="$t('I18nRP.PrintPreview.PrintBy')"
                :store="storeUnit"
                query-mode="local"
                display-field="unit_name"
                value-field="unit_type"
              />
            </div>
          </div>
        </div>
      </template>
      <template slot="footer">
        <div class="group-button-popup flex">
          <div class="ms-footer-left flex flex-grow">
            <ms-button
              class="add-button popup-button-right mt-3"
              type="secondary"
              @click="closePopup"
            >
              {{ $t('I18NCommon.Cancel') }}
            </ms-button>
          </div>

          <div class="right-group-button flex">
            <ms-button
              class="add-button popup-button-left mt-3"
              @click="submitChoosePrintParam"
            >
              {{ $t('I18NCommon.Agree') }}
            </ms-button>
          </div>
        </div>
      </template>
    </ms-popup>
  </div>
</template>

<script>
import MSStore from '@/api/store';
import optionAPI from '@/api/SYS/SYSDbOptionAPI';
import BaseFormDialog from '@/views/Base/BaseFormDialog.vue';
import { UnitConvert } from '@/common/commonSource';
import { MSEnum } from '@/common/enumeration';

/**
 * Preview báo cáo
 */
export default {
	name: 'MsPrintParameter',
	components: {},
	extends: BaseFormDialog,
	props: {
		showPrintParameter: {
			type: Boolean,
			default: false
		},
	},

	data() {
		const me = this;
		return {
			// End bổ sung số lô và hạn sử dụng
			// Store chứa dữ liệu của combo `In phiếu xuất theo`
			storeUnit: new MSStore({
				data: UnitConvert
			}),

			/**
			 * Tham số Mẫu in: Đơn vị tính
			 */
			p_unit_type: 0,

			isShow: false
		};
	},

	watch: {
		isShow(value) {
			let me = this;
			me.$emit('update:showPrintParameter', value);
		},

		//commented by dvquan: chưa show cho đến khi iframe load xong
		showPrintParameter() {
			this.isShow = this.showPrintParameter;
		},
	},

	//Xử lý sau khi render giao diện xong
	mounted() {},

	created() {
		let me = this;

		// Gọi đến láy dữ liệu đơn vị tính và thêm vào store
		let url = optionAPI.apiList.DIAPI + '/unit_get/getMaxUnitConvert';
		optionAPI
			.request(url, 'get')
			.then(res => {
				if (res.Success) {
					me.storeUnit.data.items.length = res.Data + 1;
				}

				me.storeUnit.data.items.unshift(
					{
						unit_type: -1,
						unit_name:  me.$t('I18nRP.PrintPreview.VoucherUnit')
					}
				);

				me.p_unit_type = me.$ms.session.PrintParamUnitType;

				// Nếu đơn vị tính này k tồn tại -> Lấy đơn vị tính trên chứng từ
				let itemUnit = me.storeUnit.data.items.filter(x=>x.unit_type == me.p_unit_type)[0];
				if (!itemUnit) {
					me.p_unit_type = -1;
				}
			})
			.catch(ex => {});
	},
	methods: {
		/**
		 * @Override kế thừa hàm từ baseForm => bỏ qua không chạy hàm này trong baseForm
		 * ntlan 12.11.2020
		 */
		googleAnalytic(){},
		/**
		 * Sự kiện ấn Đồng ý trên form chọn tham số In
		 * @author nnhung - 13.07.2020
		 */
		submitChoosePrintParam() {
			let me = this;


			let data = [
				{
					option_id: 'PrintParamUnitType',
					option_value: me.p_unit_type,
				}
			];

			optionAPI.saveOption(data).then(res => {
				if (res.Success) {
					me.$ms.session.PrintParamUnitType = me.p_unit_type;
					me.$emit('submitPrintParameter');
					me.isShow = false;
				}
			});

		},

		/**
		 * Đóng popup
		 * @author nnhung - 31.07.2020
		 */
		closePopup(){
			let me = this;
			me.isShow = false;

			me.p_unit_type = me.$ms.session.PrintParamUnitType;
		},

		/**
		 * Phím tắt
		 * @author nnhung - 31.07.2020
		 */
		shortkeyAction(e) {
			switch (e.originEvent.which) {
				case 27: //esc
					this.closePopup();
					break;
			}
		},
	}

};
</script>
<style lang="scss" scoped>
.title-popup {
	font-size: 24px;
	font-weight: bold;
}
::v-deep.ms-popup--title{
    padding: 20px 32px 20px 20px;
}

::v-deep.ms-popup--content{
	padding: 0px 20px 20px;

	.divide {
		margin: 24px 0px 8px;
	}
}
</style>
