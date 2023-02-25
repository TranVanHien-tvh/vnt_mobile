<!-- =========================================================================================
    File Name: MsTabRouter.vue
    Description:
    Component Name: MsTabRouter
    ----------------------------------------------------------------------------------------
    Project Name: AMS
    Author: NNLAM 
    Author URL: http://www.misa.com.vn
========================================================================================== -->
<template>
  <div
    ref="msTabRouter"
    v-bind="$attrs"
    :class="[`ms-tabs-position-${position}`]"
    class="ms-tabs con-ms-tabs"
    @focus.capture="onFocus"
    @blur.capture="onBlur"
  >
    <div class="con-ms-ul-tabs">
      <ul
        ref="ul"
        :class="[`ms-ul-tabs-${alignment}`]"
        class="ul-tabs ms-tabs-ul"
      >
        <li
          v-for="(item, index) in tabs"
          ref="li"
          :key="index"
          :class="{ 'active-item': activeIndex == index }"
          class="ms-tabs-li flex"
          @mouseover="hover = true"
          @mouseout="hover = false"
        >
          <div
            class="ms-tabs-btn"
            type="button"
            @click="activeItem(index)"
          >
            <label class="tab-label">{{ item.title }} <span
              v-if="item.beta==true"
              class="beta"
            >beta</span> </label>
          </div>
        </li>
      </ul>
      <div class="gray-line" />
      <template v-if="position !== 'left' && position !== 'inner'">
        <span class="line-ms-tabs line-bottom" />
      </template>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import MsBaseComponent from '../ms-base-component/MsBaseComponent';
