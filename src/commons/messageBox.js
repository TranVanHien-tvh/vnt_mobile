/**
 * File messageBox.js
 * Description: File dùng trung gian để gọi thông báo
 * creatd by: nntam - 16/8/2019
 */
import Vue from "vue";
import MsMessageBox from "@/components/msmessagebox/MsMessageBox";

class MessageBox {
  show(option) {
    var promise = new Promise((resolve, reject) => {
      let me = this;
      // cấu hình button mặt định
      var btnConfigDefault = [
        {
          key: "Save",
          target: "Right",
          text: "Lưu",
          hasBtn: false,
          typeButton: "blue",
        },
        {
          key: "SaveNew",
          target: "Right",
          text: "Lưu và thêm mới",
          hasBtn: false,
          typeButton: "blue",
        },
        {
          key: "Cancel",
          hasBtn: false,
          target: "Left",
          text: "Hủy bỏ",
          typeButton: "third"
        },
        {
          key: "Close",
          hasBtn: false,
          target: "Center",
          text: "Đóng",
          typeButton: "primary"
        },
        {
          key: "Yes",
          hasBtn: false,
          target: "Right",
          text: "Đồng ý",
          typeButton: "primary",
          focus: true
        },
        {
          key: "No",
          hasBtn: false,
          target: "Right",
          text: "Không",
          typeButton: "secondary"
        },
        {
          key: "SaveAndMotive",
          target: "Right",
          hasBtn: false,
          text: "Lưu & phát động",
          typeButton: "secondary",
        },
      ];

      // merge cấu hình người dùng với cấu hình mặc định
      // nntam - 16/04/2020: bổ sung thêm truyền vào loại button (typeButton)
      if (option.btnConfig != null) {
        // NMTUAN2 18.01.2022: chỉ sử dụng cấu hình button truyền xuống
        if (option.onlyUseCustomButton) {
          btnConfigDefault = option.btnConfig.map((btn) => { return Object.assign({ hasBtn: true }, btn) });
        }
        else {
          btnConfigDefault.forEach(element => {
            element.hasBtn = false;
            option.btnConfig.forEach(e => {
              if (element.key === e.key) {
                element.target = e.target;
                element.hasBtn = true;
                element.text = e.text ? e.text : element.text;
                element.focus = e.focus;
                element.typeButton = e.typeButton
                  ? e.typeButton
                  : element.typeButton;
              }
            });
          });
        }
      }

      // gán lại cấu hình mặc định với các tham số người dùng gửi vào
      var optionDefault = {
        title: option.title,
        message: option.message,
        messageDetail: option.messageDetail || null,
        icon:
          option.icon == false
            ? false
            : option.icon
              ? option.icon
              : "mi-exclamation-warning-48",
        line: option.line == false ? false : true,
        btnConfig: btnConfigDefault,
        closeMessageAfterLink: option.closeMessageAfterLink,
        close: typeof option.close === 'undefined' ? true : option.close,
        width: option.width ? option.width : "444px",
        title: option.title ? option.title : null
      };

      var zz = new Vue({
        el: "#message-box",
        components: {
          MsMessageBox
        },
        computed: {},
        methods: {},
        render: function (h) {
          // const vv = {
          //   on: {
          //     ttt(val) {
          //       a = val;
          //       this.$emit('messageClick', val);
          //     }
          //   }
          // }
          return (
            <MsMessageBox
              ref="msgBox"
              option={optionDefault}
            //  {...vv}
            >
              {" "}
            </MsMessageBox>
          );
        }
      });
      // nhận sự kiện click vào button
      let msgBox = zz.$refs.msgBox;
      if (msgBox) {
        msgBox.$on("btnClick", function (msg, action) {
          resolve(action);
        });
        // hngiap - 26.05.2020: Bổ sung callback thêm tham số resolve, reject để
        // - Xử lý trường hợp await action của msgBox cần resolve để chạy tiếp
        msgBox.$on("linkActive", function () {
          me.customLinkActive(resolve, reject);
        });
        msgBox.$on("linkPopup", this.customLinkPopup);
      }
    });

    return promise;
  }

  customLinkActive(resolve, reject) {
    // console.log('run');
  }

  customLinkPopup() { }
  /**
   * Hàm hiện thị message box câu hỏi
   * @param option Nội dung thông báo hoặc config
   */
  showQuestion(option) {
    // cấu hình mặc định với msg Question
    var cf = {
      // icon: 'mi-exclamation-question-48',
      // line: true
    }


    if (typeof option === "object") {
      Object.assign(cf, option);
      if (!cf.title)
        cf.title = window._appConfig.appTitle
      if (option.yesNoCancel) {
        cf.btnConfig = [
          {
            key: "Cancel",
            target: "Left",
            text: "Hủy bỏ",
            typeButton: "secondary"
          },
          {
            key: "No",
            target: "Right",
            text: "Không",
            typeButton: "secondary"
          },
          {
            key: "Yes",
            target: "Right",
            text: "Có",
            focus: true,
            typeButton: option.typeButton || "danger"
          }
        ];
      } else {
        cf.btnConfig = cf.btnConfig ? cf.btnConfig : [
          {
            key: "No",
            target: "Right",
            text: "Không",
            typeButton: "secondary"
          },
          {
            key: "Yes",
            target: "Right",
            text: "Có",
            focus: true,
            typeButton: option.typeButton || "danger"
          }
        ];
      }
    } else {
      cf.message = option;
      cf.title = window._appConfig.appTitle
    }

    return this.show(cf);
  }

