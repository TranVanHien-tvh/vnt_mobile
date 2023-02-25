<!-- =========================================================================================
	component msDownloadLink
========================================================================================== -->
<template>
  <a
    :href="link"
    target="_blank"
  >{{ name }}</a>
</template>
<script>
import fileApi from "@/apis/system/fileAPI";
import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleOrganization, ModuleContext } from "@/stores/module-const";

export default {
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },

  data() {

    return {
      link: null,
      name: null,
      downloadName: null
    };
  },

  computed: {
    ...mapGetters({
      context: ModuleContext + "/Context"
    })
  },

  mounted() {
    const me = this;
    if (me.data) {
      const type = me.data.State === me.$ms.enum.ModelState.Insert ? me.$ms.enum.StorageFileType.Temp : me.$ms.enum.StorageFileType.Attachment;
      me.name = me.data.name;
      me.link = fileApi.getDownloadLink(me.data.name, type, me.context.TenantID, me.context.OrganizationID, me.data.downloadName);
    } else {
      me.link = "javascript:void(0)";
      me.name = "";
    }
  }
};
</script>
<style lang="scss" scoped>
a {
  color: #2c8eff;
  text-decoration: underline;
}
</style>