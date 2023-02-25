import axios from 'axios';
import Qs from 'qs';
import Utility from '@/commons/utility';
import _ from 'lodash';
import { __assign } from 'tslib';
import store from '@/stores/store';

/**
 * Đối tượng thực hiện toàn bộ các request đến các api từ Client
 * Cả hệ thống sẽ thực hiện call qua đây để kiểm soát chung
 * Với các method:
 *  1. Get: sẽ sử dụng params
 *  2. Delete, Put, Post: Sử dụng data
 *
 * Trong tình huống có custom thêm thì bổ sung vào thuộc tính của config
 * VD: cần custom Content-Type
 * config = {
 *    headers: {
 *      "Content-Type": "application/x-www-form-urlencoded"
 *    }
 * }
 * @author DNThang - 04.07.2019
 * @modifiedBy DNThang - 30.04.2020: Bổ sung thêm cấu hình Comporession
 */
class HttpClient {
	//Danh sách các Method mà khi call sẽ sử dụng params
	lstMethodsParam = ['delete', 'get', 'head', 'options'];

	//#region  Public

	/**
	 * Khởi tạo các giá trị ngầm định của đối tượng làm việc với server
	 */
	constructor() {
		Utility.forEach(
			['delete', 'get', 'head', 'options'],
			function forEachMethodNoData(method) {
				HttpClient.prototype[method] = function(url, config) {
					return this.callRequest(
						Object.assign(config || {}, {
							method: method,
							url: url
						})
					);
				};
			}
		);

		Utility.forEach(
			['post', 'put', 'patch'],
			function forEachMethodWithData(method) {
				HttpClient.prototype[method] = function(url, data, config) {
					return this.callRequest(
						Object.assign(config || {}, {
							method: method,
							url: url,
							data: data
						})
					);
				};
			}
		);
	}

	/**
	 * Thực hiện chuẩn hóa request của axios theo method
	 * Với các
	 * @public
	 * Thực hiện gọi lên api (promise)
	 * @param {Object} options: Tham số của lời gọi
	 * @param {String} [options.url] đến api service (VD: https://smecloud.com.vn/api/Customer?CustomerID=2a31ba68-20ed-40fd-bbba-4b88873a8382)
	 * @param {String} [options.method] của lời gọi Service ('GET', 'POST', ...)
	 * @param {Object} [options.data] của request
	 * @param {Object} [options.config] ngầm định của request (VD: {async: false})
	 * @author DNThang - 03.07.2019
	 */
	request(options) {
		let me = this,
			isParam = false,
			optionAxios,
			data = options.data ? options.data : options.params,
			method = options.method.toLowerCase();

		if (me.lstMethodsParam.indexOf(method) !== -1) {
			isParam = true;
		}

		optionAxios = {
			url: options.url,
			method: method,
			data: isParam ? null : data,
			params: isParam ? data : null
			//cancelToken: options.cancelToken
		};
		//PDKIEN trộn cấu hình
		optionAxios = __assign(options, optionAxios);

		if (method === 'delete' || method === 'get') {
			if (optionAxios.params && optionAxios.params instanceof Array) {
				optionAxios.paramsSerializer = function(params) {
					return Qs.stringify(params, {
						arrayFormat: 'repeat'
					});
				};
			}
		}
		// return me.callRequest(options.url, options.method, options.data, options.config);
		return me.callRequest(optionAxios);
	}

	/**
	 * @public
	 * Gọi lên api truyền thằng Url vào (async)
	 * @param {String} url đến api service (VD: https://smecloud.com.vn/api/Customer?CustomerID=2a31ba68-20ed-40fd-bbba-4b88873a8382)
	 * @param {String} method của lời gọi Service ('GET', 'POST', ...)
	 * @param {Object} jsonData của request
	 * @param {Object} config ngầm định của request (VD: {async: false})
	 */
	async requestAsync(url, method, data, config) {
		let me = this;

		return await me.callRequestAsync(url, method, data, config);
	}

