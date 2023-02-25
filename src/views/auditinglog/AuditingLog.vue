<template>
  <div class="form-list flex-column flex">
    <div class="flex-row title-box">
      <div class="list-title flex">{{ $t("i18nAuditingLog.List.Title") }}</div>
      <div class="title-action">
        <!-- <ms-button type="secondary-outline" leftIcon="more" /> -->
      </div>
    </div>

    <div class="box list-content flex flex-column">
      <div class="condition-box flex-row">
        <ms-input
          :placeholder="$t('i18nAuditingLog.List.Search')"
          class="search-input remain-focus-when-enter"
          leftIcon="search"
          v-model="searchText"
          @change="searchChange"
        />
        <div class="flex"></div>
        <div class="action">
          <ms-button
            type="secondary-outline"
            leftIcon="refresh"
            :title="$t('i18nCommon.command.refresh')"
            class="mr-2"
            @click="refreshClick()"
          />
          <ms-button
            type="primary-outline"
            leftIcon="export-excel"
            :title="$t('i18nCommon.command.export')"
            class="mr-2"
            @click="exportExcel"
          />
        </div>
      </div>

      <ms-grid-viewer
        :ref="viewRef"
        :columns="columns"
        :data="viewItems"
        :pageSize="pageSize"
        :pageTotal="total"
        :loadingSummary="loadingSummary"
        :summary="summary"
        class="flex-box"
        pagination
        greyTitle
        :loading="loading"
        :rowActions="rowActions"
        :multiple="true"
        :rowActionInlineCount="0"
        v-model="selected"
        :alwayTakeColumns="['entity']"
      />
    </div>
  </div>
</template>

<script>
import BaseListPopup from "@/views/base/BaseListPopup";
import { ModueleAuditingLog } from "@/stores/module-const";
import msGridViewer from "@/components/msgridviewer/msGridViewer.vue";
import {
  DescriptionLogFactory,
  auditingLogFunction,
} from "@/commons/auditingLogFunction";
export default {
  extends: BaseListPopup,
  components: {
    msGridViewer,
  },
  data() {
    return {
      module: ModueleAuditingLog,
      splitLoadRequest: false,
    };
  },
  computed: {
    /**
     * Dữ liệu hiển thị
     */
    viewItems() {
      const me = this;
      let result = [];
      if (this.items) {
        this.items.forEach((item) => {
          let temp = {};
          for (let i in item) {
            let value = item[i];
            if (value) {
              switch (i) {
                case "action":
                  value = me.buildAction(value, item);
                  break;
                case "description":
                  let description = JSON.parse(value);
                  value = DescriptionLogFactory.getDescription(
                    description,
                    item
                  );
                  break;
                case "entity":
                  value = me.$t(["i18nCommon.module.", item.entity].join(""));
                  break;
                case "reference":
                  let referenceJSON = JSON.parse(value);
                  let reference = me.buildReference(referenceJSON, item);
                  value = reference ? reference : item[i];
                  break;
              }
              temp[i] = value;
            }
          }

          result.push(temp);
        });
      }

      return result;
    },
  },

  created() {
    const me = this;
    me.initColumn();
  },

  methods: {
    /**
     * Khởi tạo cột hiển thị cho grid
     */
    initColumn() {
      const me = this;
      me.columns = [
        {
          caption: me.$t("i18nAuditingLog.List.UserName"),
          dataField: "username",
          width: 150,
        },
        {
          caption: me.$t("i18nAuditingLog.List.LogTime"),
          dataField: "time",
          width: 170,
          formatType: me.$ms.enum.FormatType.DateTime,
          align: "center",
        },
        {
          caption: me.$t("i18nAuditingLog.List.Action"),
          dataField: "action",
          width: 200,
          enum: "AuditingLogAction",
        },
        {
          caption: me.$t("i18nAuditingLog.List.Reference"),
          dataField: "reference",
          width: 200,
          formatType: 99,
        },
        {
          caption: me.$t("i18nAuditingLog.List.Description"),
          dataField: "description",
          width: 200,
          autoResize: true,
          formatType: 99,
        },
        // {
        //   caption: me.$t("i18nAuditingLog.List.ClientIP"),
        //   dataField: "ip",
        //   width: 200,
        // },
      ];
    },

    /**
     * Sinh nội dung tham chiếu
     * NDHUY 04.12.2021
     */
    buildReference(def, item) {
      // hãy custom tham chiếu trong này
      const me = this;
      let referenceString = "";
      try {
        let reference = def ? def : null;
        if (reference && typeof reference == "object") {
          if (reference.name && reference.code) {
            referenceString = reference.name + " (" + reference.code + ")";
          } else if (reference.name) {
            referenceString = reference.name;
          } else if (reference.code) {
            referenceString = reference.code;
          }
        }

        return referenceString;
      } catch (error) {
        console.log(error);
      }
    },

    /**
     * Sinh action
     * NDHUY 02.12.2021
     */
    buildAction(value, item) {
      let me = this,
        action = "";
      switch (value) {
        case me.$ms.enum.AuditingLogAction.Login:
        case me.$ms.enum.AuditingLogAction.Logout:
          action = me.$ms.commonFn.getEnumResource(value, "AuditingLogAction");
          break;
        default:
          action = me.$ms.commonFn.getEnumResource(value, "AuditingLogAction");
          let moduleName = me.$t("i18nCommon.module." + item.entity);
          if (moduleName) {
            action = action + " " + moduleName.toLowerCase();
          }
          break;
      }

      return action;
    },
  },
};
</script>


<style lang="scss" scoped>
/deep/.newValue,
/deep/.oldValue {
  font-weight: 600;
}
