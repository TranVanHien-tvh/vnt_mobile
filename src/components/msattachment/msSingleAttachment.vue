<template>
  <div ref="container" class="ms-attachment form-group">
    <div v-if="Type == 'avatar'">
      <div class="add-img pointer" @click="add">Chọn ảnh</div>
    </div>
    <div v-else>
      <div class="flex-row" v-if="visibleItems.length <= 0">
        <div class="d-flex form-group">
          <div class="upload d-flex pointer" @click="add">
            <div class="icon20" />
            <div class="text">
              {{ $t("i18nComponent.Attachment.Label") }}
            </div>
          </div>
          <div class="d-flex">
            <div class="des-text">
              Hỗ trợ định dạng *.doc, *.docx, *.pdf và kích thước tối đa 30MB
            </div>
          </div>
        </div>
      </div>
      <div class="flex-row" v-else>
        <div class="attachment-row flex-row">
          <div class="flex-row">
            <div
              class="file-name blue-text pointer col"
              @click="previewFile"
              v-tooltip="attachmentDataRow.AttachmentName"
            >
              {{ attachmentDataRow.AttachmentName }}
            </div>
            <div
              v-show="isShowDownloadIcon"
              class="download-icon pointer"
              @click="downloadFile"
            ></div>
          </div>

          <div class="file-size col">
            {{ attachmentDataRow.FileSize }}
          </div>

          <div class="row-action d-flex">
            <div class="pointer change-file" @click="add">Đổi tệp khác</div>
            <div
              class="ic20 download-icon pointer"
              v-tooltip="'Tải tệp'"
              @click="downloadFile"
            ></div>
            <div
              class="ic20 delete pointer"
              v-tooltip="'Xóa'"
              @click="remove(internalValue[0])"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <input
      ref="file"
      type="file"
      class="hidden"
      :accept="Type == 'avatar' ? avtfile : accept"
      @drop="fileSelected2"
      @dragover="fileSelected2"
      @change="fileSelected"
    />
  </div>
</template>
<script>
import { MSEnum } from "@/commons/enumeration";
import fileApi from "@/apis/system/fileAPI";
import commonFn from "@/commons/commonFunction";
import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
import popupUtil from "@/commons/popupUtil";
// import msDownLoad from "../msdownload/msDownLoad.vue";
// import EmployeeProfileDetailTabVue from "../../views/movement/emulationprofile/tabdetail/EmployeeProfileDetailTab.vue";

