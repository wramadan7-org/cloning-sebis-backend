const mongoose = require("mongoose");

const vaSchema = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	bank: {
		type: String,
		required: true
	},
	number: {
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

module.exports = mongoose.model("VirtualAccount", vaSchema);