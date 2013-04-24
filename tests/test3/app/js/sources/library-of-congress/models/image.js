define([ 'Backbone' ], function(Backbone) {
	var ImageModel = Backbone.Model.extend({
		defaults: {
			src: '',
			title: 'none',
			alt: ''
		},
		parse: function(item) {
			return {title: item.title, src: item.image.square, alt: item.image.alt };
		}
	});
	return ImageModel;
});
