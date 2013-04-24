var fs = require('fs');

var ConcatenateWriter = function(path) {
    this.path = path;
    this.indent = 0;
    this.text = '';
};
ConcatenateWriter.prototype.incIndent = function() {
    this.indent ++;
};
ConcatenateWriter.prototype.decIndent = function() {
    if (this.indent > 0) {
        this.indent --;
    }
};
ConcatenateWriter.prototype.appendLine = function(str) {
    var indentation = '';
    for (var i = 0; i < this.indent; i++) {
        indentation += '\t';
    }
    if (this.text !== '') {
        this.text += '\n';
    }
    this.text += indentation + str.replace(/\r\n|\r|\n/g,'\r\n' + indentation);
};
ConcatenateWriter.prototype.close = function() {
    fs.appendFileSync(this.path, this.text);
};

module.exports = ConcatenateWriter;