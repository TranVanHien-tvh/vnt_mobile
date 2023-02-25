<template>
  <div class="activity-detail-container">
    <!-- Ảnh và thông tin thành viên đánh giá -->
    <div class="activity-detail-header">
    </div>
    <!-- Thông tin nội dung hoạt động -->
    <div class="activity-detail-body">
      <div class="flex-between ">
        <div class="overview-section flex-center">
          <div class="overview-icon logo"></div>
          <div class="overview-text bold f-16">Vietnam Together</div>
        </div>
        <div class="flex-center">
          <div class="overview-section">
            <div class="overview-icon user-icon"></div>
            <div class="overview-text">143</div>
          </div>
          <div class="line-break"></div>
          <div class="overview-section">
            <div class="overview-icon star-icon"></div>
            <div class="overview-text">8.5/10</div>
          </div>
        </div>
      </div>
      <!-- Tên hoạt động và các chức năng -->
      <div class="activity-detail-title">
        <div class="f-20">
          {{
            activityDetail.Organization &&
            activityDetail.Organization.title_short
              ? activityDetail.Organization.title_short + " - "
              : ""
          }}{{ activityDetail.title }}
        </div>
        <div class="activity-detail-title-type">
          <div class="f-16 mr-16 color-grey">Công ích xã hội</div>
          <div class="f-16 public">
            <div class="earth mr-8"></div>
            <div>Công khai</div>
          </div>
        </div>
        <div class="activity-detail-title-fc">
          <div
            class="tab-section tab-section-active"
            @click="selectTab(1)"
          >
            <div
              class="tab-icon icon-detail-active"
            ></div>
            <div
              class="tab-text"
              :class="{ 'tab-text-active': tabSelect == 1 }"
            >
              {{ textDetail }}
            </div>
          </div>
          
          <div
            class="tab-section"
            @click="selectTab(2)"
          >
            <div class="tab-icon icon-noti"></div>
          </div>
          <div
            class="tab-section"
            @click="selectTab(2)"
          >
            <div class="tab-icon icon-chat"></div>
          </div>
          <div
            class="tab-section"
            @click="selectTab(2)"
          >
            <div class="tab-icon icon-paper"></div>
          </div>
        </div>
      </div>
      <!-- nội dung sẽ thay đổi theo từng chức năng -->
      <div>
        <!-- Địa điểm, thời gian diễn ra -->
        <div class="address-time">
          <div class="time">
            <div
              class="icon-calendar icon32"
            ></div>
            <div class="text-left ml-15">
              <div class="f-16 text-type">Thời gian diễn ra</div>
              <div
                class="f-14"
              >
                Từ ngày {{ momentDate(activityDetail.start_time) }} đến ngày
                {{ momentDate(activityDetail.end_time) }}.
              </div>
            </div>
          </div>
          <div class="address">
            <div
              class="icon-place icon32"
            ></div>
            <div class="text-left ml-15">
              <div class="f-16 text-type">Địa điểm</div>
              <div
                class="plr-5 f-14"
              >
                {{ activityDetail.address }}
              </div>
            </div>
          </div>
        </div>
        <!-- Giới thiệu chung -->
        <div class="info">
          <div class="info-title">Giới thiệu chung</div>
          <div class="info-description">
            {{ activityDetail.description }}
          </div>
          <div class="info-button">
            <ms-button
              v-if="false"
              class="btn secondary"
              type="four"
              :text="'Xem thêm'"
            />
          </div>
        </div>
        <!-- lịch trình -->
        <div class="schedule">
          <div class="schedule-title">Lịch trình</div>
          <div class="schedule-body">
            <div
              class="schedule-item"
              v-for="(item, index) in activityDetail.schedule_data"
              :key="index"
            >
              <div class="schedule-datetime">
                <div class="schedule-time">
                  {{ momentTime(item.start_time) }}
                </div>
                <div class="schedule-date">
                  {{ momentDate(item.start_time) }}
                </div>
              </div>
              <div class="schedule-icon">
                <div class="icon24 icon-group-time"></div>
                <div
                  class="icon-line"
                  v-if="
                    index <=
                    (activityDetail.schedule_data
                      ? activityDetail.schedule_data.length - 2
                      : 0)
                  "
                ></div>
              </div>
              <div class="schedule-content">{{ item.description }}.</div>
            </div>
          </div>
        </div>
        <!-- Mục tiêu -->
        <div class="target">
          <div class="target-content">
            <div class="target-left">
              <div class="flex-row">
                <div class="icon56 icon-target"></div>
                <div class="target-left-title">Mục tiêu</div>
              </div>
              <div>
                <div class="contribute-section">
                  <div class="contribute-text">Đóng góp</div>
                  <div class="contribute-icon"></div>
                </div>
              </div>
            </div>
            <div class="target-right">
              <div class="target-right-title">Quỹ quyên góp cho hoạt động</div>
              <div class="target-right-percent">
                <div
                  class="target-right-percent-left"
                  :style="{ width: percent + '%' }"
                ></div>
                <div
                  class="target-right-percent-right"
                  :style="{ width: 100 - percent + '%' }"
                ></div>
              </div>
              <div class="target-right-contribute">
                Đạt
                <span>{{ (activityDetail.donated? activityDetail.donated : 0) / 1000000 }} triệu</span> trên
                tổng số
                <span
                  >{{ (activityDetail.totalDonate? activityDetail.totalDonate : 0) / 1000000 }} triệu. ({{
                    percent
                  }}%)</span
                >
              </div>
              <div class="target-right-user-contribute">
                <div class="target-right-user-avatar">
                  <div
                    class="user-avatar"
                    v-for="(item, index) in activityDetail.memberDonated"
                    :key="index"
                    :style="{
                      left:
                        index == 0
                          ? 0
                          : +(size <= 768 ? index * 14 : index * 24) + 'px',
                    }"
                  >
                    <img
                      style="width: 100%; height: 100%"
                      v-if="item.avatar"
                      :src="item.avatar"
                      alt=""
                    />
                    <img
                      style="width: 100%; height: 100%"
                      v-if="!item.avatar"
                      src="~@/assets/images/icons/no-avatar.png"
                      alt=""
                    />
                  </div>
                  <div
                    class="user-ellipse"
                    v-if="
                      activityDetail.memberDonated &&
                      activityDetail.memberDonated.length > 7
                    "
                  >
                    <div class="icon_three_dot"></div>
                  </div>
                </div>
                <div class="target-right-user-total">
                  {{
                    activityDetail.memberDonated &&
                    activityDetail.memberDonated.length
                  }}
                  người đã quyên góp
                </div>
              </div>
              <!-- <div>
                <ms-button
                  class="btn-target"
                  type="four"
                  right-icon="icon-v"
                  :text="'Đóng góp'"
                  @click="showPopupDownload()"
                />
              </div> -->
            </div>
          </div>
        </div>
        <!-- Chức năng tham gia, chia sẻ, thoát khỏi hoạt động -->
        <div class="action-share-accept" v-if="!isJoinActivity">
          <ms-button
            class="btn-action-share-accept"
            type="four"
            :text="'Tham gia'"
            @click="joinActivity()"
          />
          <div
            class="icon56 icon-uncare-act"
            @click="showPopupDownload()"
          ></div>
          <div class="icon56 icon-bi-heart" @click="showPopupDownload()"></div>
          <div class="icon56 icon-refer" @click="showPopupDownload()"></div>
        </div>
        <div class="action-share-accept" v-if="isJoinActivity">
          <ms-button
            class="btn-action-logout"
            type="four"
            left-icon="ic_logout_white"
            @click="showPopupDownload()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseListPopup from "@/views/base/BaseListPopup";
