<template>
  <div
    class="ms-input"
    @mouseover="onMouseover"
    @mouseout="onMouseout"
  >
    <ms-tooltip :tooltip="tooltip">
      <div
        v-if="title"
        class="flex"
      >
        <div
          v-if="title"
          class="ms-input-title"
        >
          {{ title }}
        </div>
        <div
          v-if="required && requiredVisible"
          style="color:red"
        >
          &nbsp{{ textRequired }}
        </div>
      </div>
    </ms-tooltip>
    <div ref="parentElement">
      <!-- ms-input -->
      <div
        ref="coninput"
        :class="['style-label',
                 {
                   'isFocus':isFocus,
                 }]"
        class="ms-component ms-con-input-label ms-input"
      >
        <ValidationProvider
          ref="provider"
          v-slot="{ valid, errors }"
          :vid="vid"
          :rules="validateRules"
          :name="title"
        >
          <div
            class="ms-con-input"
            :class="typeInput === 'secondary'? 'ms-input-flat':''"
          >
            <!-- <ValidationProvider :name="$attrs.label" :rules="rules" > -->
            <input
              v-imask="mask"
              v-model="innerValue"
              :disabled="isDisabled"
              v-bind="$attrs"
              :class="[{
                'ms-input-focus':isFocus,
                'ms-input-hoverx':hoverx,
                'hasValue':innerValue !== '',

                'placehoder':true,
                'ms-input-disabled':isReadOnly,
                'ms-input-normal':!isReadOnly&&!isDisabled,
                'ms-input-validate-error': valid===false
              },
              ]"
              :placeholder="placeholder"
              :readonly="isReadOnly"
              :title="errors[0]"
              :type="$attrs.type?$attrs.type:'text'"
              class="ms-inputx ms-input--input"
              @complete="onComplete"
              @accept="onAccept"
              @blur="onBlur($event,valid,errors)"
              v-on="listeners"
            >
          </div>
        </ValidationProvider>
      </div>
    </div>
  </div>
</template>

