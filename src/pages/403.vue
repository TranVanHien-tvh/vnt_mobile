<!-- =========================================================================================
    Description: Không có quyền truy cập
========================================================================================== -->

<template>
  <div class="h-screen flex w-full">
    <div class="vx-col flex items-center justify-center flex-col sm:w-1/2 md:w-3/5 lg:w-3/4 xl:w-1/2 mx-auto text-center">
      <img
        src="@/assets/images/pages/bg_Error403.svg"
        class="mx-auto mb-4"
      >
      <h1 class="page--title">
        {{ $t('i18nPages.Error.403') }}
      </h1>
      <p class="mb-16 d-theme-text-inverse">
        {{ $t('i18nPages.Error.403_sub') }}
      </p>
      <a
        :href="backLink"
        class="btn primary"
      >{{ $t('i18nCommon.command.Back') }}</a>
    </div>
  </div>
</template>
<script>
export default {
  data(){
    return {
      backLink: window._external.eOfficeUrl,
      data: {}
    }
  },
  mounted() {
	},
  methods: {
  }
}
</script>
<style lang="scss" scoped>
.h-screen{
  height: 100vh;
  display: flex;
  background: #fff;
  .items-center{
    height: 50vh;
    width: 50%;
    margin: auto;
  }
  .d-theme-text-inverse{
    margin-bottom: 30px;
  }
}
</style>
