/**
 * Class thực hiện các thao tác liên quan đến JSON
 * Dùng ở đây để sau còn custom
 */

class MSJson {
	/**
	 * Thực hiện serialize object ra string
	 * @param {Object/Array/...} obj
	 */
	serialize(obj) {
		return JSON.stringify(obj);
	}

	deserialize(jsonData) {
		return JSON.parse(jsonData);
	}

	/**
	 * Hàm này dùng để 1 chuỗi thành object (trong đó nếu có chuỗi dạng datetime thì chuyển đổi thành date)
	 * @param {*} jsonData
	 */
	deserializeCustom(jsonData) {
		const dateFormat = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(.)?(\d{0,9})?(Z)?(\+)?(\d{2})?(:)?(\d{2})?$/;

		function reviver(key, value) {
			if (typeof value === 'string' && dateFormat.test(value)) {
				return new Date(value);
			}

			return value;
		}

		return JSON.parse(jsonData, reviver);
	}
}

export default new MSJson();
