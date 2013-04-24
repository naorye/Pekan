var fs = require('fs'),
    path = require('path'),
    ArgumentsParser = require('./arguments-parser');



function isFunction (it) {
    return ostring.call(it) === '[object Function]';
}

function isArray (it) {
    return ostring.call(it) === '[object Array]';
}

/**
 * Simple function to mix in properties from source into target,
 * but only if target does not already have a property of the same name.
 */
function mixin (target, source, force, deepStringMixin) {
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

/**
 * Cycles over properties in an object and calls a function for each
 * property value. If the function returns a truthy value, then the
 * iteration is stopped.
 */
function eachProp(obj, func) {
    var prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (func(obj[prop], prop)) {
                break;
            }
        }
    }
}

//Allow getting a global that expressed in
//dot notation, like 'a.b.c'.
function getGlobal(value) {
    if (!value) {
        return value;
    }
    var g = global;
    each(value.split('.'), function (part) {
        g = g[part];
    });
    return g;
}

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

        config.paths = config.paths || {};

        //Save off the paths and packages since they require special processing,
        //they are additive.
        var pkgs = config.pkgs,
            shim = config.shim,
            objs = {
                paths: true,
                config: true,
                map: true
            };

        eachProp(config, function (value, prop) {
            if (objs[prop]) {
                if (prop === 'map') {
                    mixin(config[prop], value, true, true);
                } else {
                    mixin(config[prop], value, true);
                }
            } else {
                config[prop] = value;
            }
        });

        //Merge shim
        if (config.shim) {
            eachProp(config.shim, function (value, id) {
                //Normalize the structure
                if (isArray(value)) {
                    value = {
                        deps: value
                    };
                }
                if (value.exports && !value.exportsFn) {
                    value.exportsFn = function fn() {
                        var ret;
                        if (value.init) {
                            ret = value.init.apply(global, arguments);
                        }
                        return ret || getGlobal(value.exports);
                    };
                }
                shim[id] = value;
            });
            config.shim = shim;
        }

        //Adjust packages if necessary.
        if (config.pkgs) {
            each(config.pkgs, function (pkgObj) {
                var location,
                    currDirRegExp = /^\.\//,
                    jsSuffixRegExp = /\.js$/;

                pkgObj = typeof pkgObj === 'string' ? { name: pkgObj } : pkgObj;
                location = pkgObj.location;

                //Create a brand new object on pkgs, since currentPackages can
                //be passed in again, and config.pkgs is the internal transformed
                //state for all package configs.
                pkgs[pkgObj.name] = {
                    name: pkgObj.name,
                    location: location || pkgObj.name,
                    //Remove leading dot in main, so main paths are normalized,
                    //and remove any trailing .js, since different package
                    //envs have different conventions: some use a module name,
                    //some use a file name.
                    main: (pkgObj.main || 'main')
                        .replace(currDirRegExp, '')
                        .replace(jsSuffixRegExp, '')
                };
            });

            //Done with modifications, assing packages back to context config
            config.pkgs = pkgs;
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
    var paths, pkgs, pkg, pkgPath, syms, i, parentModule, url,
        parentPath,
        ext = '.js',
        jsExtRegExp = /^\/|:|\?|\.js$/;
    //If a colon is in the URL, it indicates a protocol is used and it is just
    //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
    //or ends with .js, then assume the user meant to use an url and not a module id.
    //The slash is important for protocol-less URLs as well as full paths.
    if (jsExtRegExp.test(moduleName)) {
        //Just a plain path, not module name lookup, so just return it.
        //Add extension if it is included. This is a bit wonky, only non-.js things pass
        //an extension, this method probably needs to be reworked.
        url = moduleName + ext;
    } else {
        //A module that needs to be converted to a path.
        paths = this.config.paths;
        pkgs = this.config.pkgs;

        syms = moduleName.split('/');
        //For each module name segment, see if there is a path
        //registered for it. Start with most specific name
        //and work up from it.
        for (i = syms.length; i > 0; i -= 1) {
            parentModule = syms.slice(0, i).join('/');
            pkg = pkgs[parentModule];
            parentPath = paths[parentModule];
            if (parentPath) {
                //If an array, it means there are a few choices,
                //Choose the one that is desired
                if (isArray(parentPath)) {
                    parentPath = parentPath[0];
                }
                syms.splice(0, i, parentPath);
                break;
            } else if (pkg) {
                //If module name is just the package name, then looking
                //for the main module.
                if (moduleName === pkg.name) {
                    pkgPath = pkg.location + '/' + pkg.main;
                } else {
                    pkgPath = pkg.location;
                }
                syms.splice(0, i, pkgPath);
                break;
            }
        }
        //Join the path parts together, then figure out if baseUrl is needed.
        url = syms.join('/');
        url += (ext || (/\?/.test(url) ? '' : '.js'));
        url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : this.config.baseUrl) + url;
    }

    return config.urlArgs ? url +
            ((url.indexOf('?') === -1 ? '?' : '&') +
                config.urlArgs) : url;
};

module.exports = BuildObj;