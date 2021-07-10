const Karyawan = require("../models/Karyawan");

module.exports = {
	viewApi: async (req, res) => {
		try{
			const karyawan = await Karyawan.find();
			res.json({
				'status': 200,
				'messages': 'OK',
				'data': karyawan
			});
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	  
    },
	
	addApi: async(req, res) => {
		try{
			const { nama, nik, jabatan, divisi } = req.body;
			await Karyawan.create({ nama, nik, jabatan, divisi });
			
			res.json({
				'status': 200,
				'messages': 'OK',
				'data': 'Add karyawan success!'
			});
			
		} catch(error){
			res.json({
				'status' : 500,
				'messages' : 'Failed',
				'data' : error.message
			});
		};
	},
	
	editApi: async(req, res) => {
		try{
			const { id, nama, nik, jabatan, divisi } = req.body;
			const karyawan = await Karyawan.findOne({ _id: id });
			
			karyawan.nama = nama;
		    karyawan.nik = nik;
		    karyawan.jabatan = jabatan;
		    karyawan.divisi = divisi;
	  
			await karyawan.save();
			
			var data = "Karyawan dengan NIK: ";
			data += nik;
			data += ", berhasil di edit!";
			
			res.json({
				'status' : 200,
				'messages' : 'OK',
				'data' : data
			});
		} catch(error){
			res.json({
				'status' : 500,
				'messages' : 'Failed',
				'data' : error.message
			});
		};
	},
	
	deleteApi: async (req, res) => {
		try{
			const { id } = req.params;
			const karyawan = await Karyawan.findOne({ _id: id });
			await karyawan.remove();
			
			var data = "NIK: ";
			data += karyawan.nik;
			data += ", Nama: ";
			data += karyawan.nama;
			data += ", Berhasil dihapus!";
			
			res.json({
				'status': 200,
				'messages': 'OK',
				'data': data
			});
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		}
	}
}