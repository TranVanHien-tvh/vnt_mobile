import { directive as onClickaway } from 'vue-clickaway';
import {
    eventOff,
    eventOn,
    filterVisible,
    isArray,
    keyCodes,
    selectAll,
    setAttr,
    getBCR,
    parentElementByClassName
} from './utils';
import { normalizeSlot } from './normalize-slot';

export default {
    directives: {
        onClickaway
    },

    props: {
        closeOnClick: {
            type: Boolean,
            default: true
        },
        closeOnScroll: {
            type: Boolean,
            default: true
        },
        lazy: {
            type: Boolean,
            default: false
        },
        itemSelector: {
            type: [String, Array],
            default: () => ['.v-context-item', '.v-context > li > a']
        },
        role: {
            type: String,
            default: 'menu'
        },
        subMenuOffset: {
            type: Number,
            default: 10
        },
        useScrollHeight: {
            type: Boolean,
            default: false
        },
        useScrollWidth: {
            type: Boolean,
            default: false
        },
        heightOffset: {
            type: Number,
            default: 5, //25
        },
        widthOffset: {
            type: Number,
            default: 25
        },
        tag: {
            type: String,
            default: 'ul'
        },
        customPositionMenu: {
            type: Boolean,
            default: false
        },
        customWidth: {
            type: Number,
            default: 0,
        }
    },

    computed: {
        style() {
            return this.show
                ? { top: `${this.top}px`, left: `${this.left}px`, width: `${this.width}px` }
                : null;
        }
    },

    data() {
        return {
            top: null,
            left: null,
            width: null,
            show: false,
            data: null,
            localItemSelector: '',
            activeSubMenu: null
        };
    },

    created() {
        this.localItemSelector = this.mapItemSelector(this.itemSelector);
    },

    beforeDestroy() {
        if (this.closeOnScroll) {
            this.removeScrollEventListener();
        }
    },

    methods: {
        addScrollEventListener() {
            eventOn(window, 'scroll', this.close);
        },

        addHoverEventListener(element) {
            element.querySelectorAll('.v-context__sub').forEach(
                subMenuNode => {
                    eventOn(subMenuNode, 'mouseenter', this.openSubMenu);
                    eventOn(subMenuNode, 'mouseleave', this.closeSubMenu);
                }
            );
        },

        close() {
            if (!this.show) {
                return;
            }

            // make sure all sub menus are closed
            while (this.activeSubMenu !== null) {
                parentElementByClassName(this.activeSubMenu, 'v-context__sub').dispatchEvent(new Event('mouseleave'));
            }

            this.resetData();
            this.removeHoverEventListener(this.$el);

            if (this.closeOnScroll) {
                this.removeScrollEventListener();
            }

            this.$emit('close');
        },

        focusItem(index, items) {
            const el = items.find((el, idx) => idx === index);
            el && el.focus();
        },

        focusNext(event, up) {
            if (!this.show) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            this.$nextTick(() => {
                const items = this.getItems();
                if (items.length < 1) {
                    return;
                }

                let index = items.indexOf(event.target);
                if (up && index > 0) {
                    index--;
                } else if (!up && index < items.length - 1) {
                    index++;
                }

                if (index < 0) {
                    index = 0;
                }

                this.focusItem(index, items);
            });
        },

        getItems() {
            // if a sub menu is active only return the elements of the sub menu to keep the scope
            return filterVisible(selectAll(this.localItemSelector, this.activeSubMenu || this.$el));
        },

        mapItemSelector(itemSelector) {
            if (isArray(itemSelector)) {
                itemSelector = itemSelector
                    .map(selector => `${selector}:not(.disabled):not([disabled])`)
                    .join(', ');
            }

            return itemSelector;
        },

        onClick() {
            this.close();
        },

        onKeydown(event) {
            const key = event.keyCode;

            if (key === keyCodes.ESC) {
                // Close on esc
                this.close();
            } else if (key === keyCodes.DOWN) {
                // Down arrow
                this.focusNext(event, false);
            } else if (key === keyCodes.UP) {
                // Up arrow
                this.focusNext(event, true);
            } else if (key === keyCodes.RIGHT) {
                // check if a parent element which is associated with a sub menu can be found.
                const menuContainer = parentElementByClassName(event.target, 'v-context__sub');

                // try to open a sub menu if the sub menu isn't the current sub menu
                if (menuContainer && menuContainer.getElementsByClassName('v-context')[0] !== this.activeSubMenu) {
                    menuContainer.dispatchEvent(new Event('mouseenter'));
                    this.focusNext(event, false);
                }
            } else if (key === keyCodes.LEFT) {
                if (!this.activeSubMenu) {
                    return;
                }

                const parentMenu = parentElementByClassName(this.activeSubMenu, 'v-context__sub');
                parentMenu.dispatchEvent(new Event('mouseleave'));

                const items = this.getItems(),
                    index = items.indexOf(parentMenu.getElementsByTagName('a')[0]);

                this.focusItem(index, items);
            }
        },

        open(event, data) {
            this.data = data;
            this.show = true;

            this.$nextTick(() => {

                let buttonDropDownPosition = (event.toElement || event.target).getBoundingClientRect();
                let clientY = buttonDropDownPosition ? buttonDropDownPosition.top : event.clientY;
                let clientX = buttonDropDownPosition ? buttonDropDownPosition.left : event.clientX;
                if (this.customPositionMenu) {
                    [this.top, this.left, this.width] = this.positionByMasterElement(clientY, clientX, this.$el);
                } else {
                    [this.top, this.left, this.width] = this.positionMenu(clientY, clientX, this.$el);
                }

                this.$el.focus();
                this.setItemRoles();
                this.addHoverEventListener(this.$el);

                if (this.closeOnScroll) {
                    this.addScrollEventListener();
                }

                this.$emit('open', event, this.data, this.top, this.left);
            });
        },

        openSubMenu(event) {
            const subMenuElement = this.$el,
                parentMenu = parentElementByClassName(subMenuElement.parentElement, 'v-context'),
                bcr = getBCR(event.target);

            // check if another sub menu is open. In this case make sure no other as well as no nested sub menu is open
            if (this.activeSubMenu !== parentMenu) {
                while (this.activeSubMenu !== null
                    && this.activeSubMenu !== parentMenu
                    && this.activeSubMenu !== subMenuElement
                ) {
                    parentElementByClassName(this.activeSubMenu, 'v-context__sub')
                        .dispatchEvent(new Event('mouseleave'));
                }
            }

            // first set the display and afterwards execute position calculation for correct element offsets
            subMenuElement.style.display = 'block';

            let [elementTop, elementLeft, elementWidth] = this.positionMenu(bcr.top, bcr.right - this.subMenuOffset, subMenuElement);

            subMenuElement.style.left = `${elementLeft}px`;
            subMenuElement.style.top = `${elementTop}px`;
            subMenuElement.style.width = `${elementWidth}px`;

            this.activeSubMenu = subMenuElement;
        },

        closeSubMenu(event) {
            const subMenuElement = this.getSubMenuElementByEvent(event),
                parentMenu = parentElementByClassName(subMenuElement, 'v-context');

            // if a sub menu is closed and it's not the currently active sub menu (eg. a lowe layered sub menu closed
            // by a mouseleave event) close all nested sub menus
            if (this.activeSubMenu !== subMenuElement) {
                while (this.activeSubMenu !== null && this.activeSubMenu !== subMenuElement) {
                    parentElementByClassName(this.activeSubMenu, 'v-context__sub')
                        .dispatchEvent(new Event('mouseleave'));
                }
            }

            subMenuElement.style.display = 'none';

            // check if a parent menu exists and the parent menu is a sub menu to keep track of the correct sub menu
            this.activeSubMenu = parentMenu && parentElementByClassName(parentMenu, 'v-context__sub')
                ? parentMenu
                : null;
        },

        getSubMenuElementByEvent(event) {
            return event.target.getElementsByTagName('ul')[0];
        },

        positionMenu(top, left, element) {
            //top,left là vị trí của icon sổ xuống
            //position của thẻ ul (menu dropdown)
            let positionMenu = element.getBoundingClientRect();
            //position của button cha 
            let positionParentMenu = element.previousElementSibling.getBoundingClientRect();
            // tính width cho menu : nếu có custom thì tính theo custom còn không thì sét width bằng width của button
            let width = this.customWidth != 0 ? this.customWidth : positionParentMenu.width;
            //nếu width bên trên mà lớn hơn width mặc định của menu thì mới gán, nếu nhỏ hơn thì thôi để mặc định cho đẹp
            /*width = width> element.offsetWidth? width: element.offsetWidth;*/
            let testPosition = element.offsetHeight + positionParentMenu.top + element.previousElementSibling.offsetHeight - window.innerHeight;
            let testBottonPosition = positionParentMenu.top - element.offsetHeight;

            const elementHeight = this.useScrollHeight ? element.scrollHeight : element.offsetHeight;
            const largestHeight = window.innerHeight - elementHeight - positionParentMenu.height - (positionParentMenu.bottom - positionParentMenu.top) - this.heightOffset;

            const elementWidth = this.useScrollWidth ? element.scrollWidth : width;
            const largestWidth = window.innerWidth - elementWidth - this.widthOffset;

            //trường hợp mà menu quay ngược lên trên hoặc xuôi xuống dưới mà không bị vượt quá chiều cao màn hình thì nhảy vào đây
            if ((testPosition >= 0 && testBottonPosition >= 0) || (testPosition < 0 && testBottonPosition < 0)) {
                //nếu top > chiều cao max thì dàn lên trên nếu không thì dàn xuống dưới
                if (testPosition > 0) {
                    top = (positionParentMenu.top - element.offsetHeight);
                } else {
                    top = positionParentMenu.top + element.previousElementSibling.offsetHeight;
                }
            }
            //nếu mà chiều cao của menu cao quá, dù quay lên trên hay quay xuống dưới đều bị màn hình cắt mất thì nhảy vào đây
            else {
                //nếu top > chiều cao max thì dàn lên trên nếu không thì dàn xuống dưới
                if (positionMenu.top >= largestHeight) {
                    top = largestHeight;
                } else {
                    top = positionMenu.top + this.heightOffset;
                }
            }

            //nếu left của menu > độ rộng max thì dàn sang trái, nếu k thì dàn sang phải
            if (positionMenu.left >= largestWidth) {
                left = largestWidth;
            } else {
                left = positionMenu.left + (positionParentMenu.left - positionMenu.left - width + positionParentMenu.width)
            }

            return [top, left, width];
        },

        /**
         * TDNGHIA 13/1/2021: chế lại vị trí của context cho các chỗ dùng nhưng lại di động
         * VD: buttondropdown, actionmenu,... có scroll nên không định rõ được vị trí
         * Chú nào vào tận đây đọc code cũng khỏe đấy
         * @param {*} top 
         * @param {*} left 
         * @param {*} element 
         * @returns 
         */
        positionByMasterElement(top, left, element) {
            //position của button cha 
            let positionParentMenu = element.previousElementSibling.getBoundingClientRect();
            //position của thẻ ul (menu dropdown)
            let positionMenu = element.getBoundingClientRect();

            // tính width cho menu : nếu có custom thì tính theo custom còn không thì sét width bằng width của button
            let width = this.customWidth != 0 ? this.customWidth : positionParentMenu.width;

            let testPosition = element.offsetHeight + positionParentMenu.top + element.previousElementSibling.offsetHeight - window.innerHeight;
            let testBottonPosition = positionParentMenu.top - element.offsetHeight;

            const elementHeight = this.useScrollHeight ? element.scrollHeight : element.offsetHeight;
            const largestHeight = window.innerHeight - elementHeight - positionParentMenu.height - (positionParentMenu.bottom - positionParentMenu.top) - this.heightOffset;

            const elementWidth = this.useScrollWidth ? element.scrollWidth : width;
            const largestWidth = window.innerWidth - elementWidth - this.widthOffset;

            //nếu top > chiều cao max thì dàn lên trên nếu không thì dàn xuống dưới
            if (testPosition > 0) {
                top = (positionParentMenu.top - element.offsetHeight);
            } else {
                top = positionParentMenu.top + element.previousElementSibling.offsetHeight;
            }

            //nếu left của menu > độ rộng max thì dàn sang trái, nếu k thì dàn sang phải
            if (positionMenu.left >= largestWidth) {
                left = largestWidth;
            } else {
                left = positionMenu.left + (positionParentMenu.left - positionMenu.left - width + positionParentMenu.width)
            }

            return [top, left, width];
        },

        removeScrollEventListener() {
            eventOff(window, 'scroll', this.close);
        },

        removeHoverEventListener(element) {
            element.querySelectorAll('.v-context__sub').forEach(
                (subMenuNode) => {
                    eventOff(subMenuNode, 'mouseenter', this.openSubMenu);
                    eventOff(subMenuNode, 'mouseleave', this.closeSubMenu);
                }
            );
        },

        resetData() {
            this.top = null;
            this.left = null;
            this.data = null;
            this.show = false;
        },

        setItemRoles() {
            // Add role="menuitem" and tabindex="-1" to all items
            selectAll(this.localItemSelector, this.$el)
                .forEach(el => {
                    setAttr(el, 'role', 'menuitem');
                    setAttr(el, 'tabindex', '-1');
                });
        }
    },

    watch: {
        closeOnScroll(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }

            if (newValue && this.show) {
                this.addScrollEventListener();
            } else {
                this.removeScrollEventListener();
            }
        },

        itemSelector(selector, oldValue) {
            if (selector !== oldValue) {
                this.localItemSelector = this.mapItemSelector(selector);
            }
        },
    },

    render(h) {
        if (this.lazy && !this.show) {
            return h(false);
        }

        // Only register the events we need
        const on = {
            // `!` modifier for capture
            '!contextmenu': e => {
                e.preventDefault();
            },
            keydown: this.onKeydown // up, down, esc
        };

        if (this.closeOnClick) {
            on.click = this.onClick;
        }

        // Only register the directives we need
        const directives = [
            {
                name: 'on-clickaway',
                value: this.close,
                rawName: 'v-on-clickaway'
            }
        ];

        if (!this.lazy) {
            directives.push({
                name: 'show',
                value: this.show,
                rawName: 'v-show',
                expression: 'show'
            });
        }

        return h(
            this.tag,
            {
                staticClass: 'v-context',
                style: this.style,
                attrs: {
                    tabindex: '-1',
                    role: this.role,
                    'aria-hidden': this.lazy ? null : String(!this.show)
                },
                on,
                directives
            },
            [normalizeSlot('default', { data: this.data }, this.$scopedSlots, this.$slots)]
        );
    }
};
