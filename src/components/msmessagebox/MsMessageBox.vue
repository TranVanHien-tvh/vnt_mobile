<!-- =========================================================================================
	File Name: MSMessageBox.vue
	Description: Component MsMessageBox - Component hiện thị thông báo
	----------------------------------------------------------------------------------------
	Author: nntam - 15/8/2019
========================================================================================== -->
<template>
  <div id="message-box">
    <!-- <div id="message-box" > -->
    <div
      v-if="isShowMessage"
      class="con-ms-message-box"
    >
      <div
        class="message-center"
      >
        <!-- @shortkey="escAction"
				 v-shortkey="{
					Close: ['esc'], //Đóng
				}" -->
        <div class="ms-message-bg" />
        <div class="ms-mesage-box">
          <div
            v-if="option.close"
            class="close-button"
            @click="isShowMessage=false"
          />

          <div :style="[{ width: option.width, minWidth: '444px' }]">
            <div class="padding-20-16">
              <!-- 'align-items-center': (!showMessageDetail && option.title ==null) -->
              <div :class="{ content: true, }">
                <div
                  v-if="option.icon"
                  class="icon-message"
                >
                  <div
                    class="mi mi-52"
                    :class="[option.icon]"
                  />
                </div>
                <div class="message-content p-l-16 p-t-12">
                  <div
                    v-if="option.title != null"
                    class="title"
                  >
                    {{ option.title }}
                  </div>
                  <span
                    v-if="option.message != ''"
                    id="idMessage"
                    class="message"
                  >{{ message }}</span>
                  <div
                    v-if="option.messageDetail && option.messageDetail.length > 0 && !showMessageDetail"
                    class="mess-link"
                    @click="showMessageDetail = true"
                  >
                    <div class="mi mi-14 mi-chevron-down--primary-small" />
                    <div>Mở rộng</div>
                  </div>
                  <div v-if="option.messageDetail && option.messageDetail.length > 0 && showMessageDetail">
                    <ul class="detail-container">
                      <li
                        v-for="(detailItem, detailIndex) in option.messageDetail"
                        :key="detailIndex"
                      >
                        {{ detailItem }}
                      </li>
                    </ul>
                    <div
                      v-if="option.messageDetail !== '' && option.messageDetail != null && showMessageDetail"
                      class="mess-link"
                      @click="showMessageDetail = false"
                    >
                      <div class="mi mi-14 mi-chevron-up--primary-small" />
                      <div>Thu gọn</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
			<div class="mess-line" />
			<div
			v-if="showButton"
			class="mess-footer"
			@keydown="footerKeydown"
			>
			<!-- nntam - 16/04/2020 thêm computed để bog v-if lồng v-for -->
			<div
				v-for="button in listBtn"
				:key="button.key"
				:class="[button.target,'btn-size']"
			>
				<ms-button
				:ref="button.focus?'btnFocus':'btnOther'"
				class="w-100"
				:type="button.typeButton"
				:text="button.text"
				@keydown="escAction($event, button.key)"
				@click="btnClick(button.key)"
				/>
			</div>
			</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
	import commonFunction from '@/commons/commonFunction';
	export default {
		name: 'MsMessageBox',
		props: {
			// chiều rộng của messagebox
			width: {
				type: String,
				default: '444px'
			},
			// option cấu hình messageBox
			option: {
				type: Object,
				default: null
			}
		},
		data() {
			let showButton = false;
			for (let i = 0; i < this.option.btnConfig.length; i++) {
				if (this.option.btnConfig[i].hasBtn) {
					showButton = true;
					break;
				}
			}

			return {
				isShowMessage: true,
				showMessageDetail: false,
				message: '',
				showButton: showButton
			};
		},
		computed: {
			listBtn() {
				return this.option.btnConfig.filter(x => x.hasBtn == true);
			}
		},
		mounted() {
			//Focus
			if (this.$refs['btnFocus']) {
				this.$refs['btnFocus'][0].$el.focus();
			} else {
				let primaryBtn = this.$el.querySelector('.ms-button-primary');
				if (primaryBtn) {
					primaryBtn.focus();
				} else {
					commonFunction.focusFirstControl(this.$el);
				}
			}

			// hiện thị text ra message box
			var tt = document.getElementById('idMessage');
			if (this.option.message != '' && tt != null) {
				// nếu truyền thml thì vẫn để thế còn truyền text thì chuyển lại thành ký từ đặc biệt để nó không bị biến thành html khi hiển thị
				if (
					/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(
						this.option.message
					)
				) {
					tt.innerHTML = this.option.message;
				} else {
					this.message = this.option.message;
				}
			}

			let linkActive = this.$el.querySelector('.link-active'),
				linkPopup = this.$el.querySelector('.link-open-popup');

			if (linkActive !== null) {
				linkActive.addEventListener('click', this.linkActive_OnClick);
			}
			if (linkPopup !== null) {
				linkPopup.addEventListener('click', this.linkPopup_OnClick);
			}
		},
		methods: {
			/**
			 * Bắt sự kiện click vào button
			 */
			btnClick(key) {
				this.isShowMessage = false;
				this.$emit('btnClick', this, key);
			},
			escapeContent(htmlContent) {
				//Thay đổi toàn bộ kí tự đặc biệt `<`, `>` sang ký hiệu tương ứng để không bị ảnh hưởng việc hiển thị html
				return htmlContent.replace(/>/g, '&gt;').replace(/</g, '&lt;');
			},
			escAction(e, key) {
				const shortkey = e.target.getAttribute('shortkey');
				if (shortkey && shortkey.split('|').indexOf(e.srcKey) > -1) {
					e.preventDefault();
					this.isShowMessage = false;
				}
				// Nếu focus và nhấn enter thì thực hiện hành động click của nút đó
				else if(e.which == 13){
					this.btnClick(key);
				}
			},
			footerKeydown(e) {
				const me = this;
				e.preventDefault();
				e.stopPropagation();
				e.cancel = true;
				if(me.option.close && e.which == 27){
					this.isShowMessage = false;
				}
				commonFunction.processUnfocusLastControl(e, function () {
					commonFunction.focusFirstControl(me.$el);
				});
			},
			linkActive_OnClick() {
				this.$emit('linkActive');
				if (this.option.closeMessageAfterLink) {
					this.isShowMessage = false;
				}
			},
			linkPopup_OnClick() {
				this.$emit('linkPopup');
				this.isShowMessage = false;
			}
		}
	};
</script>

<style lang='scss' scoped>
	@import '@/assets/scss/components/msMessageBox.scss';
</style>
