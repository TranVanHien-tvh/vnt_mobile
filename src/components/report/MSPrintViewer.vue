<template>
  <!-- <div class="print-viewer"> -->
  <!-- Popup chỉnh sửa layout grid -->
  <ms-popup
    ref="printViewer"
    :active.sync="active"
    class="detail-popup"
    :width="1200"
    :loading="loading"
    :full-screen="true"
    class-list-content="flexed no-padding"
    @close="hide"
    @shortkeyAction="shortkeyActionCustom"
  >
    <template slot="header">
      <div class="header-popup flex">
        <div class="title-popup flex">
          <div>{{ options.reportName }}</div>
          <div
            v-if="extentionMergePrint"
            class="mi mi-24 my-auto m-l-16"
            :class="extentionMergePrint"
          />
        </div>
        <div class="action-bar">
          <ms-button
            v-tooltip="mapShortkeyTooltip('Print')"
            class="action-item button-icon "
            type="print-viewer-header"
            size="print-viewer-header"
            left-icon="print"
            shortkey-target="Print"
            :text="$t('i18nReport.ReportViewer.Print')"
            @click="print"
          />
          <div
            v-if="isShowOfReport"
            class="d-inline-block action-item"
          >
            <ms-dropdown
              :is-line="false"
              is-single
              icon="none"
              type="print-viewer-header"
              size="print-viewer-header"
              button-class="button-icon export"
            >
              <template slot="text">
                <span class="pr-4">{{ $t('i18nReport.ReportViewer.Export') }}</span>
              </template>
              <template slot="content">
                <ms-dropdown-menu>
                  <ms-dropdown-item
                    v-if="isShowExportExcel"
                    @click="exportFile('excel')"
                  >
                    {{ $t('i18nReport.ReportViewer.ExportExcel') }}
                  </ms-dropdown-item>
                  <ms-dropdown-item
                    v-if="isShowExportPdf"
                    @click="exportFile('pdf')"
                  >
                    {{ $t('i18nReport.ReportViewer.ExportPdf') }}
                  </ms-dropdown-item>
                  <ms-dropdown-item
                    v-if="isShowExportWord"
                    @click="exportFile('word')"
                  >
                    {{ $t('i18nReport.ReportViewer.ExportWord') }}
                  </ms-dropdown-item>
                </ms-dropdown-menu>
              </template>
            </ms-dropdown>
          </div>
          <ms-button
            v-if="showChooseParameterBtn()"
            class="action-item button-icon parameter"
            size="print-viewer-header"
            type="print-viewer-header"
            :left-icon="setting"
            :text="$t('I18nRP.ReportViewer.ChooseParam')"
            @click="chooseParameter"
          />

          <!-- Gửi email -->
          <!-- <ms-button
							v-if="showSendEmailBtn()"
							size="print-viewer-header"
							type="print-viewer-header"
							class="action-item button-icon email"
							@click="sendEmail"
						>{{ $t('I18NCommon.SendEmail') }}</ms-button> -->

          <!-- Dành cho in báo cáo thuế -->
          <!-- Tạm gọi màn hình cha để export xml -->
          <ms-button
            v-if="isShowExportXMLAndSubmitMTAX"
            size="print-viewer-header"
            type="print-viewer-header"
            class="action-item button-icon export-xml"
            @click="exportXML"
          >
            {{ $t('I18nRP.ReportViewer.ExportTA_01GTGTTT26') }}
          </ms-button>


          <ms-button
            v-if="isShowExportXMLAndSubmitMTAX"
            size="print-viewer-header"
            type="print-viewer-header"
            class="action-item button-icon mtax"
            @click="handleSubmitDataToMTAX"
          >
            {{ $t('I18nRP.ReportViewer.SubmitTADeclararionToMTAX') }}
          </ms-button>
        </div>
      </div>
    </template>
    <template slot="content">
      <!-- NNLAM  18.04.2020: Chờ load được dữ liệu mới cho hiển thị frame -->
      <iframe
        id="iframeViewer"
        ref="iframeViewer"
        class="iframe-viewer flexed"
        name="iframeViewer"
        :src="viewLink"
      />
    </template>
  </ms-popup>
  <!-- -->
  <!-- <component
			:is="popupMerge"
			:active="isShowPopupMergeLayout"
			@closePopup="closePopupMerge()"
			:currentItem="options.currentItem"
			:mergePrintItem="editPrintItem"
		></component> -->
  <!-- </div> -->
