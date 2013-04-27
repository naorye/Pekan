var fs = require('fs'),
    ArgumentsParser = require('./utils/arguments-parser'),
    VariablesNamesGenerator = require('./utils/variables-names-generator'),
    DependenciesRegistrar = require('./utils/dependencies-registrar');
    BuildObj = require('./utils/build-obj'),
    ConcatenateWriter = require('./utils/concatenate-writer'),
    compressor = require('node-minify');

var app = {
    evaluateContent: function(content) {
        return (new Function('with(this) { return ' + content + ' }')).call(this);
    },
    resolveModule: function (filePath) {
        console.log('Fetching ' + filePath + ' with depth ' + this.readDepth);
        if (!fs.existsSync(filePath)) {
            console.log('JS File ' + filePath + ' is not exists.');
            return false;
        }

        this.readDepth++;

        var content = fs.readFileSync(filePath, 'utf8'),
            evalResult = null;

        try {
            evalResult = this.evaluateContent(content);
        } catch(e) {
            if (e instanceof SyntaxError) {
                console.log('Syntax error while trying to read ' + filePath + '.');
                return false;
            }
            throw e;
        }

        if (evalResult.content !== null) {
            this.writer.incIndent();
            this.writer.appendLine(evalResult.content);
            this.writer.decIndent();
        }

        this.readDepth--;
        return evalResult;
    },
    fetchJSDependencies: function(dependencies) {
        var evalResults = [];
        for (var i = 0; i < dependencies.length; i++) {
            var filePath = this.buildObj.getDependencyPath(dependencies[i] + '.js');
            if (this.dependenciesRegistrar.isLoaded(filePath)) {
                evalResults.push(this.dependenciesRegistrar.getLoaded(filePath));
            } else if (this.dependenciesRegistrar.isLoading(filePath)) {
                console.log('Circular dependency: ' + filePath);
                return false;
            } else {
                this.dependenciesRegistrar.registerLoading(filePath);
                var evalResult = this.resolveModule(filePath);
                if (!evalResult) {
                    return false;
                }
                this.dependenciesRegistrar.registerLoaded(filePath, evalResult);
                evalResults.push(evalResult);
            }
        }
        return evalResults;
    },
    define: function() {
        var defineArgsParser = new ArgumentsParser({
            '2': ['dependencies', 'callback'],
            '3': ['moduleName', 'dependencies', 'callback'],
            noMapMessage: 'define expect 2 or 3 arguments.',
            defaults: {
                moduleName: null,
                dependencies: [],
                callback: function() {}
            }
        });
        if (!defineArgsParser.parse(arguments)) {
            return false;
        }

        var evalResults = this.fetchJSDependencies(defineArgsParser.args.dependencies);
        if (!evalResults) {
            return false;
        }

        var currentVariable = this.namesGenerator.getNext(),
            varDefine = 'var ' + currentVariable,
            callback = defineArgsParser.args.callback.toString(),
            args = [];

        for (var i = 0; i < evalResults.length; i++) {
            args.push(evalResults[i].variable);
        }

        return {
            content: varDefine + ' = (' + callback + ').apply(this, [' + args.toString() + ']);',
            variable: currentVariable
        };
    },
    require: function() {
        var defineArgsParser = new ArgumentsParser({
            '1': ['dependencies'],
            '2': ['dependencies', 'callback'],
            '3': ['moduleName', 'dependencies', 'callback'],
            noMapMessage: 'define expect 1, 2 or 3 arguments.',
            defaults: {
                moduleName: null,
                dependencies: [],
                callback: null
            }
        });
        if (!defineArgsParser.parse(arguments)) {
            return false;
        }

        var evalResults = this.fetchJSDependencies(defineArgsParser.args.dependencies);
        if (!evalResults) {
            return false;
        }

        var content = null, args = [];
        for (var i = 0; i < evalResults.length; i++) {
            args.push(evalResults.variable);
        }

        if (defineArgsParser.args.callback !== null) {
            content = '(' + defineArgsParser.args.callback.toString() + ').apply(this, [' + args.toString() + ']);';
        }

        return {
            content: content,
            variable: null
        };
    },
    initialize: function() {
        this.buildObj = new BuildObj();
        if (!this.buildObj.isValid) {
            return false;
        }

        this.readDepth = 0;
        this.namesGenerator = new VariablesNamesGenerator({}, 'pekan');
        this.dependenciesRegistrar = new DependenciesRegistrar();
        this.writer = new ConcatenateWriter(this.buildObj.getJSOutPath(), {
            functionWrap: true
        });

        this.resolveModule(this.buildObj.getJSInPath());
        this.writer.close();
        new compressor.minify({
            fileIn: this.config.getJSOutPath(),
            fileOut: this.config.getJSOutPath(),
    }
};

app.initialize();