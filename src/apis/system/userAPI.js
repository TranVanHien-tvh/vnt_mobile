import BaseAPI from "@/apis/base/baseAPI";
import httpClient from "@/apis/base/axiosHttpClient";

class UserAPI extends BaseAPI {
  constructor() {
    super();
  }
  apiName = "Business";
  controllerName = "users";

  // /**
  //  * @override: Lấy dữ liệu danh sách
  //  * @author vvkiet - 17.03.2021
  //  */
  // getList(payload) {
  //   // URL mặc định
  //   let url = this.getAPIUrl() + "/list";

  //   if (payload.type == "all_user_permission") {
  //     url = this.getAPIUrl() + "/all_user_permission";
  //   }

  //   // Build tham số
  //   let request = {
  //     url: url,
  //     data: payload,
  //   };

  //   // Call api
  //   return httpClient.postAsync(request);
  // }

  // /**
  //  * @override: Lấy dữ liệu danh sách
  //  * @author vvkiet - 17.03.2021
  //  */
  // getAllUserAmis(payload) {
  //   // URL mặc định
  //   let url = this.getAPIUrl() + "/all_user_ams_permission";

  //   // Build tham số
  //   let request = {
  //     url: url,
  //     data: payload,
  //   };

  //   // Call api
  //   return httpClient.getAsync(request);
  // }
  // /**
  //  * lấy danh sách userjoin với employee
  //  * @param {*} payload
  //  * @returns
  //  */
  // getUserJoinEmployee(payload) {
  //   // URL mặc định
  //   let url = this.getAPIUrl() + "/user_join_employee";

  //   // Build tham số
  //   let request = {
  //     url: url,
  //     data: payload,
  //   };

  //   // Call api
  //   return httpClient.getAsync(request);
  // }

  /**
   * Lấy ra src ảnh của user
   */
  getUserInfo(id) {
    const me = this;

    let request = {
      url: [this.getAPIUrl(), `info?id=${id}`].join('/'),
      headers:{
        userid: 1,
      }
    }
    return httpClient.getAsync(request);
  }

  /**
   * 
   * @param {*} payload 
   * @returns 
   */
  updateUser(payload) {
    const me = this;

    let request = {
      url: [this.getAPIUrl(), `update`].join('/'),
      data: payload,
      headers:{
        userid: 1,
      }
    }
    return httpClient.postAsync(request);
  }

  /**
   * Thực hiện điều hướng sang misaID theo action
   */
  generateLogin(payload) {
    const me = this;
    
    let request = {
      url: [this.getAPIUrl(), 'generatelinklogin', payload.Action].join('/'),
      data: payload.Acion
    }
    return httpClient.getAsync(request, true);
  }
}

export default new UserAPI();
