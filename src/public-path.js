/* global __webpack_public_path__:writable */
/* exported __webpack_public_path__ */

// Thay đổi publish path lúc runtime, các request tới sẽ gọi vào đây
if (process.env.NODE_ENV !== 'development' && window._appConfig.publicPath) {
    // eslint-disable-next-line camelcase
    __webpack_public_path__ = window._appConfig.publicPath
  }
  