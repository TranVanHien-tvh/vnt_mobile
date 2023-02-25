<template>
  <div
    :class="['ms-collapse-item', {'open-item': maxHeight != '0px', 'disabledx': disabled}, collapseType + '-collapse' ]"
    :tabIndex="0"
  >
    <a
      class="ms-collapse-item--header"
      href="javascript:void(0)"
      @click="toggleContent"
      v-on="$listeners"
      @keydown.space.prevent="toggleContent"
    >
      <span
        v-if="!notArrow"
        :class="['icon-header',collapseType=='secondary'?'ms-collapse-secondary-item--icon-header':'ms-collapse-item--icon-header', collapseType + '-collapse--icon']"
      >
        <div
          :class="[iconArrow,'icon24','mi-16']"
          :icon-pack="iconPack"
          :icon="iconArrow"
        />
      </span>
      <!-- <div :class=[{"maxHeight !== '0px'? 'title-green':''"}]> -->
      <!-- bỏ title-green theo như yêu cầu cửa sd kqquan -->
      <div :class="['ms-collapse-item--label',titleStyleCustom ]">
        <slot
          name="header"
          :isCollapse="isCollapsed"
        />
      </div>
    </a>
    <div
      :style="{'maxHeight': maxHeight, 'opacity': opacity}"
      class="ms-collapse-item--content"
    >
      <div
        ref="content"
        class="con-content--item"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
<script>
export default {
	name: 'MsCollapseItem',
	props: {
		// Primary key của item này, dùng để phân biệt với các item khác
		itemID: {
			type: [String,Number]
		},
		open: {
			default: false,
			type: Boolean
		},
		disabled: {
			default: false,
			type: Boolean
		},
		notArrow: {
			default: false,
			type: Boolean
		},
		iconArrow: {
			default: 'mi-arrow-right--black',
			type: String
		},
		iconPack: {
			default: 'feather',
			type: String
		},
		name: {
			default: '',
			type: String
		},

		/**
		 * Loại collapse hiển thị
		 * primary - icon bên trái và header không nền
		 * secondary - icon bên phải và header có nền
		 */
		collapseType: {
			type: String,
			default: 'primary'
		},

		/**
		 * Class custom cho title của header
		 */
		titleStyleCustom: {
			type: String,
			default: ''
		}
	},
	data: () => {
		return {
			// maxHeight của Content, tạm thời phải dùng maxHeight để xử lý được animation slide up/down
			maxHeight: '0px',
			isCollapsed: true,
			opacity: 'unset'
		};
	},
	computed: {
		/**
		 * Đóng tất cả các MsCollapseItem khác
		 */
		accordion() {
			return this.$parent.accordion;
		},
	},
	mounted() {
		const me = this;

		if(me.open) {
			me.expandContent();
		}
	},
	methods: {
		/**
		 * Toggle content
		 * @author BVHAU 06.05.2020
		 */
		toggleContent(e) {
			//nếu element trong header có bắt click và chỉ định dừng event thì sẽ không xử lý
			if (e.cancel) {
				return;
			}

			const me = this;

			// Đóng tất cả các MsCollapseItem khác nếu có cấu hình accordion = true
			if (me.accordion) {
				me.$parent.closeAllItems(me.$el);
			}

			if(me.isCollapsed) {
				me.expandContent();
				// Gọi sự kiện bên trong ms-collapse
				me.$parent.itemIsActive({ name: me.name });
			}
			else {
				me.collapseContent();
			}

			// Emit ra ngoài để component cha có thể hứng được event đóng/mở
			me.$emit('onToggleContent', me.isCollapsed);
		},
		/**
		 * Đóng content
		 * @author BVHAU 06.05.2020
		 */
		collapseContent() {
			const me = this;
			if(!me.isCollapsed) {
				me.isCollapsed = true;

				// Phải chuyển từ none sang fixed maxHeight để có thể chạy được animation
				let scrollHeight = me.$refs.content.scrollHeight;
				me.maxHeight = `${parseFloat(scrollHeight)}px`;
				// Cho maxHeight về 0 để đóng box
				setTimeout(() => {
					me.maxHeight = `0px`;
					me.opacity = 0;
				}, 1);
			}
		},
		/**
		 * Mở content
		 * @author BVHAU 06.05.2020
		 */
		expandContent() {
			const me = this;
			if(me.isCollapsed) {
				me.isCollapsed = false;

				// Phải fixed maxHeight để có thể chạy được animation
				let scrollHeight = me.$refs.content.scrollHeight;
				me.maxHeight = `${parseFloat(scrollHeight)}px`;

				// Sau khi chạy xong animation thì đổi maxHeight sang none để nó tự động co kéo nếu content bên trong thay đổi
				setTimeout(() => {
					me.maxHeight = `none`;
					me.opacity = 'unset';
				}, 201);
			}
		}
	}
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/components/msCollapse.scss';
</style>
