var fs = require('fs');

var ConcatenateWriter = function(path, options) {
    this.options = options || {};
    this.options.functionWrap = this.options.functionWrap !== false;

    for (var option in this.defaults) {
        if (!(option in this.options)) {
            this.options[option] = this.defaults[option];
        }
    }

    this.path = path;
    this.indent = 0;
    this.lines = [];
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

    return indentation + str.replace(/\r\n|\r|\n/g,'\r\n' + indentation);
};
ConcatenateWriter.prototype.appendLine = function(str) {
    this.lines.push(this.formatLine(str));
};
ConcatenateWriter.prototype.prependLine = function(str) {
    this.lines.splice(0, 0, this.formatLine(str));
};
ConcatenateWriter.prototype.close = function() {
    if (this.options.functionWrap) {
        this.prependLine('(function() {');
        this.appendLine('})();');
    }

    fs.appendFileSync(this.path, this.lines.join('\n'));
};

module.exports = ConcatenateWriter;