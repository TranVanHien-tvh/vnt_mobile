<!-- =========================================================================================
Popup Thêm tài liệu đính kèm (Thêm nhiều) 
========================================================================================== -->
<template>
  <div>
    <input
      ref="file"
      type="file"
      class="hidden"
      @change="fileSelected"
      :accept="'*'"
      :multiple="true"
    />
  </div>
</template>

<script>
import BaseDetailPopup from "@/views/base/BaseDetailPopup";
import msAttachment from "@/components/msattachment/msAttachment.vue";
import msDownLoadVue from "@/components/msdownload/msDownLoad.vue";
import fileApi from "@/apis/system/fileAPI";
import commonFn from "@/commons/commonFunction";

export default {
  components: {},
  extends: BaseDetailPopup,

  data() {
    const me = this;
    return {
      module: "attachmentdetail",
      listAttachmentSave: [],
      rowActions: [
        {
          command: "Delete",
          icon: "delete",
          text: this.$t("i18nCommon.command.delete"),
        },
      ],
      dataRow: [],
      AttachmentChanges: [],
      listAttachmentDeleted: [],
      isShowFileBrowser: false,
      fileSizeSumary: 0,
      /**
       * Giữ source all file kèm state
       */
      internalValue: [],
      /**
       * Giữ tạm thời các file dc thông qua khi upload
       */
      fileTemps: [],
      fileType: me.$ms.enum.StorageFileType.Temp,
    };
  },

  methods: {
    /**
     * @override
     * Kiểm tra tổng dung lượng file đã vượt quá 30MB hay chưa trước khi mở file browser
     * NTDIEM 07/04/2022
     */
    show(param, options) {
      const me = this;

      me.fileSizeSumary = options.fileSizeSumary;
      if (me.fileSizeSumary / 1048576 > 30) {
        me.fileSizeSumary = 0;
        me.$ms.msgBox.showError(
          me.$t("i18nComponent.Attachment.FileSumaryLarger30MB")
        );
        me.hide();
      } else {
        me.super("show", param, options);
      }
    },

    /**
     * @override
     * Không load data mà mở file browser luôn
     * NTDIEM 06/04/2022
     */
    loadData() {
      this.$refs.file.click();
      return;
    },

    /**
     * Xử lý sau khi chọn file
     * NTDIEM 06/04/2022
     */
    fileSelected(e) {
      const me = this,
        files = e.target.files;
      me.loading = true;
      commonFn.mask();

      if (me.validateFile(files)) {
        if (me.fileTemps.length > 0) {
          me.$emit("selected");
          //Nếu là avatar thì lưu fileName = employeeID
          if (me.Type == "avatar") {
            me.fileTemps.map((item) => {
              // let fileExtension = item.name.split(".").pop();
              item.FileName = me.AttachmentData.toString();
              me.avatarFile = item;
            });
            me.customFileType = me.$ms.enum.StorageFileType.Avatar;
          }
          fileApi
            .uploads(
              me.fileTemps,
              me.customFileType ? me.customFileType : me.fileType
            )
            .then((result) => {
              result.forEach((item, i) => {
                let file = files[i];

                if (item.error) {
                  //TODO lỗi thì...
                  if (item.error === "File extension invalid") {
                    me.$ms.msgBox.showError(
                      me.$t("i18nComponent.Attachment.FileExtensionInvalid")
                    );
                  } else if (item.error === "File name invalid") {
                    me.$ms.msgBox.showError(
                      me.$t("i18nComponent.Attachment.FileNameInvalid")
                    );
                  } else if (item.error === "File larger 30 MB") {
                    me.$ms.msgBox.showError(
                      me.$t("i18nComponent.Attachment.FileLarger30MB")
                    );
                  } else {
                    me.$ms.msgBox.showError(item.error);
                  }
                } else {
                  let newInternalValue = {
                    name: file.name,
                    size: file.size,
                    file: item.name,
                    state: me.$ms.enum.ModelState.Insert,
                  };
                  //Nếu là sửa thì thêm trường id cho tệp đính kèm để sửa
                  if (me.formState == me.$ms.enum.ModelState.Update) {
                    newInternalValue.AttachmentID = me.attachmentID;
                  }
                  //Thêm file mới
                  me.internalValue.push(newInternalValue);
                }
              });

              me.emitValue();
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              e.target.value = "";
              me.loading = false;
              commonFn.unmask();
            });
        } else {
          me.loading = false;
          commonFn.unmask();
        }
      } else {
        me.loading = false;
        commonFn.unmask();
      }
    },

    /**
     * Lấy tên file: bỏ đi phần mở rộng (.docs, .xmind, ...)
     * NTDIEM 18.11.2021
     */
    getFileName(name) {
      return name.split(".").slice(0, -1).join(".");
    },

    /**
     * validate File
     */
    validateFile(files) {
      let me = this,
        valid = true;
      me.fileTemps = [];

      files.forEach((file) => {
        var data = file.name.split(".");

        me.fileSizeSumary += file.size;
        //Nếu không có extension -> fail
        if (data.length < 2) {
          valid = false;
          me.$ms.msgBox.showError(
            me.$t("i18nComponent.Attachment.FileNameInvalid")
          );
          return;
        }

        var ext = data[data.length - 1].toLowerCase();
        if (
          window._fileConfig &&
          !window._fileConfig.UploadAllowExtension.contains(ext)
        ) {
          valid = false;
          me.$ms.msgBox.showError(
            me.$t("i18nComponent.Attachment.FileExtensionInvalid")
          );
          return;
        }

        if (
          window._fileConfig &&
          file.size > window._fileConfig.UploadMaxSizeMB * 1024 * 1024
        ) {
          valid = false;
          me.$ms.msgBox.showError(
            me.$t("i18nComponent.Attachment.FileLarger30MB")
          );
          return;
        }
        if (valid) {
          me.fileTemps.push(file);
        }
      });
      if (me.fileSizeSumary / 1048576 > 30) {
        valid = false;
        me.fileSizeSumary = 0;
        me.$ms.msgBox.showError(
          me.$t("i18nComponent.Attachment.FileSumaryLarger30MB")
        );
      }
      return valid;
    },

    /**
     * gửi thông tin update value cho control cha
     */
    emitValue() {
      const me = this;
      me.suppendValue = true;

      let value = [],
        change = [];
      me.internalValue.forEach((item) => {
        if (item.state !== me.$ms.enum.ModelState.Delete) {
          let fileName = this.getFileName(item.name);
          value.push({
            Name: fileName,
            FileName: item.file,
            AttachmentName: item.name,
            FileSize: item.size,
            EntityState: me.$ms.enum.ModelState.Insert,
            FileType: me.fileType,
          });
        }

        switch (item.state) {
          case me.$ms.enum.ModelState.Insert:
          case me.$ms.enum.ModelState.Delete:
            change.push({
              file: item.file,
              state: item.state,
            });
            break;
        }
      });
      me.setAttachmentDetail(value, change);
      me.$emit("input", value, change);
      me.$emit("update:change", change);
    },

    /**
     * Set gias trị các trường cho tài liệu
     * NTDIEM 23.11.2021
     */
    setAttachmentDetail(value, change) {
      const me = this;

      //show mask
      me.loading = true;
      let newListFolder = [];
      value.forEach((item) => {
        let newAttachment = item;

        newAttachment.FileSize = me.formatSizeUnits(item.FileSize);
        newListFolder.push(newAttachment);
      });
      me.currentItem = newListFolder;
      me.AttachmentChanges = change;

      me.submit({ Entity: newListFolder }, "insert");
    },

    /**
     * Xử lý cất dữ liệu
     * Gửi xuống grid ở detail
     * NTDIEM 23.11.2021
     */
    submit(param, action) {
      const me = this;

      if (param.Entity.length) {
        param.Entity.forEach((entity) => {
          entity.Author = me.options.context.User.FullName;
          entity.CreatedDate = new Date();
          entity.OrganizationID =
            me.options.context.Organization.OrganizationID;
          param.Entity.EntityState = action;
        });
        param.AttachmentChanges = me.AttachmentChanges;
        param.fileSizeSumary = me.fileSizeSumary;
        //xử lý sau khi cất
        me.afterSubmit({}, param, action);
      } else {
        //Nếu không có dữ liệu tệp đính kèm thì đóng popup
        me.$emit("savesuccess", param.Entity);
        me.hide();
      }
    },

    /**
     * Chuyển đổi dung lượng  file
     * NTDIEM 29.11.2021
     */
    formatSizeUnits(bytes) {
      if (bytes >= 1048576) {
        bytes = (bytes / 1048576).toFixed(2) + " MB";
      } else {
        bytes = (bytes / 1024).toFixed(2) + " KB";
      }
      return bytes;
    },

    /**
     * @override
     * Lấy câu thông báo sau khi thêm thành công tệp đính kèm
     * NTDIEM 21.12.2021
     */
    getNotiSuccess() {
      const me = this;

      me.$toast.success(me.$t("i18nBaseForm.Message.AddSuccess"));
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .form-label {
  margin-bottom: 8px;
  color: #666666;
  font-size: 14px;
  font-weight: 500;
}

::v-deep .note {
  height: 32px;
  margin-left: 8px;
  margin-top: 4px;
  color: #707070;
  font-size: 12px;
  font-weight: 100;
}
::v-deep.custom-grid {
  border: 1px solid #c1c1c1;
  max-height: 200px;
}
::v-deep.attachment-custom {
  border: none !important;
  padding: 0px !important;
}
::v-deep .ms-content--table {
  border-bottom: none !important;
  overflow-x: hidden;
}
::v-deep .empty-text-content {
  width: auto !important;
}
::v-deep .ms-td {
  padding: 0 16px !important;
  max-width: 230px;
}
::v-deep .editor-display {
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.file-input {
  width: 0px;
  height: 0px;
}
</style>
