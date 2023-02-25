<template>
<ms-popup
    :active.sync="active"
    class="detail-popup event-register full-detail-form"
    :full-main-view="true"
    :fullScreen="true"
    :show-close-icon="false"
    :show-modal="true"
    :flex="true"
    :show-footer="true"
    :loading="loading"
    @close="close"
  >
    <!-- Phần header title các kiểu -->
    <template slot="header">
      <div class="flex-row top-bar">
        <div
            class="icon24 back cursor-pointer"
            shortkey-target="Close"
            @click="close()"
        />
        <div class="flex center pdl-10">
          <span>Đăng ký tham gia sự kiện</span>
        </div>
      </div>
    </template>
    <!-- Phần content chính -->
    <template slot="content">
      <ms-validate ref="validateObserver">
        <div class="flex flex-row form-body scroll">
            <div class="event-list">
                <div class="event-item" v-for="(item, index) in events" :key="index">
                    <div class="event-title">Tên hoạt động <span class="color-red">*</span></div>
                    <div>
                        <ms-input
                            :max-length="255"
                            :placeholder="'Nhập tên hoạt động'"
                            rules="required"
                            name="Tên hoạt động"
                            class=""
                        />
                    </div>
                </div>
            </div>
        </div>
      </ms-validate>
    </template>

    <!-- Phần footer -->
    <template slot="footer" class="footer-custom">
        <ms-button
            class="w-100 vnt-btn vnt-login-btn"
            type="primary"
            :text="'Đăng ký tham gia'"
        />
    </template>
  </ms-popup>
</template>
<script>
import msValidate from "@/components/msValidate/msValidate.vue";
import BaseDetailPopup from "@/views/base/BaseDetailPopup";
import { ModuleEvent } from "@/stores/module-const";
export default {
    name: "EventRegister",
    components: {
        msValidate,
    },
    extends: BaseDetailPopup,
    data() {
        return {
            module: ModuleEvent,
            active: false,
            currentItem: {}, // Object dữ liệu người dùng
            events:[1,2,3,4,5,6,7,8,9,10]
        };
    },
    methods: {
        async loadData(action, param) {

        }
    }
}
</script>
<style lang="scss">
@import "@/assets/scss/_variables.scss";
.event-register{
    .event-list{
        padding: 0 10px 10px 10px;
        width: 100%;
        overflow: auto;
        .event-item{
            width: 100%;
            margin-top: 10px;
            .event-title{
                font-size: 14px;
                font-weight: bold;
            }
        }
    }

    .color-red{
        color: $required;
    }
}
</style>