
<template>
  <transition>
    <div class="ms-tour" @keyup.capture="onKeyUp">
      <div v-if="active" class="tour-guide-steps">
        <svg class="tour-guide">
          <path ref="path" :d="path" class="region--highlight" />
        </svg>
        <div class="tour__info-guide-block">
          <div
            ref="guideBlock"
            class="info-guide-block"
            :style="{
              top: topPx,
              left: leftPx,
              bottom: bottomPx,
              right: rightPx,
            }"
          >
            <div
              :class="['arrow', topPx == 'auto' ? 'rotate-arrow' : '']"
              :style="styleArrow"
            />
            <div class="header">
              <div class="title">
                {{ titleStep }}
              </div>
            </div>

            <div class="body-info">
              <div class="description-info">
                {{ descriptionStep }}
              </div>
            </div>
            <div class="flex-row footer-info">
              <!-- 27/12/2021 NMTUAN3: Phần hiển thị các dấu chấm để cho người dùng biết được đang đến bước thứ mấy -->
              <div class="flex-row" style="align-items: center">
                <div
                  v-for="(step, i) in stepOnScreen"
                  :key="i"
                  class="dot"
                  :class="[i == currentStep ? 'active' : '']"
                ></div>
              </div>

              <div class="flex-row flex">
                <div class="flex" />
                <ms-button
                  :type="
                    currentStep < stepOnScreen.length - 1
                      ? 'secondary-outline'
                      : 'primary'
                  "
                  text="Tôi đã hiểu"
                  class="detail-button"
                  @click="finishTour"
                />
                <ms-button
                  v-if="currentStep < stepOnScreen.length - 1"
                  class="ml-2"
                  type="primary"
                  text="Bước tiếp theo"
                  @click="doNextStep"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <short-key @shortkeyAction="shortkeyAction"></short-key> -->
    </div>
  </transition>