<script>
import _color from '../utils/color.js';
import stylelineColor from '../utils/styleline.js';
import MsBaseComponent from '../ms-base-component/MsBaseComponent';
import { ValidationProvider } from 'vee-validate';
import IMask from 'imask';
import { IMaskDirective } from 'vue-imask';
export default {
	name: 'MsTime',
	directives: {
		imask: IMaskDirective
	},
	components: {
		ValidationProvider
	},
	extends: MsBaseComponent,
	inheritAttrs: false,
	props: {
		oldValue: {
			type: String
		},
		value: {
			type: [String, Number]
		},
		placeholder: {
			default: null,
			type: [String, Number]
		},

		title: {
			type: String
		},
		tooltip: {
			type: String
		},
		required: {
			type: Boolean,
			default: false
		},
		textRequired: {
			type: String,
			default: '*',
			required: false
		},
		/**
		 * Có hiển thị ký tự required ra không
		 */
		requiredVisible: {
			type: Boolean,
			default: false
		},
		warningText: {
			type: String,
			default: 'Textbox này không được để trống'
		},

		/**
		 * Các rule phục vụ cho validate control
		 */
		rules: {
			type: [Object, String],
			default: ''
		},
		/**
		 * id của validator provider
		 */
		vid: {
			type: String
		},

		// /**
		//  * remember state of validate provider
		//  */
		// vPersist: {

		// }
		//add by dxtruong
		typeInput: {
			default: null,
			type: String
		}
	},
	inject: {
		elForm: {
			default: ''
		},
		elFormItem: {
			default: ''
		}
	},
	data: function() {
		return {
			mask: {
				mask: 'H{:}M{:}S',
				lazy: false,
				blocks: {
					H: {
						mask: IMask.MaskedRange,
						from: 0,
						to: 23,
						maxLength: 2
					},
					M: {
						mask: IMask.MaskedRange,
						from: 0,
						to: 59,
						maxLength: 2
					},
					S: {
						mask: IMask.MaskedRange,
						from: 0,
						to: 59,
						maxLength: 2
					}
				},

				overwrite: true,
				autofix: false
			},
			innerValue: this.value,
			isFocus: false,
			isWarning: false,
			hasWarning: false,
			screenX: '',
			screenY: '',
			heightEl: '',
			width: '',
			screenParentX: '',
			screenParentY: '',
			styleTamGiac: { left: '10px' },
			hoverx: false
		};
	},
	computed: {
		isAfter() {
			return this.isWarning ? true : this.iconAfter;
		},
		isNoBorder() {
			return this.isWarning ? true : this.iconNoBorder;
		},
		styleWarning() {
			//tinh vi tri tooltip
			let height =
				window.innerHeight ||
				document.documentElement.clientHeight ||
				document.body.clientHeight;
			let width =
				window.innerWidth ||
				document.documentElement.clientWidth ||
				document.body.clientWidth;
			let top = '-20px';
			if (this.screenY > height - this.heightEl) {
				top = 20 + 'px';
			} else {
				top = -20 + 'px';
			}
		},

		listeners() {
			return {
				...this.$listeners,
				input: evt => {
					// if (this.readOnlyState) {
					// 	evt.preventDefault();
					// 	return;
					// }
					// this.$emit('input', evt.target.value);
				},
				focus: evt => {
					this.hoverx = false;
					this.hasWarning = false;
					this.isWarning = false;
					this.$emit('focus', evt);
					this.changeFocus(true);
				},

				mouseover: evt => {
					this.hoverx = true;
				},
				mouseout: evt => {
					this.hoverx = false;
				}
			};
		},

		isValue() {
			return this.labelPlaceholder ? true : !this.innerValue;
		},
		getIcon() {
			return this.danger
				? this.valIconDanger
				: this.warning
				? this.valIconWarning
				: this.success
				? this.valIconSuccess
				: '';
		},
		/**
		 * Buid động validation rules theo config của control
		 */
		validateRules() {
			let me = this,
				rules = me.rules;

			if (!rules) {
				rules = '';
			}

			if (me.required) {
				rules = me.appendRuleValidation('required', rules);
			}
			return rules;
		}
	},
	watch: {
		innerValue(val, old) {
			if (this.readOnlyState) {
				// evt.preventDefault();
				return;
			}
			// if(this.maxLength){
			//   if(val.length>parseInt(this.maxLength)){
			//     this.innerValue=old;
			//       this.$emit('input', old);
			//       return;
			//   }
			// }
			// this.$emit('input', val);
			// this.$emit('changeValue', val, old);
		},
		value(val) {
			this.innerValue = val;
		}
	},

	mounted() {
		this.heightEl = this.$el.offsetHeight;
		this.width = this.$el.offsetWidth;
		this.screenParentX = this.$refs.parentElement.getBoundingClientRect().left;
		this.screenParentY = this.$refs.parentElement.getBoundingClientRect().top;
	},

	methods: {
		onComplete(e) {
			this.innerValue = e.detail.unmaskedValue;
			e.detail.updateValue();
			this.$emit('input', this.innerValue);
		},
		onAccept() {},
		// animation
		onBlur: function(evt, valid, err) {
			// if (this.readOnlyState) {
			// 	evt.preventDefault();
			// 	return;
			// }
			this.hoverx = false;
			if (
				this.required &&
				(!this.$props.value || this.$props.value.length === 0)
			) {
				this.isWarning = true;
			} else {
				this.isWarning = false;
			}
			this.$emit('blur', evt);
			this.changeFocus(false);
			if (valid === false) {
				this.$emit('validationError', err);
			}
		},
		changeFocus(booleanx) {
			this.isFocus = booleanx;
		},
		beforeEnter(el) {
			el.style.height = 0;
		},
		enter(el, done) {
			let h = el.scrollHeight;
			el.style.height = h + 'px';
			done();
		},
		leave: function(el) {
			el.style.height = 0 + 'px';
		},
		focusInput() {
			this.$refs.msinput.focus();
		},
		onMouseover(event) {
			if (this.isWarning) {
				this.hasWarning = true;

				this.screenX = event.screenX;
				this.screenY = event.screenY;
			}
		},
		onMouseout() {
			this.hasWarning = false;
		},

		// setReadOnlyCustom: function(readOnly){
		//   console.log("MsInput.setReadOnlyCustom")
		// }
		//add by dxtruong
		iconClick() {
			//this.$refs.msinput.focus();
			if (this.typeInput != null && this.typeInput === 'inputSearch') {
				this.$emit('iconClick');
			}
		}
	}
};
</script>
<style >
</style>

<style lang="scss" scoped>
@media screen and (max-width: 1366px) {
	@import '@/assets/scss/_sm-variables.scss';
	@import '@/assets/scss/components/msInput.scss';
}
@media screen and (min-width: 1367px) {
	@import '@/assets/scss/_variables.scss';
	@import '@/assets/scss/components/msInput.scss';
}
// .ms-con-input {
// 	span {
// 		// display: block;
// 		// width: 100%;
// 	}
// }
</style>
