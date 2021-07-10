const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	desc: {
		type: String,
		required: false
	},
	nprice1: {
		type: String,
		required: true
	},
	nprice2: {
		type: String,
		required: false
	},
	nprice3: {
		type: String,
		required: false
	},
	nprice4: {
		type: String,
		required: false
	},
	nprice5: {
		type: String,
		required: false
	},
	oprice1: {
		type: String,
		required: false
	},
	oprice2: {
		type: String,
		required: false
	},
	oprice3: {
		type: String,
		required: false
	},
	oprice4: {
		type: String,
		required: false
	},
	oprice5: {
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

module.exports = mongoose.model("Price", priceSchema);