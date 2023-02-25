/**
 * Object xử lý event global trên toàn bộ hệ thống
 * @author DNThang - 17.03.2020
 */

import Vue from 'vue'
const EventBusGlobal = new Vue();

export default EventBusGlobal;

/**
 * Đối tượng liệt kê các global event đang có
 * Bắt buộc có globalEvent nào đều phải cấu hình vào đây để không bị trùng tên
 * @author DNThang - 17.03.2020
 */
const GlobalEventName = {
    /**
     * Xử lý đóng tất form
     */
    closeAllPopup: 'closeAllPopup',
    scrollEvent: "scrollEvent",
    reloadList: "reloadList",
    resetPopupCenter: "resetPopupCenter",
    setWaitingConfirm: "setWaitingConfirm",
    showHelpViewHistory: "showHelpViewHistory",
    sortEvent: "sortEvent",
    updateNotification:"updateNotification",
    closeAllDropdown: "closeAllDropdown",
    checkTaxDeclarationProcedure: "checkTaxDeclarationProcedure",
    checkTaxPaymentProcedure: "checkTaxPaymentProcedure",
    sentData: "sentData",
    collapseLeftMenu: "collapseLeftMenu",
    /**
	 * Phục vụ cho việc hiện thị phím tắt ở bên dưới form
     * NNLAM
	 */
	controlFocus:'controlFocus',
	controlBlur:'controlBlur',
	gridFocus:'gridFocus',
    gridBlur:'gridBlur',
}

export { GlobalEventName };