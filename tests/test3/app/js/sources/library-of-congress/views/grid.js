define([
	'jQuery',
	'Underscore',
	'Backbone',
	'sources/library-of-congress/collections/images',
	'sources/library-of-congress/models/image',
	'text!sources/library-of-congress/templates/images.html',
	'tooltipster'
], function($, _, Backbone, ImagesCollection, ImageModel, imagesTemplate) {
	var GridView = Backbone.View.extend({
		tagName: 'div',
		template: _.template(imagesTemplate),
		initialize: function() {
			this.images = new ImagesCollection();
		},
		render: function(options) {
			this.images.fetch({
				dataType:'jsonp',
				data:{
					fo: 'json',
					q: options.term
				},
				success: _.bind(function(collection, response) {
					this.$el.empty();
					if (this.images.size() > 0) {
						this.$el.append(this.template({images: this.images.toJSON()}));
						this.$('img').tooltipster();
					} else {
						this.$el.text('No result found!');
					}
				}, this),
				error: _.bind(function(collection, xhr, options) {
					this.$el.text('Error get result!!');
				}, this)
			});
		}
	});
	return GridView;
});




