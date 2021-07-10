const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const coursematerialScheme = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	gradeId: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	desc: {
		type: String,
		required: false
	},
	typeId: {	// B. INDONESIA | B. INGGRIS | MATEMATIKA | IPA | IPS | SAINS | ... | ...
		type: String,
		required: true
	},
	year: {
		type: String,
		required: false
	},
	status: {	// 0-Draft | 1-Submission | 2-Approved | 3-Rejected
		type: String,
		required: true
	},
	disable: {	// 'enable'
		type: String,
		required: true
	},
	delete: {	// 0 | 1
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

coursematerialScheme.plugin(mongoosePaginate);
module.exports = mongoose.model("Course_material", coursematerialScheme);