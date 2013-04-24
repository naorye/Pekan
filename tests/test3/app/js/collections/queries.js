define([
	'Underscore',
	'Backbone',
	'models/query'
], function(_, Backbone, QueryModel) {
	var QueriesCollection = Backbone.Collection.extend({
		model: QueryModel
	});
	return QueriesCollection;
});
