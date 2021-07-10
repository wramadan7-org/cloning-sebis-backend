const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema({
	orderId: {
		type: String,
		required: true
	},
	scheduleId: {
		type: String,
		required: true
	},
	price: {
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

module.exports = mongoose.model("Order_detail", orderDetailSchema);