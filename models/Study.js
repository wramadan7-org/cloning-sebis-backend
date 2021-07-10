const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const studySchema = new mongoose.Schema({
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
	status: {	// Course ID
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

studySchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Study", studySchema);