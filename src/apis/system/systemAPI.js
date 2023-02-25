import BaseAPI from '@/apis/base/baseAPI';
import httpClient from "@/apis/base/axiosHttpClient";

class SystemAPI extends BaseAPI {
	constructor() {
		super();
	}
	apiName = 'Business';
	controllerName = 'System';

	// /**
	//  * Lấy context data
	//  */
	// async getContextData(param) {
	// 	let request = {
	// 		url: this.getAPIUrl() + "/context"
	// 	};
	// 	return await httpClient.getAsync(request);
	// }
}

export default new SystemAPI();