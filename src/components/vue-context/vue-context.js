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
            //top,left l?? v??? tr?? c???a icon s??? xu???ng
            //position c???a th??? ul (menu dropdown)
            let positionMenu = element.getBoundingClientRect();
            //position c???a button cha 
            let positionParentMenu = element.previousElementSibling.getBoundingClientRect();
            // t??nh width cho menu : n???u c?? custom th?? t??nh theo custom c??n kh??ng th?? s??t width b???ng width c???a button
            let width = this.customWidth != 0 ? this.customWidth : positionParentMenu.width;
            //n???u width b??n tr??n m?? l???n h??n width m???c ?????nh c???a menu th?? m???i g??n, n???u nh??? h??n th?? th??i ????? m???c ?????nh cho ?????p
            /*width = width> element.offsetWidth? width: element.offsetWidth;*/
            let testPosition = element.offsetHeight + positionParentMenu.top + element.previousElementSibling.offsetHeight - window.innerHeight;
            let testBottonPosition = positionParentMenu.top - element.offsetHeight;

            const elementHeight = this.useScrollHeight ? element.scrollHeight : element.offsetHeight;
            const largestHeight = window.innerHeight - elementHeight - positionParentMenu.height - (positionParentMenu.bottom - positionParentMenu.top) - this.heightOffset;

            const elementWidth = this.useScrollWidth ? element.scrollWidth : width;
            const largestWidth = window.innerWidth - elementWidth - this.widthOffset;

            //tr?????ng h???p m?? menu quay ng?????c l??n tr??n ho???c xu??i xu???ng d?????i m?? kh??ng b??? v?????t qu?? chi???u cao m??n h??nh th?? nh???y v??o ????y
            if ((testPosition >= 0 && testBottonPosition >= 0) || (testPosition < 0 && testBottonPosition < 0)) {
                //n???u top > chi???u cao max th?? d??n l??n tr??n n???u kh??ng th?? d??n xu???ng d?????i
                if (testPosition > 0) {
                    top = (positionParentMenu.top - element.offsetHeight);
                } else {
                    top = positionParentMenu.top + element.previousElementSibling.offsetHeight;
                }
            }
            //n???u m?? chi???u cao c???a menu cao qu??, d?? quay l??n tr??n hay quay xu???ng d?????i ?????u b??? m??n h??nh c???t m???t th?? nh???y v??o ????y
            else {
                //n???u top > chi???u cao max th?? d??n l??n tr??n n???u kh??ng th?? d??n xu???ng d?????i
                if (positionMenu.top >= largestHeight) {
                    top = largestHeight;
                } else {
                    top = positionMenu.top + this.heightOffset;
                }
            }

            //n???u left c???a menu > ????? r???ng max th?? d??n sang tr??i, n???u k th?? d??n sang ph???i
            if (positionMenu.left >= largestWidth) {
                left = largestWidth;
            } else {
                left = positionMenu.left + (positionParentMenu.left - positionMenu.left - width + positionParentMenu.width)
            }

            return [top, left, width];
        },

        /**
         * TDNGHIA 13/1/2021: ch??? l???i v??? tr?? c???a context cho c??c ch??? d??ng nh??ng l???i di ?????ng
         * VD: buttondropdown, actionmenu,... c?? scroll n??n kh??ng ?????nh r?? ???????c v??? tr??
         * Ch?? n??o v??o t???n ????y ?????c code c??ng kh???e ?????y
         * @param {*} top 
         * @param {*} left 
         * @param {*} element 
         * @returns 
         */
        positionByMasterElement(top, left, element) {
            //position c???a button cha 
            let positionParentMenu = element.previousElementSibling.getBoundingClientRect();
            //position c???a th??? ul (menu dropdown)
            let positionMenu = element.getBoundingClientRect();

            // t??nh width cho menu : n???u c?? custom th?? t??nh theo custom c??n kh??ng th?? s??t width b???ng width c???a button
            let width = this.customWidth != 0 ? this.customWidth : positionParentMenu.width;

            let testPosition = element.offsetHeight + positionParentMenu.top + element.previousElementSibling.offsetHeight - window.innerHeight;
            let testBottonPosition = positionParentMenu.top - element.offsetHeight;

            const elementHeight = this.useScrollHeight ? element.scrollHeight : element.offsetHeight;
            const largestHeight = window.innerHeight - elementHeight - positionParentMenu.height - (positionParentMenu.bottom - positionParentMenu.top) - this.heightOffset;

            const elementWidth = this.useScrollWidth ? element.scrollWidth : width;
            const largestWidth = window.innerWidth - elementWidth - this.widthOffset;

            //n???u top > chi???u cao max th?? d??n l??n tr??n n???u kh??ng th?? d??n xu???ng d?????i
            if (testPosition > 0) {
                top = (positionParentMenu.top - element.offsetHeight);
            } else {
                top = positionParentMenu.top + element.previousElementSibling.offsetHeight;
            }

            //n???u left c???a menu > ????? r???ng max th?? d??n sang tr??i, n???u k th?? d??n sang ph???i
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
