/*=========================================================================================
  File Name: globalComponents.js
  Description: Here you can register components globally
==========================================================================================*/

import Vue from "vue";

import MsButton from "@/components/msbutton/msButton.vue";
Vue.component(MsButton.name, MsButton);

import MsSplitButton from "@/components/msbutton/msSplitButton.vue";
Vue.component(MsSplitButton.name, MsSplitButton);

import MsButtonDropdown from "@/components/msbuttondropdown/msButtonDropdown.vue";
Vue.component(MsButtonDropdown.name, MsButtonDropdown);

import MsInput from "@/components/msinput/msInput.vue";
Vue.component(MsInput.name, MsInput);

import MsCheckbox from "@/components/mscheckbox/msCheckbox.vue";
Vue.component(MsCheckbox.name, MsCheckbox);

import MsRadio from "@/components/msradio/msRadio.vue";
Vue.component(MsRadio.name, MsRadio);

import MsRadioGroup from "@/components/msradio/MsRadioGroup.vue";
Vue.component(MsRadioGroup.name, MsRadioGroup);

import MsDatepicker from "@/components/msdatepicker/MsDatePicker.vue";
Vue.component(MsDatepicker.name, MsDatepicker);

import MsDateRange from "@/components/msdaterange/MsDateRange.vue";
Vue.component(MsDateRange.name, MsDateRange);

import MsTextarea from "@/components/msTextarea/MsTextarea.vue";
Vue.component(MsTextarea.name, MsTextarea);

import VTooltip from "@/components/msTooltip";
Vue.use(VTooltip);

import MsNumber from "@/components/msnumber/msNumber.vue";
Vue.component(MsNumber.name, MsNumber);

import MsDropDown from "@/components/msdropdown/msDropdown.vue";
Vue.component(MsDropDown.name, MsDropDown);

import MsDropDownMenu from "@/components/msdropdown/msDropDownMenu.vue";
Vue.component(MsDropDownMenu.name, MsDropDownMenu);

import MsDropdownItem from "@/components/msdropdown/msDropdownItem.vue";
Vue.component(MsDropdownItem.name, MsDropdownItem);

import MsTooltip from "@/components/msTooltip/components/MSTooltip.vue";
Vue.component(MsTooltip.name, MsTooltip);

//Ông popup thì sẽ không cấy trực tiếp vào form mà xử lý show động
import MsPopup from "@/components/mspopup/MsPopup.vue";
Vue.component(MsPopup.name, MsPopup);

import MsComboBox from "@/components/mscombobox/msCombobox.vue";
Vue.component(MsComboBox.name, MsComboBox);

//phím tắt
import "@/components/ms-shortkey/shortkey";
