const mongoose = require("mongoose");

// original field is 'validate' (Cause error on mongoose library)
// new field name is 'validates' on Line 36


const peopleScheme = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	nameLetter: {
		type: String,
		required: false
	},
	nameEng: {
		type: String,
		required: false
	},
	secret: {
		type: String,
		required: false
	},
	sex: {
		type: String,
		required: false
	},
	phone: {
		type: String,
		required: false
	},
	password: {
		type: String,
		required: false
	},
	validates: {
		type: String,
		required: false
	},
	email: {
		type: String,
		required: true
	},
	avatar: {
		type: String,
		required: false
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

module.exports = mongoose.model("People", peopleScheme);