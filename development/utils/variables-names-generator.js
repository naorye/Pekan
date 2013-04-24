/*
 * VariablesNamesGenerator generate unique variables names inside a scope.
 * scope - the scope where the variables will be defined. If empty, then 
 *         global or window are used.
 * prefix - prefix for the variable name. If no prefix defined, 'var' is used.
 */
var VariablesNamesGenerator = function(scope, prefix) {
    this.scope = scope || global || window;
    this.prefix = prefix || 'var';
    this.variablesIndex = 0;
};
VariablesNamesGenerator.prototype.getNext = function() {
    var varName =  this.prefix + this.variablesIndex ++;
    while (this.scope[varName] !== undefined) {
        varName =  this.prefix + this.variablesIndex ++;
    }
    return varName;
};

module.exports = VariablesNamesGenerator;