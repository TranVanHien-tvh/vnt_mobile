import httpClient, {
    FormMultiPart,
    FormUrlEncoded,
    ApplicationJson,
    POST,
    PUT,
    GET,
    DELETE
} from "@/apis/base/axiosHttpClient";
import commonFn from "@/commons/commonFunction";

export default class BaseAPI {
    constructor() { }
    baseUrl = "";
    controllerName = "";
    apiName = "";

    //khởi tạo ApiUrl
    // created by NDQUAN 20/08/2019
    // create api by aip aipName : window._apis[this.apiName]
    //API được khởi tạo dựa trên apiName
    initAPI() {
        if (this.apiName) {
            this.baseUrl = "http://123.31.12.126:8080" + "/api"+ "/"+ this.controllerName;
        }
    }

    //Build api url
    //CreatedBy NDQUAN 20/08/2019
    getAPIUrl() {
        // Khi base url chưa khởi tạo
        if (this.baseUrl == "") {
            this.initAPI();
        }

        //Nếu có truyền thêm argument thì nó khởi tạo thêm url
        if (arguments && arguments.length > 0) {
            return commonFn.combineUrl(this.baseUrl, ...arguments);
        }

        return this.baseUrl;
    }

    /**
     * config: AxiosRequestConfig
     * @param config: {
     * url?: string;
     * method?: string;
     * baseURL?: string;
     * transformRequest?: AxiosTransformer | AxiosTransformer[];
     * transformResponse?: AxiosTransformer | AxiosTransformer[];
     * headers?: any;
     * params?: any;
     * paramsSerializer?: (params: any) => string;
     * data?: any;
     * timeout?: number;
     * withCredentials?: boolean;
     * adapter?: AxiosAdapter;
     * auth?: AxiosBasicCredentials;
     * responseType?: string;
     * xsrfCookieName?: string;
     * xsrfHeaderName?: string;
     * onUploadProgress?: (progressEvent: any) => void;
     * onDownloadProgress?: (progressEvent: any) => void;
     * maxContentLength?: number;
     * validateStatus?: (status: number) => boolean;
     * maxRedirects?: number;
     * httpAgent?: any;
     * httpsAgent?: any;
     * proxy?: AxiosProxyConfig | false;
     * cancelToken?: CancelToken;
     * }
     * @param isShowLoading: có cho loading hay không, hiển thị loading cho người dùng
     * @param isCancelRequest: có cho phép hủy request cùng url và method hay không
     * @param contenType: application/json, application/x-www-form-urlencoded, multipart/form-data
     */
    async postAsync(
        config,
        isShowLoading = false,
        isCancelRequest = true,
        contenType = ApplicationJson
    ) {
        return await httpClient.requestAsync(
            config,
            POST,
            isShowLoading,
            isCancelRequest,
            contenType
        );
    }

    /**
     * config: AxiosRequestConfig
     * @param config: {
     * url?: string;
     * method?: string;
     * baseURL?: string;
     * transformRequest?: AxiosTransformer | AxiosTransformer[];
     * transformResponse?: AxiosTransformer | AxiosTransformer[];
     * headers?: any;
     * params?: any;
     * paramsSerializer?: (params: any) => string;
     * data?: any;
     * timeout?: number;
     * withCredentials?: boolean;
     * adapter?: AxiosAdapter;
     * auth?: AxiosBasicCredentials;
     * responseType?: string;
     * xsrfCookieName?: string;
     * xsrfHeaderName?: string;
     * onUploadProgress?: (progressEvent: any) => void;
     * onDownloadProgress?: (progressEvent: any) => void;
     * maxContentLength?: number;
     * validateStatus?: (status: number) => boolean;
     * maxRedirects?: number;
     * httpAgent?: any;
     * httpsAgent?: any;
     * proxy?: AxiosProxyConfig | false;
     * cancelToken?: CancelToken;
     * }
     * @param isShowLoading: có cho loading hay không, hiển thị loading cho người dùng
     * @param isCancelRequest: có cho phép hủy request cùng url và method hay không
     * @param contenType: application/json, application/x-www-form-urlencoded, multipart/form-data
     */
    async putAsync(
        config,
        isShowLoading = false,
        isCancelRequest = true,
        contenType = ApplicationJson
    ) {
        return await httpClient.requestAsync(
            config,
            PUT,
            isShowLoading,
            isCancelRequest,
            contenType
        );
    }

    /**
     * config: AxiosRequestConfig
     * @param config: {
     * url?: string;
     * method?: string;
     * baseURL?: string;
     * transformRequest?: AxiosTransformer | AxiosTransformer[];
     * transformResponse?: AxiosTransformer | AxiosTransformer[];
     * headers?: any;
     * params?: any;
     * paramsSerializer?: (params: any) => string;
     * data?: any;
     * timeout?: number;
     * withCredentials?: boolean;
     * adapter?: AxiosAdapter;
     * auth?: AxiosBasicCredentials;
     * responseType?: string;
     * xsrfCookieName?: string;
     * xsrfHeaderName?: string;
     * onUploadProgress?: (progressEvent: any) => void;
     * onDownloadProgress?: (progressEvent: any) => void;
     * maxContentLength?: number;
     * validateStatus?: (status: number) => boolean;
     * maxRedirects?: number;
     * httpAgent?: any;
     * httpsAgent?: any;
     * proxy?: AxiosProxyConfig | false;
     * cancelToken?: CancelToken;
     * }
     * @param isShowLoading: có cho loading hay không, hiển thị loading cho người dùng
     * @param isCancelRequest: có cho phép hủy request cùng url và method hay không
     * @param contenType: application/json, application/x-www-form-urlencoded, multipart/form-data
     */
    async getAsync(
        config,
        isShowLoading = false,
        isCancelRequest = true,
        contenType = ApplicationJson
    ) {
        return await httpClient.requestAsync(
            config,
            GET,
            isShowLoading,
            isCancelRequest,
            contenType
        );
    }

