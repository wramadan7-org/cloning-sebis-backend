const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const identitiesScheme = new mongoose.Schema({
	compId: {
		type: String,
		required: true
	},
	// Usertype (public, student, parent, teacher, bteacher, pteacher)
	userType: {
		type: String,
		required: true
	},
	peopleId: {
		type: String,
		required: true
	},
	positionId: {
		type: String,
		required: false
	},
	titleId: {
		type: String,
		required: false
	},
	departId: {
		type: String,
		required: false
	},
	roleId: {
		type: String,
		required: false
	},
	ruleId: {
		type: String,
		required: false
	},
	number: {
		type: String,
		required: false
	},
	code: {
		type: String,
		required: false
	},
	secret: {
		type: String,
		required: false
	},
	disable: {
		type: String,
		required: true
	},
	balance: {
		type: String,
		required: false
	},
	groupType: {
		type: String,
		required: true
	},
	employDate: {
		type: String,
		required: false
	},
	leaveDate: {
		type: String,
		required: false
	},
	startTime: {
		type: String,
		required: false
	},
	endTime: {
		type: String,
		required: false
	},
	subscribe: {
		type: String,
		required: false
	},
	registed: {
		type: String,
		required: false
	},
	subscribeStart: {
		type: String,
		required: false
	},
	subscribeEnd: {
		type: String,
		required: false
	},
	api_token: {
		type: String,
		required: false
	},
	regId: {
		type: String,
		required: false
	},
	pushType: {
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

identitiesScheme.plugin(mongoosePaginate);
module.exports = mongoose.model("Identities", identitiesScheme);