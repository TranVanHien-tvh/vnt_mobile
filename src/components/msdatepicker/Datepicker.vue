<template>
  <div class="calendar-container" :style="style()">
    <div class="calendar ms-dropdown">
      <div
        :class="[
          'calendar-header flex-row',
          selecting === 'year' ? 'year-select' : 'day-select',
        ]"
      >
        <div
          :class="[
            'icon-calendar-header pointer left',
            selecting === 'year' ? 'icon-year-active' : '',
          ]"
          @click="previousMonth"
        />
        <div class="calender-current-date flex" @click="setSelecting('year')">
          <span v-if="selecting === 'date'"
            >Tháng {{ currentMonth + 1 }} / {{ currentYear }}</span
          >
          <span v-else> {{ currentYear }} </span>
        </div>
        <div
          :class="[
            'icon-calendar-header pointer right',
            selecting === 'year' ? 'icon-year-active' : '',
          ]"
          @click="nextMonth"
        />
      </div>
      <div class="separate-line-header" />
      <div class="calendar-body">
        <table class="calendar-table">
          <thead>
            <tr>
              <th v-for="(value, key) in dayMap" :key="key">
                {{ value }}
              </th>
            </tr>
          </thead>
          <tbody class="date-in-month">
            <tr v-for="(days, index) in calendar" :key="index">
              <td
                v-for="(day, index) in days"
                :key="index"
                :class="[
                  day.day !== '' ? 'date-in-table' : '',
                  'ms-date item',
                  {
                    selected: day.selected && day.day,
                    'ms-date-current': day.currentDay,
                  },
                  {
                    disabled:
                      day.disabled || checkMinDate(day) || checkMaxDate(day),
                  },
                  { 'diff-month': day.diffMonth },
                ]"
                @keydown.esc="onClose"
                @click.exact="setByDay(day), setSelecting('date')"
              >
                {{ day.day }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="separate-line" />
      </div>
      <div v-show="selecting === 'year'" class="calendar-year-select">
        <div class="separate-line" />
        <table>
          <transition-group name="slide-fade" tag="tbody">
            <tr v-for="(yearList, index) in years" :key="index + 0">
              <td
                v-for="(year, index) in yearList"
                :id="`${year.year}-calendar-year`"
                :key="index"
                class="year"
                :class="{ selected: year.selected }"
                @click="setByYear(year.year)"
              >
                <div
                  :class="[
                    'ms-datepicker-year item',
                    { selected: year.selected },
                  ]"
                >
                  {{ year.year }}
                </div>
              </td>
            </tr>
          </transition-group>
        </table>
        <div class="separate-line" />
        <button class="cancel-button" @click="setSelecting('date')">
          Hủy bỏ
        </button>
      </div>
      <div v-if="hasTime" class="time">
        <ms-label bold class="mr-12-px"> Thời gian: </ms-label>
        <div class="change-hour">
          <ms-number
            v-model="hour"
            max="23"
            min="0"
            is-time
            leading-zero="keep"
            class="input-time"
            @keydown.enter="updateHour"
            @input="onInputHour"
          />
        </div>
        <ms-label class="mr-6-px ml-6-px"> : </ms-label>
        <div class="change-minute">
          <ms-number
            ref="min"
            v-model="min"
            max="60"
            min="0"
            is-time
            leading-zero="keep"
            class="input-time"
            @keydown.enter="updateMin"
            @input="onInputMin"
          />
        </div>
        <ms-label class="mr-6-px ml-6-px"> : </ms-label>
        <div class="change-second">
          <ms-number
            ref="second"
            v-model="second"
            max="60"
            min="0"
            is-time
            leading-zero="keep"
            class="input-time"
            @keydown.enter="updateSecond"
            @input="onInputSecond"
          />
        </div>
      </div>
      <div class="calendar-footer">
        <button class="pick-today-button" @click.stop.prevent="onNow">
          Hôm nay
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/* --------------------------------
 * Hàm tách mảng
 */
const slice = (array, start, end) => {
  let length = array == null ? 0 : array.length;

  if (!length) {
    return [];
  }

  start = start == null ? 0 : start;

  end = end === undefined ? length : end;

  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }

  end = end > length ? length : end;

  if (end < 0) {
    end += length;
  }

  length = start > end ? 0 : (end - start) >>> 0;
  start >>>= 0;

  let index = -1;

  const result = new Array(length);

  while (++index < length) {
    result[index] = array[index + start];
  }

  return result;
};
/** -----------------------------
 * Hàm tách mảng thành nhiều mảng nhỏ có độ dài cho trước
 * @param {arrays, size}
 * -------------------------------
 */
