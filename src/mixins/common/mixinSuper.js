/**
 * Mixin để xử lý call method lớp cha
 */
export const mixinSuper = {
    created() {
        this._parentScrope = {};
    },
    methods: {
        /**
         * Gọi lên lớp cha
         */
        super(methodName){
            const me = this,
                cur = me.$options,
                find = function(parent) {
                    if (me._parentScrope && me._parentScrope[methodName] !== parent.name && parent.methods && parent.methods[methodName]) {
                        me._parentScrope[methodName] = parent.name;
                        return parent.methods[methodName];
                    }

                    if (parent.extends) {
                        return find(parent.extends);
                    }

                    return null;
                };

            let fn = find(me.$options.extends);
            if (fn) {
                try {
                    let args = [];
                    for (var i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }

                    return fn.apply(this, args);
                } finally {
                    delete me._parentScrope[methodName];
                }
            }
        },
    }
};