import moment from "moment";
import { ModuleActivityDetail } from "@/stores/module-const";
// import MsSyncLoading from "@/components/mssyncloading/MsSyncLoading.vue";
import popupUtil from "@/commons/popupUtil";

export default {
  components: {
  },
  extends: BaseListPopup,

  data() {
    return {
      schedules: [], // danh sách lịch trình
      percent: 0, // phần trăm đóng góp
      users: [], // danh sách người đóng góp
      tabSelect: 1, // 1- chi tiết, 2- bài đăng, 3- Tin nhắn, 4- Công việc
      images: [], // danh sách ảnh của hoạt động
      textCountMember: "", // thông tin hiển thị số thành viên
      textRating: "", // thông tin hiện thị đánh giá
      textDetail: "Chi tiết", // button chi tiết
      textPost: "Bài đăng", // button bài đăng
      textMessage: "Tin nhắn", // button nhắn tin
      textTask: "Công việc", // button công việc
      activityDetail: {
        title: "",
        schedule_data: [
        {
          start_time: new Date(),
          description: "Chuẩn"
        },
        {
          start_time: new Date(),
          description: "Chuẩn"
        },
        {
          start_time: new Date(),
          description: "Chuẩn"
        },
        {
          start_time: new Date(),
          description: "Chuẩn"
        },
      ]
      },
      banners: [], // danh sách ảnh banner
      activeLoading: true,
      isJoinActivity: false,
      currentUser: {}
    };
  },
  created() {
    const me = this;
    me.size = window.innerWidth;
    me.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    me.id = me.$route.query?.id ? me.$route.query?.id : 1;
  },

  methods: {
    loadData(payload) {
      const me = this;
      me.activityDetail.schedule_data = [
        {
          start_time: new Date(),
          description: "Chuẩn"
        },
        {
          start_time: new Date(),
          description: "Chuẩn"
        },
        {
          start_time: new Date(),
          description: "Chuẩn"
        },
        {
          start_time: new Date(),
          description: "Chuẩn"
        },
      ];
      me.fetchData(me.id);
    },
    /**
     * Load dữ liệu của 1 hoạt động theo id của hoạt động đó
     * tvhien 11/06/2022
     */
    fetchData(id) {
      const me = this;
      
      me.$store
        .dispatch([ModuleActivityDetail, "getActivityByID"].join("/"), id)
        .then((result) => {
          me.activeLoading = false;
          if (result?.data) {
            me.activityDetail = result?.data;
            var user = result?.data.members.find(x=> x.id == me.currentUser.userId);
            if(user){
              me.isJoinActivity = true;
            }
            else{
              me.isJoinActivity = false;
            }
            me.activityDetail.images.map((item, index) => {
              if (index < 6) {
                me.images.push(item);
              } else {
                return;
              }
            });
            me.percent = parseFloat(
              ((result?.data.donated / result?.data.totalDonate) * 100).toFixed(
                2
              )
            );
            me.banners = me.activityDetail.banner;
            me.textCountMember = result?.data.members?.length + "";
            me.textRating = result?.data.rate + "/10";
            me.textTask = "";
            me.textMessage = "";
            me.textPost = "";
          }
        });
    },

    /**
     * sự kiện khi chọn tab
     * tvhien 11/06/2022
     */
    selectTab(tab) {
      const me = this;
      switch (tab) {
        case 2:
          //   me.tabSelect = tab;
          me.showPopupDownload();
          break;
        case 3:
          //   me.tabSelect = tab;
          me.showPopupDownload();
          break;
        case 4:
          //   me.tabSelect = tab;
          me.showPopupDownload();
          break;
        default:
          me.tabSelect = tab;
          me.textDetail = "Chi tiết";
          if (me.size <= 768) {
            me.textTask = "";
            me.textMessage = "";
            me.textPost = "";
          }
          break;
      }
    },
    /**
     * Đổi định dạng ngày
     * tvhien 11/06/2022
     */
    momentDate: function (date) {
      return moment(date).format("DD/MM/YYYY");
    },

    /**
     * đổi định dạng giờ
     * tvhien 11/06/2022
     */
    momentTime: function (date) {
      return moment(date).format("HH:MM");
    },

    /**
     * mở popup yêu cầu cài app
     * tvhien 11/06/2022
     */
    showPopupDownload() {
      const me = this;
      me.showDetail("QrDownLoad", 1, {});
    },

    /**
     * tham gia hoạt động
     * tvhien 27/11/2022
     */
    joinActivity(){
      const me = this;
      me.showDetail("EventRegister", 1, {});
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/views/activityDetail.scss";
</style>