var fs = require('fs');

var ConcatenateWriter = function(path, options) {
    this.options = options || {};
    this.options.functionWrap = this.options.functionWrap !== true;

    for (var option in this.defaults) {
        if (!(option in this.options)) {
            this.options[option] = this.defaults[option];
        }
    }

    this.path = path;
    this.indent = 0;
    this.text = '';
};
ConcatenateWriter.prototype.defaults = {
    functionWrap: true
};
ConcatenateWriter.prototype.incIndent = function() {
    this.indent ++;
};
ConcatenateWriter.prototype.decIndent = function() {
    if (this.indent > 0) {
        this.indent --;
    }
};
ConcatenateWriter.prototype.formatLine = function(str) {
    var indentation = '';
    for (var i = 0; i < this.indent; i++) {
        indentation += '\t';
    }
    if (this.text !== '') {
        this.text += '\n';
    }
    return indentation + str.replace(/\r\n|\r|\n/g,'\r\n' + indentation);
};
ConcatenateWriter.prototype.appendLine = function(str) {
    this.text += this.formatLine(str);
};
ConcatenateWriter.prototype.prependLine = function(str) {
    this.text = this.formatLine(str) + this.text;
};
ConcatenateWriter.prototype.close = function() {
    if (this.options.functionWrap) {
        this.prependLine('(function() {');
        this.appendLine('})();');
    }

    fs.appendFileSync(this.path, this.text);
};

module.exports = ConcatenateWriter;