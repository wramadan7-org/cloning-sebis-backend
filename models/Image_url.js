const mongoose = require("mongoose");

const imageUrlSchema = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: false
	},
	image: {
		type: String,
		required: true
	},
	thumbnail: {
		type: String,
		required: true
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

module.exports = mongoose.model("Image_url", imageUrlSchema);