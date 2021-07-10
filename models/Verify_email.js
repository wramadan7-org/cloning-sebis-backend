const mongoose = require("mongoose");

const verifyEmailSchema = new mongoose.Schema({
	peopleId: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	status: {	// 0 = Process | 1 = Verified
		type: String,
		required: true
	},
	token: {
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

module.exports = mongoose.model("Verify_email", verifyEmailSchema);