export default {
  components: {},
  name: "MsSingleAttachment",
  props: {
    /**
     * V-model bắn ra ngoài binding 2 chiều
     */
    value: {
      type: Object,
      default: Object,
    },
    /**
     * Không cho phép thao tác upload
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Cho chọn nhiều file không
     */
    multiple: {
      type: Boolean,
      default: true,
    },
    /**
     * Danh sách các loại file
     */
    accept: {
      type: String,
      default: "*",
    },
    /**
     * Danh sách các loại file
     */
    fileType: {
      type: Number,
      default: MSEnum.StorageFileType.Temp,
    },
    /**
     * vị trí hiển thị dropdown list file
     * Mặc định là hướng sang trái
     */
    position: {
      type: String,
      default: "left",
    },

    /**
     * Đính kèm 1 tệp hay nhiều tệp
     * TDNGHIA 17/11/2021
     */
    singleAttachment: {
      type: Boolean,
      default: false,
    },

    /**
     * Có cho hiện icon tải xuống hay không
     * NTDIEM 31.12.2021
     */
    isShowDownloadIcon: {
      type: Boolean,
      default: false,
    },

    Type: {
      type: String,
      default: "default",
    },

    AttachmentData: {
      default: null,
    },
  },
  data() {
    return {
      avtfile: "image/png, image/jpg",

      /**
       * Giữ source all file kèm state
       */
      internalValue: [],
      /**
       * Giữ tạm thời các file dc thông qua khi upload
       */
      fileTemps: [],

      /**
       * Hiển thị danh sách các file đính kèm
       */
      showListFile: false,
      /**
       * Cờ đang xử lý trên server
       */
      loading: false,

      /**
       * Dữ liệu thay đổi
       * Dùng để trên service đọc ra xử lý
       * khi value được update sẽ update kèm món này
       */
      change: [],
      /**
       * Trạng trái form là thêm mới hay sửa
       */
      formState: null,
      attachmentID: null,
      attachmentDataRow: {},
      customFileType: null,
      avatarFile: null,
    };
  },
  computed: {
    ...mapGetters(ModuleContext, ["Context"]),

    //TDNGHIA 17/11/2021: thêm context vào để tải về thì truyền org phân biệt đơn vị
    context() {
      return this.$store.state[ModuleContext];
    },

    /**
     * Câc file hiển thị
     */
    visibleItems() {
      const me = this;
      let rs = [];
      if (Array.isArray(me.internalValue)) {
        let tenantId = me.Context.TenantID;
        me.internalValue.forEach((item) => {
          if (item.state !== MSEnum.ModelState.Delete) {
            let temp = {
              origin: item,
            };

            temp.link = fileApi.getDownloadLink(
              item.file,
              me.fileType,
              tenantId,
              me.context.Organization.OrganizationID || 0,
              item.name
            );
            rs.push(temp);
          }
        });
      } else {
        temp.link = fileApi.getDownloadLink(
          me.internalValue.file,
          me.fileType,
          tenantId,
          me.context.Organization.OrganizationID || 0,
          me.internalValue.name
        );
        rs = temp;
      }
      return rs;
    },
  },
  watch: {
    value(newValue) {
      const me = this;
      if (me.suppendValue) {
        delete me.suppendValue;
        return;
      }
      if (newValue) {
        me.internalValue = [];
        //single attachment: newValue la 1 object
        //Nếu là sửa tài liệu đính kèm thì gán lại các giá trị cho internalValue
        if (newValue.EntityState == me.$ms.enum.ModelState.Update) {
          newValue.file = newValue.FileName;
          newValue.name = newValue.AttachmentName;
          me.attachmentID = newValue.AttachmentID;
          me.formState = me.$ms.enum.ModelState.Update;
        }
        newValue.state = null;
        if (newValue.file) {
          me.internalValue.push(newValue);
          me.attachmentDataRow = newValue;
        }
      }
    },
  },
  created() {
    const me = this;

    window.addEventListener("click", me.windowClick);
  },
  beforeDestroy() {
    window.removeEventListener("click", this.windowClick);
  },
  methods: {
    /**
     * Click vào view box
     * Nếu đã có file đính kèm -> hiển thị drơpdown xem chi tiết
     * Nếu chưa có file nào thì hiển thị browser file
     */
    viewClick() {
      const me = this;
      this.showListFile = true;
      me.showBrowserFile();
    },
    /**
     * Hiển thị cửa sổ chọn file đính kèm mới
     */
    showBrowserFile() {
      this.$refs.file.click();
    },
    fileSelected2(e) {},
    /**
     * chọn file
     */
    fileSelected(e) {
      const me = this,
        files = e.target.files;
      me.loading = true;
      commonFn.mask();

      if (me.validateFile(files)) {
        // vvkiet - 27.04.2021: Bổ sung emit sự kiện selected file
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
                  //Nếu đã có file thì xóa file cũ đi
                  if (me.internalValue.length > 0) {
                    me.internalValue.forEach((item) => {
                      item.state = me.$ms.enum.ModelState.Delete;
                    });
                  }

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

              me.emitAfterSelect();
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
     * validate File
     */
    validateFile(files) {
      let me = this,
        valid = true;
      me.fileTemps = [];
      files.forEach((file) => {
        var data = file.name.split(".");
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
      return valid;
    },

    /**
     * Xóa file
     */
    remove(item, e) {
      const me = this;
      me.suppendClick = true;
      if (item.state === me.$ms.enum.ModelState.Insert) {
        me.internalValue.remove(item);
      } else {
        item.state = me.$ms.enum.ModelState.Delete;
      }
      me.emitAfterSelect();
    },
    /**
     * gửi thông tin update value cho control cha
     */
    emitAfterSelect() {
      const me = this;
      let value = {};
      me.suppendValue = true;
      me.internalValue.forEach((item) => {
        let fileSeleted = me.change.filter(function (itemSelected) {
          return itemSelected.file == item.file;
        });
        if (fileSeleted.length == 0) {
          me.change.push(item);
        }
        if (item.state !== me.$ms.enum.ModelState.Delete) {
          let fileName = this.getFileName(item.name);
          value = {
            Name: fileName,
            FileName: item.file,
            AttachmentName: item.name,
            FileSize: this.formatSizeUnits(item.size),
            EntityState: me.$ms.enum.ModelState.Insert,
            FileType: me.$ms.enum.StorageFileType.Temp,
          };
          //Nếu là form sửa thì thêm ID vào
          if (me.formState == me.$ms.enum.ModelState.Update) {
            value.AttachmentID = me.attachmentID;
          }
        }
      });
      me.internalValue = me.internalValue.filter((item) => {
        return item.state == me.$ms.enum.ModelState.Insert;
      });
      me.attachmentDataRow = value;
      me.$emit(
        "input",
        value,
        me.change,
        me.customFileType == me.$ms.enum.StorageFileType.Avatar
          ? me.avatarFile
          : null
      ); // Nếu là file Avatar thì emit thêm avatar file ra để lưu vào storage khi thêm mới employee NTDIEM 18/03/2022
    },
    /**
     * click bất kỳ vào đâu
     */
    windowClick(e) {
      const me = this;

      if (me.suppendClick) {
        delete me.suppendClick;
        return;
      }

      const container = me.$refs.container;
      if (e.target === container) {
        return;
      }
      let parent = e.target.closest(".ms-attachment");
      if (parent && parent === container) {
        return;
      }

      me.showListFile = false;
    },

    /**
     * Cắt lấy tên file
     * NTDIEM 18.11.2021
     */
    getFileName(name) {
      return name.split(".").slice(0, -1).join(".");
    },

    /**
     * Chọn thêm file
     */
    add() {
      const me = this;
      // me.showListFile = false;
      me.showBrowserFile();
    },
    /**
     * Chuyển đổi dung lượng  file
     * NTDIEM 24.12.2021
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
     * Tải file xuống
     * NTDIEM 24.12.2021
     */
    downloadFile() {
      const me = this;
      //Nếu có FileType là dữ liệu ở storage Temp, lấy từ DB ko có FileType => lấy từ storage real (attachment) NTDIEM 24.12.2021
      const type =
        me.attachmentDataRow.FileType == me.$ms.enum.StorageFileType.Temp
          ? me.$ms.enum.StorageFileType.Temp
          : me.$ms.enum.StorageFileType.Attachment;
      let link = fileApi.getDownloadLink(
        me.attachmentDataRow.FileName,
        type,
        me.Context.TenantID,
        me.Context.OrganizationID,
        me.attachmentDataRow.AttachmentName
      );
      commonFn.downloadFile(link);
    },

    previewFile() {
      const me = this;
      const type =
        me.attachmentDataRow.FileType == me.$ms.enum.StorageFileType.Temp
          ? me.$ms.enum.StorageFileType.Temp
          : me.$ms.enum.StorageFileType.Attachment;
      let fileType = me.attachmentDataRow.FileName.split(".").pop();
      let contentType = "application/pdf";
      switch (fileType) {
        case "pdf":
          contentType = "application/pdf";
          break;
        case "png":
        case "jpg":
        case "jpeg":
          contentType = "image/" + fileType;
          break;
        default:
          contentType = fileType;
          break;
      }
      //Lấy link preview NTDIEM 31.12.2021
      me.previewLink = fileApi.getPreviewLink(
        me.attachmentDataRow.FileName,
        type,
        me.Context.TenantID,
        me.Context.OrganizationID,
        me.attachmentDataRow.AttachmentName,
        contentType
      );
      let param = {
        reportData: {
          ReportName: me.attachmentDataRow.Name,
        },
        previewURL: me.previewLink,
      };
      window.open(me.previewLink, "_blank");
      // popupUtil.show(me, "PreviewDetail", param);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msAttachment.scss";
@import "@/assets/scss/_variables.scss";
.upload {
  line-height: 38px;
  width: 150px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0px 8px;
  align-items: center;
  .icon24 {
    margin: 7px 0 0 0;
  }
  .text {
    color: #000;
    font-weight: 500;
  }
  .icon20 {
    height: 20px;
    width: 20px;
    background: url("~@/assets/images/icons/attachment.svg") no-repeat;
    margin-right: 8px;
  }
}
.des-text {
  margin-left: 8px;
  width: 210px;
  height: 38px;
  font-size: 12px;
  padding: 6px;
}

.attachment-row {
  border: 1px solid #e0e0e0;
  border-radius: 3.5px;
  padding: 0px 12px;
  background: transparent;
  min-height: 34px;
  width: 100%;
}

.blue-text {
  color: #2979ff !important;
  font-weight: 500 !important;
  width: 320px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.change-file {
  color: #2979ff !important;
  font-weight: 500 !important;
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.file-name {
  min-width: 280px;
}

.file-size {
  min-width: 100px;
  padding-left: 16px;
}

.col {
  text-align: left;
  line-height: 34px;
}

.row-action {
  justify-content: flex-end;
}

.ic20 {
  height: 20px;
  width: 20px;
  margin-left: 8px;
}

.attach {
  background: url($ms-image-ic_attachment) no-repeat;
}
.delete {
  background: url($ms-image-CeGo_Sprites) -144px -50px no-repeat;
}

.download-icon {
  width: 24px;
  height: 24px;
  background: url($ms-image-CeGo_Sprites) -72px -72px no-repeat;
}

.add-img {
  color: #2979ff;
  font-size: 12px;
  text-align: center;
}

::v-deep .flex-row {
  align-items: center;
}
</style>

