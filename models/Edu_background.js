const mongoose = require("mongoose");

const eduBackgroundSchema = new mongoose.Schema({
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
		required: true
	},
	institution: { //univ min d3
		type: String,
		required: true
	},
	major: { //jurusan
		type: String,
		required: true
	},
	thesis: { //tugas akhir
		type: String,
		required: true
	},
	strata: { //rata2
		type: String,
		required: true
	},
	score: { //ipk
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

module.exports = mongoose.model("Edu_background", eduBackgroundSchema);