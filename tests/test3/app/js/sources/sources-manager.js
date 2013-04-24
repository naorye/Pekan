define([
	'jQuery',
	'Underscore',
	'Backbone',
	'text!templates/loading.html'
], function($, _, Backbone, loadingTemplate) {

	var SourcesManager = Backbone.View.extend({
		loadingTemplate: _.template(loadingTemplate),
		initialize: function(options) {
			this.model.on('change', this.render, this);
			this.sourcesPool = { };
			if (options.sources) {
				for ( var i = 0; i < options.sources.length; i++ ) {
					this.addSource(options.sources[i]);
				}
			}
		},
		render: function(model, changes) {
			var sourceId = this.model.get('sourceId');
			var sourceModel = this.sourcesPool[sourceId];
			if (!sourceModel) {
				console.log('Source ' + sourceId + ' not found!');
				return;
			}

			var term = this.model.get('term');
			var viewType = sourceModel.get('view');
			var view = new viewType({
				el: this.el
			});

			console.log('Rendering ' + sourceId + ' with term "'+ term + '"');

			this.$el.empty().append(this.loadingTemplate());
			view.render({ term: term });
		},
		addSource: function(sourceModel) {
			var sourceId = sourceModel.get('id');
			this.sourcesPool[sourceId] = sourceModel;
			console.log('Adding source ' + sourceId + ' to the sources pool');
		}
	});

	return SourcesManager;
});