    /**
     * config: AxiosRequestConfig
     * @param config: {
     * url?: string;
     * method?: string;
     * baseURL?: string;
     * transformRequest?: AxiosTransformer | AxiosTransformer[];
     * transformResponse?: AxiosTransformer | AxiosTransformer[];
     * headers?: any;
     * params?: any;
     * paramsSerializer?: (params: any) => string;
     * data?: any;
     * timeout?: number;
     * withCredentials?: boolean;
     * adapter?: AxiosAdapter;
     * auth?: AxiosBasicCredentials;
     * responseType?: string;
     * xsrfCookieName?: string;
     * xsrfHeaderName?: string;
     * onUploadProgress?: (progressEvent: any) => void;
     * onDownloadProgress?: (progressEvent: any) => void;
     * maxContentLength?: number;
     * validateStatus?: (status: number) => boolean;
     * maxRedirects?: number;
     * httpAgent?: any;
     * httpsAgent?: any;
     * proxy?: AxiosProxyConfig | false;
     * cancelToken?: CancelToken;
     * }
     * @param isShowLoading: có cho loading hay không, hiển thị loading cho người dùng
     * @param isCancelRequest: có cho phép hủy request cùng url và method hay không
     * @param contenType: application/json, application/x-www-form-urlencoded, multipart/form-data
     */
    async deleteAsync(
        config,
        isShowLoading = false,
        isCancelRequest = true,
        contenType = ApplicationJson
    ) {
        return await httpClient.requestAsync(
            config,
            DELETE,
            isShowLoading,
            isCancelRequest,
            contenType
        );
    }

    /**
     * Lấy dữ liệu danh sách
     */
    getList(payload) {
        let request = {
            url: this.getAPIUrl() + "/list",
            data: payload
        };

        return httpClient.postAsync(request);
    }

    /**
     * Lấy dữ liệu danh sách full
     */
    getFullList(payload) {
        let request = {
            url: this.getAPIUrl() + "/full"
        };

        return httpClient.getAsync(request);
    }
    /**
     * Lấy dữ liệu danh sách tree
     */
    getListTree(payload) {
        let request = {
            url: this.getAPIUrl() + "/list-tree",
            data: payload
        };

        return httpClient.postAsync(request);
    }

    /**
     * Lấy bản ghi mặc định khi thêm mới
     */
    getNew(payload) {
        let request = {
            url: this.getAPIUrl() + "/new",
            data: payload
        };

        debugger

        return httpClient.getAsync(request);
    }

    getAutoID(payload) {
        let request = {
            url: this.getAPIUrl() + "/getAutoID",
            data: payload
        };

        return httpClient.getAsync(request);
    }

    /**
     * Lấy bản ghi mặc định khi thêm mới
     */
    getEdit(payload) {
        let request = {
            url: [this.getAPIUrl(), payload.id].join("/")
        };

        return httpClient.getAsync(request);
    }
    /**
     * Lấy bản ghi nhân bản
     */
    getDuplicate(payload) {
        let request = {
            url: [this.getAPIUrl(), "duplicate", payload.id].join("/")
        };

        return httpClient.getAsync(request);
    }

    /**
     * Thêm mới
     */
    insert(payload) {
        let request = {
            url: this.getAPIUrl(),
            data: payload
        };
        return httpClient.postAsync(request, true);
    }

    /**
     * Thêm mới
     */
    insertMulti(payload) {

        let request = {
            url: this.getAPIUrl() + "/batch",
            data: payload
        };
        return httpClient.postAsync(request, true);
    }

    /**
     * Cập nhật
     */
    update(payload) {
        let request = {
            url: this.getAPIUrl(),
            data: payload
        };
        return httpClient.putAsync(request, true);
    }

    /**
   * Cập nhật config 
   */
    updateConfig(payload) {
        let request = {
            url: this.getAPIUrl() + '/config',
            data: payload
        };
        return httpClient.putAsync(request, true);
    }

    /**
     * Cập nhật trạng thái cho các bản ghi
     * TDNGHIA 15/11/2021
     */
    updateStatus(payload) {
        let request = {
            url: this.getAPIUrl() + "/status",
            data: payload
        };

        return httpClient.putAsync(request, true);
    }

    /**
     * Xóa
     */
    delete(payload) {
        let request = {
            url: this.getAPIUrl(),
            data: payload
        };
        return httpClient.deleteAsync(request, true);
    }

    /**
     * Lấy dữ liệu combobox load paging
     */
    getComboboxPaging(payload) {
        let param = { ...payload };

        //xử lý tham số trước khi request load dữ liệu
        commonFn.processComboboxParamRequest(param);

        let request = {
            url: this.getAPIUrl() + "/combobox-paging",
            data: param
        };

        return httpClient.postAsync(request);
    }

    /**
     * Lấy dữ liệu combobox load paging, lấy tất cả bản ghi không phân biệt cơ cấu tổ chức
     */
    getComboboxPagingAll(payload) {
        let param = { ...payload };

        //xử lý tham số trước khi request load dữ liệu
        commonFn.processComboboxParamRequest(param);

        let request = {
            url: this.getAPIUrl() + "/combobox-paging-all",
            data: param
        };

        return httpClient.postAsync(request);
    }
}