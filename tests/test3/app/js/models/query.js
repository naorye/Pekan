define([
	'Underscore',
	'Backbone'
], function(_, Backbone) {
	var QueryModel = Backbone.Model.extend({
		defaults: {
			term: '',
			sourceId: ''
		}
	});
	return QueryModel;
});