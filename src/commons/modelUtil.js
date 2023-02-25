import commonFn from './commonFunction.js';
import Utility from '@/commons/utility';
import Vue from 'vue';

/**
 * Class thực hiện các action xử lý cho Model phía client
 * @author DNThang - 19.8.2019
 */
export default class ModelUtil {
	//#region Property

	static customField = 'custom_field';

	//#endregion Property

	/**
	 * Thực hiện khởi tạo Model từ object
	 * @param {Object[]} records object hoặc array object cần convert sang Model
	 * @param {Model} model kiểu model cần tạo của object
	 * @param {Boolean} isTemp Có phải là temp model không
	 * Nếu truyền vào Object thì sẽ return Object, nếu truyền vào Array thì sẽ return Array
	 */
	static createModel(records, model, isTemp, isPhantom) {
		let me = this,
			ret;

		if (!model) {
			return records;
		}

		records = records ? records : {};

		let convertToModel = function(record, model, isTemp) {
			if (!record) {
				return record;
			}

			if (record.isModel) {
				if (isTemp) {
					record.setTempModel(isTemp);
				}

				if (typeof isPhantom != 'undefined' && isPhantom != null) {
					record.setPhantom(isPhantom);
				}

				return record;
			} else {
				let entity = new model(record);

				if (entity.isModel) {
					if (isTemp) {
						entity.setTempModel(isTemp);
					}

					if (typeof isPhantom != 'undefined' && isPhantom != null) {
						entity.setPhantom(isPhantom);
					}
				}

				// ret.add(entity);
				return entity;
			}
		};

		if (records instanceof Array) {
			let i = 0;
			ret = [];

			for (i = 0; i < records.length; i++) {
				let entity = convertToModel(records[i], model, isTemp);
				ret.add(entity);
			}
		} else if (records instanceof Object) {
			ret = convertToModel(records, model, isTemp);
		} else {
			commonFn.infoLogging('DEV: Record to convert require object.');
			return;
		}

		return ret;
	}

	/**
	 * Lấy ra danh sách các trường CustomField mặc định mà hệ thống đáp ứng cho chứng từ
	 * Hiện tại hỗ trợ tối đa là 10 customField
	 * CreatedBy DNThang - 01.10.2019
	 */
	static getListCustomFieldDefault(maxField = null) {
		let me = this,
			result = [],
			i;

		maxField = maxField ? maxField : 10;

		for (i = 0; i < maxField; i++) {
			result.add({
				name: me.customField + (i + 1).toString(),
				type: 'any'
			});
		}

		return result;
	}

	/**
	 * Convert từ dữ liệu string sang kiểu DateTime
	 */
	static convertStringToDate(dateString) {
		return Utility.convertStringToDate(dateString);
	}

	/**
	 *
	 * @param {Object} obj Đối tượng cần bổ sung reactive
	 * @param {String} key Field cần reactive
	 * @param {any} val Giá trị gán vào
	 */
	static defineVueReactive(obj, key, val) {
		let v = Vue;
		if (obj && key && v && v.util && v.util.defineReactive) {
			let ob = obj.__ob__;
			if (!ob) {
				return;
			}

			v.util.defineReactive(obj, key, val);
			// ob.dep.notify();
		}
	}

	/**
	 * Xử lý xóa reactive của một property trên Object
	 * @param {Object} obj Đối tượng cần xóa field reactive
	 * @param {String} key Field name cần xóa reactive
	 */
	static deleteVueReactive(obj, key) {
		let v = Vue;
		if (obj && key && v && v.delete) {
			let ob = obj.__ob__;
			if (!ob) {
				return;
			}
			v.delete(obj, key);
		}
	}

	static addNoneReactiveProperty(scope, fieldName, value) {
		if (scope && fieldName) {
			Object.defineProperty(scope, fieldName, {
				enumerable: false,
				configurable: false,
				writable: true,
				value: value
			});
		}
	}
}
