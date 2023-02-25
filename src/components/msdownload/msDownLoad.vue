<!-- =========================================================================================
	component msDownload, trước tiên dựng giao diện để hiển thị trước, sau này xử lý Download file sẽ gắn vào đây.
    pvduy 04/02/2020
========================================================================================== -->
<template>
  <div
    class="ms-download d-flex"
    ref="msDownLoad"
    v-click-outside="handleFocusOut"
  >
    <!-- show text xanh để preview -->
    <div
      class="blue-text"
      @click="previewFile(previewLink, Name)"
      :title="Name"
      v-if="!dataRow.AttachmentDetail"
    >
      {{ Name }}
    </div>
    <!-- Có nhiều hơn 1 tệp đính kèm  -->
    <div
      v-else-if="dataRow.AttachmentDetail.length > 1"
      class="multi-attachment"
    >
      <div class="blue-text" @click="showAttachmentList">
        Chi tiết ({{ dataRow.AttachmentDetail.length }})
      </div>
    </div>
    <div v-else class="multi-attachment">
      <div
        class="blue-text"
        @click="
          previewFile(
            dataRow.AttachmentDetail[0].previewLink,
            dataRow.AttachmentDetail[0].Name
          )
        "
      >
        {{ dataRow.AttachmentDetail[0].AttachmentName }}
      </div>
    </div>

    <template>
      <div
        class="attachment-list flex-column"
        v-bind:style="{ top: popupTop + 'px', left: popupLeft + 'px' }"
        v-if="isShowAttachmentList"
        @mouseleave="isShowAttachmentList = false"
      >
        <div class="attachment-list-container">
          <div
            v-for="(attachment, i) in dataRow.AttachmentDetail"
            :key="i"
            @click="previewFile(attachment.previewLink, attachment.Name)"
            class="attachment-item"
          >
            <div class="attachment-name">{{ attachment.AttachmentName }}</div>
            <div class="subtext">
              {{ attachment.Author }} - {{ attachment.Date }} -
              {{ attachment.FileSize }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <div
      v-show="col.isShowDownloadIcon"
      class="download-icon"
      @click="downloadFile(downloadLink, dataRow.Name)"
    ></div>
  </div>
</template>
<script>
import fileApi from "@/apis/system/fileAPI";
import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleOrganization, ModuleContext } from "@/stores/module-const";
import commonFn from "@/commons/commonFunction";
import popupUtil from "@/commons/popupUtil";
import EventBusGlobal, { GlobalEventName } from "@/commons/eventBusGlobal";