const chunk = (array, size) => {
  size = Math.max(size, 0);

  const length = array == null ? 0 : array.length;

  if (!length || size < 1) {
    return [];
  }

  let index = 0;

  let resIndex = 0;

  const result = new Array(Math.ceil(length / size));

  while (index < length) {
    result[resIndex++] = slice(array, index, (index += size));
  }

  return result;
};
const monthMap = {
  0: "Tháng 1",
  1: "Tháng 2",
  2: "Tháng 3",
  3: "Tháng 4",
  4: "Tháng 5",
  5: "Tháng 6",
  6: "Tháng 7",
  7: "Tháng 8",
  8: "Tháng 9",
  9: "Tháng 10",
  10: "Tháng 11",
  11: "Tháng 12",
};
// @ is an alias to /src
import { ModuleContext } from "@/stores/module-const";
import { mapGetters } from "vuex";
export default {
  name: "Datepicker",
  props: {
    hasTime: {
      type: Boolean,
      default: false,
    },
    colorSelected: {
      type: String,
      required: false,
      default: "#08BF1E",
    },
    backgroundSelected: {
      type: String,
      required: false,
      default: "rgba(44, 160, 28, 0.2)",
    },
    yearSelected: {
      type: String,
      required: false,
      default: "#fff",
    },
    value: {},

    screenX: {
      type: Number,
      required: true,
    },
    screenY: {
      type: Number,
      required: true,
    },
    minDate: {},
    maxDate: {},
  },
  data() {
    let dteNow = new Date();
    return {
      hour: 0,
      min: 0,
      second: 0,
      dayMap: {
        0: "T2",
        1: "T3",
        2: "T4",
        3: "T5",
        4: "T6",
        5: "T7",
        6: "CN",
      },
      currentMonth: `${dteNow.getMonth()}`, // tháng đang hiển thị trên picker
      currentYear: `${dteNow.getFullYear()}`, // năm đang hiển thị trên picker
      selecting: "date",
      selectedDayRange: [],
      selectedDayOfWeek: "",
      selectedDay: dteNow.getDate(), // selected: ngày/ tháng/ năm đang chọn
      selectedMonth: `${dteNow.getMonth()}`,
      selectedYear: `${dteNow.getFullYear()}`,
      rangeDayMode: false, // chế độ khoảng thời gian, mặc định là không bật
      height: "",
      width: "",
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        const me = this;

        if (newVal && newVal instanceof Date) {
          me.hour = newVal.getHours();
          me.min = newVal.getMinutes();
          me.second = newVal.getSeconds();
        }
      },
    },
  },
  methods: {
    checkMinDate(day) {
      if (this.minDate) {
        let lessYear = this.currentYear < this.minDate.getFullYear(),
          lessMonth =
            this.currentYear == this.minDate.getFullYear() &&
            this.currentMonth < this.minDate.getMonth(),
          lessDay =
            this.currentYear == this.minDate.getFullYear() &&
            this.currentMonth == this.minDate.getMonth() &&
            day.day < this.minDate.getDate();

        if (lessYear || lessMonth || lessDay) return true;
      }
      return false;
    },
    checkMaxDate(day) {
      if (this.maxDate) {
        let greaterYear = this.currentYear > this.maxDate.getFullYear(),
          greaterMonth =
            this.currentYear == this.maxDate.getFullYear() &&
            this.currentMonth > this.maxDate.getMonth(),
          greaterDay =
            this.currentYear == this.maxDate.getFullYear() &&
            this.currentMonth == this.maxDate.getMonth() &&
            day.day > this.maxDate.getDate();

        if (greaterYear || greaterMonth || greaterDay) return true;
      }
      return false;
    },
    onInputHour() {
      // hàm này kiểm tra focus sang input min
      const me = this,
        hour = me.hour;
      if (
        (hour.toString().length === 1 && hour >= 3) ||
        hour.toString().length === 2
      ) {
        me.updateTime(hour, null, null);
      }
    },

    onInputMin() {
      const me = this,
        min = me.min;
      if (
        (min.toString().length === 1 && min >= 6) ||
        min.toString().length === 2
      ) {
        me.updateTime(null, min, null);
      }
    },

    onInputSecond() {
      const me = this,
        second = me.second;

      if (
        (second.toString().length === 1 && second >= 6) ||
        second.toString().length === 2
      ) {
        //update ra ngoai
        me.updateTime(null, null, second);
      }
    },

    updateHour() {
      this.updateTime(this.hour, null, null);
    },

    updateMin() {
      this.updateTime(null, this.min, null);
    },

    updateSecond() {
      this.updateTime(null, null, this.second);
    },

    /**
     * Thực hiện cập nhật Giờ/Phút/Giây
     */
    updateTime(hour, min, second) {
      const me = this;

      let valueDateTime = me.value;
      if (valueDateTime && valueDateTime instanceof Date) {
        if (hour) {
          valueDateTime.setHours(hour);
        }
        if (min) {
          valueDateTime.setMinutes(min);
        }
        if (second) {
          valueDateTime.setSeconds(second);
        }

        this.$emit("input", valueDateTime);
      }
    },

    style() {
      //Chieu cao cua cua so
      let height =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      let width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
      let top = 36 + "px";

      //this.screenY laf vi tri cua
      if (this.screenY + this.height + 100 > height) {
        top = -this.height - 36 + "px";
      }
      if (this.screenX - this.width < 200) {
        return {
          left: 0 + "px",
          top: top,
        };
      } else
        return {
          right: 0 + "px",
          top: top,
        };
    },

    /**
     * Changes the display to the calendar or years depending on the value.
     */
    /*---------------------------------
     * Hàm trả về tháng tiếp theo (hoặc 12 năm tiếp theo) khi bấm mũi tên sang phải (hoặc lên trên)
     * Created by: nvlam (22/06/2019)
     */
    nextMonth() {
      if (this.selecting === "date") {
        if (this.currentMonth < 11) {
          this.currentMonth = this.currentMonth + 1;
        } else {
          this.currentMonth = 0;
          this.currentYear = this.currentYear + 1;
        }
      } else if (this.selecting === "year") {
        this.currentYear = this.currentYear + 12;
      }
    },

    /*---------------------------------
     * Hàm trả về tháng trước (hoặc 12 năm về trước) khi bấm mũi tên sang phải (hoặc xuống dưới)
     * Created by: nvlam (22/06/2019)
     */
    previousMonth() {
      if (this.selecting === "date") {
        if (this.currentMonth > 0) {
          this.currentMonth = this.currentMonth - 1;
        } else {
          this.currentMonth = 11;
          this.currentYear = this.currentYear - 1;
        }
      } else if (this.selecting === "year") {
        this.currentYear -= 12;
      }
    },

    /*---------------------------------
     * Đóng lịch khi các nút Esc hay Tab được nhấn
     * Created by: nvlam (22/06/2019)
     */
    setEscapeEvent() {
      const me = this;
      document.addEventListener("keydown", me.eventEscape);
    },

    eventEscape(event) {
      const me = this;
      if (event.keyCode == 27 || event.key == "Escape" || event.key == "Tab") {
        event.cancel = true;
        me.onClose(event);
      }
    },

    setByYear(year) {
      this.selectedDay = "";
      this.selectedYear = year;
      this.currentYear = year;
      this.selecting = "date";
    },

    onBlur(e) {
      this.onHide(e);
    },

    /*---------------------------------
     * Chọn ngày hiện tại khi bấm vào nút Hôm nay
     * Created by: nvlam (24/06/2019)
     */
    onNow() {
      const me = this,
        date = new Date(); //me.ConfigInfo.CurrentDate;

      me.selectedDay = date.getDate();
      me.selectedMonth = date.getMonth();
      me.currentMonth = date.getMonth();
      me.currentYear = date.getFullYear();
      me.selectedYear = date.getFullYear();
      me.selectedDayOfWeek = date.getDay();

      if (me.hasTime) {
        me.hour = date.getHours();
        me.min = date.getMinutes();
        me.second = date.getSeconds();
      }

      me.setByDay({
        currentDay: true,
        day: me.selectedDay,
        //NMTuan3 22/12/2021: Truyền thêm tháng được chọn
        month: me.selectedMonth,
        selected: true,
      });

      // me.$emit('input', new Date(date).getDateOnly());
      // me.onClose(event);
    },

    /**
     * Emit a close event so the developer can close the date picker as they
     * see fit.
     */
    onClose(e) {
      // this.hideBodyOverflow(false);
      const me = this;
      this.$emit("close", e);
    },

    onHide(e) {
      const me = this;
      this.$emit("hide", e);
    },

    /**
     * Set the date by the given day.
     *
     * @param {Object}
     */
    setByDay(day) {
      const me = this;

      // if (day.disabled) return;
      if (me.rangeDayMode == false) {
        // NMTuan3 22/12/2021: Case để set năm được chọn
        // NMTUAN2 19.04.2022: sửa để giá trị năm được chọn luôn tính theo năm đang hiển thị
        if (day.month == 0 && me.currentMonth == 11) {
          me.selectedYear = me.currentYear + 1;
        } else if (day.month == 11 && me.currentMonth == 0) {
          me.selectedYear = me.currentYear - 1;
        } else {
          me.selectedYear = me.currentYear;
        }
        me.selectedDay = day.day;
        me.selectedMonth = day.month;
        me.selectedDayOfWeek = new Date(
          me.selectedYear,
          me.selectedMonth,
          me.selectedDay
        ).getDay();
      }

      let valueDateTime = new Date(
        me.selectedYear,
        me.selectedMonth,
        me.selectedDay
      );

      if (me.hasTime) {
        valueDateTime.setHours(me.hour);
        valueDateTime.setMinutes(me.min);
        valueDateTime.setSeconds(me.second);
      }

      me.$emit("selected", new Date(valueDateTime));
      me.$emit("input", new Date(valueDateTime));

      me.onClose(event);
      // this.onInput();
    },
    closeOut(e) {
      const me = this;
      if (
        !e.target.closest(".calendar") &&
        (!e.target.closest(".ms-datepicker") ||
          e.target.closest(".ms-datepicker") != me.$parent.$el)
      ) {
        me.onHide(e);
      }
    },
    /*--------------------------------
     * Bật chế độ chọn khoảng ngày
     * Created by: nvlam(26/06/2019)
     */
    onRangeDayMode() {
      this.rangeDayMode = true;
      return this.rangeDayMode;
    },

    /*--------------------------------
     * Tắt chế độ chọn khoảng ngày
     * Created by: nvlam(26/06/2019)
     */
    offRangeDayMode() {
      this.rangeDayMode = false;
      return this.rangeDayMode;
    },

    /*---------------------------------
     * Hàm thay đổi chế độ chọn năm hoặc chọn ngày
     * Created by: nvlam(24/06/2019)
     */
    setSelecting(value) {
      this.selecting = value;
      this.currentYear = this.selectedYear;
    },

    /**
     * Lấy ngày cho datepicker khi nhập từ ô input.
     */
    setDate() {
      // Nếu ngày được truyền tới component datepicker, nó sẽ được dùng
      // thay cho ngày hiện tại.
      let date;

      if (this.min && this.min && !this.value) {
        date = new Date();
      } else if (this.value && this.value) {
        date = new Date(this.value);
      } else {
        date = new Date();
      }
      // if (this.initialDate) {
      //     this.selectedDay = date.getDate();
      // } else {
      //     this.selectedDay = date.getDate();
      // }
      this.selectedDay = date.getDate();
      this.selectedDayOfWeek = date.getDay();
      this.selectedMonth = date.getMonth();
      this.currentMonth = date.getMonth();
      this.selectedYear = date.getFullYear();
      this.currentYear = date.getFullYear();
    },
  },

  computed: {
    ...mapGetters(ModuleContext, ["ConfigInfo"]),
    /* --------------------------------
     * Hàm trả về một mảng gồm ngày của tuần đầu tiên trong tháng của năm
     * VD: Nếu ngày 1 trong tháng bắt đầu từ thứ 6
     * thì mảng sẽ là ['', '', '', '', '', '1', '2']
     * Created by: nvlam (22/06/2019)
     */
    calendar() {
      const days = [];
      //Lấy ra thứ của ngày đầu tiên trong tháng
      let now = new Date(this.selectedYear, this.currentMonth, 1);
      const startDayOfMonth = now.getDay();
      let startDay = startDayOfMonth;
      if (startDayOfMonth != 0) {
        let pre = now.addDays(-1).getDate();
        for (let i = startDay - 2; i >= 0; i--) {
          days.push(pre - i);
        }
      } else {
        let pre = now.addDays(-1).getDate();
        for (let i = 0; i < 6; i++) {
          days.unshift(pre--);
        }
      }
      //Tạo mảng gồm các ngày còn lại trong tháng
      const daysInMonth =
        32 - new Date(this.selectedYear, this.currentMonth, 32).getDate();
      for (let i = 0; i < daysInMonth; i++) {
        days.push(i + 1);
      }

      // Map the days from numbers to objects that have current day,
      // selected, and disabled properties for the view.
      const today = new Date(this);

      let dis = startDay;
      const dayObjects = days.map((day, index) => {
        const currentDay =
          day === today.getDate() &&
          this.currentMonth == today.getMonth() &&
          this.selectedYear == today.getFullYear();
        // const disabled = this.dayDisabled(day);
        const diffMonth =
          (index < 6 && day < 8) || (index >= 6 && day >= 1) ? false : true;

        // NMTUAN3 18/12/2021: Case thêm trường hợp nếu tháng hiện tại là 1 thì những ngày add vào trước là tháng 12
        // Ví dụ: ngày 1/1/2022 là thứ 7 thì các thứ từ 2-6 là ngày ở tháng 12/2021
        const month = diffMonth
          ? this.currentMonth == 0
            ? 11
            : this.currentMonth - 1
          : this.currentMonth;
        const selected =
          this.selectedDay === day && month === this.selectedMonth;
        return { day, currentDay, selected, diffMonth, month };
      });

      // add thêm ngày tháng sau cho kín lịch
      var ofs = dayObjects.length % 7;
      if (ofs > 0) {
        for (let i = 1; i <= 7 - ofs; i++) {
          dayObjects.push({
            day: i,
            currentDay: false,
            selected: false,
            disabled: false,
            diffMonth: true,
            // NMTUAN3 18/12/2021: nếu tháng hiện tại là tháng 12 thì những ngày được add vào sau là tháng 1
            // Ví dụ: ngày 31/12/2021 là thứ 6 thì t7 và chủ nhật của tuần là ngày của tháng 1/2022
            month: this.currentMonth == 11 ? 0 : this.currentMonth + 1,
          });
        }
      }

      // Chunk all of the days into an array of arrays, by seven.
      return chunk(dayObjects, 7);
    },
    years() {
      //Đặt năm đầu tiên của dãy
      const today = new Date();
      let lastYear;
      if (this.selectedYear === "") {
        lastYear = today.getFullYear();
      } else lastYear = this.currentYear;
      let through = 12; // số năm hiển thị trên 1 trang
      let years = []; // mảng chứa các năm
      for (let i = lastYear; i > lastYear - through; i--) {
        years.push(i);
      }
      const yearObjects = years.map((year) => {
        const currentYear = this.selectedYear === today.getFullYear();
        const selected =
          this.selectedYear === year &&
          this.currentMonth === this.selectedMonth;
        // const disabled = this.dayDisabled(day);

        return { year, currentYear, selected };
      });

      // Chunk all of the days into an array of arrays, by seven.
      return chunk(yearObjects, 4);
    },
    /**
     * Trả về tháng được chọn thành một từ.
     * VD: 6 -> Tháng 6
     *
     * @return {String}
     */
    selectedMonthWord() {
      return monthMap[this.selectedMonth];
    },
    selectedDateRange() {
      let beginDay = this.selectedDay;
      return beginDay;
    },
  },
  getValueFromInput() {
    return (this.currentMonth = this.specifiedDate.getMonth());
  },
  created() {
    this.setEscapeEvent();
    this.setDate();
    document.addEventListener("click", this.closeOut);
  },
  beforeDestroy() {
    const me = this;
    document.removeEventListener("click", me.closeOut);
    document.removeEventListener("keydown", me.eventEscape);
  },
  mounted() {
    this.height = this.$el.offsetHeight;
    this.width = this.$el.offsetWidth;
  },
};
</script>
<style>
/* @import '../../assets/css/iconfont.css'; */
</style>

<style lang="scss" scoped>
@import "@/assets/scss/components/msDatePickerPopup.scss";
.disabled {
  opacity: 0.7;
  pointer-events: none;
}
</style>



