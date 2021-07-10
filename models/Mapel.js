const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const mapelScheme = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	kelasId: {
		type: String,
		required: true
	},
	curriculum: {	// 0 - Nasional, 1 - Cambridge, 2 - IB
		type: String,
		required: true
	},
	disable: {			// enable
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

mapelScheme.plugin(mongoosePaginate);
module.exports = mongoose.model("Mapel", mapelScheme);