const mongoose = require("mongoose");

const kelasScheme = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	grade: {
		type: String,
		required: true
	},
	tograde: {
		type: String,
		required: true
	},
	curriculum: {	// 0 - Nasional, 1 - Cambridge, 2 - IB
		type: String,
		required: true
	},
	disable: { // enable
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

module.exports = mongoose.model("Kelas", kelasScheme);