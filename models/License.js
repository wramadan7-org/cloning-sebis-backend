const mongoose = require("mongoose");

const licenseScheme = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	gradeId: {
		type: String,
		required: true
	},
	typeId: {	// Course ID
		type: String,
		required: true
	},
	disable: {	// 'enable'
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

module.exports = mongoose.model("License", licenseScheme);