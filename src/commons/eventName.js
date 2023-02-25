/**
 * Danh sách các event name custom riêng cho MS
 * @author DNThang - 05.07.2019
 */
export const MSEventName = {

    /**
     * Danh sách các sự kiện hỗ trợ trên MISA Store
     * @author DNThang - 05.07.2019
     */
    MSStore: {

        /**
         * Sự kiện 1 hoặc nhiều record được thêm vào store
         * args: store, records, index, opts
         */
        add: 'add',

        /**
         * Sự kiện xóa 1 hoặc nhiều record trên store
         * args: store, record
         */
        remove: 'remove',

        /**
         * Sự kiện khi 1 hoặc nhiều bản ghi thêm/xóa
         * args: store, opts
         */
        dataChanged: 'dataChanged',

        /**
         * Sự kiện khi 1 item được thực hiện cập nhật
         * args: store, record, eOpts
         */
        update: 'update',

        /**
         * Sự kiện thực hiện sắp xếp trên store
         * args: store, opts
         */
        sort: 'sort',

        /**
         * Sự kiện Clear dữ liệu trên store
         * args: store, records
         */
        clear: 'clear',

        /**
         * Sự kiện sau khi xử lý xong load data (load từ server về hoặc load local)
         */
        loaded: 'loaded',

        /**
         * Sự kiện thay đổi filter (Add/Remove/Update)
         */
		filterChanged: 'filterChanged',

		urlChanged:'urlChanged'

    }
}
