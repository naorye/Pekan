define([ 'Backbone' ], function(Backbone) {
	var ProductModel = Backbone.Model.extend({
		defaults: {
			title: '',
			description: '',
			link: '',
			thumbnail: ''
		},
		parse: function(item) {
			var attrs = { };
			if (item && item.product) {
				var product = item.product;
				attrs.title = product.title || '';
				attrs.description = product.description || '';
				attrs.link = product.link || '';
				
				if (product.images && product.images.length > 0 &&
					product.images[0].status == 'available' &&
					product.images[0].thumbnails && product.images[0].thumbnails.length > 0) {
					attrs.thumbnail = product.images[0].thumbnails[0].link;
				}
			}
			return attrs;
		}
	});
	return ProductModel;
});