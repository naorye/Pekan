define([], function() {
    var Utils = {
        extend: function (base, methods) {
            var sub = function() {
                base.apply(this, arguments); // Call base class constructor

                // Call sub class initialize method that will act like a constructor
                if (this.initialize) {
                    this.initialize.apply(this, arguments);
                }
            };
            sub.prototype = Object.create(base.prototype);
            $.extend(sub.prototype, methods);
            return sub;
        },
        parseSize: function (size) {
            size = parseFloat(size);
            if (isNaN(size)) {
                size = null;
            }
            return size;
        }
    };

    return Utils;
});