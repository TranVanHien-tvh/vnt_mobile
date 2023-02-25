<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <!-- <a class="navbar-brand" href="#">Navbar</a> -->
    <div class="vnt-logo" @click="navigateToHome()"></div>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <div class="nav-link nav-content" href="" :class="{'color-active': tabSelect == 1}"
          @click="selectTab(1)"
            >Trang chủ</div
          >
        </li>
        <li class="nav-item">
          <div class="nav-link nav-content" href="" :class="{'color-active': tabSelect == 2}" @click="selectTab(2)">Hoạt động</div>
        </li>
        <li class="nav-item">
          <div class="nav-link nav-content" href="" :class="{'color-active': tabSelect == 3}" @click="selectTab(3)">Câu lạc bộ</div>
        </li>
        <li class="nav-item">
          <div class="nav-link nav-content" href="">Công việc</div>
        </li>
      </ul>
      <div class="form-inline my-2 my-lg-0">
        <ul class="navbar-nav mr-auto">
        <li class="nav-item po-relative">
          <a class="nav-link" href="#" 
              id="navbarDropdownToggle"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              @click="showDropdownToggle">
            <img src="~@/assets/images/icons/vnt/ic_toggle.svg"  alt="">
          </a>
          <div class="dropdown-info-user" style="right: 10%; top: 63%; padding: 11px 17px" aria-labelledby="navbarDropdownToggle" v-if="isShowToggle">
            <div class="flex-row align-center add_club" @click="showAdd('club')">
              <div class="ic_group_club m-r-8">
              </div>
              <a class="">Tạo Câu Lạc Bộ</a>
            </div>
            <div class="flex-row align-center add_activity" @click="showAdd('activity')">
              <div class="ic_add_activity m-r-8">
              </div>
              <a class="">Tạo hoạt động</a>
            </div>
          </div>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">
            <img src="~@/assets/images/icons/vnt/ic_chat_gray.svg" alt="">
          </a>
        </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              id="navbarDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              @click="showDropdownInfoUser"
            >
              <img src="~@/assets/images/icons/vnt/fa-solid_user-circle.svg" alt="">
            </a>
            <div class="dropdown-info-user" aria-labelledby="navbarDropdown" v-if="isShow">
              <!-- <a class="dropdown-item" href="/login" @click="logout()">Đăng xuất</a>
              <a class="dropdown-item" href="#">Another action</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">Something else here</a> -->
              <!-- Ảnh đại diện -->
              <div class="pb-19">
                <div class="flex-row flex-center">
                  <div class="avatar">
                    <img v-if="!currentUser || !currentUser.avatar" src="~@/assets/images/icons/no-avatar.png" alt="">
                    <img v-if="currentUser && currentUser.avatar" :src="currentUser.avatar" alt="">
                  </div>
                  <div>
                    {{currentUser && currentUser.name ? currentUser.name: ''}}
                  </div>
                </div>
              </div>
              <div class="dropdown-item" @click="itemClick('profile')">
                <div class="dropdown-child">Quản lý tài khoản</div>
              </div>
              <div class="dropdown-item">
                <div class="dropdown-child">Cài đặt</div>
              </div>
              <div class="dropdown-item">
                <div class="dropdown-child">Chuyển đổi tài khoản</div>
              </div>
              <div class="dropdown-item">
                <div class="dropdown-child">Đóng góp ý kiến</div>
              </div>
              <div class="flex-row flex-center logout">
                <div class="icon20 ic_logout m-r-8">
                </div>
                <a class="" href="/login" @click="logout()">Đăng xuất</a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import {
  ModuleContext,
  ModuleUser,
} from "@/stores/module-const";
import commonFunction from "@/commons/commonFunction";
import popupUtil from "@/commons/popupUtil";

export default {
  components: {},
  props: {
    collapse: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      tabSelect: 1,// tab mặc định chọn là tab trang chủ
      isShow: false,
      isShowToggle: false,
      currentUser: {
        avatar: null,
        name: ''
      },
    };
  },

  watch: {},

  computed: {},
  created() {
    const me = this;
    me.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    switch (me.$route?.path) {
      case '/actpage':
        me.tabSelect = 2;
        break;
      case '/clubpage':
        me.tabSelect = 3;
        break;
      default:
        me.tabSelect = 1;
        break;
    }
  },

  mounted() {
    const me = this;
  },
  methods: {
    logout(){
      localStorage.removeItem("currentUser")
    },

    /**
     * sự kiện click từng item trong profile
     * tvhien 11/09/2022
     */
    itemClick(value){
      const me =this;
      switch (value) {
        case 'profile':
          me.$router.push({
            path: "/profile",
          });
          break;
      
        default:
          break;
      }
    },

    /**
     * hiển thị thông tin người dùng
     * tvhien 11/09/2022
     */
    showDropdownInfoUser(){
      const me = this;
      me.isShow = !me.isShow;
    },

    showDropdownToggle(){
      const me = this;
      me.isShowToggle = !me.isShowToggle;
    },

    showAdd(value){
      const me =this;
      switch (value) {
        case 'club':
          me.$router.push({
            path: '/newclub'
          });
          break;
        default:
          me.$router.push({
            path: '/newactivity'
          });
          break;
      }
      me.isShowToggle = false;
    },

    /**
     * sự kiện thay đổi tab chọn
     * tvhien 12/06/2022
     */
    selectTab(tab){
      const me =this;
      switch (tab) {
        case 2:
          me.tabSelect = tab;
          me.$router.push({
            path: '/actpage'
          });
          break;
        case 3:
          me.tabSelect = tab;
          me.$router.push({
            path: '/clubpage'
          });
          break;
        case 4:
          me.tabSelect = tab;
          break;
        default:
          me.tabSelect = tab;
          me.$router.push({
            path: '/'
          });
          break;
      }
    },
    
    /**
     * 
     */
    navigateToHome(){
      const me = this;
      me.$router.push("/");
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/layouts/topNav.scss";
</style>
