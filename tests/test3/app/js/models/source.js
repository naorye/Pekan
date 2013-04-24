define([
	'Backbone'
], function(Backbone) {
	var SourceModel = Backbone.Model.extend({
		defaults: {
			id: '',
			name: '',
			view: null
		}
	});
	return SourceModel;
});