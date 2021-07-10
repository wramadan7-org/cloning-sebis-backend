const mongoose = require("mongoose");

const jadwalSchema = new mongoose.Schema({
	identitiesId: {
		type: String,
		required: true
	},
	day: {	// 0 - Sunday, 1 - Monday, 2 - Tuesday, 3 - Wednesday, 4 - Thursday, 5 - Friday, 6 - Saturday
		type: String,
		required: true
	},
	dateStart: {
		type: String,
		required: true
	},
	dateEnd:{
		type: String,
		required: true
	},
	updated_at: {
		type: String,
		required: true
	},
	created_at: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model("Jadwal", jadwalSchema);