export default {
  components: {},
  props: {
    dataRow: {
      type: Object,
      default: Object,
    },
    col: {},
  },
  data() {
    return {
      downloadLink: null,
      previewLink: null,
      Name: null,
      attachments: [],
      popupTop: null,
      popupLeft: null,
      isShowAttachmentList: false,
      fileSize: null,
    };
  },
  computed: {
    ...mapGetters({
      context: ModuleContext + "/Context",
    }),
  },
  watch: {
    dataRow: function () {
      this.setDownloadData();
    },
  },
  mounted() {
    this.setDownloadData();
  },
  created() {
    const me = this;
    EventBusGlobal.$on(GlobalEventName.scrollEvent, me.scrollEvent);
  },
  methods: {
    setDownloadData() {
      const me = this;

      //Trường hợp file đính kèm chuyển từ Quyết định khen thưởng sang => kiểu file là Attachment
      if (me.dataRow.AttachmentDetail) {
        me.dataRow.AttachmentDetail.forEach((attachment) => {
          attachment.previewLink = me.getPreviewLink(
            attachment.FileName,
            me.$ms.enum.StorageFileType.Attachment, //Để tạm để test tính năng, có dữ liệu thì kiểu là Attachment NTDIEM 07.01.2022
            me.context.TenantID,
            attachment.OrganizationID
              ? attachment.OrganizationID
              : me.context.OrganizationID,
            attachment.AttachmentName
          );

          attachment.downloadLink = me.getDownloadLink(
            attachment.FileName,
            me.$ms.enum.StorageFileType.Attachment, //Để tạm để test tính năng, có dữ liệu thì kiểu là Attachment NTDIEM 07.01.2022
            me.context.TenantID,
            attachment.OrganizationID
              ? attachment.OrganizationID
              : me.context.OrganizationID,
            attachment.AttachmentName
          );
          //Convert ngày tháng để hiện lên subtitle
          attachment.Date = commonFn.formatDateTime(attachment.CreatedDate);
        });
      } else if (me.dataRow.FileName) {
        //Trường hợp có 1 file đính kèm đính từ hồ sơ
        //Nếu có FileType là dữ liệu ở storage Temp, lấy từ DB ko có FileType => lấy từ storage real (attachment) NTDIEM 03.12.2021
        const type =
          me.dataRow.FileType == me.$ms.enum.StorageFileType.Temp
            ? me.dataRow.FileType
            : me.$ms.enum.StorageFileType.Attachment;
        // ntdiem: Lấy link tải file xuống.
        me.downloadLink = me.getDownloadLink(
          me.dataRow.FileName,
          type,
          me.context.TenantID,
          me.col.customOrganizationID || me.dataRow.OrganizationID
            ? me.dataRow.OrganizationID
            : me.context.OrganizationID, //Config customOrganizationID vào initColumn nếu không muốn dùng OrgID bằng context
          me.dataRow.AttachmentName
        );

        me.Name = me.dataRow.AttachmentName;
        //Lấy link preview NTDIEM 31.12.2021
        me.previewLink = me.getPreviewLink(
          me.dataRow.FileName,
          type,
          me.context.TenantID,
          me.col.customOrganizationID || me.dataRow.OrganizationID
            ? me.dataRow.OrganizationID
            : me.context.OrganizationID,
          me.dataRow.AttachmentName
        );
      } else {
        me.downloadLink = "javascript:void(0)";
        me.Name = "";
      }

      me.fileSize = me.dataRow.FileSize;
    },

    /**
     * Tải file xuống
     * NTDIEM 03.12.2021
     */
    downloadFile(link) {
      const me = this;
      commonFn.downloadFile(link);
    },

    /**
     * Preview File
     */
    previewFile(link, name) {
      const me = this;
      let param = {
        reportData: {
          ReportName: name,
        },
        previewURL: link,
      };


      //TDNGHIA 28/3/2022: sửa if thêm để dùng cho trường hợp là đường dẫn sẽ mở tab mới
      if (!me.fileSize && !me.dataRow.AttachmentDetail) {
        window.open(name, "_blank");
      } else {
        window.open(link, "_blank");
      }
    },

    /**
     * Show danh sách tệp đính kèm ( trong trường hợp có nhiều hơn 1 tệp đính kèm trong 1 bản ghi)
     * NTDIEM 07.01.2022
     */
    showAttachmentList(e) {
      const me = this;
      me.isShowAttachmentList = !me.isShowAttachmentList;
      me.popupTop = me.$refs.msDownLoad.getBoundingClientRect().y + 20;
      me.popupLeft = me.$refs.msDownLoad.getBoundingClientRect().x - 280;
    },

    /**
     * Lấy link preview
     * NTDIEM 07.01.2022
     */
    getPreviewLink(fileName, type, tenatID, orgID, attachmentName) {
      const me = this;
      let fileType = fileName.split(".").pop();
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
      let previewLink = fileApi.getPreviewLink(
        fileName,
        type,
        tenatID,
        orgID,
        attachmentName,
        contentType
      );
      return previewLink;
    },

    /**
     * Lấy link tải xuống
     * NTDIEM 07.01.2022
     */
    getDownloadLink(fileName, type, tenatID, orgID, attachmentName) {
      let downloadLink = fileApi.getDownloadLink(
        fileName,
        type,
        tenatID,
        orgID,
        attachmentName
      );
      return downloadLink;
    },

    scrollEvent(e) {
      const me = this;

      me.isShowAttachmentList = false;
    },
    /**
     * Khi click ra ngoài đóng list tệp đính kèm
     * NTDIEM 11.01.2021
     */
    handleFocusOut(e) {
      const me = this;
      me.isShowAttachmentList = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msButton.scss";
.download-file {
  cursor: pointer;
}

::v-deep.blue-text {
  color: #2979ff !important;
  font-weight: 500 !important;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.ms-download {
  width: 100%;
  position: relative;
}

.download-icon {
  width: 24px;
  height: 24px;
  background: url($ms-image-ic_download_blue) no-repeat;
}

::v-deep.multi-attachment {
  width: 100%;
  height: 100%;
}

::v-deep.attachment-list {
  position: fixed;
  width: 400px;
  height: 186px;
  z-index: 15 !important;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 24%);
  padding: 4px 4px;
  background-color: #fff;
}

::v-deep.attachment-list-container {
  position: relative;
  z-index: 15 !important;
  border-radius: 4px;
  width: 100%;
  padding: 8px 12px;
  overflow: scroll;
  border-radius: 4px;
  background-color: #fff;
}

.attachment-name {
  width: 100%;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.subtext {
  line-height: 20px;
  color: #707070;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.attachment-item {
  padding: 8px 8px;
  border-radius: 4px;
}

.attachment-item:hover {
  background: #eff1f6;
}
</style>


