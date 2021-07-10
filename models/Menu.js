const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const menuSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	parent:{
		type: String,
		required: false
	},
	uri: {
		type: String,
		required: true
	},
	html: {
		type: String,
		required: false
	},
	userType: {
		type: String,
		required: true
	},
	disable: {
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
menuSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Menu", menuSchema);