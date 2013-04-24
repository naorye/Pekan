define([
	'Backbone',
	'sources/library-of-congress/models/image'
], function(Backbone, ImageModel) {
	var ImagesCollection = Backbone.Collection.extend({
		model: ImageModel,
		url: 'http://loc.gov/pictures/search/',
		parse: function(response) {
			return response.results;
		}
	});
	return ImagesCollection;
});
