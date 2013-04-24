define([
	'Underscore',
	'Backbone',
	'models/query',
	'views/search',
	'views/history',
	'sources/sources-manager',
	'models/source',
	'sources/library-of-congress/views/grid',
	'sources/google-search-api-for-shopping/views/list'
], function(_, Backbone,
		QueryModel, SearchView, HistoryView,
		SourcesManager, SourceModel,
		LocGridView, GoogleListView) {

	var Application = function() { };

	_.extend(Application.prototype, {
		initialize: function (router) {
			this.router = router;
			this.appQuery = new QueryModel();

			this.appQuery.on('change', function(model, changes) {
				this.router.navigate(
					'/search/' + model.get('sourceId') + '/' + model.get('term'),
					{trigger: false } );
			}, this);

			this.searchView = new SearchView({
				model: this.appQuery
			});
			this.historyView = new HistoryView({
				model: this.appQuery
			});

			this.sourcesManager = new SourcesManager( {
				el: '.content',
				model: this.appQuery,
				sources: [
					new SourceModel({
						id: 'library-of-congress',
						name: 'Library Of Congress',
						view: LocGridView
					}),
					new SourceModel({
						id: 'google-shopping',
						name: 'Google Shopping',
						view: GoogleListView
					})
				]
			});

			this.searchView.addSources(this.sourcesManager.sourcesPool);
		}
	});

	return new Application();
});