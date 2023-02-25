<template>
  <div class="float-container">
    <!-- bắt đầu sử dụng -->
    <!-- <div v-if="showButonGetting">
      <ms-button
        id="btnGettingStarted"
        ref="btnGettingStarted"
        type="primary"
        text="Bắt đầu sử dụng"
        left-icon="rocket"
        class="float-button"
        @click="usingStartedFloat_click"
      />
    </div> -->
  </div>
</template>
<script>

import { mapState, mapActions, mapGetters } from "vuex";
import { ModuleContext } from "@/stores/module-const";
import commonFunction from '@/commons/commonFunction';

export default {
    name: "FloatAction",
    components: {},
    props: {
        collapse: {
            default: false,
            type: Boolean
        }
    },
    data() {
        const me = this;
        me.formGettingStarted = "GettingStarted"; // màn hình bắt đầu làm việc
        return {
            showButonGetting: true,
        };
    },

    watch: { },
    created() {
        const me = this;
        me.bindData();
    },
    mounted() { },
    methods: {
        /**
         * @override
         */
        bindData(){
            const me = this;
            let getting = me.gettingStatuts();
            if(getting && getting.SeenGetting){
                me.showButonGetting = false;
            }

            let newSession = me.$ms.commonFn.getLocalStorage("NewLoginSession");
            if(newSession){

                if(getting && !getting.SeenGetting){
                    me.showGettingStarted();
                }
                me.$ms.commonFn.removeLocalStorage("NewLoginSession");
            }
        },
        usingStartedFloat_click(){
            const me = this;
            me.showGettingStarted();
        },

        showGettingStarted(){
            const me = this;
            // build param
            let param = {
                mode: me.$ms.enum.FormState.View
            };


            popupUtil.show(me, me.formGettingStarted, param, {
                summit: function(){
                    me.showButonGetting = true;
                }
            });
        },

        gettingStatuts(){
            const me = this;

            let getting = me.$ms.commonFn.getLocalStorage("GettingStarted");
            if(getting){
                getting = JSON.parse(getting);
                return getting;
            }

            return null;
        }
    }
};
</script>
<style lang="scss" scoped>
    @import "@/assets/scss/layouts/floatAction.scss";
</style>