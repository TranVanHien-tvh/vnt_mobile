<template>
  <div ref="container" class="ms-attachment">
    <div class="flex-row pointer view-container" v-if="!isText">
      <div class="flex-row pointer view-container" @click="viewClick">
        <div class="icon20 attach" />
        <div class="label">
          {{ $t("i18nComponent.Attachment.Label") }}
        </div>
        <div v-if="visibleItems.length > 0" class="count">
          {{ $t("i18nComponent.Attachment.Count").format(visibleItems.length) }}
        </div>
      </div>
      <div
        v-if="showListFile"
        ref="div-list-files"
        class="box list-files"
        :class="[position, { disabled: disabled }]"
      >
        <div class="files">
          <div
            v-for="(item, index) in visibleItems"
            :key="index"
            class="file flex-row"
          >
            <a
              class="link pointer"
              :href="item.link"
              :title="item.origin.name"
              target="_blank"
              >{{ item.origin.name }}</a
            >
            <div class="size">\ ({{ item.origin.size | formatFileSize }})</div>
            <div v-if="!disabled" class="flex" />
            <div
              v-if="!disabled"
              class="remove flex-center pointer"
              @click="remove(item.origin, $event)"
            />
          </div>
        </div>

        <div v-if="!disabled" class="upload flex-row pointer" @click="add">
          <div class="icon24 add" />
          <div class="flex text">
            {{ $t("i18nComponent.Attachment.Add") }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex-row pointer" v-else>
      <div class="upload flex-row pointer" ref="addAttachment" @click="add">
        <div class="icon24 add-blue" />
        <div class="flex text">
          {{ $t("i18nComponent.Attachment.Add") }}
        </div>
      </div>
    </div>
    <input
      ref="file"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
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

export default {
  name: "MsAttachment",
  props: {
    /**
     * V-model b???n ra ngo??i binding 2 chi???u
     */
    value: {
      type: Array,
      default: Array,
    },
    /**
     * D??? li???u thay ?????i
     * D??ng ????? tr??n service ?????c ra x??? l??
     * khi value ???????c update s??? update k??m m??n n??y
     */
    change: {
      type: Array,
      default: Array,
    },
    /**
     * Kh??ng cho ph??p thao t??c upload
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Cho ch???n nhi???u file kh??ng
     */
    multiple: {
      type: Boolean,
      default: true,
    },
    /**
     * Danh s??ch c??c lo???i file
     */
    accept: {
      type: String,
      default: "*",
    },
    /**
     * Danh s??ch c??c lo???i file
     */
    fileType: {
      type: Number,
      default: MSEnum.StorageFileType.Temp,
    },
    /**
     * v??? tr?? hi???n th??? dropdown list file
     * M???c ?????nh l?? h?????ng sang tr??i
     */
    position: {
      type: String,
      default: "left",
    },

    /**
     * ????nh k??m 1 t???p hay nhi???u t???p
     * TDNGHIA 17/11/2021
     */
    // singleAttachment: {
    //   type: Boolean,
    //   default: false,
    // },
    /**
     * N???u IsText = true
     * Hi???n th??? n??t th??m m???i ??? d???ng text
     * IsText = false(default)
     * Hi???n th??? n??t th??m m???i d???ng button
     */
    isText: {
      type: Boolean,
      default: false,
    },

    showFileBrowser: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /**
       * Gi??? source all file k??m state
       */
      internalValue: [],
      /**
       * Gi??? t???m th???i c??c file dc th??ng qua khi upload
       */
      fileTemps: [],

      /**
       * Hi???n th??? danh s??ch c??c file ????nh k??m
       */
      showListFile: false,
      /**
       * C??? ??ang x??? l?? tr??n server
       */
      loading: false,
    };
  },
  computed: {
    ...mapGetters(ModuleContext, ["Context"]),

    //TDNGHIA 17/11/2021: th??m context v??o ????? t???i v??? th?? truy???n org ph??n bi???t ????n v???
    context() {
      return this.$store.state[ModuleContext];
    },

    /**
     * C??c file hi???n th???
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
              item.state === MSEnum.ModelState.Insert
                ? me.$ms.enum.StorageFileType.Temp
                : me.fileType,
              tenantId,
              me.context.Organization.OrganizationID || 0,
              item.name
            );
            rs.push(temp);
          }
        });
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
        newValue.forEach((item) => {
          let temp = { ...item, ...{ state: null } };
          me.internalValue.push(temp);
        });
      }
    },

    showFileBrowser(newValue) {
      const me = this;

      if (newValue) {
        me.add();
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
     * Click v??o view box
     * N???u ???? c?? file ????nh k??m -> hi???n th??? dr??pdown xem chi ti???t
     * N???u ch??a c?? file n??o th?? hi???n th??? browser file
     */
    viewClick() {
      const me = this;
      if (me.visibleItems.length > 0) {
        me.showListFile = !me.showListFile;
      } else if (!me.disabled) {
        me.showBrowserFile();
      }
    },
    /**
     * Hi???n th??? c???a s??? ch???n file ????nh k??m m???i
     */
    showBrowserFile() {
      this.$refs.file.click();
    },
    fileSelected2(e) {},
    /**
     * ch???n file
     */
    fileSelected(e) {
      const me = this,
        files = e.target.files;

      me.loading = true;
      commonFn.mask();
      if (me.validateFile(files)) {
        // vvkiet - 27.04.2021: B??? sung emit s??? ki???n selected file
        if (me.fileTemps.length > 0) {
          me.$emit("selected");
          fileApi
            .uploads(me.fileTemps, me.fileType)
            .then((result) => {
              result.forEach((item, i) => {
                let file = files[i];
                if (item.error) {
                  //TODO l???i th??...
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
                  me.internalValue.push({
                    name: file.name,
                    size: file.size,
                    file: item.name,
                    state: me.$ms.enum.ModelState.Insert,
                  });
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
     * validate File
     */
    validateFile(files) {
      let me = this,
        valid = true;
      me.fileTemps = [];
      files.forEach((file) => {
        var data = file.name.split(".");
        //N???u kh??ng c?? extension -> fail
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
     * Ch???n th??m file
     */
    add() {
      const me = this;
      // me.showListFile = false;
      me.showBrowserFile();
    },
    /**
     * X??a file
     */
    remove(item, e) {
      const me = this;
      me.suppendClick = true;

      if (item.state === me.$ms.enum.ModelState.Insert) {
        me.internalValue.remove(item);
      } else {
        item.state = me.$ms.enum.ModelState.Delete;
      }
      me.emitValue();
    },
    /**
     * g???i th??ng tin update value cho control cha
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
      me.$emit("input", value, change);
      me.$emit("update:change", change);
    },
    /**
     * click b???t k??? v??o ????u
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
     * L???y t??n file: b??? ??i ph???n m??? r???ng (.docs, .xmind, ...)
     * NTDIEM 18.11.2021
     */
    getFileName(name) {
      return name.split(".").slice(0, -1).join(".");
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msAttachment.scss";
</style>

