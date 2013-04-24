define([], function() {
    var RowGenerator = function(container, margin, options) {
        this.container = container;
        this.margin = margin;
        this.options = jQuery.extend({}, this.defaults, options);
    };

    jQuery.extend(RowGenerator.prototype, {
        defaults: { },
        generateGridRowModel: function() {
            throw "GridRowGenerator is abstract.";
        },
        getGenerator: function() {
            return jQuery.proxy(this.generateGridRowModel, this);
        },
        setOption: function(key, value) {
            this.options[key] = value;
        },
        setOptions: function(options) {
            options = options || {};
            for (var key in options) {
                this.setOption(key, options[key]);
            }
        }
    });

    return RowGenerator;
});