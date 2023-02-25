import commonFn from "@/commons/commonFunction";
/**
 * Mixin xử lý validate text
 */
export const validateText = {
  methods: {
    /**
     * @override
     */
    validateRule(rule, value, editor) {
      const me = this;
      let res = true;
      switch (rule) {
        case "taxCode":
          res = me.validateTaxCode(value);
          break;
        case "phoneEmail":
          res = me.validatePhoneEmail(value);
          break;
        case "phone_agreement":
          res = me.validatePhone(value);  
          break;
        case "email":
          res = me.validateEmail(value);
          break;
        case "password":
          res = me.validatePassword(value);
          break;
        case "full_name":
          res = me.validateFullName(value);
          break;
        default:
          res = me.super("validateRule", rule, value, editor);
          break;
      }

      return res;
    },
    //Validate mã số thuế
    validateTaxCode(value) {
      try {
        let oRegex = /^[0-9]{10}$|^[0-9]{13}$|^[0-9]{10}(\s|-)[0-9]{3}$/;
        if (oRegex.test(value)) {
          let arrcode = [],
            lengthCode = value.length;
          for (let i = 0; i < lengthCode; i++) {
            arrcode.push(value[i]);
          }

          let intTemp =
            31 * parseFloat(arrcode[0]) +
            29 * parseFloat(arrcode[1]) +
            23 * parseFloat(arrcode[2]) +
            19 * parseFloat(arrcode[3]) +
            17 * parseFloat(arrcode[4]) +
            13 * parseFloat(arrcode[5]) +
            7 * parseFloat(arrcode[6]) +
            5 * parseFloat(arrcode[7]) +
            3 * parseFloat(arrcode[8]);

          if (!(parseFloat(arrcode[9]) === 10 - (intTemp % 11))) {
            return false;
          }
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
      return true;
    },
    validatePhoneEmail(value) {
      try {
        return this.validatePhone(value) || this.validateEmail(value);
      } catch (e) {
        return false;
      }
    },
    validatePhone(value) {
      if (value !== null) {
        try {
          let oRegex = /^(0|\+84)(\s|\.)?((2[0-9][0-9])|(3[2-9])|(5[689])|(7[06-9])|(8[1-9])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
          let result = value;
          if (!oRegex.test(result.trim())) {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
      return true;
    },
    validateEmail(value) {
      try {
        let oRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let result = value;
        if (result && !oRegex.test(result.trim())) {
          return false;
        }
      } catch (e) {
        return false;
      }
      return true;
    },
    validatePassword(value) {
      const me = this;
      let lengthPass = false;
      if (value && value.length >= 8) {
        lengthPass = true;
      }
      let textPass = false;
      let upcasePass = false;
      let lowercasePass = false;
      if (value && /[^A-Z]/g.test(value)) {
        upcasePass = true;
      }
      if (value && /[^a-z]/g.test(value)) {
        lowercasePass = true;
      }
      if (upcasePass && lowercasePass) {
        textPass = true;
      }
      let numberPass = false;
      if (value && /[^0-9]/g.test(value)) {
        numberPass = true;
      }
      me.$set(me.errorProvider, "lengthPass", lengthPass);
      me.$set(me.errorProvider, "textPass", textPass);
      me.$set(me.errorProvider, "numberPass", numberPass);
      return lengthPass && textPass && numberPass;
    },
    validateFullName(value) {
      try {
        var isValid = true,
        value = value.trim();
				// ko có ký tự trắng trong tên đã trim
				if (value.indexOf(' ') == -1) {
					isValid = false;
				}
				// tên toàn các ký tự trùng nhau
				else if (value.length == value.split(' ').length + value.split(value[0]).length - 2) {
					isValid = false;
				}
				// danh sách ký tự đặc biệt
				else {
					var i,
						specialLetter = "~,`,!,@,#,$,%,^,&,*,(,),_,+,-,=,{,[,},],:,;,',|,/,\,<,>,.,?,0,1,2,3,4,5,6,7,8,9",
						arrSpecialLetter = specialLetter.split(',');
					arrSpecialLetter.push('"');
					arrSpecialLetter.push(',');
					arrSpecialLetter.push('\\');
					for (i = 0; i < arrSpecialLetter.length; i++) {
						if (value.indexOf(arrSpecialLetter[i]) > 0) {
							isValid = false;
							break;
						}
					}
				}
				return isValid;
      }
      catch (e) {
        return false;
      }
    },
  }
};
