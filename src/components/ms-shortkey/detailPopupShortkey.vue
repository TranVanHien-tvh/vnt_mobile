<template>
  <!-- <span 
			class="detail-popup-shortkey"
      @shortkey="shortkeyAction"
      v-shortkey="{
        //Close: ['esc'], //Đóng
        Save: ['ctrl', 's'],  //Cất
        SaveAndAdd: ['ctrl', 'shift', 's'],  //Cất và thêm
        Help: ['f1'],  //Giúp
      }"
      ></span> -->
</template>

<script>
export default {
	name: 'DetailPopupShortkey',
	props: {
	},
	data: function() {
		return {
		};
	},
	computed: {
	},
	watch: {
	},
	mounted() {
	},
	methods: {
		shortkeyAction(event) {
			this.$emit('shortkeyAction', event);
		}
	}
};
</script>