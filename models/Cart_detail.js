const mongoose = require("mongoose");

const cartDetailSchema = new mongoose.Schema({
	cartId: {
		type: String,
		required: true
	},
	scheduleId: {
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

module.exports = mongoose.model("Cart_detail", cartDetailSchema);