	/**
	 * @public
	 * Thực hiện gọi lên api (async)
	 * @param {Object} options: Tham số của lời gọi
	 * @param {String} [options.url] đến api service (VD: https://smecloud.com.vn/api/Customer?CustomerID=2a31ba68-20ed-40fd-bbba-4b88873a8382)
	 * @param {String} [options.method] của lời gọi Service ('GET', 'POST', ...)
	 * @param {Object} [options.data] của ajax request
	 * @param {Object} [options.config] ngầm định của ajax request (VD: {async: false})
	 * @author DNThang - 03.07.2019
	 */
	async requestAjaxAsync(options) {
		let me = this;

		return await me.callRequestAsync(
			options.url,
			options.method,
			options.data,
			options.config
		);
	}

	//#endregion Public

	//#region  Private

	/**
	 * @private
	 * Xử lý biến truyền vào trước khi call request
	 *  @param {options}: config dùng để call request
	 * @author DNThang - 02.07.2019
	 * ModifiedBy DNThang - 01.11.2019: Bổ sung xử lý thêm dữ liệu cho tình huống contentType là urlendcoded
	 */
	processData(options) {
		if (options) {
			if (options.headers) {
				let key = 'Content-Type',
					data = options.data ? options.data : options.params,
					contentType = Utility.objectGetField(options.headers, key);

				if (data && data instanceof Object && contentType) {
					let qs = Qs;
					if (
						contentType.contains(
							'application/x-www-form-urlencoded'
						) &&
						data instanceof Object
					) {
						data = qs.stringify(data);
						if (options.data) {
							options.data = data;
						}

						if (options.params) {
							options.params = data;
						}
					}
				}
			}
		}
	}

	/**
	 * Xử lý option, add thêm branchID, content-type, .... và các option khác nếu cần
	 * @param {*} options Option của axios chuẩn bị set vào request
	 * NQMinh 28.11.2019
	 */
	processHeader(options) {	
		let me = this;

		if (options) {
			let header = options.headers || {};

			if (!header['Authorization']) {
				let token = store.state.auth.mtaxAccessToken;
				if (token) {
					header['Authorization'] = ['Bearer ', token].join('');
				}
			}

			if (!header['Content-Type']) {
				header['Content-Type'] = 'application/json';
			}

			if (!header['apikey']) {
				header['apikey'] = "zkaokjAsldasd2#$$@@@";
				// header['apikey'] = window._appConfig.appKey;
			}
			

			if (!header['ClientId']) {
				header['ClientId'] = window.__env.authConfig.client_id;
			}

			options.headers = header;
		}
	}

	/**
	 * @private
	 * Xử lý biến truyền vào trước khi call request
	 *  @param {data}: object data hoặc model
	 * @author DNThang - 02.07.2019
	 */
	async processDataAsync(data) {}

	/**
	 * @private
	 * Xử lý call Request
	 * @param {string} url của service (VD: https://smecloud.com.vn/api/Customer?CustomerID=2a31ba68-20ed-40fd-bbba-4b88873a8382)
	 * @param {method} method của lời gọi Service ('GET', 'POST', ...)
	 * @param {data} jsonData của request
	 * @param {config} config ngầm định của request (VD: {async: false})
	 * @author DNThang - 02.07.2019
	 */
	callRequest(options) {
		let me = this;

		//Sau sẽ xử lý token authen ở đây
		let token = null;
		let axiosOpt = options;

		me.processData(axiosOpt);
		me.processHeader(axiosOpt);

		let axiosTemp = axios;

		let promise = new Promise((resolve, reject) => {
			axiosTemp(axiosOpt)
				.then(res => {
					resolve(res);
				})
				.catch(ex => {
					reject(ex);
				});
		});

		return promise;
	}

	/**
	 * @private
	 * Xử lý call Request Async
	 * @param {string} url của service (VD: https://smecloud.com.vn/api/Customer?CustomerID=2a31ba68-20ed-40fd-bbba-4b88873a8382)
	 * @param {method} method của lời gọi Service ('GET', 'POST', ...)
	 * @param {data} jsonData của request
	 * @param {config} config ngầm định của request (VD: {async: false})
	 * @author DNThang - 02.07.2019
	 */
	async callRequestAsync(url, method = 'GET', data, config = {}) {
		let me = this;

		//Sau sẽ xử lý token authen ở đây
		let token = null;

		let ajaxObj = {
			config: config ? config : {},
			url: url,
			method: method
		};

		await me.processDataAsync(data);

		let response = await axios({
			method: ajaxObj.method,
			url: ajaxObj.url,
			params: data
		});

		return response;
	}

	//#endregion Private
}

export default new HttpClient();
