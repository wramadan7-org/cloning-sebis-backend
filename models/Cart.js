const mongoose = require("mongoose");

const cartScheme = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	studyId: {
		type: String,
		required: true
	},
	clientId: {
		type: String,
		required: true
	},
	totalSchedule: {
		type: String,
		required: true
	},
	status: {			// private / group (1-2) / group (3-5)
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

module.exports = mongoose.model("Cart", cartScheme);