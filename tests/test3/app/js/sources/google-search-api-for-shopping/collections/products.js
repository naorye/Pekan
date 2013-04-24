define([
	'Backbone',
	'sources/google-search-api-for-shopping/models/product'
], function(Backbone, ProductModel) {
	var ProductsCollection = Backbone.Collection.extend({
		model: ProductModel,
		url: 'https://www.googleapis.com/shopping/search/v1/public/products',
		parse: function(response) {
			return response.items;
		}
	});
	return ProductsCollection;
});
