(function() {
	var var0 = (function () {
	    return [1,2,3];
	}).apply(this, []);
	var var1 = (function (b) {
	    var a = function() {
	        return b;
	    };
	
	    return a;
	}).apply(this, [var0]);
})();