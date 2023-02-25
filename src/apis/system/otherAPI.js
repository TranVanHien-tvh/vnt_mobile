import BaseAPI from "@/apis/base/baseAPI";
import httpClient from "@/apis/base/axiosHttpClient";

class OtherAPI extends BaseAPI {
  constructor() {
    super();
  }
  apiName = "Business";
  controllerName = "other";
  /**
   * Lấy ra src ảnh của user
   */
   uploadUserAvatar(payload) {
    const me = this;
    let request = {
      url: [this.getAPIUrl(), `upload?type=user_info`].join('/'),
      data: payload,
      headers:{
        userid: 1,
        'Content-Type': 'multipart/form-data'
      }
    }
    return httpClient.postAsync(request);
  }

  getProvinces(payload) {
    const me = this;
    let request = {
      url: [this.getAPIUrl(), `list-cities`].join('/'),
      data: payload,
    }
    return httpClient.getAsync(request);
  }

  getWards(payload) {
    const me = this;
    let request = {
      url: [this.getAPIUrl(), `list-wards`].join('/'),
      data: payload,
    }
    return httpClient.getAsync(request);
  }

  getDistricts(payload) {
    const me = this;
    let request = {
      url: [this.getAPIUrl(), `list-districts`].join('/'),
      data: payload,
    }
    return httpClient.getAsync(request);
  }

  // /**
  //  * 
  //  * @param {*} payload 
  //  * @returns 
  //  */
  // updateUser(payload) {
  //   const me = this;

  //   let request = {
  //     url: [this.getAPIUrl(), `update`].join('/'),
  //     data: payload,
  //     headers:{
  //       apisecret: '6d552d1a-8d78-418f-af22-3e38878bc17d',
  //       userid: 1,
  //       osinfo: 'iOS',
  //       deviceinfo: 'iPhone',
  //       appversion: '1.0.0',
  //       uuid: 'zzzzzzz',
  //       refreshkey: 'b00e7b10-d895-4bd6-adaf-c1c656336caf'
  //     }
  //   }
  //   return httpClient.postAsync(request);
  // }
}

export default new OtherAPI();
