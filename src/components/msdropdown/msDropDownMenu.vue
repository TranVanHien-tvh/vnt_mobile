<template lang="html">
  <div
    class="ms-component"
    @keydown="onKeydown"
  >
    <div
      v-if="modal && dropdownVisible"
      class="modal-background"
    />
    <transition name="dropdownx">
      <div
        v-if="dropdownVisible"
        ref="options"
        :class="{'rightx':rightx,'notHeight':notHeight,'padding-top':$parent.type=='feature'}"
        :style="{
          'left':leftx+'px',
          'top':topx+'px'
        }"
        class="con-ms-dropdown--menu ms-dropdown-menu"
        @mouseleave="mouseleavex"
        @mouseenter="mouseenterx"
      >
        <!-- @mouseout="toggleMenu($event)" -->
        <!-- @mouseover="toggleMenu($event)" -->
        <ul
          v-if="!msCustomContent"
          class="ms-component ms-dropdown--menu"
        >
          <slot />
        </ul>
        <div
          v-else
          class="ms-dropdown--custom ms-dropdown--menu"
        >
          <slot />
        </div>
        <div
          v-if="$parent.type=='footer'"
          ref="menuAfter"
          class="ms-dropdown--menu--after"
        />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
	name: 'MsDropdownMenu',
	props: {
		/**
		 * Dropdown có nền đen ở dưới
		 */
		modal: {
			default: false,
			type: Boolean
		},
	},
	data: () => ({
		_dropdownVisible: false,
		get dropdownVisible() {
			return this._dropdownVisible;
		},
		set dropdownVisible(value) {
			this._dropdownVisible = value;
		},
		leftAfter: 20,
		leftx: 0,
		topx: 0,
		rightx: true,
		msTriggerClick: false,
		widthx: 0,
		notHeight: false,
		msCustomContent: false,
		parentNode: null
	}),
	watch: {
		dropdownVisible() {
			let dropdownGroup = this.$children.filter(item => {
				return item.hasOwnProperty('activeGroup');
			});
			dropdownGroup.forEach(item_group => {
				item_group.activeGroup = false;
			});
			this.setDirection();
		}
	},
	mounted() {
		this.insertBody();
		window.addEventListener('scroll', this.removeItem());
	},
	beforeDestroy() {
		this.$el.parentNode.removeChild(this.$el);
		window.removeEventListener('scroll', this.removeItem());
	},
	methods: {
		onKeydown(e) {
		},
		/**
		 * TThuyen chinh sua
		 */

		removeItem() {
			// this.dropdownVisible = false;
		},
		mouseenterx() {
			if (!this.msTriggerClick) {
				this.dropdownVisible = true;
				this.widthx = this.$el.clientWidth;
			}
		},
		mouseleavex() {
			if (!this.msTriggerClick) {
				this.dropdownVisible = false;
				this.widthx = this.$el.clientWidth;
			}
		},
		setDirection() {
			setTimeout(() => {
				const dropdown = this.parentNode;
				const menuAfter = this.$refs.menuAfter;
				if (!menuAfter) return;
				if (
					dropdown &&
					menuAfter &&
					dropdown.getBoundingClientRect().top + 300 >= window.innerHeight
				) {
					const hasGroup = this.$children.find(it =>
						it.hasOwnProperty('activeGroup')
					);
					menuAfter.style.bottom = '-5px';
					menuAfter.style.transform = 'rotate(225deg)';
					return;
				}
				menuAfter.style.top = '10px';
			}, 100);
		},
		toggleMenu(event) {
			if (event.type == 'mouseover' && !this.msTriggerClick) {
				this.dropdownVisible = true;
			} else if (!this.msTriggerClick) {
				this.dropdownVisible = false;
			}
			this.widthx = this.$el.clientWidth;
		},
		insertBody() {
			let elp = this.$el;
			this.parentNode = this.$el.parentNode;
			document.body.insertBefore(elp, document.body.firstChild);
		},

		/**
		 * Sự kiện emit ra một sự kiện
		 *
		 * Created by: pvduong1 19/09/2019
		 */
		sendEmit(data) {
			this.$emit('itemSelected', data);
		}
	}
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/components/msDropdown.scss";
.padding-top {
	padding-top: 0px;
}
</style>
