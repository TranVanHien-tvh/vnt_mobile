import BaseAPI from "@/apis/base/baseAPI";
import httpClient from "@/apis/base/axiosHttpClient";

class AuthenAPI extends BaseAPI {
  constructor() {
    super();
  }
  apiName = "Auth";
  controllerName = "authentication";

  /**
   * this.getAPIUrl() + // lấy local URL
   * Đăng nhập
   * @param {*} payload
   * @returns
   * npcuong 29.05.2022
   */
   login(payload) {
    let request = {
      url: this.getAPIUrl() + "/login-by-password",
      data: payload,
    };
    return httpClient.postAsync(request);
  }

  /**
   * Kiểm tra số điện thoại có trong hệ thống hay không
   * @param {*} payload 
   * @returns 
   * tvhien 27/08/2022
   */
  checkPhone(payload){
    let request = {
      url: this.getAPIUrl() + "/check-phone",
      data: payload,
    };
    return httpClient.postAsync(request);
  }

  /**
   * Xác nhận đổi mật khẩu
   * @param {*} payload 
   * @returns 
   * tvhien 27/08/2022
   */
  forgetPassword(payload){
    let request = {
      url: this.getAPIUrl() + "/forget-password",
      data: payload,
    };
    return httpClient.postAsync(request);
  }

  /**
   * Đăng ký tài khoản
   * @param {*} payload 
   * @returns
   * tvhien 28/08/2022 
   */
  signUp(payload){
    let request = {
      url: this.getAPIUrl() + "/signup-with-id-token",
      data: payload,
    };
    return httpClient.postAsync(request);
  }

  /**
   * 
   */
  changePassword(){
    let request = {
      url: this.getAPIUrl() + "/get-otp",
      data: payload
    };
    return httpClient.postAsync(request);
  }
}

export default new AuthenAPI();