</template>

<script>
import reportApi from '@/apis/report/reportAPI';
import fileAPI from "@/apis/system/fileAPI";
import BaseListPopup from "@/views/base/BaseListPopup";
import { MSEnum } from "@/commons/enumeration";
import { shortkeyStatusbar } from '@/mixins/common/shortkeyStatusbar';

/**
 * Preview báo cáo
 */
export default {
	name: 'MsPrintViewer',
	mixins: [shortkeyStatusbar],
	// components: {
	// 	MergePrintLayout
	// },
	props: {
		title: String,
		content: String
	},

	data() {
		const me = this;
		me._msData = me.getStaticData();
		return {
			viewLink: '',
			isShowPopupMergeLayout: false,
			popupMerge: '',
			// NNHUNG - 03/07/2020: Đối tượng printItem của printMenu
			editPrintItem: null,
			extentionMergePrint: '',
			//có được phép sửa mẫu không
			editable: true,
			isShowExportPdf: false,
			isShowExportExcel: false,
			isShowExportWord: false,
			// Có hiện button xuất XML, nộp tờ khai qua MTAX không
			isShowExportXMLAndSubmitMTAX: false,
			// Có show button tải file
			isShowOfReport: true,
			active: true,
			loading: false,
		};
	},

	computed: {},

	created() {
		this.options = {};
	},
	mounted() {
      //init cha của form sẽ ăn phím tắt
      this.$ms.commonFn.shortkeyPushView(this.$el);
    },
    beforeDestroy() {
      //destroy cha của form sẽ ăn phím tắt
      this.$ms.commonFn.shortkeyPopView(this.$el);
    },

	methods: {
		/**
		 * func ẩn hiện options xuất khẩu chứng từ
		 * @author NCThanh1 24.08.2020
		 */
		configShowHideExportFile() {
			switch (this.options.reportType) {
				case this.$ms.enum.ReportTypeUI.Stimul:
					this.isShowExportPdf = true;
					this.isShowExportExcel = true;
					this.isShowExportWord = true;
					break;
				case this.$ms.enum.ReportTypeUI.Html:
					this.isShowExportPdf = true;
					this.isShowExportExcel = false;
					this.isShowExportWord = false;
					break;
				case this.$ms.enum.ReportTypeUI.Merge:
					this.isShowExportPdf = true;
					if (
						this.extentionMergePrint === 'doc' ||
						this.extentionMergePrint === 'docx'
					) {
						this.isShowExportExcel = false;
						this.isShowExportWord = true;
					} else if (
						this.extentionMergePrint === 'xls' ||
						this.extentionMergePrint === 'xlsx'
					) {
						this.isShowExportExcel = true;
						this.isShowExportWord = false;
					} else {
						this.isShowExportExcel = false;
						this.isShowExportWord = false;
					}
					break;
				default:
					this.isShowExportPdf = false;
					this.isShowExportExcel = false;
					this.isShowExportWord = false;
					break;
			}
		},
		featureIsWorking() {
			this.$ms.msgBox.showInfo('Tính năng đang phát triển');
		},
		/**
		 * Hiển thị
		 */
		show(key, options) {
			let me = this;
			me.options = options;

			me.editable = options.reportType === me.$ms.enum.ReportTypeUI.Html;
			me.active = true;
			let extentions = ['xls', 'xlsx', 'doc', 'docx'];
			let ext = me.options.reportId.split('.').pop();
			me.extentionMergePrint = extentions.includes(ext) ? ext : '';
			me.configShowHideExportFile();
			// hngiap - 21.09.2020: Kiểm tra có hiện các button xuất XML, nộp tờ khai không
			me.checkShowExportXMLAndSubmitMTAX();
			// tvphi Thực hiện ẩn nút xuất file theo yêu cầu BA ở BCTC
			me.checkShowExportFinancialReport();

			me.reportKey = key; // NCThanh1 18.8.2020 - lưu lại cacheKey để phục vụ cho xuất file

			// this.$ms.commonFn.mask();
			me.loadReportData(key);

			// hngiap - 30.08.2020: append lại vào body tránh tình trạng bị đè bởi các component khác
			// mặc dù z-index của component khác thấp nhưng vẫn bị đè do thằng này nằm trong footer
			document.body.appendChild(me.$el);
		},

		 /**
		 * Xử lý đóng form
		 */
		hide(){
			this.active = false;
		},

		/**
		 * func get data tĩnh
		 * @author NCThanh1 18.05.2020
		 */
		getStaticData() {
			let _msData = {};
			return _msData;
		},
		/**
		 * Build link cho ifram để show báo cáo
		 */
		loadReportData() {
			const me = this;

			if (me.exportType === me.$ms.enum.ExportType.Excel) {
				window.open(reportApi.getPrintLink(me.reportKey, 'pdf'), '_blank');
				me.$parent.exportType = 0;
			} else  if (Array.isArray(me.options.reports) && me.options.reports.length > 1) {
				//nếu có nhiều hơn 1 port -> chuyển thành async
				me.viewLink = null;
				me.renderFileName = null;
				me.$ms.commonFn.mask();
				reportApi.renderAsync(me.reportKey)
					.then(res => {
						window[res.data.Data] = function(param) {
							//Giữ lại để cho download file pdf dùng luôn
							me.renderFileName = param.file;

							let link = fileAPI.getPdfLink(me.$ms.enum.StorageFileType.Temp, param.file);
							me.viewLink = link;
							me.$ms.commonFn.unmask();

							if (me.renderTimeout) {
								clearTimeout(me.renderTimeout);
								delete me.renderTimeout;
							}
						}
					})
					.catch(err => {
						me.$ms.commonFn.unmask();
					});

				//timeout 5p thì cũng ẩn mask đi
				me.renderTimeout = setTimeout(function() {
					me.$ms.commonFn.unmask();
					clearTimeout(me.renderTimeout);
					delete me.renderTimeout;
				}, 5 * 60 * 1000);
			} else {
				me.viewLink = reportApi.getPrintLink(me.reportKey, 'pdf');
				me.$refs.iframeViewer.src = me.viewLink;
				setTimeout(function() {
					me.$ms.commonFn.unmask();
				}, 500)
			}
		},

		buttonClick(){
			this.print();
		},

		/**
		 * In
		 */
		async print() {

			const me = this,
				lstTrackingReports = [
					'DeliveryNote_Warranty',
					'OutwardStockBySaleVoucher',
					'DeliveredNoteWarrantySerial',
					'OutwardStockBySaleVoucherA5',
					'DeliveredNoteLotExpiry'
				];

			//nếu trong danh sách pxk bán hàng thì checking
			if (lstTrackingReports.includes(me.options.reportId)) {
				if (await me.checkingPrintINOutward()) {
					me.doPrint();
				}
			} else {
				me.doPrint();
			}
		},

		/**
		 * Thực hiện in
		 */
		doPrint() {
			try {
				this.$refs['iframeViewer'].contentWindow.print();
			} catch (ex) {
				let iframe = window.frames['iframeViewer'];
				iframe.focus();
				iframe.print();
			}
		},

		/**
		 * Cảnh báo in và update dữ liệu tracking phiếu xuất kho bán hàng
		 * @author DVQuan 06.05.2020
		 */
		async checkingPrintINOutward() {
			let me = this,
				printedTime = 0,
				user = me.$ms.commonFn.getUserInfo(),
				fullName = `${user.FirstName} ${user.LastName}`,
				refParam = '';
			// Nếu là in theo lô
			if (
				me.options.parameter.printBatchParams &&
				me.options.parameter.printBatchParams.length > 0
			) {
				let detailRef = '';
				me.options.parameter.printBatchParams.forEach(el => {
					refParam = refParam.concat(
						`${el.DataParam.refid}:${el.DataParam.reftype},`
					);
				});

				// bật tùy chọn cảnh báo thì mới show popup
				if (me.$ms.session.IsWarningWhenSecondPrintINOutward) {
					await reportApi
						.getTrackingPrintINOutward(
							refParam,
							me.options.reportId,
							me.$ms.session.IsWorkingWithManagementBook
						)
						.then(res => {
							if (!_.isEmpty(res.Data)) {
								res.Data.forEach(el => {
									detailRef = detailRef.concat(
										`<${el.refno} - ${el.printed_time} lần>, `
									);
								});
								detailRef = detailRef.slice(0, -2);
							}
						});

					// show popup
					if (detailRef) {
						let confirm = await me.$ms.msgBox.showConfirm(
							`Các phiếu xuất sau đã được in: ${detailRef}. Bạn có muốn tiếp tục in các phiếu xuất này không?`
						);
						if (confirm !== 'Yes') {
							return false;
						}
					}
				}
			} else {
				refParam = `${me.options.parameter.refid}:${me.options.parameter.reftype}`;
				// bật tùy chọn cảnh báo thì mới show popup
				if (me.$ms.session.IsWarningWhenSecondPrintINOutward) {
					await reportApi
						.getTrackingPrintINOutward(
							refParam,
							me.options.reportId,
							me.$ms.session.IsWorkingWithManagementBook
						)
						.then(res => {
							if (!_.isEmpty(res.Data)) {
								printedTime = res.Data[0].printed_time;
							}
						});

					// update tracking và in
					if (printedTime > 0) {
						let confirm = await me.$ms.msgBox.showConfirm(
							`Phiếu xuất này đã được in ${printedTime} lần. Bạn có muốn in tiếp không?`
						);
						if (confirm !== 'Yes') {
							return false;
						}
					}
				}
			}
			// Là pxk bán hàng thì luôn tracking
			await reportApi.updateTrackingPrintINOutward(
				refParam,
				me.options.reportId,
				fullName
			);
			return true;
		},

		/**
		 * Xóa đi dữ liệu in theo lô tránh lặp vào lần sau
		 * @author DVQUAN 26.05.2020
		 */
		closePopup() {
			if (this.options.parameter && this.options.parameter.printBatchParams) {
				this.options.parameter.printBatchParams.length = 0;
			}
		},

		/**
		 * Gửi email
		 * created by ntphong 14/1/2021
		 */
		async sendEmail() {
			// const me = this;
			// try {
			// 	me.$ms.commonFn.mask();
			// 	let exportFile;

			// 	if (!me.popupSendEmailVoucher) {
			// 		let component = await import ('@/views/RP/PopupSendEmailVoucher.vue');
			// 		if (component && component.default) {
			// 			let options = {
			// 				i18n: me.$i18n,
			// 				propsData: {
			// 					reportId: me.options.reportId,
			// 					reportKey: me.reportKey
			// 				}
			// 			};
			// 			me.popupSendEmailVoucher = me.$ms.commonFn.prepareForDialog(
			// 				component.default,
			// 				me.ownerForm,
			// 				options
			// 			);
			// 			me.popupSendEmailVoucher.$on('close', me.onSendEmailVoucher);
			// 		}
			// 	}
			// 	if (me.popupSendEmailVoucher.show instanceof Function) {
			// 		me.popupSendEmailVoucher.show(exportFile, me.$parent, me.options);
			// 	}
			// 	me.$ms.commonFn.unmask();
			// } catch (e) {
			// 	me.$ms.log.handleException(e);
			// 	me.$ms.commonFn.unmask();
			// }
		},

		/**
		 * Xử lí load lại frame khi đóng form sửa mẫu
		 * created by ntphong 15/1/2021
		 */
		onSendEmailVoucher(frm, dialogResult) {
			//if (dialogResult === 'Yes') {
				// this.$refs.iframeViewer.src = this.$refs.iframeViewer.src;
				// this.$ms.commonFn.mask();

				this.loadReportData();
			//}
		},

		/**
		 * Sửa mẫu
		 */
		edit() {
			if (this.options.reportIsSystem) {
				this.openEditTemplatePopup();
			} else {
				this.editMergeLayout();
			}
		},

		/**
		 * Mở popup sửa mẫu
		 * @author NCThanh1 28.09.2020
		 */
		async openEditTemplatePopup() {
			// const me = this;
			// try {
			// 	if (!me.popupEditTemplate) {
			// 		let component = await import ('@/views/RP/PopupEditTemplate.vue');
			// 		if (component && component.default) {
			// 			let options = {
			// 				i18n: me.$i18n,
			// 				propsData: {
			// 					reportId: me.options.reportId,
			// 					reportKey: me.reportKey
			// 				}
			// 			};
			// 			me.popupEditTemplate = me.$ms.commonFn.prepareForDialog(
			// 				component.default,
			// 				me.ownerForm,
			// 				options
			// 			);
			// 			me.popupEditTemplate.$on('close', me.onEditTemplateClose);
			// 		}
			// 	}
			// 	if (me.popupEditTemplate.show instanceof Function) {
			// 		me.popupEditTemplate.show();
			// 	}
			// } catch (e) {
			// 	me.$ms.log.handleException(e);
			// }
		},

		/**
		 * Xử lí load lại frame khi đóng form sửa mẫu
		 * @author NCThanh1 28.09.2020
		 */
		onEditTemplateClose(frm, dialogResult) {
			if (dialogResult === 'Yes') {
				// this.$refs.iframeViewer.src = this.$refs.iframeViewer.src;
				// this.$ms.commonFn.mask();

				this.loadReportData();
			}
		},

		/**
		 * Sửa mẫu: show popup Thiết kế mẫu
		 * @author nnhung - 03.07.2020
		 */
		editMergeLayout() {
			let me = this;

			me.editPrintItem = {
				report_id: me.options.reportId
			};

			me.popupMerge = 'MergePrintLayout';
			me.isShowPopupMergeLayout = true;
		},

		/**
		 * Đóng popup merge
		 * @author nnhung - 03.07.2020
		 */
		closePopupMerge() {
			let me = this;
			me.isShowPopupMergeLayout = false;
			me.popupMerge = '';
		},
		/**
		 * Xuất khẩu chứng từ
		 * @author NCThanh1 18.08.2020
		 */
		exportFile(type) {
			let me = this,
				downloadLink = reportApi.getDownloadink(me.reportKey, type);
			switch (type) {
				case 'excel':
					if (
						!me.checkPermissionAlert(me.$ms.enum.EnumPermission.ExportExcel)
					) {
						return;
					}
					break;

				case 'pdf':
					if (me.renderFileName) {
						//donwload chính file temp renderAsync -> đỡ phải render lại
						downloadLink = fileAPI.getDownloadLink(me.$ms.enum.StorageFileType.Temp, me.renderFileName, {
							name: [me.options.reportName, '.pdf'].join('')
						});
					}
					break;
			}

			me.$ms.commonFn.downloadLink(downloadLink);
		},
		/**
		 * func show popup
		 */
		showUnderConstruction() {
			this.$ms.msgBox.showInfo(this.$t('I18NCommon.UnderConstruction'));
		},
		/**
		 * reset print preview
		 */
		reset() {
			this.showUnderConstruction();
		},
		shortkeyAction(e) {
			switch (e.srcKey) {
				case 'Print':
					e.preventDefault();
					e.originEvent.preventDefault();
					this.print();
					break;
				case 'Close':
					this.isShow = false;
					break;
			}
		},

		/**
		 * reset print preview
		 * @author nnhung - 13.07.2020
		 */
		chooseParameter() {
			let me = this;
			me.$emit('showPrintParameterEvent', {
				printBatchParams: me.options.parameter.printBatchParams,
				reportId: me.options.reportId,
				printViewerVueInstance: me
			});
		},

		showChooseParameterBtn() {
			let me = this;
			return false;
		},

		showSendEmailBtn() {
			let me = this;

			let isShow = false;
			if (me.options && me.options.currentItem) {
				switch(me.options.currentItem.reftype) {
					case MSEnum.RefType.SAQuote:
					case MSEnum.RefType.SAOrder:
					case MSEnum.RefType.SAVoucher:
					case MSEnum.RefType.SAVoucherCash:
					case MSEnum.RefType.SAVoucherExport:
					case MSEnum.RefType.SAVoucherOnePriceAgent:
					case MSEnum.RefType.SAVoucherOnePriceAgentCash:
					case MSEnum.RefType.SAVoucherCommission:
					case MSEnum.RefType.SAVoucherDeposit:
					case MSEnum.RefType.SAVoucherOnePriceAgentDeposit:
					case MSEnum.RefType.PUOrder:
						isShow = true;
						break;
				}
			}

			return isShow;
		},

		/**
		 * Check có phải BCTC, BCTCTH hay không
		 */
		checkShowExportFinancialReport(){
			const me = this;
			// if(me.options.reportType == MSEnum.RefType.GLFinancialReportSummary || me.options.reportType == MSEnum.RefType.GLFinancialReport || me.options.reportType == MSEnum.RefType.GLFinancialReportStatement){
			// 	me.isShowOfReport = false;
			// }else{
			// 	me.isShowOfReport = true;
			// }
			return true
		},



		/**
		 * Hàm xác định xem có phải là in tờ khai thuế hay không
		 * - Phải đặt thành hàm do biến me.options không reactive
		 * @author hngiap - 21.09.2020
		 */
		checkShowExportXMLAndSubmitMTAX() {
			const me = this;

			if (me.options && me.options.reportId) {
				switch (me.options.reportId) {
					case 'TA_01GTGTTT26':
					case 'TA_04GTGT':
					case 'TA_03TNDN':
					case 'TA_01TTDB_TT195':
						me.isShowExportXMLAndSubmitMTAX = true;
						break;
				}
			}
		},

		/**
		 * Xuất XML
		 * - Chuyển từ trên HTML xuống để check null
		 * @author hngiap - 21.09.2020
		 */
		exportXML() {
			const me = this;

			if (me.$parent && typeof me.$parent.exportXML == 'function') {
				me.$parent.exportXML();
			}
		},

		/**
		 * Nộp tờ khai, báo cáo qua MTAX
		 * - Chuyển từ trên HTML xuống để check null
		 * @author hngiap - 21.09.2020
		 */
		handleSubmitDataToMTAX() {
			const me = this;

			if (
				me.$parent &&
				typeof me.$parent.handleSubmitDataToMTAX == 'function'
			) {
				me.$parent.handleSubmitDataToMTAX(this);
			}
		},
		shortkeyActionCustom(e){
			let me = this;
			switch(e.srcKey){
			case 'Close':
				e.preventDefault();
				e.stopPropagation();
				e.originEvent.cancel = true;
				me.hide();
				break;
			default:
				this.shortkeyAction(e);
				break;
			}
		},
	},
};
</script>
<style lang="scss" scoped>
@import '@/assets/scss/components/msPrintViewer.scss';

