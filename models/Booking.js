const mongoose = require("mongoose");

const bookingScheme = new mongoose.Schema({
	identityId: {
		type: String,
		required: true
	},
	courseId: {
		type: String,
		required: true
	},
	issuedBy: {
		type: String,
		required: true
	},
	scheduleId: {
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

module.exports = mongoose.model("Booking", bookingScheme);