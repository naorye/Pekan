var fs = require('fs'),
    path = require('path'),
    ArgumentsParser = require('./arguments-parser');

var BuildObj = function() {


    this.config = this.read();
    this.isValid = this.validate();
};
BuildObj.prototype.read = function() {
    var appArguments = new ArgumentsParser({
        '1': ['buildFilePath'],
        noMapMessage: 'Usage: node pekan [buildfile.js]'
    });
    if (!appArguments.parse(process.argv.splice(2))) {
        return false;
    }
    var buildFilePath = appArguments.args.buildFilePath;
    if (!fs.existsSync(buildFilePath)) {
        console.log('No such file ' + buildFilePath);
        return false;
    }

    var buildJson = null;
    try {
        buildJson = fs.readFileSync(buildFilePath, 'utf8');
    } catch (e) {
       if (e instanceof Error) {
            if (e.code === 'ENOENT') {
                console.log(buildFilePath + ' not found.');
                return false;
            }
        }
        throw e;
    }

    var config = null;
    try {
        config = eval(buildJson);

        if (config.baseUrl) {
            // Set baseUrl relative to build file path
            config.baseUrl = path.resolve(
                path.dirname(buildFilePath), config.baseUrl);

            // Make sure the baseUrl ends in a slash.
            if (config.baseUrl.charAt(config.baseUrl.length - 1) !== '/') {
                config.baseUrl += '/';
            }
        }
    } catch (e) {
        if (e instanceof SyntaxError) {
            console.log('Syntax error while trying to read ' + buildFilePath + '.');
        }
        throw e;
    }

    return config;
};
BuildObj.prototype.validate = function() {
    if (!this.config) {
        return false;
    }

    if (!fs.existsSync(this.config.baseUrl)) {
        console.log('baseUrl ' + this.config.baseUrl + ' is not exists.');
        return false;
    }

    if (!fs.existsSync(this.getJSInPath())) {
        console.log('jsIn ' + this.getJSInPath() + ' is not exists.');
        return false;
    }

    var jsOut = this.getJSOutPath();
    if (fs.existsSync(jsOut)) {
        fs.unlinkSync(jsOut);
    }
    return true;
};
BuildObj.prototype.getJSOutPath = function() {
    return path.resolve(this.config.baseUrl, this.config.jsOut);
};
BuildObj.prototype.getJSInPath = function() {
    return path.resolve(this.config.baseUrl, this.config.jsIn);
};
BuildObj.prototype.getDependencyPath = function(moduleName) {
    return path.resolve(this.config.baseUrl, moduleName);
};

module.exports = BuildObj;