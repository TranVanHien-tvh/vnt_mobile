<template>
  <div class="activity-slide-container container-fluid">
    <VueSlickCarousel :arrows="true" :dots="true">
      <div
        class="activity-item"
        v-for="(item, index) in activitiesJoined"
        :key="index"
      >
        <div class="activity-item-img">
          <img class="activity-image" :src="item.thumb" alt="" />
          <div class="saved-club">
            <img src="~@/assets/images/icons/vnt/ic_care_active.svg" alt="" />
          </div>
          <div class="club-info-container">
            <div class="club-name-container">
              <img :src="item.thumb" class="club-avatar" alt="" />
              <div class="club-name">{{ item.Organization.title }}</div>
            </div>
            <div class="club-info">
              <div class="club-user">
                <img
                  class="club-icon"
                  src="~@/assets/images/icons/vnt/add-user.svg"
                  alt=""
                />
                <div class="club-content">{{ item.total_mem }}</div>
              </div>
              <div class="club-rating">
                <img
                  class="club-icon"
                  src="~@/assets/images/icons/vnt/star.svg"
                  alt=""
                />
                <div class="club-content">{{ item.rate }}/10</div>
              </div>
            </div>
          </div>
        </div>
        <div class="activity-item-info">
          <div class="activity-name" @click="viewActivityDetail(item.id)">
            <div>{{ item.title }}</div>
          </div>
          <div class="activity-address">
            <img src="~@/assets/images/icons/vnt/place.png" alt="" />
            <div>{{ item.address }}</div>
          </div>
          <div class="activity-time">
            <img src="~@/assets/images/icons/vnt/calendar.png" alt="" />
            <div>
              {{ momentDate(item.start_time) }} -
              {{ momentDate(item.end_time) }}
            </div>
          </div>
        </div>
      </div>
    </VueSlickCarousel>
  </div>
</template>
<script>
// import component
import moment from "moment";
import VueSlickCarousel from "vue-slick-carousel";
import "vue-slick-carousel/dist/vue-slick-carousel.css";
// optional style for arrows & dots
import "vue-slick-carousel/dist/vue-slick-carousel-theme.css";
export default {
  components: { VueSlickCarousel },
  props: {
    activitiesJoined: {
      default: () => [
        {
          id: 0,
          title: "",
          description: "",
          thumb: "",
          tags: "",
          theme: "",
          rate: 0,
          total_mem: 0,
          Organization: {
            title: "",
          },
        },
      ],
    },
  },

  data() {
    return {};
  },

  methods: {
    /**
     * Xem chi tiết từng hoạt động
     * tvhien 11/06/2022
     */
    viewActivityDetail(id) {
      this.$router.push({
        path: "/activity-detail",
        query: { id: id },
      });
    },

    /**
     * Đổi định dạng ngày
     * tvhien 11/06/2022
     */
    momentDate: function (date) {
      return moment(date).format("DD/MM/YYYY");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
.activity-slide-container {
  padding: 0;
  .activity-item {
    border-radius: 16px;
    margin-right: 23px;
    width: 343px !important;
    height: 306px;
    max-height: 306px;
    display: flex !important;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 1px 2px rgb(0 0 0 / 7%), 0 2px 4px rgb(0 0 0 / 7%),
      0 4px 8px rgb(0 0 0 / 7%), 0 8px 16px rgb(0 0 0 / 7%),
      0 16px 32px rgb(0 0 0 / 7%), 0 32px 64px rgb(0 0 0 / 7%);
    .activity-item-img {
      width: 343px;
      height: 172px;
      cursor: pointer;
      position: relative;
      .activity-image {
        width: 100%;
        height: 100%;
        filter: brightness(0.65);
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        box-shadow: 0 1px 2px rgb(0 0 0 / 7%), 0 2px 4px rgb(0 0 0 / 7%),
          0 4px 8px rgb(0 0 0 / 7%), 0 8px 16px rgb(0 0 0 / 7%);
      }

      .saved-club {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .club-info-container {
        position: absolute;
        bottom: 8px;
        display: flex;
        width: 95%;
        justify-content: space-between;
        margin-left: 10px;
      }

      .club-info,
      .club-name-container {
        display: flex;
        color: #ffffff;
      }

      .club-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }

      .club-user,
      .club-rating {
        display: flex;
      }

      .club-user {
        margin-right: 8px;
      }

      .club-icon {
        width: 24px;
        height: 24px;
      }

      .club-name {
        margin-left: 8px;
        font-size: 20px;
      }

      .club-content {
        display: flex;
        align-items: center;
        height: 26px;
        margin-left: 3px;
      }
    }
    .activity-item-info {
      padding: 15px 20px;
      flex: 1;
      .activity-name {
        font-size: 20px;
        font-weight: 600;
        color: #5c5c5c;
        cursor: pointer;

        div {
          margin-bottom: 10px;
        }
      }
      .activity-address,
      .activity-time {
        display: flex;

        div {
          display: flex;
          align-items: center;
          margin-left: 7px;
        }
      }
    }
  }
}
// img {
//   margin: 0 auto;
//   height: 502px;
//   // height: 420px;

//   width: 100%;
// }

::v-deep {
  .activity-slide-container {
    .slick-list {
      max-height: 317px;
      height: 317px;
      .slick-slide {
        width: 343px !important;
        margin: 0 12px;
      }
    }
  }
}
</style>