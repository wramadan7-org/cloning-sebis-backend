const mongoose = require("mongoose");

const schedulesessionScheme = new mongoose.Schema({
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

module.exports = mongoose.model("Schedule_session", schedulesessionScheme);