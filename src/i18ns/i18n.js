/*=========================================================================================
  File Name: i18n.js
  Description: Thiết lập localize
  ----------------------------------------------------------------------------------------
  Author: PDKIEN
  Author URL: https://misa.com.vn
==========================================================================================*/

import Vue from 'vue';
import VueI18n from 'vue-i18n';
import i18nData from './i18nData';

Vue.use(VueI18n);

export default new VueI18n({
	locale: 'vi', // set default locale
	messages: i18nData
});