export default {
	name: 'MsTabRouter',
	extends: MsBaseComponent,
	props: {
		/**
		 * Đồng bộ tab với router URL - Không thay đổi tab khi reload page
		 * @type {Boolean}
		 */
		asyncRouter: {
			default: true,
			type: Boolean
		},

		/**
		 * Danh sách các Tab con
		 * @example {title: this.$t('I18NCA.ReceiptPayment'),
		 * 					path: '/CA/CAReceipt/CAReceiptPaymentList'}
		 */
		tabs: {
			default: [
				{
					title: '',
					path: ''
				}
			],
			type: Array,
			require: true
		},

		/**
		 * Vị trí tab đầu tiên được active
		 * @type {Number, String}
		 */
		startIndex: {
			default: 0,
			type: [Number, String]
		},

		/**
		 * Vị trí căn lề tab list
		 * @type {String}
		 */
		alignment: {
			default: 'left',
			type: String
		},
		/**
		 * Vị trí đặt tab title tab
		 * @description `top`: ở trên, `bottom` ở dưới, `inner` ở trong 1 tab router khác
		 * @type {String}
		 */
		position: {
			default: 'top',
			type: String
		},
	},

	data() {
		let me = this;
		return {
			activeIndex: me.startIndex,
			hover: false,
			isFocused: false,//mstab đang được focus
		};
	},

	mounted() {
		let index = -1;
		if (!this.asyncRouter) {
			index = this.parseIndex(this.startIndex);
		} else {
			var currentPath = this.$route.fullPath;
			index = this.getIndexItem(currentPath);
		}

		if (typeof index === 'number') {
			this.activeItem(index);
		} else {
			//nếu không matching dc sẽ kiểm tra matchPath
			this.activeIndex = this.getTabIndexByMatch();
		}
		this.addHandler();
	},

	methods: {
		/**
		 * Lắng nghe các sự kiện 
		 * @author NVLAM 07.12.2020
		 */
		addHandler() {
			let me = this;
			document.addEventListener('keydown', me.onKeydown);
				
		},
		/**
		 * Xóa các hàm lắng nghe sự kiện
		 * @author NVLAM 07.12.2020
		 */
		removeHandler() {
			let me = this;
			document.removeEventListener('keydown', me.onKeydown);
			
		},
		onKeydown(e) {
			const me = this;
			
			switch (e.which) {
				//Di chuyển đến tab tiếp
				case 192:
					if (e.ctrlKey) {
						e.preventDefault();
						e.stopPropagation();
						e.cancel = true;
						me.activeNext();
					}
					break;					
			}
		},
		onFocus() {
			this.isFocused = true;
		},
		onBlur() {
			this.isFocused = false;
		},
		getTabIndexByMatch() {
			var routers =this.$route.matched;
			for(let i = 0 ; i < this.tabs.length; i++) {
				let tab = this.tabs[i];
				if (Array.isArray(tab.matchPath)) {
					for(let j = 0; j<tab.matchPath.length; j++) {
						for (let k =0; k < routers.length; k++) {
							if(routers[k].path === tab.matchPath[j]
							|| routers[k].regex.test(tab.matchPath[j])) {
								return i;
							}
						}
					}
				} 
			}

			return -1;
		},

		// Lấy index của item theo path URL hiện tại
		getIndexItem(currentPath) {
			let upper = currentPath.toUpperCase();
			for (var i = 0; i < this.tabs.length; i++) {
				if (
					this.tabs[i].path.toUpperCase().indexOf(upper) > -1
				) {
					return i;
				}
			}
		},

		// Check startIndex
		parseIndex(index) {
			let activeIndex = this.activeIndex;
			if (index < 0) {
				activeIndex = 0;
			} else if (index >= this.$children.length) {
				activeIndex = this.$children.length - 1;
			} else if (typeof this.$children[index].$attrs.disabled === 'undefined') {
				activeIndex = parseInt(index);
			}
			return activeIndex;
		},

		// Thêm class vào một El
		makeActiveClass(elem, className) {
			elem.classList.add(className);
		},

		async activeItem(index) {
			// Thay đổi vị trí của tab đc active
			this.activeIndex = index;

			// Gửi sự kiện lên thằng cha gọi đến MsTabs
			if (this.tabs[index].path !== '') {
				let tab = { tabIndex: this.activeIndex };
				this.$emit('tabActived', tab);

				if (this.$route.path.toLowerCase() !== this.tabs[index].path.toLowerCase()) {
					this.redirectTo(this.tabs[index].path);
				}
			} else {
				let tab = { tabIndex: this.activeIndex };
				this.$emit('tabActived', tab);
			}
		},
		/**
		 * Xử lý phím tắt
		 */
		shortkeyAction(e) {
			const shortkey = e.target.getAttribute('shortkey');
			if (shortkey && shortkey.split('|').indexOf(e.srcKey) > -1) {
				switch (e.srcKey) {
					case 'Next':
						this.activeNext();
						break;
				}
			}
		},

		/**
		 * Active tab tiếp theo
		 */
		activeNext() {
			if (this.tabs.length === this.activeIndex + 1) {
				this.activeItem(0);
			} else {
				this.activeItem(this.activeIndex + 1);
			}
		},

		// Thêm tab mới vào vị trí bất kì hoặc vào cuối danh sách
		addTab(index = null, title) {
			if (index !== null && title !== '') {
				this.tabs.splice(index, 0, title);
			} else if (title !== '') {
				this.tabs.push(title);
			}
		},

		// Xóa một tab trong danh sách tab theo vị trí
		removeTab(index) {
			if (index !== null) {
				this.tabs.splice(index, 1);
			}
		},

		// Chuyển trang
		redirectTo(url) {
			this.$router.push(url);
		},

		beforeEnter: (to, from, next) => {
			this.activeItem(this.getIndexItem(to.path));
		}
	},

	beforeUpdate() {
		let me = this,
			fullPath = me.$route.fullPath,
			index = me.getIndexItem(fullPath);

		if (typeof index === 'number') {
			me.activeItem(index);
		}
		else {
			//nếu không matching dc sẽ kiểm tra matchPath
			this.activeIndex = this.getTabIndexByMatch();
		}
	},
	destroyed() {
		let me = this;
		me.removeHandler();
	}
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/components/msTabRouter.scss';
</style>
