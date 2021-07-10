const mongoose = require("mongoose");

const certificateScheme = new mongoose.Schema({
	identityId: {
		type: String,
		required: true
	},
	no: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	issueDate: {
		type: String,
		required: true
	},
	expiryDate: {
		type: String,
		required: true
	},
	description: {
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

module.exports = mongoose.model("Certificate", certificateScheme);