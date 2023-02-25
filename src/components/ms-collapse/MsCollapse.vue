<template>
  <div
    :class="[type]"
    class="ms-collapse"
  >
    <slot />
  </div>
</template>
<script>
export default {
	name: 'MsCollapse',
	props: {
		accordion: {
			default: false,
			type: Boolean
		},
		type: {
			default: 'default',
			type: String
		}
	},
	methods: {
		// Gửi sự kiện ra bên ngoài ms-collapse
		itemIsActive(item) {
			this.$emit('isOpen', item);
		},
		// Đóng tất cả các Item con ngoại trừ thằng vừa kích hoạt mở
		closeAllItems(el) {
			let children = this.$children;
			children.map(item => {
				if (item.$el !== el) {
					item.collapseContent();
				}
			});
		}
	}
};
</script>


<style lang="scss" scoped>
@import '@/assets/scss/components/msCollapse.scss';
</style>
