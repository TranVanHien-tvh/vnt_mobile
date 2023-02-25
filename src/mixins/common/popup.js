export const popup = {
  data: function() {
    return {
      //cờ hiển thị popup
      active: false
    };
  },
  methods: {
    /**
     * ẩn popup
     */
    hide() {
      this.active = false;
      this.$emit('close');
    },
    /**
     * hàm được gọi khi hiển thị
     * các form sẽ re-define lại để xử lý nghiệp vụ
     */
    show() {
        this.active = true;
    },
  }
};
