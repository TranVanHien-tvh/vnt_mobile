<template lang="html">
  <div />
</template>

<script>
/**
 * @description Control thực hiện một số hàm force chung cho MISA Component
 * @author DNThang - 11.07.2019
 */
export default {
	name: 'MsBaseComponent',
	inheritAttrs: false,
	props: {

		/**
		 * Thuộc tính dùng để định danh control (thay cho ID)
		 */
		itemId: {
			type: String,
			default: ''
		},

		/**
		 * thuộc tính readOnly cho các form sử dụng có thể khai báo trực tiếp
		 */
		readOnly: {
			type: Boolean,
			default: false
		},

		/**
		 * Thuộc tính disable control (bổ sung lên đây để dùng chung cho toàn bộ các component)
		 */
		disabled: {
			type: Boolean,
			default: false
		},
		/**
		 * Là editor trên grid
		 */
		isGridEditor: {
			type: Boolean,
			default: false
		}
	},
	data() {
		// let readOnly = this.readOnly;
		return {
			/**
			 * Trạng thái readOnly thực tế của component
			 * (sử dụng để binding và thay đổi theo nghiệp vụ do vue không cho phép thay đổi props)
			 */
			readOnlyState: this.readOnly,

			/**
			 * Trạng thái disable thực tế của component
			 * (sử dụng để binding và thay đổi theo nghiệp vụ do vue không cho phép thay đổi props)
			 */
			disabledState: this.disabled,

			/**
			 * Xử lý khi click chuột vào input của control sẽ select all text
			 */
			selectOnClick: false,
		};
	},
	computed: {
		isReadOnly: function() {
			return this.readOnly || this.readOnlyState;
		},
		isDisabled: function() {
			return this.disabled || this.disabledState;
		},
		/**
		 * Gán tabindex = -1 để không focus khi đang readonly hoặc disabled control
		 */
		tabIndex() {
			return this.isReadOnly || this.isDisabled ? -1 : null;
		},
	},
	watch: {
		readOnly: function() {
			this.readOnlyState = this.readOnly;
		},
		disabled: function() {
			this.disabledState = this.disabled;
		}
	},
	methods: {
		//#region readOnly
		/**
		 * Cập nhật trạng thái ReadOnly của component
		 */
		setReadOnly: function(readOnly) {
			let me = this;
			me.readOnlyState = readOnly;
			me.setReadOnlyCustom(readOnly);
		},

		/**
		 * Hàm cho phép các control derive có thể overrides
		 */
		setReadOnlyCustom: function(readOnly) {},

		/**
		 * Lấy ra trạng thái readOnly hiện tại của component
		 */
		getReadOnly: function() {
			return this.isReadOnly;
		},

		//#endregion readOnly

		//#region disabled
		/**
		 * Cập nhật trạng thái disabled của component
		 */
		setDisabled: function(disabled) {
			let me = this;
			me.disabledState = disabled;
			me.setDisabledCustom(disabled);
		},

		/**
		 * Hàm cho phép các control derive có thể overrides
		 */
		setDisabledCustom: function(disabled) {},

		/**
		 * Lấy ra trạng thái readOnly hiện tại của component
		 */
		getDisabled: function() {
			return this.isDisabled;
		},

		/**
		 * Append thêm rule vào rules validate
		 * @param {String} rules danh sách các rule đang có
		 * @param {String} rule rule cần append
		 */
		appendRuleValidation: function(rule, rules) {
			let me = this;
			if (rules.isNullOrWhiteSpace()) {
				return rule;
			} else {
				if (!me.$ms.commonFn.checkExitRule(rule, rules)) {
					return rules + '|' + rule;
				}
			}
		},

		/**
		 * Set giá trị vào control (control nào có đặc thù hoặc xử lý phức tạp thì overrides)
		 */
		setValue(value){
			let me = this;

			me.innerValue = value;

			me.value = value;
		},
		/**
		 * Lấy giá trị của control
		 */
		getValue() {
			return this.innerValue;
		},
		//#endregion disabled

		/**
		 * Select all text khi click
		 */
		selectAllTextWhenClick(input) {
			var now = new Date().getTime(),
				clickTime = this.clickTime,
				focusTime = this.focusTime;

			if (!clickTime || now - clickTime > 300) {
				if (now - focusTime < 150) {
					if(input){
						input.select();

					}
				}
			}

			this.clickTime = now;
		},
		/**
		 * xử lý khi focus vào control
		 */
		trackFocus() {
			this.focusTime = new Date().getTime();
		}
	},

	
};
</script>

<style>
</style>
