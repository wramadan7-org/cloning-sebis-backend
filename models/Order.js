const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
	checkoutId: {
		type: String,
		required: true
	},
	payment_type: {
		type: String,
		required: true
	},
	codeNumber: {
		type: String,
		required: true
	},
	TransactionId: {
		type: String,
		required: true
	},
	statusTrans: {			// 0 - payment proses, 1 - success payment, 2 - failed payment
		type: String,
		required: true
	},
	identitiesId: {
		type: String,
		required: true
	},
	studyId: {
		type: String,
		required: true
	},
	clientId: {
		type: String,
		required: true
	},
	status: {			// private / group (1-2) / group (3-5)
		type: String,
		required: true
	},
	totalSchedule: {
		type: String,
		required: true
	},
	discountId: {
		type: String,
		required: false
	},
	discountAmount: {
		type: String,
		required: true
	},
	grossAmount: {
		type: String,
		required: true
	},
	request: {			// request description in course
		type: String,
		required: false
	},
	requestImg: {			// Request Image
		type: String,
		required: false
	},
	requestThumb: {			// Request Image Thumb
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

module.exports = mongoose.model("Order", orderSchema);