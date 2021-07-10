const mongoose = require("mongoose");

const karyawanScheme = new mongoose.Schema({
	nama: {
		type: String,
		required: true
	},
	nik: {
		type: Number,
		required: true
	},
	jabatan: {
		type: String,
		required: true
	},
	divisi: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model("Karyawan", karyawanScheme);