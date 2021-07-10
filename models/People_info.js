const mongoose = require("mongoose");

// original field is 'validate' (Cause error on mongoose library)
// new field name is 'validates' on Line 36


const peopleInfoSchema = new mongoose.Schema({
	peopleId: {
		type: String,
		required: true
	},
	cardId: {
		type: String,
		required: false
	},
	cardType: {
		type: String,
		required: false
	},
	cardNation: {
		type: String,
		required: false
	},
	marry: {
		type: String,
		required: false
	},
	education: {
		type: String,
		required: false
	},
	birthDate: {
		type: String,
		required: false
	},
	birthPlace: {
		type: String,
		required: false
	},
	drivingLicense: {
		type: String,
		required: false
	},
	nickName: {
		type: String,
		required: false
	},
	avatarUrl: {
		type: String,
		required: false
	},
	gender: {
		type: String,
		required: false
	},
	religion: {
		type: String,
		required: false
	},
	postalcode: {
		type: String,
		required: false
	},
	language: {
		type: String,
		required: false
	},
	address: {
		type: String,
		required: false
	},
	city: {
		type: String,
		required: false
	},
	province: {
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

module.exports = mongoose.model("People_info", peopleInfoSchema);