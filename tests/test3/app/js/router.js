define([
	'Backbone',
	'app'
], function(Backbone, app) {
	var Router = Backbone.Router.extend({
		routes: {
			'search/:sourceId/:term': 'searchImages'
		},
		searchImages: function(sourceId, term) {
			app.appQuery.set( { sourceId: sourceId, term: term } );
		}
	});
	return Router;
});