  /**
   * Hàm hiện thị message box câu hỏi
   * @param {Message cần hiển thị ra} message
   * @param {Mesage chi tiết cần hiện, khi ẩn mở rộng và thu gọn} messageDetail
   */
  showDelete(message, messageDetail, title) {
    // cấu hình mặc định với msg Question
    if (!title) {
      title = window._appConfig.appTitle
    }
    var option = {
      message: message,
      messageDetail: messageDetail,
      icon: "mi-exclamation-question-48",
      line: true,
      btnConfig: [
        {
          key: "No",
          target: "Right",
          text: "Hủy bỏ",
          typeButton: "third"
        },
        {
          key: "Yes",
          target: "Right",
          text: "Xóa",
          typeButton: "danger-outline",
          focus: true
        }
      ]
    };

    return this.show(option);
  }

  /**
   * Hàm hiện thị message box cảnh báo
   * @param {Message cần hiển thị ra} message
   * @param {Mesage chi tiết cần hiện, khi ẩn mở rộng và thu gọn} messageDetail
   */
  showWarning(message, messageDetail, title, config) {
    if (!title) {
      title = window._appConfig.appTitle
    }

    // cấu hình mặc định với msgWarning
    var option = {
      message: message,
      messageDetail: messageDetail,
      icon: "mi-exclamation-warning-48",
      line: true,
      title: title,
      btnConfig: [
        {
          key: "Close",
          target: "Right",
          text: "Đóng",
          typeButton: "secondary",
          focus: true
        }
      ]
    };

    if (typeof config === 'object') {
      Object.assign(option, config);
    }

    return this.show(option);
  }

  /**
   * Hàm hiện thị message box lỗi
   * @param {Message cần hiển thị ra} message
   * @param {Mesage chi tiết cần hiện, khi ẩn mở rộng và thu gọn} messageDetail
   */
  showError(message, messageDetail, title, config) {
    if (!title) {
      title = window._appConfig.appTitle
    }
    // cấu hình mặc định với msg Error
    var option = {
      message: message,
      messageDetail: messageDetail,
      icon: "mi-exclamation-error-48-2",
      line: true,
      title: title,
      btnConfig: [
        {
          key: "Close",
          target: "Right",
          text: "Đóng",
          typeButton: "danger",
          focus: true
        }
      ]
    };

    if (typeof config === 'object') {
      Object.assign(option, config);
    }

    return this.show(option);
  }

  /**
   * Hàm hiện thị message box thông tin
   * @param {Message cần hiển thị ra} message
   * @param {Mesage chi tiết cần hiện, khi ẩn mở rộng và thu gọn} messageDetail
   */
  showInfo(message, messageDetail, title, config) {
    // cấu hình mặc định với info
    if (!title) {
      title = window._appConfig.appTitle
    }
    var option = {
      message: message,
      messageDetail: messageDetail,
      icon: "mi-exclamation-info-48",
      line: true,
      title: title,
      btnConfig: [
        {
          key: "Close",
          target: "Right",
          text: "Đóng",
          focus: true,
          typeButton: "secondary"
        }
      ]
    };

    if (typeof config === 'object') {
      Object.assign(option, config);
    }

    return this.show(option);
  }

  /**
   * Hàm hiện thị message box xác nhận
   * @param {Message cần hiển thị ra} message
   * @param {Mesage chi tiết cần hiện, khi ẩn mở rộng và thu gọn} messageDetail
   */
  showConfirm(message, messageDetail, config, title, textBtnYes = 'Lưu thay đổi', close, opts) {
    // cấu hình mặc định với msg confirm
    if (!title) {
      title = window._appConfig.appTitle
    }
    var option = {
      message: message,
      messageDetail: messageDetail,
      icon: "mi-exclamation-warning-48",
      title: title,
      line: true,
      close: close,
      btnConfig: config ? config : [
        // {
        //   key: "Cancel",
        //   target: "Left",
        //   text: "Hủy bỏ"
        // },
        {
          key: "No",
          target: "Right",
          text: "Không"
        },
        {
          key: "Yes",
          target: "Right",
          text: textBtnYes,
          focus: true
        }
      ]
    };

    if (typeof opts === 'object') {
      Object.assign(option, opts);
    }

    return this.show(option);
  }

  /**
   * Hàm hiện thị message box thành công
   * @param {Message cần hiển thị ra} message
   * @param {Mesage chi tiết cần hiện, khi ẩn mở rộng và thu gọn} messageDetail
   * created by ntphong 19/3/2020
   */
  showSuccess(message, messageDetail, title, config) {
    // cấu hình mặc định với info
    if (!title) {
      title = window._appConfig.appTitle
    }
    var option = {
      message: message,
      messageDetail: messageDetail,
      icon: "mi-exclamation-success-48",
      line: true,
      title: title,
      btnConfig: [
        {
          key: "Close",
          target: "Right",
          text: "Đóng",
          typeButton: "primary",
          focus: true
        }
      ]
    };

    if (typeof config === 'object') {
      Object.assign(option, config);
    }

    return this.show(option);
  }
}

export default new MessageBox();
