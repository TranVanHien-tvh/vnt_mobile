import Vue from 'vue';
import commonFn from '@/commons/commonFunction';
import messageBox from '@/commons/messageBox';
import MSJson from '@/commons/json';
import { MSEnum } from '@/commons/enumeration';
import VueToast from 'vue-toast-notification';
import indexedDB from '@/commons/indexedDB';

function looseClone(obj) {
	return MSJson.deserialize(MSJson.serialize(obj));
}

const install = Vue => {
	Vue.prototype.$ms = Vue.prototype.$ms ? Vue.prototype.$ms : {};
	Vue.prototype.$ms.commonFn = commonFn;
	Vue.prototype.$ms.msgBox = messageBox;
	Vue.prototype.$ms.msJson = MSJson;
	//MSEnum;
	Vue.prototype.$ms.enum = looseClone(MSEnum);
	Vue.prototype.$ms.indexedDB = indexedDB;

	Vue.use(VueToast, {
		// One of the options
		position: 'top',
		duration: 3000
	});

	//DNThang - 13.04.2020: Thực hiện nhúng vào toàn bộ các element hàm lấy ra VueInstance tránh dùng __Vue__ không chuẩn tắc
	Vue.mixin({
		mounted() {
			const me = this;
			if (me.$el && !me.$el.getVueInstance) {
				me.$el.getVueInstance = function() {
					return me;
				};
			}
		}
	});
};

install(Vue);

export default install;
