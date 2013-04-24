/*
 * DependenciesRegistrar register loading and loaded dependencies. Using this
 * you can mark and query whether a dependency is loading or already loaded.
 */
var DependenciesRegistrar = function() {
    this.loaded = {};
    this.loading = {};
};
DependenciesRegistrar.prototype.registerLoaded = function(depName, evalResult) {
    delete this.loading[depName];
    this.loaded[depName] = evalResult;
};
DependenciesRegistrar.prototype.registerLoading = function(depName) {
    this.loading[depName] = true;
};
DependenciesRegistrar.prototype.isLoaded = function(depName) {
    return depName in this.loaded;
};
DependenciesRegistrar.prototype.isLoading = function(depName) {
    return depName in this.loading;
};
DependenciesRegistrar.prototype.getLoaded = function(depName) {
    return this.loaded[depName];
};

module.exports = DependenciesRegistrar;