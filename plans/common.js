var ostring = Object.prototype.toString;
module.exports = {
    isFunction: function (it) {
        return ostring.call(it) === '[object Function]';
    },
    isArray: function (it) {
        return ostring.call(it) === '[object Array]';
    },
    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    mixin: function (target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value !== 'string') {
                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }
};