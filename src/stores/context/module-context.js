import state from './module-context-state';
import mutations from './module-context-mutations';
import actions from './module-context-actions';
import getters from './module-context-getters';

export default {
	debug: process.env.NODE_ENV !== 'production',
	namespaced: true,
	state: state,
	mutations: mutations,
	actions: actions,
	getters: getters
};
