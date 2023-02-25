import BaseAPI from "@/apis/base/baseAPI";
import httpClient from "@/apis/base/axiosHttpClient";

class EventAPI extends BaseAPI {
  constructor() {
    super();
  }
  apiName = "Business";
  controllerName = "event";

  /**
   * Đăng nhập
   * @param {*} payload
   * @returns
   */
  eventRegister(payload) {
    let request = {
      url: this.getAPIUrl() + "/guest-register",
      data: payload
    };
    return httpClient.postAsync(request);
  }
}

export default new EventAPI();
