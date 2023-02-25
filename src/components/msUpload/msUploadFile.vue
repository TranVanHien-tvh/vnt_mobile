<template>
  <div class="flex-row">
    <!-- 
        <div class="title">
            {{ title }}
        </div>
        -->   
    <div class="content flex-row">
      <div class="contener-input">
        <ms-input
          right-icon="upload-gray"
        />
      </div>
      <!-- 
            <div class="contener-button">
                <ms-button
                    type="secondary-outline"
                    leftIcon="more"
                ></ms-button>
            </div>
            -->    
    </div>        
  </div>    
</template>

<<script>
export default {
    name: "MsUploadFile",
    components: {},
    props: {
        title : {
            type: String,
            default: 'Tài liệu đính kèm'
        }        
    },
    data() {
        return {
            
        }
    },
    computed: {
        
    },
    watch: {
        
    },
    methods: {
        
    },
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';
@import '@/assets/scss/components/msUploadFile.scss';
</style>