</template>
<script>
//import ShortKey from "@/views/Base/ShortKey.vue";
export default {
  name: "MsTour",
  //components: { ShortKey },
  props: {
    /**
     * Các bước hướng dẫn trên màn hình
     */
    steps: {
      type: Array,
      default() {
        return [];
      },
    },
    /**
     * Những gợi ý hướng dẫn
     */
    guideSuggestions: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      stepsResource: this.steps, //các bước đầy đủ
      stepOnScreen: [], //các bước hiện có trên màn hình
      active: false, //bật các bước hướng dẫn
      path: "", //công thức vẽ
      titleStep: "", //tiêu đề hướng dẫn ở từng bước
      descriptionStep: "", //hướng dẫn chi tiết
      topPx: "auto", //tọa độ trên của popup hướng dẫn
      leftPx: "auto", //tọa độ trái của popup hướng dẫn
      rightPx: "auto", //tọa độ phải của popup hướng dẫn
      bottomPx: "auto", //tọa độ dưới của popup hướng dẫn
      currentStep: null, //bước hiện tại
      finishedTour: false, //trạng thái hoàn thành tour
    };
  },
  computed: {
    /**
     * Style cho mũi tên ở phần chữ hướng dẫn
     */
    styleArrow() {
      let me = this,
        arrowPos = {
          bottom: me.bottomPx == "auto" ? "100%" : "auto",
          top: me.topPx == "auto" ? "100%" : "auto",
          left: me.rightPx == "auto" ? "30px" : "auto",
          right: me.leftPx == "auto" ? "30px" : "auto",
        },
        stepIdx = me.currentStep;
      if (me.stepOnScreen[stepIdx].position) {
        switch (me.stepOnScreen[stepIdx].position) {
          case "right":
            arrowPos.bottom = "auto";
            arrowPos.top = "30px";
            arrowPos.left = "-15px";
            arrowPos.right = "auto";
            arrowPos.transform = "rotate(-90deg)";
            break;
          case "left":
            arrowPos.bottom = "auto";
            arrowPos.top = "30px";
            arrowPos.right = "-15px";
            arrowPos.left = "auto";
            arrowPos.transform = "rotate(90deg)";
            break;
        }
      }
      return arrowPos;
    },
    /**
     * Có hiện nút tắt hiện trợ giúp hay không
     * @author DVThi-Tham khảo SME Cloud 19/02/2021
     */
    isShowHelpDirect() {
      let me = this;
      return me.stepOnScreen[me.currentStep].hasDirectToHelp;
    },
  },
  created() {
    this._parent = null;
    this.footerHeight = 55; //độ cao của footer
    this.paddingX = 30; //padding của chiều ngang màn hình
    this.wigetWidth = 30; //độ rộng của cột chức năng ở grid
  },
  mounted() {
    //this.$ms.commonFn.shortkeyPushView(this.$el);

    window.addEventListener("resize", this.onWindowResize);
    //Tắt tự động tourgui
    // this.startTour();
  },
  beforeDestroy() {
    let me = this;
    window.removeEventListener("resize", me.onWindowResize);

    //this.$ms.commonFn.shortkeyPopView(this.$el);
  },
  methods: {
    // /**
    //  * Phím tắt
    //  * @author DVThi-Tham khảo SME Cloud - 19.02.2021
    //  */
    // shortkeyAction(e) {
    //   switch (e.originEvent.which) {
    //     case 27: //esc
    //       this.hideTourGuide();
    //       break;
    //   }
    // },
    /**
     * Hiện lời khuyên hướng dẫn
     * @param {Number} index: chỉ số của từng lới khuyên hướng dẫn
     * @author DVThi-Tham khảo SME Cloud 19.02.2021
     */
    showHelpSuggestion(index) {
      let me = this,
        guideItem = me.guideSuggestions[index],
        parentForm = me.getParentForm();
      me.hideTourGuide();
      if (parentForm && parentForm.help) {
        parentForm.help(guideItem.helpId);
      }
    },
    /**
     * Sự kiện được kích hoạt khi ấn phím rồi nhả trên ms tour
     * @author DVThi-Tham khảo SME Cloud 19.02.2021
     */
    onKeyUp(e) {
      const me = this;
      if (!me.active) return;
      else {
        switch (e.which) {
          //Mũi tên trái
          case 37:
            me.doPreviousStep();
            break;
          //Mũi tên phải
          case 39:
            me.doNextStep();
            break;
          default:
            break;
        }
      }
    },
    /**
     * Sự kiện click trên mstour
     * @author DVThi-Tham khảo SME Cloud 19.02.2021
     */
    onClick(e) {
      this.hideTourGuide();
    },
    /**
     * Xem hướng dẫn trên form
     * @author DVThi-Tham khảo SME Cloud 19/02/2021
     */
    watchHelp() {
      let me = this,
        parentForm = me.getParentForm();
      me.finishTour();
      if (parentForm && parentForm.help) {
        parentForm.help();
      } else {
        let element = document.getElementsByClassName("help-btn")[0];
        if (element) {
          element.click();
        }
      }
    },
    /**
     * Sự kiện tính toán lại vị trí khi thay đổi kích cỡ của cửa sổ
     * Created by DVThi-Tham khảo SME Cloud (19/02/2021)
     */
    onWindowResize() {
      if (this.active) {
        this.renderPath(this.currentStep);
        this.renderInfoBlock(this.currentStep);
      }
    },
    checkToStart() {
      if (this.stepsResource == null) {
        this.stepsResource = [];
      }
      this.stepOnScreen.length = 0;
      for (let i = 0; i < this.stepsResource.length; i++) {
        let elName = this.stepsResource[i].target,
          isElmInTable = this.stepsResource[i].isInTable;
        if (this.getElement(elName, isElmInTable) != null) {
          this.stepOnScreen.push(this.stepsResource[i]);
        }
      }
      if (this.stepOnScreen.length > 0) {
        this.stepOnScreen[this.stepOnScreen.length - 1].hasDirectToHelp = true;
      }
    },

    /**
     * Lấy ra form chứa hướng dẫn
     * @author DVThi-Tham khảo SME Cloud 19.02.2021
     */
    getParentForm() {
      let me = this;
      return me._parent;
    },
    /**
     * Ẩn thông tin màn hình hướng dẫn
     * @author DVThi-Tham khảo SME Cloud 19.02.2021
     */
    hideTourGuide() {
      let me = this,
        parent = me.getParentForm();
      me.active = false;
      if (parent && parent.focusFirstControl) {
        parent.focusFirstControl();
      }
    },
    /**
     * Bắt đầu hướng dẫn
     * Created by DVThi-Tham khảo SME Cloud 19/02/2021
     */
    startTour() {
      this.checkToStart();
      if (this.stepOnScreen.length > 0) {
        this.active = true;
        this.currentStep = 0;
        this.doStep(this.currentStep);
        this.finishedTour = false;
      }
    },
    /**
     * Kết thúc hướng dẫn
     * Created by DVThi-Tham khảo SME Cloud 19/02/2021
     */
    finishTour() {
      this.$emit("completedGuide");
      let parent = this.getParentForm();
      this.active = false;
      this.finishedTour = true;
      if (parent && parent.focusFirstControl) {
        parent.focusFirstControl();
      }
    },
    /**
     * Thực hiện bước thứ index
     * @param {Number} index: số thứ tự của bước. Bắt đầu từ 0
     * Created by DVThi-Tham khảo SME Cloud (19/02/2021)
     */
    doStep(index) {
      this.renderPath(index);
      this.renderInfoBlock(index);
      this.titleStep = this.stepOnScreen[index].title;
      this.descriptionStep = this.stepOnScreen[index].description;
      this.currentStep = index;
    },
    /**
     * Thực hiện quay lại bước trước
     * Created by DVThi-Tham khảo SME Cloud (19/02/2021)
     */
    doPreviousStep() {
      if (this.currentStep > 0) {
        this.currentStep -= 1;
        this.doStep(this.currentStep);
      }
    },
    /**
     * Thực hiện bước tiếp theo
     * Created by DVThi-Tham khảo SME Cloud (19/02/2021)
     */
    doNextStep() {
      if (this.currentStep < this.stepOnScreen.length - 1) {
        this.currentStep += 1;
        this.doStep(this.currentStep);
      }
    },
    /**
     * Lấy các thông tin vị trí của phần cần hướng dẫn để tạo ra công thức vẽ
     * @param {Object} area: Vị trí cần hướng dẫn
     * * @param {Number} padding: padding của khu vực cần highlight. VD: 5
     * Created by DVThi-Tham khảo SME Cloud (16/12/2019)
     */
    getPathAttribute(area, padding) {
      let parameter = {},
        borderRadius = 10,
        arcDirection = " 0 0 0", //clockwise
        scrollArea = document.getElementsByClassName("body")[0], //khu vực có scroll
        checkPos = this.isElementInViewport(area),
        pathAttr = "";
      if (scrollArea != null && (!checkPos.isInX || !checkPos.isInY)) {
        let scrollDistance = this.getDistanceToScroll(area); //tạo độ cần scroll để hiển thị element trên viewport
        scrollArea.scrollTop += scrollDistance.y;
        scrollArea.scrollLeft += scrollDistance.x;
      }
      parameter = Object.assign(area.getBoundingClientRect(), {});
      padding = padding ? padding : 10;
      //Công thức vẽ
      //Lưu ý những phần comment không được xóa
      pathAttr =
        "M0 0 V " +
        window.innerHeight +
        " H " +
        window.innerWidth +
        " V 0 Z M" +
        Number(parameter.x - padding) +
        "," +
        Number(parameter.y - padding) +
        // ' a' +
        // padding +
        // ',' +
        // padding +
        // arcDirection +
        // '-' +
        // padding +
        // ',' +
        // padding +
        " v " +
        (Number(parameter.height) + 2 * padding) +
        // ' a' +
        // padding +
        // ',' +
        // padding +
        // arcDirection +
        // padding +
        // ',' +
        // padding +
        " h " +
        (Number(parameter.width) + 2 * padding) +
        // ' a' +
        // padding +
        // ',' +
        // padding +
        // arcDirection +
        // padding +
        // ',' +
        // '-' +
        // padding +
        " v " +
        "-" +
        (Number(parameter.height) + 2 * padding) +
        // ' a' +
        // padding +
        // ',' +
        // padding +
        // arcDirection +
        // '-' +
        // padding +
        // ',' +
        // '-' +
        // padding +
        "z";
      return pathAttr;
    },
    /**
     * Vẽ ra phần cần highligh thứ index
     * @param {Number} index: số thứ tự của bước. Bắt đầu từ 0
     * Created by DVThi-Tham khảo SME Cloud (19/02/2021)
     */
    renderPath(index) {
      if (this.stepOnScreen && this.stepOnScreen.length > 0) {
        let step = this.stepOnScreen[index],
          elName = step.target, //tên element (VD: tên id, tên class)
          isElmInTable = step.isInTable,
          elPadding = step.padding;
        this.path = this.getPathAttribute(
          this.getElement(elName, isElmInTable),
          elPadding
        );
      }
    },
    /**
     * Lấy vị trí để hiển thị phần chữ hướng dẫn
     * ở phía (trên/ dưới/ trái/ phải) phần cần hướng dẫn
     * @param {Object} area: Khu vực cần hướng dẫn
     * @param {Object} currentStep: bước hướng dẫn hiện tại
     * Created by DVThi-Tham khảo SME Cloud (19/02/2021)
     */
    getPositionBlock(area, currentStep) {
      let parameterArea = Object.assign(area.getBoundingClientRect(), {}),
        positionOpt = currentStep.position;
      let intSpace = 25;
      if (positionOpt) {
        switch (positionOpt) {
          case "right":
            this.topPx = parameterArea.y - intSpace + "px";
            this.bottomPx = "auto";
            this.rightPx = "auto";
            this.leftPx =
              parameterArea.x + parameterArea.width + intSpace + "px";
            break;
          case "left":
            this.topPx = parameterArea.y - intSpace + "px";
            this.bottomPx = "auto";
            this.leftPx = "auto";
            this.rightPx =
              window.innerWidth - parameterArea.x + intSpace + "px";
            break;
          default:
            break;
        }
      } else {
        if (
          parameterArea.y <
          window.innerHeight - parameterArea.y - parameterArea.height
        ) {
          this.topPx = parameterArea.y + parameterArea.height + intSpace + "px";
          this.bottomPx = "auto";
        } else {
          this.topPx = "auto";
          this.bottomPx =
            window.innerHeight - parameterArea.y + intSpace + "px";
        }

        if (
          parameterArea.x <
          window.innerWidth - parameterArea.x - parameterArea.width
        ) {
          this.rightPx = "auto";
          this.leftPx = parameterArea.x + "px";
        } else {
          this.rightPx =
            window.innerWidth - parameterArea.x - parameterArea.width + "px";
          this.leftPx = "auto";
        }
      }
    },
    /**
     * Vẽ ra phần chữ hướng dẫn thứ index
     * @param {Number} index: số thứ tự của bước. Bắt đầu từ 0
     * Created by DVThi-Tham khảo SME Cloud (19/02/2021)
     */
    renderInfoBlock(index) {
      if (this.stepOnScreen && this.stepOnScreen.length > 0) {
        let currentStep = this.stepOnScreen[index],
          elName = currentStep.target,
          isElmInTable = currentStep.isInTable;
        this.getPositionBlock(
          this.getElement(elName, isElmInTable),
          currentStep
        );
      }
    },
    /**
     * Lấy ra đối tượng đang được hiển thị lên màn hình theo tên id hoặc class
     * @param {selectorName}: tên đối tượng (tên class hoặc id)
     * @param {}
     * Created by DVThi-Tham khảo SME Cloud 25/12/2019
     */
    getElement(selectorName, isInTable) {
      let el = null,
        selector = selectorName.slice(1); //bỏ kí tự đầu tiên như .,#
      if (selectorName.startsWith(".")) {
        let selector = selectorName.replace(".", "");
        el = document.getElementsByClassName(selector)[0];
      }
      if (selectorName.startsWith("#")) {
        let selector = selectorName.replace("#", "");
        el = document.getElementById(selector);
      }
      if (isInTable) {
        if (selectorName.includes(".") || selectorName.includes("."))
          throw new Error(
            "DEV: Cấu hình đối tượng cột hướng dẫn trong grid sai."
          );
        let thEl = document.querySelectorAll(
            "[ms-field=" + selectorName + "]"
          )[0], //lấy ra tiêu đề cột
          rowCls = "tr-values",
          index = null,
          tr = document.getElementsByClassName(rowCls)[0];
        if (thEl) {
          el = tr.children[thEl.cellIndex];
        }
      }
      if (el && el.offsetParent) {
        return el;
      } else return null;
    },
    /**
     * Trả về khoảng cách cần scroll nếu element không nằm trong viewport
     * @param {*} ele: phần tử đang được lấy để tính toán
     * @author DVThi-Tham khảo SME Cloud 15.04.2020
     */
    getDistanceToScroll(ele) {
      let vpWidth = window.innerWidth, //
        vpHeight = window.innerHeight - this.footerHeight, //trừ đi độ cao footer và scroll
        position = Object.assign(ele.getBoundingClientRect(), {}),
        distance = {
          x: 0, //khoảng cách cần scroll theo chiều dọc
          y: 0, //khoảng cách cần scroll theo chiều ngang
        },
        checkPos = this.isElementInViewport(ele);
      if (!checkPos.isInX) {
        let distanceX = position.left + position.width - vpWidth;
        distance.x = distanceX + this.paddingX + this.wigetWidth;
      }
      if (!checkPos.isInY) {
        let distanceY = position.top + position.height - vpHeight;
        distance.y = distanceY + this.footerHeight;
      }
      return distance;
    },
    /**
     * Kiểm tra xem phần tử hiện tại có nằm trong viewport hay không
     * @param {*} ele:  element HTML
     * @author DVThi-Tham khảo SME Cloud
     */
    isElementInViewport(ele) {
      let checkPos = {
          isInX: true,
          isInY: true,
        },
        vpWidth = window.innerWidth - this.paddingX - this.wigetWidth,
        vpHeight = window.innerHeight - this.footerHeight, //trừ đi đoạn footer
        position = Object.assign(ele.getBoundingClientRect(), {});
      if (position.left < 0 || position.left + position.width > vpWidth) {
        checkPos.isInX = false;
      }
      if (position.top < 0 || position.top + position.height > vpHeight) {
        checkPos.isInY = false;
      }
      return checkPos;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/components/msTour.scss";
</style>
