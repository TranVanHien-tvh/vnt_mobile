/**
 * Cấu hình endpoint api, config lại theo môi trường
 */
window._apis = {
  //Api
  Auth: "http://123.31.12.126:8080/api",
  Business: "http://123.31.12.126:8080/api",
  // Storage: "https://localhost:44300",
  // Report: "https://localhost:44318",
  // Import: "https://localhost:44351",
  // System: "https://localhost:44397"
};

// /**
//  * Cấu hình các kết nối với bên ngoài
//  */
// window._external = {
//   eOfficeUrl: "",
//   eOfficeHelp: "",
//   ISMACUrl: "http://ismac.misa.local/platform.js"
// };

/**
 * Config app
 */
window._appConfig = {
  appTitle: 'VietNam Together',
  appKey:"zkaokjAsldasd2#$$@@@",
  // broadcastChannel: '_cegov',
  storageKey: '_vnt',
  // saveTimeout: 100,
  // syncLoadingTimeOut: 600000,
  // buttonClickDeplayMilliseconds: 1000,
  // checkInstallTimeout: 60000,
  // showLoadChunkFail: true,
  // axiosTimeout: 15000,
  // importTimeout: 60000,
  // //Config lại theo môi trường
  // publicPath: 'https://eofficecdnapp.misa.local/cegov',
  // base_router: '/',
  // isAlwaysShowSurvey: false,
  // appCode: 'CEGOV',
  // appName: 'Thi đua - khen thưởng',
  // webMISA: 'https://www.misa.com.vn/',
  // ignoredTenantNPS: 'thidiem,demo',
  // helpURL: 'https://helpcegov.misa.vn/'
};

/**
 * Cấu hình validate file trên client
 */
window._fileConfig = {
  UploadAllowExtension: "ppt,pptx,doc,docx,xls,xlsx,pdf,txt,zip,rar,png,jpg,gif,bmp,tiff,svg,xml,inv,ods,odt,rtf,heic,jpeg,jpe",
  UploadMaxSizeMB: 30,
}

/**
 * Cấu hình trường thông tin khác
 */
window._customFieldConfig = {
  //Tối đa 20 bản ghi khi thêm thông tin khác
  MaxSize: 20
}

// chứa link QR, link APP
window._qrcode = {
  appstoreQR: "https://www.apple.com/v/app-store/b/images/overview/icon_appstore__ev0z770zyxoy_large_2x.png",
  chplayQR: "https://cdn.tgdd.vn/Files/2019/11/29/1223434/cach-thay-doi-vung-khu-vuc-quoc-gia-tren-ch-play.png",
  imageQR: "https://scontent.xx.fbcdn.net/v/t1.15752-9/279812760_3057537441179058_4293777218088299608_n.png?_nc_cat=108&ccb=1-6&_nc_sid=aee45a&_nc_ohc=G5rpHFCYqQkAX_APjES&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=03_AVIrblVPCN5ZDH9RB7jmlDGXG4obia72UhEOma7RXM80hg&oe=629EA52C"
};