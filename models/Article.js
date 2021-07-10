const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const articleScheme = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	tags: {
		type: String,
		required: false
	},
	title: {
		type: String,
		required: true
	},
	subtitle: {
		type: String,
		required: false
	},
	headerImage: {
		type: String,
		required: false
	},
	content: {
		type: String,
		required: true
	},
	published: {
		type: String,
		required: true
	},
	thumbnail: {
		type: String,
		required: false
	},
	created_at: {
		type: String,
		required: true
	},
	updated_at: {
		type: String,
		required: true
	}
});

articleScheme.plugin(mongoosePaginate);
module.exports = mongoose.model("Article", articleScheme);