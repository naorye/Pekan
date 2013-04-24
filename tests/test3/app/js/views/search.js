define([
    'Underscore',
    'Backbone',
    'app',
    'text!templates/search.html'
], function(_, Backbone, app, searchTemplate) {
    var SearchView = Backbone.View.extend({
        el: '.search',
        events: {
            'click .search-button': 'setQuery'
        },
        searchTemplate: _.template(searchTemplate),
        optionTemplate: _.template("<option value='<%= id %>'><%= name %></option>"),
        initialize: function() {
            this.model.on('change', this.applyQuery, this);
            this.render();
        },
        setQuery: function() {
            var term = this.searchInput.val();
            var sourceId = this.sourceSelect.val();
            this.model.set( { term: term, sourceId: sourceId } );
        },
		applyQuery: function() {
			var term = this.model.get('term');
			var sourceId = this.model.get('sourceId');
			
			this.searchInput.val(term);
			this.sourceSelect.val(sourceId);
		},
        render: function() {
            this.$el.empty().append(this.searchTemplate());

            this.searchInput = this.$('.search-input');
            this.sourceSelect = this.$('.source-select');

			this.applyQuery();
            return this;
        },
        addSources: function(sourcesPool) {
            for (var id in sourcesPool) {
                this.sourceSelect.append(this.optionTemplate({
                    id: id,
                    name: sourcesPool[id].get("name")
                }));
            }
        }
    });
    return SearchView;
});