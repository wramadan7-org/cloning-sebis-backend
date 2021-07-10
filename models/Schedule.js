const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	studyId: {
		type: String,
		required: false
	},
	clientId: {
		type: String,
		required: false
	},
	dateStart: {
		type: String,
		required: true
	},
	dateEnd:{
		type: String,
		required: true
	},
	status: {				// 0-Ready, 1-Booked, 2-Progress, 3-Done
		type: String,
		required: true
	},
	updated_at: {
		type: String,
		required: true
	},
	created_at: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model("Schedule", scheduleSchema);