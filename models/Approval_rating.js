const mongoose = require("mongoose");

const appRatingSchema = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	verifiedId: {
		type: String,
		required: false
	},
	rateName: {
		type: String,
		required: true
	},
	rateScore: {
		type: String,
		required: true
	},
	status: {
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

module.exports = mongoose.model("Approval_rating", appRatingSchema);