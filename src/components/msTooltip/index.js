import vtooltip, { defaultOptions, state } from './directives/v-tooltip'
import vclosepopover from './directives/v-close-popover'
import Popover from './components/Popover.vue'
import merge from 'lodash/merge'
import 'vue-resize/dist/vue-resize.css'

export { createTooltip, destroyTooltip } from './directives/v-tooltip'

export function install (Vue, options = {}) {
  if (install.installed) return
  install.installed = true

  const finalOptions = {}
  merge(finalOptions, defaultOptions, options)

  plugin.options = finalOptions
  vtooltip.options = finalOptions

  Vue.directive('tooltip', vtooltip)
  Vue.directive('close-popover', vclosepopover)
  Vue.component('v-popover', Popover)
  Vue.directive('click-outside',{
    bind: function (el, binding, vnode) {
        el.eventSetDrag = function () {
            el.setAttribute('data-dragging', 'yes');
        }
        el.eventClearDrag = function () {
            el.removeAttribute('data-dragging');
        }
        el.eventOnClick = function (event) {
            var dragging = el.getAttribute('data-dragging');
            // Check that the click was outside the el and its children, and wasn't a drag
            if (!(el == event.target || el.contains(event.target)) && !dragging) {
                // call method provided in attribute value
                vnode.context[binding.expression](event);
            }
        };
        document.addEventListener('touchstart', el.eventClearDrag);
        document.addEventListener('touchmove', el.eventSetDrag);
        document.addEventListener('click', el.eventOnClick);
        document.addEventListener('touchend', el.eventOnClick);
    }, unbind: function (el) {
        document.removeEventListener('touchstart', el.eventClearDrag);
        document.removeEventListener('touchmove', el.eventSetDrag);
        document.removeEventListener('click', el.eventOnClick);
        document.removeEventListener('touchend', el.eventOnClick);
        el.removeAttribute('data-dragging');
    },
  })
}

export const VTooltip = vtooltip
export const VClosePopover = vclosepopover
export const VPopover = Popover

const plugin = {
  install,

  get enabled () {
    return state.enabled
  },

  set enabled (value) {
    state.enabled = value
  },
}

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}

export default plugin
