<!--
  Form hiển thị dữ liệu báo cáo
  CreatedBy DNThang - 31.10.2019
-->
<template>
  <div class="report-viewer">
    <div class="header-viewer flex">
      <div class="w-1/2 add-note">
        <!-- <a @click="redirectTo('')">{{$t('I18nRP.ReportViewer.AddNote')}}</a> -->
      </div>
      <div class="w-1/2 button-feature flex align-right">
        <!-- <ms-tooltip :tooltip="$t('I18nRP.ReportViewer.Search')">
		  <div class="flex-center search-button list-button">
            <ms-input
              :placeholder="$t('I18NSY.SearchByKeyWord')"
              icon="mi-search"
              iconPack="feather"
              iconAfter
              v-model="searchText"
              @keyup.enter.native="$emit('search', searchText)"
            />
          </div>
				</ms-tooltip>-->
        <div class="pl-3">
          <ms-tooltip :tooltip="$t('I18NCommon.RefreshData')">
            <div class="header-detail-btn">
              <div
                class="mi mi-24 mi-refresh-bold"
                @click="$emit('refresh')"
              />
            </div>
          </ms-tooltip>
        </div>
        <!-- <div class="px-3">
					<ms-tooltip :tooltip="$t('I18NCommon.SendRPEmail')">
						<ms-dropdown
							isSingle
							:isLine="false"
							:icon="false"
							type="none"
							buttonClass="dropdown-custom"
							class="dropdown-list-layout"
						>
							<template slot="text">
								<div class="mi mi-24 mi-email-bold"></div>
							</template>
							<template slot="content">
								<ms-dropdown-menu>
									<ms-dropdown-item @click="buttonClick('SendEmailExcel')">{{ $t('I18NCommon.SendExcel') }}</ms-dropdown-item>
									<ms-dropdown-item @click="buttonClick('SendEmailPdf')">{{ $t('I18NCommon.SendPDF') }}</ms-dropdown-item>
									<hr />
									<ms-dropdown-item
										@click="$ms.msgBox.showInfo($t('I18NCommon.UnderConstruction'))"
									>{{ $t('I18NCommon.ScheduleReportSubmission') }}</ms-dropdown-item>
								</ms-dropdown-menu>
							</template>
						</ms-dropdown>
					</ms-tooltip>
				</div> -->

        <ms-tooltip :tooltip="$t('I18nRP.ReportViewer.Print')">
          <div
            class="close-btn header-detail-btn"
            shortkey-target="PrintReport"
            @click="buttonClick('PrintReport')"
          >
            <div class="mi mi-24 mi-print" />
          </div>
        </ms-tooltip>
        <div class="px-3">
          <ms-tooltip :tooltip="$t('I18nRP.ReportViewer.ExportExcel')">
            <div
              class="close-btn header-detail-btn"
              @click="buttonClick('ExportReport')"
            >
              <div class="mi mi-24 mi-export__excel-bold" />
            </div>
          </ms-tooltip>
        </div>
      </div>
    </div>

    <div class="flex">
      <div class="flex-grow">
        <iframe
          id="iframeViewer"
          ref="iframeViewer"
          :class="[isFullSize ? 'iframe-viewer-custom' : 'iframe-viewer']"
          name="iframeViewer"
          :src="previewLink"
          @load="loaded"
        />
      </div>
    </div>
  </div>
</template>

<script>
//import { permission } from '@/mixins/common/permission';
/**
 * Preview báo cáo
 */
export default {
	name: 'MsReportViewer',
	//mixins: [permission],
	props: {
		reportId: {
			type: String,
			default: ''
		},
		/**
		 * Url để tải file PDF preview lên iFrame
		 */
		previewLink: {
			type: String,
			default: ''
		},
		isFullSize: {
			type: Boolean,
			default: false
		}
	},

	data: function() {
		return {
			key: '',
			searchText: ''
		};
	},
	methods: {
		/**
		 * Xử lý sự kiện khi click các button
		 * - Bổ sung để đóng gói các hành động vào 1 hàm
		 * - Bổ sung xử lý kiểm tra quyền các hành động
		 * CreatedBy hngiap - 16.03.2020
		 */
		buttonClick(action, e) {
			const me = this;

			switch (action) {
				// In báo cáo
				case 'PrintReport':
					if (!me.checkPermissionAlert(me.$ms.msEnum.EnumPermission.PrintReport)) {
						return;
					}
					me.print();
					break;

				// Xuất excel
				case 'ExportReport':
					if (!me.checkPermissionAlert(me.$ms.msEnum.EnumPermission.ExportReport)) {
						return;
					}
					me.exportExcel();
					break;

				// Xuất XML
				case 'ExportXML':
					me.exportXML();
					break;
				// Gửi báo cáo qua email (excel)
				case 'SendEmailExcel':
					me.sendEmailExcel();
					break;
				// Gửi báo cáo qua email (pdf)
				case 'SendEmailPdf':
					me.sendEmailPdf();
					break;
			}
		},

		/**
		 * @override
		 * Lấy sub_system_code của trang báo cáo để kiểm tra phân quyền
		 * - Lấy theo report id
		 * @author hngiap - 16.03.2020
		 */
		getSubSystemCode(permission, data) {
			let route = this.$route,
				subSystemCode;

			if (route && route.meta.hasOwnProperty('sub_system_config')) {
				let config = route.meta.sub_system_config,
					paramName = config.parameter_name,
					subSystemCodeConfig = config.sub_system_code;

				if (paramName) {
					// lấy ra giá trị param và sub_system_code
					let paramValue = route.params[paramName];

					subSystemCode = subSystemCodeConfig.find(item => item == paramValue);
				}
			}

			return this.getSubSystemCodeCustom(subSystemCode, permission, data);
		},

		// Nếu load được frame thì unmask (dvquan 12.03.2020)
		loaded() {
			this.$ms.commonFn.unmask();
		},

		/**
		 * Export
		 */
		exportExcel() {
			this.$emit('exportExcel');
		},

		exportXML() {},

		/**
		 * gửi báo cáo qua email (excel)
		 */
		sendEmailExcel() {
			this.$emit('sendEmailExcel');
		},

		/**
		 * gửi báo cáo qua email (pdf)
		 */
		sendEmailPdf(){
			this.$emit('sendEmailPdf');
		},

		/**
		 * In
		 */
		print() {
			try {
				this.$refs['iframeViewer'].contentWindow.print();
			} catch (e) {
				let iframe = window.frames['iframeViewer'];
				iframe.focus();
				iframe.print();
			}
		},

		/**
		 * Sửa mẫu
		 */
		edit() {
			this.$router.push('/RP/EditTemplate/ ');
		}
	}
};
</script>
<style lang="scss" scoped>
@import '@/assets/scss/components/MSReportViewer.scss';
</style>
