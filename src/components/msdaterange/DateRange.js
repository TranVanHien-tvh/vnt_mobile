/**
 * fiscalYear năm tài chính
 * Mặc định ngày bắt đầu là thứ 2
 */

// import session from '@/common/session';
import { MSEnum } from "@/commons/enumeration";

let Period = MSEnum.Period;

let fiscalFromDate = new Date();

class DateRange {

	/**
	 * Xác định quý
	 * @param {*} month
	 */
	caculQuarterByMonth(month) {
		//Xác định quý
		if (isNaN(month)) return;
		return Math.floor(month / 3) + 1;
  }

	/**
	 * Ngày hiện tại
	 */
	getThisDay() {
		var d = new Date();
		return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

	/**
	 * Tính ngày bắt đầu của tháng (1...12)
	 */
	getFromDateMonth(month,year) {
		let dateNow=new Date();
		let currentYear=dateNow.getFullYear();
		if(year){
			currentYear=year;
		}
		return new Date(currentYear, month - 1, 1);
  }

	/**
	 * Tính ngày kết thúc của tháng (1....12)
	 */
	getToDateMonth(month,year) {
	let currentYear =new Date().getFullYear();
	if(year){
		currentYear=year;
	}
    const daysInMonth =
			32 - new Date(currentYear, month - 1, 32, 0, 0, 0).getDate();
		return new Date(currentYear, month - 1, daysInMonth, 0, 0, 0);
	}

	/**  Sinh hàm riêng tránh ảnh hưởng đến chức năng chung
	 * Tính ngày kết thúc của tháng (1....12) cua năm xác định
	 */
	getToDateMonthAndYear(month,year){
		const daysInMonth =32 - new Date(year, month - 1, 32, 0, 0, 0).getDate();
		return new Date(year, month - 1, daysInMonth, 0, 0, 0);
	}

	getFromDateMonthAndYear(month,year){
		return new Date(year, month - 1, 1);
	}

	/**
	 * Quý này
	 */
	getThisQuarter() {
		let date=new Date();
		var currenMonth = date.getMonth(),
      currentQuater = this.caculQuarterByMonth(currenMonth),
      currentYear = date.getFullYear();
		var range = {};
		range.fromDate = this.fromQuarter(currentQuater,currentYear);
		range.toDate = this.toQuarter(currentQuater,currentYear);
		return range;
  }

	/**
	 * Quý sau
	 */
	getNextQuarter() {
		let date=new Date();
		var currenMonth =date.getMonth(),
      currentQuater = this.caculQuarterByMonth(currenMonth) + 1,
      currentYear = date.getFullYear(),
      range = {};

		range.fromDate = this.fromQuarter(currentQuater,currentYear);
		range.toDate = this.toQuarter(currentQuater,currentYear);
		return range;
  }

	/**
	 * Quý trước
	 */
	getLastQuarter() {
		let date=new Date();
		var currenMonth = date.getMonth(),
      currentQuater = this.caculQuarterByMonth(currenMonth) - 1,
      currentYear = date.getFullYear(),
      range = {};

		range.fromDate = this.fromQuarter(currentQuater,currentYear);
		range.toDate = this.toQuarter(currentQuater,currentYear);
		return range;
  }

	/**
	 * Tính hôm qua
	 */
	getYesterday() {
    var dte = new Date();
    dte.addDays(-1);
		return dte;
  }

	/**
	 * Tính ngày mai
	 */
	getTomorrow() {
    var dte = new Date();
    dte.addDays(1);
		return dte;
  }

	/**
	 * Tính tuần này
	 */
	getThisWeek() {
		//Tính ngày hiện tại là thứ mấy
		let date=new Date();
		var currentYear = date.getFullYear(),
			currenMonth = date.getMonth(),
			currentDay = date.getDate();
		let day = date.getDay();
		let x = day == 0 ? day + 7 - 1 : day - 1;
		var range = {};
		range.fromDate = new Date(
			currentYear,
			currenMonth,
			currentDay - x,
			0,
			0,
			0
		);
		range.toDate = new Date(
			currentYear,
			currenMonth,
			currentDay - x + 6,
			0,
			0,
			0
		);
		return range;
  }

	/**
	 * Tính tuần trước
	 */
	getLastWeek() {

		let date=new Date();
		var currentYear = date.getFullYear(),
			currenMonth = date.getMonth(),
			currentDay = date.getDate();
		let day =date.getDay();
		let x = day == 0 ? day + 7 - 1 : day - 1;
		var range = {};
		range.fromDate = new Date(
			currentYear,
			currenMonth,
			currentDay - x - 7,
			0,
			0,
			0
		);
		range.toDate = new Date(
			currentYear,
			currenMonth,
			currentDay - x - 1,
			0,
			0,
			0
		);
		return range;
  }

	/**
	 * Tuần tới
	 */
	getNextWeek() {
		let date=new Date();
		var currentYear = date.getFullYear(),
			currenMonth = date.getMonth(),
			currentDay = date.getDate();
		let day =date.getDay();
		let x = day == 0 ? day + 6 : day - 1;
		var range = {};
		range.fromDate = new Date(
			currentYear,
			currenMonth,
			currentDay - x + 7,
			0,
			0,
			0
		);
		range.toDate = new Date(
			currentYear,
			currenMonth,
			currentDay - x + 13,
			0,
			0,
			0
		);
		return range;
  }

	/**
	 * Tháng này
	 *
	 */
	getThisMonth() {
		var date=new Date( );
		var currentYear = date.getFullYear(),
			currenMonth =date.getMonth(),
			currentDay = date.getDate(),
			daysOfMonth = 32 - new Date(currentYear, currenMonth, 32).getDate();
		var range = {};
		range.fromDate = new Date(currentYear, currenMonth, 1, 0, 0, 0);
		range.toDate = new Date(currentYear, currenMonth, daysOfMonth, 0, 0, 0);
		return range;
  }

	/**
	 * Tháng sau
	 */
	getLastMonth() {
		var date=new Date( );
		var currentYear = date.getFullYear(),
			currenMonth =date.getMonth(),
			currentDay = date.getDate(),
			daysOfMonth = 32 - new Date(currentYear, currenMonth - 1, 32).getDate();
		var range = {};
		range.fromDate = new Date(currentYear, currenMonth - 1, 1);
		range.toDate = new Date(currentYear, currenMonth - 1, daysOfMonth);
		return range;
  }

	/**
	 * Tính tháng tới
	 */
	getNextMonth() {
		var date=new Date( );
		var currentYear = date.getFullYear(),
			currenMonth =date.getMonth(),
			currentDay = date.getDate();
		var range = {};
		range.fromDate = new Date(currentYear, currenMonth + 1, 1);
		range.toDate = new Date(
			currentYear,
			currenMonth + 1,
			32 - new Date(currentYear, currenMonth + 1, 32).getDate()
		);
		return range;
  }

	/**
	 * Tính sáu tháng cuối năm +Từ ngày đầu tiên + 6 tháng nữa
	 */
	getSixLastMonth() {

		var currentYear = this.getCurrentFiscalYear(),
			startMonth =0,//new Date(fiscalFromDate).getMonth(),
			daysOfMonth = 32 - new Date(currentYear, startMonth + 11, 32).getDate();
		var range = {};
		range.fromDate = new Date(currentYear, startMonth + 6, 1, 0, 0, 0);
		range.toDate = new Date(currentYear, startMonth + 11, daysOfMonth);
		return range;
  }

    getCurrentFiscalYear() {
		//get current date
		var today = new Date();
		
		//get current month
		// var curMonth = today.getMonth();
		
		// var fiscalYr = "";
		// if (curMonth > 3) { //
		// 	fiscalYr = today.getFullYear().toString();
		// } else {
		// 	fiscalYr = (today.getFullYear() - 1).toString();
		// }
		
		return today.getFullYear();
	}

	/**
	 * Tính sáu tháng đầu  năm
	 */
	getSixFirstMonth() {
		var currentYear = this.getCurrentFiscalYear(),
			currenMonth = 0,//new Date(fiscalFromDate).getMonth(),
			daysOfMonth = 32 - new Date(currentYear, currenMonth + 5, 32).getDate();
		var range = {};
		range.fromDate = new Date(currentYear, currenMonth, 1, 0, 0, 0);
		range.toDate = new Date(currentYear, currenMonth + 5, daysOfMonth);
		return range;
	}

	/**
	 * Tính năm  trước
	 */
	getLastYear() {
		var currentYear = this.getCurrentFiscalYear(),
			currenMonth = 0,//new Date(fiscalFromDate).getMonth(),
			daysOfMonth =32 - new Date(currentYear - 1, currenMonth + 11, 32).getDate();
	    	var range = {};
      range.fromDate = new Date(currentYear - 1, currenMonth, 1, 0, 0, 0);
      range.toDate = new Date(currentYear - 1, currenMonth + 11, daysOfMonth);


		return range;
  }

	/**
	 * Năm sau
	 */
	getNextYear() {
		var currentYear = this.getCurrentFiscalYear(),
			currenMonth =0,//new Date(fiscalFromDate).getMonth(),
			daysOfMonth =32 - new Date(currentYear + 1, currenMonth + 11, 32).getDate();
		var range = {};
		range.fromDate = new Date(currentYear + 1, currenMonth, 1, 0, 0, 0);
		range.toDate = new Date(currentYear + 1, currenMonth + 11, daysOfMonth);

		return range;
  }

	// /**
	//  * Kiểm tra xem ngày hạch toán của hệ thống so với ngày bắt đầu của năm tài chính
  //  * true<==> Ngày hoạch toán nhỏ hơn ngày bắt đầu Năm tài chính
	//  */
	// checkFiscalYear() {
	// 	var postedDate = new Date(2019,this.session.SystemDate.getMonth(),this.session.SystemDate.getDate(),0,0,0).getTime() / 1000;
	// 	var startDate =new Date(2019,this.FiscalFromDate.getMonth(),this.FiscalFromDate.getDate(),0,0,0).getTime() / 1000;
	// 	return postedDate <  startDate;
	// }
	/**
	 * Năm nay
	 */
	getThisYear(year) {
		var range = {};
		var currentYear = this.getCurrentFiscalYear();
		if(year){
			currentYear=year;
		}
		var	currenMonth = 0,//new Date(fiscalFromDate).getMonth(),
			currentDay =new Date(fiscalFromDate).getDate(),
			daysOfMonth = 32 - new Date(currentYear, currenMonth + 11, 32).getDate();
			range.fromDate = new Date(currentYear, currenMonth, 1, 0, 0, 0);
			// range.fromDate = this.session.FiscalFromDate;
			range.toDate =new Date(currentYear, currenMonth+ 11, daysOfMonth, 0, 0, 0);

		return range;
  }

	/**
	 * Cách đây 3 năm
	 */
	getThreeLastWeek() {
		// var range={};
		// range.fromDate = new Date(this.FiscalFromDate.addYears(-3));
		// range.toDate = new Date(this.FiscalFromDate.addYears(-2).addDays(-1));
		// return range;
		var currentYear = this.getCurrentFiscalYear(),
			currenMonth = new Date(fiscalFromDate).getMonth(),
			currentDay =new Date(fiscalFromDate).getDate(),
			daysOfMonth =
				32 - new Date(currentYear - 3, currenMonth + 11, 32).getDate();
		var range = {};
		range.fromDate = new Date(currentYear - 3, currenMonth, 1, 0, 0, 0);
		range.toDate = new Date(currentYear - 3, currenMonth + 11, daysOfMonth);
		return range;
  }

	/**
	 * Đầu tuần với hiện tại
	 */
	getFirstWeekToPresent() {
		//Tính ngày hiện tại là thứ mấy
		let date=new Date();
		var currentYear = date.getFullYear(),
			currenMonth = date.getMonth(),
			currentDay = date.getDate();
		let day = date.getDay();
		let x = day == 0 ? day + 7 - 1 : day - 1;
		var range = {};
		range.fromDate = new Date(
			currentYear,
			currenMonth,
			currentDay - x,
			0,
			0,
			0
		);
		range.toDate = new Date(currentYear, currenMonth, currentDay, 0, 0, 0);
		return range;
	}

	/**
	 * Đầu quý đến hiện tại
	 */
	getFirstQuarterToPresent() {
		//Tính quý này là quý nào
		let date= new Date();
		var currenMonth = date.getMonth(),
			currentQuater = this.caculQuarterByMonth(currenMonth);
		var range = {};
		range.fromDate = this.fromQuarter(currentQuater,date.getFullYear());
		range.toDate = date;
		return range;
  }

	/**
	 * Đầu tháng đến hiện tại
	 */
	getFirstMonthToPresent() {
		let date = new Date();
		var currentYear = date.getFullYear(),
			currenMonth = date.getMonth(),
			currentDay = date.getDate();
		var range = {};
		range.fromDate = new Date(currentYear, currenMonth, 1, 0, 0, 0);
		range.toDate = new Date();
		return range;
  }

	/**
	 * Đầu năm đến hiện tại
	 */
	getFirstYearToPresent() {
    var currentYear = this.getCurrentFiscalYear(),
    currenMonth = 0, //new Date(fiscalFromDate).getMonth(),
    currentDay =new Date( fiscalFromDate).getDate();
		var range = {};
		range.fromDate = new Date(currentYear,currenMonth,1,0,0,0);
		range.toDate = new Date();
		return range;
  }

	/**
	 * Ngày bắt đầu của quý
	 * @param {*} quater=tên quý +offset
	 */
	fromQuarter(quater,year) {
		//tính ngày bắt đầu quý
		let month = (quater - 1) * 3 + 1;
		let fromDate = new Date(year, month - 1, 1);
		return fromDate;
  }

	/**
	 * Ngày kết thúc Quý
	 * @param {*} quater=tên quý +offset:Ví dụ quý I nhưng ngày final lại là 1/4 => Thực tế là quý 2
	 */
	toQuarter(quater,year) {
		//Ngày kết thuc của quý
		let month = quater * 3;
		const daysInMonth = 32 - new Date(year, month - 1, 32).getDate();
		let toDate = new Date(year, month - 1, daysInMonth);
		return toDate;
  }

  /***
   * TTHuyen
   * Bổ sung year phục vụ tính toán kỳ báo cáo
   * TThuyen Hàm tính Ngày tháng
   * @return {Object} trả về range {fromDate: , toDate: }
   */
  caculateRangeFromPeriod(period, innerFromDate, innerToDate,year) {
    var me = this,
        range,
        fromDate,
        toDate;
    switch (period) {
      case Period.January:
      case Period.February:
      case Period.March:
      case Period.April:
      case Period.May:
      case Period.June:
      case Period.July:
      case Period.August:
      case Period.September:
      case Period.October:
      case Period.November:
      case Period.December:
        fromDate = me.getFromDateMonth(period,year);
        toDate = me.getToDateMonth(period,year);
        break;
      case Period.FiscalI:
      case Period.FiscalII:
      case Period.FiscalIII:
      case Period.FiscalIV: {
		let offsetQuarter =	0,//me.caculQuarterByMonth(new Date(fiscalFromDate).getMonth()) - 1,
			fiscal = period / 100 + offsetQuarter;
		if(!year){
			year=me.getCurrentFiscalYear();
		}else{
			//Với truyền năm cần tính toán lại năm cho đúng theo quý đang tính toán (dùng cho subTitle báo cáo)
			year=me.getYearWithFromDate(innerFromDate,year);
		}
        fromDate = me.fromQuarter(fiscal, year);
        toDate = me.toQuarter(fiscal, year);
        break;
      }
      case Period.ThisDay:
        fromDate = toDate = me.getThisDay();
        // toDate = me.getThisDay();
        break;
      case Period.Yesterday: {
        fromDate = me.getYesterday();
        toDate = fromDate;
        break;
      }
      case Period.Tomorrow: {
        fromDate = me.getTomorrow();
        toDate = fromDate;
        break;
      }
      case Period.ThisWeek: {
        range = me.getThisWeek();

        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.LastWeek: {
        range = me.getLastWeek();

        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.NextWeek: {
        range = me.getNextWeek();

        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.ThisMonth: {
        range = me.getThisMonth();

        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.LastMonth: {
        range = me.getLastMonth();

        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.NextMonth: {
        range = me.getNextMonth();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.ThisQuarter: {
        range = me.getThisQuarter();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.LastQuarter: {
        range = me.getLastQuarter();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.NextQuarter: {
        range = me.getNextQuarter();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.SixLastMonth: {
        range = me.getSixLastMonth();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.SixFirstMonth: {
        range = me.getSixFirstMonth();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.ThisYear: {
        range = me.getThisYear(year);
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.LastYear: {
        range = me.getLastYear();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.NextYear: {
        range = me.getNextYear();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      // case Period.ThreeLastYear: {
      // 	range = me.getThreeLastWeek();
      // 	fromDate = range.fromDate;
      // 	toDate = range.toDate;
      // 	break;
      // }
      case Period.FirstWeekToPresent: {
        range = me.getFirstWeekToPresent();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.FirstQuarterToPresent: {
        range = me.getFirstQuarterToPresent();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.FirstYearToPresent: {
        range = me.getFirstYearToPresent();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      case Period.FirstMonthToPresent: {
        range = me.getFirstMonthToPresent();
        fromDate = range.fromDate;
        toDate = range.toDate;
        break;
      }
      default:
        fromDate = innerFromDate;
        toDate = innerToDate;
        break;
    }

    return {
      fromDate: fromDate,
      toDate: toDate
    };
  }
  getYearWithFromDate(innerFromDate,year){
		let me = this,
		systemDate = innerFromDate,
		fiscalFromDate = fiscalFromDate,
		fiscalYear = 0;
	  //Trường hợp ngày bắt đầu năm tài chính = 01/01
		if (fiscalFromDate.getMonth() != 0){
			/* Nếu Ngày bắt đầu năm tài chính != 01/01: có thể là 01/04 hoặc 01/07 hoặc 01/10 năm N
				- SystemDate >= FiscallFromDate/SystemDate.getFullYear():
					thì FiscallYear = SystemDate.getFullYear()
				- Nếu không thì FiscallYear = SystemDate.getFullYear() - 1
			*/
			let fiscalFromDateCurrent = new Date(systemDate.getFullYear(), fiscalFromDate.getMonth(), fiscalFromDate.getDate());
				if (systemDate.getTime() >= fiscalFromDateCurrent.getTime()){
					fiscalYear = year;
				}else{
					fiscalYear = year - 1;
				}
		}else{
			//Trường hợp này Ngày bắt đầu năm tài chính luôn = 01/01
			//Trường hợp này FiscalFromDate và FiscalToDate là cùng 1 năm
			fiscalYear = year;
		}
		return fiscalYear;
  }

  /**
   * Tính ra kỳ theo từ ngày và đến ngày
   * @param {Date} fromDate Từ ngày
   * @param {Date} toDate Đến ngày
   * @returns {number} Giá trị của kỳ (theo MSEnum)
   * @author pcminh 24.04.2020
   */
 	caculatePeriodFromRange(fromDate, toDate) {
	  let period = MSEnum.Period.Custom;
	  for (let i = 0; i < Object.keys(MSEnum.Period).length; i++) {
		  const key = Object.keys(MSEnum.Period)[i];
		  let range = this.caculateRangeFromPeriod(MSEnum.Period[key]);
		  if (
				new Date(fromDate).toDateString() ==
					new Date(range.fromDate).toDateString() &&
				new Date(toDate).toDateString() ==
					new Date(range.toDate).toDateString()
			) {
				period = MSEnum.Period[key];
			}
	  }
	  return period;
	}
	/**
	 * TTHuyen Đọc kỳ báo cáo được chọn phục vụ đoch title ngày báo cáo
	 * Với Báo cáo các kỳ báo cáo là tròn tháng, tròn quý tròn năm, nên chỉ lấy source từ FRReportPeriod thay vì Period
	 * Cho tối ưu.
	 * Năm báo cáo theo formDate chứ không theo năm tài chính
	 * @param {*} fromDate : từ ngày
	 * @param {*} toDate : đến ngày
	 */
	caculatePeriodFromRangeReport(fromDate, toDate) {
		let period = MSEnum.FRReportPeriod.Custom;
		//Lấy các kỳ báo cáo

		for (let i = 0; i < Object.keys(MSEnum.FRReportPeriod).length; i++) {
			const key = Object.keys(MSEnum.FRReportPeriod)[i];
			let range = this.caculateRangeFromPeriod(MSEnum.FRReportPeriod[key],fromDate,toDate,fromDate.getFullYear());
			if (
				  new Date(fromDate).getDateOnly().getTime() ==
					  new Date(range.fromDate).getDateOnly().getTime()&&
				  new Date(toDate).getDateOnly().getTime()==
					  new Date(range.toDate).getDateOnly().getTime()
			  ) {
				  period = MSEnum.FRReportPeriod[key];
				  break;
			  }
		}
		return period;
	}

  /**
   * Tính ra số ngày theo từ ngày và đến ngày
   * @param {Date} fromDate Từ ngày
   * @param {Date} toDate Đến ngày
   * @return {Number} trả về số ngày
   * @author nnhung 25.08.2020
   */
	caculateDiffDayOfRange(fromDate, toDate) {
    let ONE_DAY = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    let date1 = fromDate.getTime();
    let date2 = toDate.getTime();

    // Calculate the difference in milliseconds
    let diff = Math.abs(date2 - date1);

    // Convert back to days and return
    return Math.round(diff/ONE_DAY);
	}

  /**
   * Tính ra kỳ trước theo từ ngày và đến ngày
   * @param {Date} fromDate Từ ngày
   * @param {Date} toDate Đến ngày
   * @return {Object} trả về range {fromDate: , toDate: }
   * @author nnhung 25.08.2020
	 * @modified by ndquan 13.01.2020: sử dụng hàm caculatePeriodFromRangeExceptYear. Trường hợp tròn tháng của năm trước nếu dùng hàm cũ sẽ ra period custom
   */
  caculatePreviousRange(fromDate, toDate) {
		let period = this.caculatePeriodFromRangeExceptYear(fromDate, toDate),
				prevPeriod = null,
				prevFromDate,
				prevToDate,
				thisMonth = fromDate.getMonth(),
				thisYear = fromDate.getFullYear();

		switch (period) {
			// Tháng
			case Period.ThisMonth:
			case Period.LastMonth:
			case Period.NextMonth:
			case Period.January:
			case Period.February:
			case Period.March:
			case Period.April:
			case Period.May:
			case Period.June:
			case Period.July:
			case Period.August:
			case Period.September:
			case Period.October:
			case Period.November:
			case Period.December:
			{
				// Tháng 1 thì lấy Tháng 12 năm trước
				if (thisMonth == 0) {
					prevFromDate = new Date(thisYear - 1, 11, 1, 0, 0, 0);
					prevToDate = new Date(fromDate).addDays(-1);
				} else {
					prevFromDate = new Date(thisYear, thisMonth - 1, 1, 0, 0, 0);
					prevToDate = new Date(fromDate).addDays(-1);
				}
        		break;
			}
			// Quý
			case Period.ThisQuarter:
			case Period.LastQuarter:
			case Period.NextQuarter:
			case Period.FiscalI:
			case Period.FiscalII:
			case Period.FiscalIII:
			case Period.FiscalIV:
			{
				let thisQuater = 1;//this.caculQuarterByMonth(thisMonth);
				// Quý 1 thì lấy quý 4 năm trước
				if (thisQuater == 0) {
					prevFromDate = this.fromQuarter(4, thisYear - 1);
					prevToDate = this.toQuarter(4, thisYear - 1);
				} else {
					prevFromDate = this.fromQuarter(thisQuater - 1,thisYear);
					prevToDate = this.toQuarter(thisQuater - 1,thisYear);
				}
				break;
			}
			// Sáu tháng đầu năm
			case Period.SixFirstMonth:
			{
				prevFromDate = new Date(thisYear - 1, 6, 1, 0, 0, 0);
				prevToDate = new Date(fromDate).addDays(-1);
        		break;
			}
			// Sáu tháng cuối năm
			case Period.SixLastMonth:
			{
				prevFromDate = new Date(thisYear, 0, 1, 0, 0, 0);
				prevToDate = new Date(fromDate).addDays(-1);
				break;
			}
			// Năm
			case Period.ThisYear:
			case Period.LastYear:
			case Period.NextYear:
			{
				prevFromDate = new Date(thisYear - 1, 0, 1, 0, 0, 0);
				prevToDate = new Date(fromDate).addDays(-1);
				break;
			}
			default:
				const one_day = 1000 * 60 * 60 * 24;
				prevToDate = new Date(fromDate).addDays(-1);

				let diffDay = this.caculateDiffDayOfRange(fromDate, toDate);
				let prevFromTime = prevToDate.getTime() - diffDay * one_day;
				prevFromDate = new Date(prevFromTime);
        		break;
			}

		return {
			fromDate: prevFromDate,
			toDate: prevToDate
		};
	}

	/**
   * Tính ra kỳ theo từ ngày và đến ngày, không quan tâm năm nào, miễn là từ ngày và đến ngày phải cùng năm.
   * @param {Date} fromDate Từ ngày
   * @param {Date} toDate Đến ngày
   * @returns {number} Giá trị của kỳ (theo MSEnum)
   * @author ndquan 13.01.2020
   */
	caculatePeriodFromRangeExceptYear(fromDate, toDate) {
		if(new Date(fromDate).getFullYear() != new Date(toDate).getFullYear()){
			return this.caculatePeriodFromRange(fromDate, toDate)
		}
	  let period = MSEnum.Period.Custom;
	  for (let i = 0; i < Object.keys(MSEnum.Period).length; i++) {
		  const key = Object.keys(MSEnum.Period)[i];
			let range = this.caculateRangeFromPeriod(MSEnum.Period[key]);
			if(range.fromDate && range.toDate){
				if (
					new Date(fromDate).toISOString().slice(5,10) ==
						new Date(range.fromDate).toISOString().slice(5,10) &&
					new Date(toDate).toISOString().slice(5,10) ==
						new Date(range.toDate).toISOString().slice(5,10)
				) {
					period = MSEnum.Period[key];
				}
			}
	  }
	  return period;
	}

}

export default new DateRange();
