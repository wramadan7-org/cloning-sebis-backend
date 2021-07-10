const mongoose = require("mongoose");

const gradeScheme = new mongoose.Schema({
	name: {
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

module.exports = mongoose.model("Grade", gradeScheme);