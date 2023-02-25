import BaseAPI from "@/apis/base/baseAPI";
import httpClient from "@/apis/base/axiosHttpClient";

class ActivityAPI extends BaseAPI {
  constructor() {
    super();
  }
  apiName = "Business";
  controllerName = "activities";
  
  getActivityByID(id) {
    let request = {
      url: [this.getAPIUrl(), `detail?id=${id}`].join("/"),
      headers:{
        apisecret: '6d552d1a-8d78-418f-af22-3e38878bc17d',
        userid: 1,
        osinfo: 'iOS',
        deviceinfo: 'iPhone',
        appversion: '1.0.0',
        uuid: 'zzzzzzz',
        refreshkey: 'b00e7b10-d895-4bd6-adaf-c1c656336caf'
      }
    };

    return this.getAsync(request);
  }

  /**
   * lấy ra danh sách các hoạt động theo chủ đề
   * @param {*} param 
   * @returns 
   * tvhien 11/06/2022
   */
  getListActivities(param) {
    let request = {
      url: [this.getAPIUrl(), `list?page_id=${param.pageID}&limit=${param.limit}&theme=${param.theme}&type=${param.type}`].join("/"),
      headers:{
        userid: 1
      }
    };

    return this.getAsync(request);
  }

  getListActivitiesJoin(param) {
    let request = {
      url: [this.getAPIUrl(), `list-joined?page_id=${param.pageID}&limit=${param.limit}&type=${param.type}`].join("/"),
      headers:{
        userid: 1,
      }
    };

    return this.getAsync(request);
  }

  getListActivitiesFollow(param) {
    let request = {
      url: [this.getAPIUrl(), `list-followed?page_id=${param.pageID}&limit=${param.limit}&type=${param.type}`].join("/"),
      headers:{
        apisecret: '6d552d1a-8d78-418f-af22-3e38878bc17d',
        userid: 1,
        osinfo: 'iOS',
        deviceinfo: 'iPhone',
        appversion: '1.0.0',
        uuid: 'zzzzzzz',
        refreshkey: 'b00e7b10-d895-4bd6-adaf-c1c656336caf'
      }
    };

    return this.getAsync(request);
  }

  /**
   * Tạo câu lạc bộ
   * @param {*} payload 
   * @returns 
   */
   createActivity(payload) {
    let request = {
      url: [this.getAPIUrl(), `create?`].join("/"),
      headers:{
        apisecret: '6d552d1a-8d78-418f-af22-3e38878bc17d',
        userid: 1,
        osinfo: 'iOS',
        deviceinfo: 'iPhone',
        appversion: '1.0.0',
        uuid: 'zzzzzzz',
        refreshkey: 'b00e7b10-d895-4bd6-adaf-c1c656336caf'
      },
      data: payload
    };

    return this.postAsync(request);
  }

  /**
   * tham gia hoạt động
   * @param {*} payload 
   * @returns 
   * tvhien 27/11/2022
   */
   joinActivity(payload) {
    const me = this;

    let request = {
      url: [this.getAPIUrl(), `user-join`].join('/'),
      data: payload,
    }
    return httpClient.postAsync(request);
  }

}

export default new ActivityAPI();
