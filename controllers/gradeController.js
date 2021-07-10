// DB
const Grade = require("../models/Grade");
const Kelas = require("../models/Kelas");
const Identities = require("../models/Identities");
const Imageurl = require("../models/Image_url");
const People = require("../models/People");
const Menu = require("../models/Menu");

function ucfirst(str) {
    var firstLetter = str.slice(0,1);
    return firstLetter.toUpperCase() + str.substring(1);
}

const dateTime = require('node-datetime');
var dt = dateTime.create();
var dateNow = dt.format('Y-m-d H:M:S');

var isGoogle = false;
const renderEJS = function(ContentData = {}, req, res, fileName, ContentMain= "", ContentScript ="", ContentHeader="content-header/main.ejs"){
	ContentData.Google = isGoogle;
	res.render(fileName, {ContentHeader,ContentScript ,ContentMain,ContentData});
};
  
module.exports = {
	addGrade: async (req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try {
			var grades = [
				'I',
				'II',
				'III',
				'IV',
				'V',
				'VI',
				'VII',
				'VIII',
				'IX',
				'X',
				'XI',
				'XII'
			];
			
			for(var x=0; x<grades.length; x++){
				var values = {
					name: grades[x],
					created_at: dateNow,
					updated_at: dateNow
				};
			
				await Grade.create(values);
			};
			res.status(200).send({ status: 'OK', message: 'Your data has been submitted' });
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	gradeView: async (req, res) => {
		var avatarThumb = '';
		var PName = '';
		var userType = '';
		var regId = req.cookies.regId;
		var Status = req.flash('postStatus');
		var msg = req.flash('postMessage');
		var currPage = req.flash('currPage');
		var nextNumber = req.flash('nextNumber');
		var userMenu = '';
		var tokens = req.csrfToken();
		
		msg = (msg < 1) ? '' : msg[0];
		Status = (Status < 1) ? '' : Status[0];
		
		
		if (regId === undefined || global.USERTYPE === undefined) {
			return res.redirect("/login");
		}
		
		if(nextNumber === undefined) nextNumber = 0;
		if(currPage === undefined || currPage < 1) currPage = 1;
		
		
		try{
			var getKelas = await Kelas.find().sort({name: 'asc'});
			var getIdentities = await Identities.findOne({ regId: regId });
			if(!getIdentities){
				res.clearCookie("regId");
				return res.redirect("/login");
			}
			var imageData = await Imageurl.findOne({identitiesId: getIdentities._id, type: 'profile'});
			if(imageData != '' && imageData != null && imageData !== undefined)
				avatarThumb = imageData.image;
			var getPeople = await People.findOne({ _id: getIdentities.peopleId });
			userType = getIdentities.userType;
			if(getIdentities.pushType == 'google') isGoogle = true;
			var userMenu = await Menu.find({userType: userType, disable: 'enable', parent: ''}).sort({name: 'asc'});
			var subMenu = [];
			for(var sm=0; sm<userMenu.length; sm++){
				var tempSub = await Menu.find({parent: userMenu[sm]._id}).sort({name: 'asc'});
				if(tempSub) subMenu.push(tempSub);
				else subMenu.push('');
			};
			if(userType == 'administrator' || userType == 'verifikator'){
				global.USERTYPE = userType;
			} else {
				return res.redirect('/home');
			}
			if(getPeople) PName = getPeople.name;
			var userMenu = await Menu.find({userType: userType, disable: 'enable', parent: ''}).sort({name: 'asc'});
			var subMenu = [];
			for(var sm=0; sm<userMenu.length; sm++){
				var tempSub = await Menu.find({parent: userMenu[sm]._id}).sort({name: 'asc'});
				if(tempSub) subMenu.push(tempSub);
				else subMenu.push('');
			};
			
			var valuesData = {
				getIdentities,
				getKelas,
				peopleName: PName, 
				userType: ucfirst(userType), 
				menu: userMenu, 
				submenu: subMenu, 
				Status, 
				msg, 
				tokens,
				avatarThumb,
			};
			
			new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-grade.ejs', '', 'content-header/grade-head.ejs');
		}catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	addKelas: async(req,res) => {
		var regId = req.cookies.regId;
		var ER = false;
		var ERmsg = '';
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			if(!getIdentities){
				res.clearCookie("regId");
				return res.redirect("/login");
			}
			userType = getIdentities.userType;
			if(userType == 'administrator' || userType == 'verifikator'){
				global.USERTYPE = userType;
			} else {
				return res.redirect('/home');
			}
			
			var {dataName, dataTingkat, dataSampai, dataKurikulum} = req.body;
			
			if(dataName === undefined || dataName == null || dataName == ''){
				ER = true;
				ERmsg = "Nama tidak boleh kosong!";
			}
			
			if(dataTingkat === undefined || dataTingkat == null || dataTingkat == ''){
				ER = true;
				ERmsg = "Harap isi tingkat kelas";
			}
			
			if(dataSampai === undefined || dataSampai == null || dataSampai == ''){
				ER = true;
				ERmsg = "Harap isi tingkat kelas";
			}
			
			if(dataKurikulum === undefined || dataKurikulum == null || dataKurikulum == ''){
				ER = true;
				ERmsg = "Harap isi kurikulum";
			}
			
			if(!ER){
				if(dataKurikulum != "0" && dataKurikulum != "1" && dataKurikulum != "2")
					dataKurikulum = "0";
				
				var values = {
					name: dataName.toUpperCase(),
					grade: dataTingkat,
					tograde: dataSampai,
					curriculum: dataKurikulum,
					disable: 'enable',
					created_at: dateNow,
					updated_at: dateNow
				};
				
				await Kelas.create(values);
				
				req.flash('postStatus', 'success');
				req.flash('postMessage', 'Tingkat kelas berhasil disimpan!');
			}else{
				req.flash('postStatus', 'error');
				req.flash('postMessage', ERmsg);
				
			}
			
			return res.redirect('/grade');
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/grade');
		};
	},
	
	switchKelas: async(req, res) => {
		var regId = req.cookies.regId;
		var ER = false;
		var ERmsg = '';
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			if(!getIdentities){
				res.clearCookie("regId");
				return res.redirect("/login");
			}
			userType = getIdentities.userType;
			if(userType == 'administrator' || userType == 'verifikator'){
				global.USERTYPE = userType;
			} else {
				return res.redirect('/home');
			}
			
			var {idKelas} = req.params;
			
			if(!ER){
				var dt = dateTime.create();
				var dateNow = dt.format('Y-m-d H:M:S');
				
				var getKelas = await Kelas.findOne({_id: idKelas});
				if(getKelas === undefined || getKelas == null || getKelas ==''){
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'ID Tidak ditemukan!');
				} else {
					var Status = getKelas.disable;
					var msg = '';
					
					if(Status == 'disable'){
						getKelas.disable = 'enable';
						msg = 'Tingkat kelas berhasil di aktifkan!';
					} else {
						getKelas.disable = 'disable';
						msg = 'Tingkat kelas berhasil di Non-aktifkan!';
					}
					
					await getKelas.save();
					
					req.flash('postStatus', 'success');
					req.flash('postMessage', msg);
				};
			}else{
				req.flash('postStatus', 'error');
				req.flash('postMessage', ERmsg);
			};
			
			return res.redirect('/grade');
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/grade');
		};
	},
	
	editKelas: async(req, res) => {
		var regId = req.cookies.regId;
		var ER = false;
		var ERmsg = '';
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			if(!getIdentities){
				res.clearCookie("regId");
				return res.redirect("/login");
			}
			userType = getIdentities.userType;
			if(userType == 'administrator' || userType == 'verifikator'){
				global.USERTYPE = userType;
			} else {
				return res.redirect('/home');
			}
			
			var {idKelas, EditdataName, EditdataTingkat, EditdataSampai, EditdataKurikulum} = req.body;
			
			if(idKelas === undefined || idKelas == null || idKelas == ''){
				ER = true;
				ERmsg = "Parameter ID tidak boleh kosong!";
			}
			
			if(EditdataName === undefined || EditdataName == null || EditdataName == ''){
				ER = true;
				ERmsg = "Nama tidak boleh kosong!";
			}
			
			if(EditdataTingkat === undefined || EditdataTingkat == null || EditdataTingkat == ''){
				ER = true;
				ERmsg = "Harap isi tingkat kelas";
			}
			
			if(EditdataSampai === undefined || EditdataSampai == null || EditdataSampai == ''){
				ER = true;
				ERmsg = "Harap isi tingkat kelas";
			}
			
			if(EditdataKurikulum === undefined || EditdataKurikulum == null || EditdataKurikulum == ''){
				ER = true;
				ERmsg = "Harap isi kurikulum";
			}
			
			if(!ER){
				var dt = dateTime.create();
				var dateNow = dt.format('Y-m-d H:M:S');

				if(EditdataKurikulum != "0" && EditdataKurikulum != "1" && EditdataKurikulum != "2")
					EditdataKurikulum = "0";
				
				var getKelas = await Kelas.findOne({_id: idKelas});
				if(getKelas === undefined || getKelas == null || getKelas ==''){
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'ID Tidak ditemukan!');
				} else {
					getKelas.name = EditdataName.toUpperCase();
					getKelas.grade = EditdataTingkat;
					getKelas.tograde = EditdataSampai;
					getKelas.curriculum = EditdataKurikulum;
					getKelas.updated_at = dateNow;
					
					await getKelas.save();
					
					req.flash('postStatus', 'success');
					req.flash('postMessage', 'Tingkat kelas berhasil disimpan!');
				};
			}else{
				req.flash('postStatus', 'error');
				req.flash('postMessage', ERmsg);
			};
			
			return res.redirect('/grade');
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/grade');
		};
	},
}