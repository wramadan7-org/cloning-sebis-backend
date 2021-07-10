const mongoose = require("mongoose");

const teachingExpSchema = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	fromDate: {
		type: String,
		required: true
	},
	toDate: {
		type: String,
		required: false
	},
	school: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: true
	},
	status: {
		type: String,
		required: false
	},
	desc: {
		type: String,
		required: false
	},
	grade: {
		type: String,
		required: true
	},
	course: {
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

module.exports = mongoose.model("Teaching_exp", teachingExpSchema);