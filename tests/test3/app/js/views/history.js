define([
	'jQuery',
	'Underscore',
	'Backbone',
	'app',
	'collections/queries',
	'text!templates/queries-list.html'
], function($, _, Backbone, app, QueriesCollection, queriesListTemplate) {
	var HistoryView = Backbone.View.extend({
		el: '#term-history',
		events: {
			'click a': 'setModel'
		},
		initialize: function() {
			this.queriesCollection = new QueriesCollection();
			this.model.on('change', this.addQuery, this);
		},
		addQuery: function(model) {
			this.queriesCollection.push(this.model.clone());
			this.render();
		},
		setModel: function(e) {
			var term = $(e.currentTarget).data('term');
			var sourceId = $(e.currentTarget).data('source');
			this.model.set( { term: term, sourceId: sourceId } );
		},
		template: _.template(queriesListTemplate),
		render: function() {
			this.$el.html(this.template({'queries': this.queriesCollection.toJSON()}));
		}
	});
	return HistoryView;
});
