const mongoose = require("mongoose");

const identity_relationsScheme = new mongoose.Schema({
	identityId: {
		type: String,
		required: true
	},
	relationId: {
		type: String,
		required: true
	},
	relationType: {
		type: String,
		required: true
	},
	relationName: {
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

module.exports = mongoose.model("Identity_relations", identity_relationsScheme);