::v-deep.con-ms-dropdown--menu {
	z-index: 101 !important;
}
.doc,
.docx {
	background-position: -1074px -467px;
}
.xls,
.xlsx {
	background-position: -705px -200px;
}

.print-viewer ::v-deep {
	.export {
		padding-left: 30px;

		&::before {
			background-position: -144px -200px;
		}

		&:hover::before {
			background-position: -144px -256px;
		}
	}

	.button-icon {
		&::before {
			content: '';
			position: absolute;
			width: 24px;
			height: 24px;
			top: -6px;
			left: 2px;
			background-image: url($ms-image-sprites);
			background-repeat: no-repeat;
			background-color: transparent;
		}
	}
}
::v-deep.iframe-viewer {
	border: none;
	width: 100%;
	height: 100%;
	background-color: #c7c9ce;
	//border-top: 1px solid rgb(82, 86, 89);
}
::v-deep.full{
	width: 100% !important;
	height: 100% !important;
	display: block;;
}
::v-deep.popup-content{
	height: -webkit-fill-available;
	padding: 0;
}
::v-deep.popup-header{
	padding: 0px 0 6px 16px;
}
::v-deep.header-popup{
	display: flex;
	padding: 12px 50px 6px 16px;
}
::v-deep.ms-popup{
	.buttons .close{
		transform: scale(1.3);
	}
}
</style>
