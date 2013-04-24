/*
 * ArgumentsParser parse arguments and set them into variables. This plugin is
 * useful especially if function has a few calling variations. For instance, if
 * your function can get 2 parameters for name and city or 3 parameters for
 * name, age and city, then using this plugin can fetch those values easily.
 * 
 * 
 * gets an object as parameter. Each item in the object defines
 * the number of arguments and its parameter names. In addition, defaults can
 * be placed in this object. For example:
 * {
 *     '3': [name, city, age].
 *     '2': [city, age],
 *     defaults: {
 *         name: 'None',
 *         city: null,
 *         age: 4
 *     },
 *     noMapMessage: function(args) { // Or string
 *     }
 * }
 * Means that if there are 3 arguments, the first one is name, the second is
 * city and the last is age. If there are 2 arguments, the first one is city
 * and the second is age. If one parameter hasn't defined, it's default
 * value is set. If unsupported number of parameters are given, then call
 * noMapMessage or console.log it.
 */
var ArgumentsParser = function(settings) {
    this.argumentsMaps = {};
    for (var key in settings) {
        if (!isNaN(key * 1)) {
            this.argumentsMaps[key] = settings[key];
        }
    }
    this.defaults = settings.defaults;
    this.noMapMessage =
        settings.noMapMessage || this.defaultNoMapMessage;
};
ArgumentsParser.prototype.defaultNoMapMessage = function(args) {
    var msg = 'Expecting ',
        length = this.argumentsMaps.length;

    if (length > 1) {
        var last = this.argumentsMaps[length - 1],
            allButLast = this.argumentsMaps.splice(0, length - 2);
        msg += allButLast.join(', ') + ' or ' + last + ' ';
    } else if (this.argumentsMaps.length === 1) {
        msg += this.argumentsMaps[0] + ' ';
    }
    msg += 'arguments.';

    return msg;
};
ArgumentsParser.prototype.parse = function(args, context) {
    if (!context) {
        context = this.args = {};
    } else {
        this.args = context;
    }
    var argumentsMap = this.argumentsMaps[args.length];
    if (argumentsMap === undefined || !Array.isArray(argumentsMap)) {
        var message = null;
        if (typeof this.noMapMessage === 'string') {
            console.log(this.noMapMessage);
        } else if (typeof this.noMapMessage === 'function') {
            console.log(this.noMapMessage(args));
        }
        return false;
    }

    if (this.defaults) {
        for (var prop in this.defaults) {
            context[prop] = this.defaults[prop];
        }
    }

    for (var i = 0; i < argumentsMap.length; i++) {
        context[argumentsMap[i]] = args[i];
    }
    return true;
};

module.exports = ArgumentsParser;