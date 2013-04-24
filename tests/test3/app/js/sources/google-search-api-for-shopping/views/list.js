define([
	'jQuery',
	'Underscore',
	'Backbone',
	'sources/google-search-api-for-shopping/collections/products',
	'sources/google-search-api-for-shopping/models/product',
	'text!sources/google-search-api-for-shopping/templates/products.html'
], function($, _, Backbone, ProductsCollection, ProductModel, productsTemplate) {
	var ListView = Backbone.View.extend({
		template: _.template(productsTemplate),
		initialize: function() {
			this.products = new ProductsCollection();
		},
		render: function(options) {
			this.products.fetch({
				data:{
					key: 'AIzaSyDEMpzAwWS40E6TBjIA_XH76QfO0YSsvDc',
					country: 'US',
					fields: 'items(product(title,description,link,images(status,thumbnails(link))))',
					q: options.term,
					alt: 'json',
					thumbnails: '128:128'
				},
				success: _.bind(function(collection, response) {
					this.$el.empty();
					if (this.products.size() > 0) {
						this.$el.append(this.template({products: this.products.toJSON()}));
					} else {
						this.$el.text('No result found!');
					}
				}, this),
				error: _.bind(function(collection, xhr, options) {
					this.$el.empty().text('Error get result!!');
				}, this)
			});
		}
	});
	return ListView;
});