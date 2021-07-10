const mongoose = require("mongoose");

const usersScheme = new mongoose.Schema({
	roleId: {
		type: String,
		required: true
	},
	super: {
		type: String,
		required: true
	},
	platform: {
		type: String,
		required: true
	},
	operator: {
		type: String,
		required: true
	},
	manager: {
		type: String,
		required: true
	},
	compId: {
		type: String,
		required: true
	},
	partnerId: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	avatar: {
		type: String,
		required: true
	},
	api_token: {
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

module.exports = mongoose.model("Users", usersScheme);