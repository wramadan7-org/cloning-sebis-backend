// DB
const People = require("../models/People");
const PeopleInfo = require("../models/People_info");
const Identities = require("../models/Identities");
const Crs = require("../models/Course");
const Study = require("../models/Study");
const Grade = require("../models/Grade");
const Menu = require("../models/Menu");
const Imageurl = require("../models/Image_url");
const TeachExp = require("../models/Teaching_exp");
const VerifyEmail = require("../models/Verify_email");
const EduBackground = require("../models/Edu_background");

const bcrypt = require('bcrypt'); 
const fs = require('fs');
const sharp = require('sharp');
var path = require('path');
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
const nodemailer = require("nodemailer");

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
	viewProfile: async (req, res) => {
		var avatarThumb = '';
		var	selfieThumb = '';
		var cardThumb = '';
		var certificateThumb = '';
		var PName = '';
		var userType = '';
		var regId = req.cookies.regId;
		var Status = req.flash('postStatus');
		var msg = req.flash('postMessage');
		var currPage = req.flash('currPage');
		//var nextNumber = req.flash('nextNumber');
		var userMenu = '';
		var tokens = req.csrfToken();
		var baseurl = 'https://'+req.get('host');
		
		msg = (msg < 1) ? '' : msg[0];
		Status = (Status < 1) ? '' : Status[0];
		
		if (regId === undefined || global.USERTYPE === undefined) {
			return res.redirect("/login");
		}
		
		if (regId === undefined) {
			return res.redirect("/login");
		};
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			if(!getIdentities){
				res.clearCookie("regId");
				return res.redirect("/login");
			}
			var getPeople = await People.findOne({ _id: getIdentities.peopleId });
			var getPeopleInfo = await PeopleInfo.findOne({peopleId: getPeople._id});
			var getTypeCourse = await Crs.find({disable: 'enable'}).sort({name: 'asc'});
			var getGrade = await Grade.find();
			var imageData = await Imageurl.find({identitiesId: getIdentities._id});
			var getVerifiyemail = await VerifyEmail.findOne({peopleId: getPeople._id});
			var emailStatus = false;
			
			if(getVerifiyemail !== undefined && getVerifiyemail != null){
				if(getVerifiyemail.status == "1") emailStatus = true;
			}
			
			if(imageData === undefined){
				var profileImg = '';
				var selfieImg = '';
				var idcardImg = '';
				var certificateImg = '';
			} else {
				var profileImg = imageData.find(o => o.type == 'profile');
				var selfieImg = imageData.find(o => o.type == 'selfie');
				var idcardImg = imageData.find(o => o.type == 'idcard');
				var certificateImg = imageData.find(o => o.type == 'certificate');
				
				if( profileImg === undefined) profileImg = '';
				if( selfieImg === undefined) selfieImg = '';
				if( idcardImg === undefined) idcardImg = '';
				if( certificateImg === undefined) certificateImg = '';
				
				if(profileImg !== undefined){
					avatarThumb = profileImg.image;
				};
				
				if(selfieImg !== undefined){
					selfieThumb = selfieImg.image;
				};
				
				if(idcardImg !== undefined){
					cardThumb = idcardImg.image;
				};
				
				if(certificateImg !== undefined){
					certificateThumb = certificateImg.image;
				};
				
			}
			
			userType = getIdentities.userType;
			if(getIdentities.pushType == 'google') isGoogle = true;
			
			/*
			if(userType != 'public'){
				global.USERTYPE = userType;
			} else {
				return res.redirect('/home');
			}
			*/
			
			var userMenu = await Menu.find({userType: userType, disable: 'enable', parent: ''}).sort({name: 'asc'});
			var subMenu = [];
			for(var sm=0; sm<userMenu.length; sm++){
				var tempSub = await Menu.find({parent: userMenu[sm]._id}).sort({name: 'asc'});
				if(tempSub) subMenu.push(tempSub);
				else subMenu.push('');
			};
			
			var getTeachExp = await TeachExp.find({identitiesId: getIdentities._id});
			var getEduBg = await EduBackground.find({identitiesId: getIdentities._id});
			if(getPeople) PName = getPeople.name;
			
			var valuesData = {
				getIdentities,
				getTeachExp,
				getEduBg,
				getGrade,
				getPeople,
				getPeopleInfo,
				profileImg,
				selfieImg,
				idcardImg,
				certificateImg,
				Status, 
				msg, 
				peopleName: PName, 
				userType: ucfirst(userType), 
				menu: userMenu, 
				submenu: subMenu,
				emailStatus,
				tokens,
				baseurl,
				avatarThumb,
				selfieThumb,
				cardThumb, 
				certificateThumb
			};
			//console.log(imageData);
			//new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-profile.ejs', 'js/datepicker.ejs', 'content-header/profile-head.ejs');
			new renderEJS(valuesData, req, res, 'admin/index_profile.ejs', '', '', '');
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	editRawData:async(req, res)=>{
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var ER = false;
		
		const { uid, emails } = req.params;
		var uRawData = req.body;
		
		try{
			var getIdentities = await Identities.findOne({_id: uid});
			//console.log(getIdentities);
			
			if(getIdentities == '' || getIdentities == null || getIdentities === undefined){
				res.status(500).send({message: 'ID Not Found!'});
			} else {
				var userType = getIdentities.userType;
				var getPeople = await People.findOne({_id: getIdentities.peopleId, email: emails});
				if(getPeople == '' || getPeople == null || getPeople === undefined){
					res.status(500).send({message: 'ID & Email Not Same!'});
				}else{
					var getPeopleInfo = await PeopleInfo.findOne({peopleId: getPeople._id});
					
					var rawJson = JSON.parse(JSON.stringify(uRawData));
					//console.log(rawJson.teaching_experiences.length);
					var userId				= getIdentities._id;
					var EditdataName 		= rawJson.name;
					var EditdataGender 		= rawJson.gender; 
					var EditdataAddress 	= rawJson.address;
					var EditdataProvince	= rawJson.state;
					var EditdataCity 		= rawJson.city;
					var EditdataPostal 		= rawJson.postal_code;
					var EditdataBPlace 		= rawJson.birth_place; 
					var EditdataBDate 		= rawJson.birth_date;
					var EditdataReligion 	= rawJson.religion; 
					var EditdataIDCNumber 	= rawJson.id_number;
					var EditdataIDCType 	= rawJson.id_type;
					var EditdataDesc 		= rawJson.about_me;
					var EditdataPhone 		= rawJson.phone;
					var EditdataYLink 		= rawJson.ytlink;
					var arrayTeach			= rawJson.teaching_experiences;
					var arrayEdu			= rawJson.educations;
					
					var tgl 				= EditdataBDate.substr(0, 2);
					var bln 				= EditdataBDate.substr(3, 2);
					var thn 				= EditdataBDate.substr(6, 4);
					var EditdataBDate 		= bln+"/"+tgl+"/"+thn;
					
					switch(EditdataIDCType){
						case 'ktp' :
							EditdataIDCType = 'ktp';
							break;
						case 'kitas' :
							EditdataIDCType = 'kitas';
							break;
						case 'sim' :
							EditdataIDCType = 'sim';
							break;
						case 'paspor' :
							EditdataIDCType = 'paspor';
							break;
						default :
							EditdataIDCType = '';
					};
					
					if(userType == 'public' || userType == 'rteacher')
						getIdentities.userType = 'pteacher';
					
					getPeople.name = ucfirst(EditdataName);
					getPeople.nameEng = EditdataDesc.substr(0, 160);
					getPeople.sex = EditdataGender;
					getPeople.phone = EditdataPhone;
					getPeople.updated_at = dateNow;
					getPeopleInfo.address = EditdataAddress;
					getPeopleInfo.province = EditdataProvince;
					getPeopleInfo.city = EditdataCity;
					getPeopleInfo.religion = EditdataReligion;
					getPeopleInfo.postalcode = EditdataPostal;
					getPeopleInfo.gender = EditdataGender;
					getPeopleInfo.birthDate = EditdataBDate;
					getPeopleInfo.birthPlace = EditdataBPlace;
					getPeopleInfo.avatarUrl = EditdataYLink;
					getPeopleInfo.cardId = EditdataIDCNumber;
					getPeopleInfo.cardType = EditdataIDCType;
					getPeopleInfo.updated_at = dateNow;
					await getIdentities.save();
					await getPeople.save();
					await getPeopleInfo.save();
					
					if(arrayTeach.length > 0){
						for(var t=0; t<arrayTeach.length; t++){
							var tempTech = arrayTeach[t];
							var TeachID 		= tempTech.tid;
							var TeachPorto 		= tempTech.portofolio;
							var TeachSchool 	= tempTech.school;
							var TeachCity 		= tempTech.city;
							var TeachGrade 		= tempTech.class;
							var TeachCourse 	= tempTech.subject;
							var TeachStatus 	= tempTech.teaching_status;
							var TeachFromDateV	= tempTech.from;
							var TeachToDateV  	= tempTech.to;
							
							if(TeachID != '' && TeachID != null && TeachID !== undefined){
								var searchTeach = await TeachExp.findOne({_id: TeachID});
								if(searchTeach === undefined || searchTeach == '' || searchTeach == null){
									var newValues = {
										identitiesId: userId,
										fromDate: TeachFromDateV,
										toDate: TeachToDateV,
										school: TeachSchool.toUpperCase(),
										city: TeachCity.toLowerCase(),
										status: TeachStatus.toLowerCase(),
										desc: TeachPorto,
										grade: TeachGrade,
										course: TeachCourse.toUpperCase(),
										created_at: dateNow,
										updated_at: dateNow
									};
									
									await TeachExp.create(newValues);
								}else{
									searchTeach.identitiesId = userId;
									searchTeach.fromDate = TeachFromDateV;
									searchTeach.toDate = TeachToDateV;
									searchTeach.school = TeachSchool.toUpperCase();
									searchTeach.city = TeachCity.toLowerCase();
									searchTeach.status = TeachStatus.toLowerCase();
									searchTeach.desc = TeachPorto;
									searchTeach.grade = TeachGrade;
									searchTeach.course = TeachCourse.toUpperCase();
									searchTeach.updated_at = dateNow;
									
									await searchTeach.save();
								};
							} else {
									var newValues = {
										identitiesId: userId,
										fromDate: TeachFromDateV,
										toDate: TeachToDateV,
										school: TeachSchool.toUpperCase(),
										city: TeachCity.toLowerCase(),
										status: TeachStatus.toLowerCase(),
										desc: TeachPorto,
										grade: TeachGrade,
										course: TeachCourse.toUpperCase(),
										created_at: dateNow,
										updated_at: dateNow
									};
									
									await TeachExp.create(newValues);
							};
							
						}; // End For()
					}; // End If()
					
					if(arrayEdu.length > 0 ){
						for(var e=0; e<arrayEdu.length; e++){
							var tempEdu = arrayEdu[e];
							
							var EduID			= tempEdu.eid;
							var EduMajors 		= tempEdu.major;
							var EduStrata 		= tempEdu.level;
							var EduCampus 		= tempEdu.college;
							var EduThesis 		= tempEdu.thesis;
							var EduFromDateV	= tempEdu.from;
							var EduToDateV 		= tempEdu.to;
							var EduScore 		= tempEdu.score;
					
							if(EduID != '' && EduID != null && EduID !== undefined){
								var searchEdu = await EduBackground.findOne({_id: EduID});
								if(searchEdu === undefined || searchEdu == '' || searchEdu == null){
									var newValues = {
										identitiesId: userId,
										fromDate: EduFromDateV,
										toDate: EduToDateV,
										institution: EduCampus.toUpperCase(),
										major: EduMajors.toUpperCase(),
										thesis: EduThesis.toLowerCase(),
										strata: EduStrata.toLowerCase(),
										score: EduScore,
										created_at: dateNow,
										updated_at: dateNow
									};
									
									await EduBackground.create(newValues);
								}else{
									searchEdu.identitiesId = userId;
									searchEdu.fromDate = EduFromDateV;
									searchEdu.toDate = EduToDateV;
									searchEdu.institution = EduCampus.toUpperCase();
									searchEdu.major = EduMajors.toUpperCase();
									searchEdu.thesis = EduThesis.toLowerCase();
									searchEdu.strata = EduStrata.toLowerCase();
									searchEdu.score = EduScore;
									searchEdu.updated_at = dateNow;
									
									await searchEdu.save();
								};
							} else {
								var newValues = {
									identitiesId: userId,
									fromDate: EduFromDateV,
									toDate: EduToDateV,
									institution: EduCampus.toUpperCase(),
									major: EduMajors.toUpperCase(),
									thesis: EduThesis.toLowerCase(),
									strata: EduStrata.toLowerCase(),
									score: EduScore,
									created_at: dateNow,
									updated_at: dateNow
								};
								
								await EduBackground.create(newValues);
							};
							
						}; // End For()
					}; // End If()
						
					//console.log(uRawData)
					res.status(200).json({data: uRawData});
				}
				
			}
		}catch(err){
			res.status(500).send({message: err.message});
		};
	},
	
	editBasicInfo: async(req, res)=>{
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var regId = req.cookies.regId;
		var ER = false;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			var getPeople = await People.findOne({ _id: getIdentities.peopleId });
			var getPeopleInfo = await PeopleInfo.findOne({peopleId: getPeople._id});
			
			if(getIdentities.userType == 'pteacher' || getIdentities.userType == 'bteacher'){
				req.flash('postStatus', 'error');
				req.flash('postMessage', 'Pengajuan menjadi tutor sedang dalam proses, harap tunggu sampai kami telah membatalkan/menyetujui pengajuan anda!');
			} else {
				var {
						EditdataName, 
						EditdataGender, 
						EditdataAddress, 
						EditdataProvince,
						EditdataCity,
						EditdataPostal,
						EditdataBPlace, 
						EditdataBDate, 
						EditdataReligion, 
						EditdataIDCNumber, 
						EditdataIDCType,
						EditdataDesc,
						EditdataPhone,
						EditdataYLink
					} = req.body;
					
				switch(EditdataGender){
					case 'male' :
						EditdataGender = 'male';
						break;
					case 'female' :
						EditdataGender = 'female';
						break;
					default :
						EditdataGender = '';
				};
				
				switch(EditdataReligion){
					case 'moslem' :
						EditdataReligion = 'moslem';
						break;
					case 'catholic' :
						EditdataReligion = 'catholic';
						break;
					case 'protestant' :
						EditdataReligion = 'protestant';
						break;
					case 'buddhist' :
						EditdataReligion = 'buddhist';
						break;
					case 'hinduism' :
						EditdataReligion = 'hinduism';
						break;
					default :
						EditdataReligion = '';
				};
				
				switch(EditdataIDCType){
					case 'ktp' :
						EditdataIDCType = 'ktp';
						break;
					case 'kitas' :
						EditdataIDCType = 'kitas';
						break;
					case 'sim' :
						EditdataIDCType = 'sim';
						break;
					case 'paspor' :
						EditdataIDCType = 'paspor';
						break;
					default :
						EditdataIDCType = '';
				};
				
				if(EditdataPhone === undefined) EditdataPhone = '';
				if(EditdataPostal === undefined) EditdataPostal = '';
					
				if(!/^[0-9]{11,13}$/.test(EditdataPhone)){
					ER = true;
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'Mohon no HP diisi dengan nomer yang valid!');
				};
				
				if(!/^[0-9]{5}$/.test(EditdataPostal)){
					ER = true;
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'Kode POS harap diisi dengan benar!');
				};
				
				if(EditdataName === undefined){
					ER = true;
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'Nama tidak boleh kosong!');
				};
				
				if(!ER){
					if(EditdataAddress === undefined) EditdataAddress = '';
					if(EditdataProvince === undefined) EditdataProvince = '';
					if(EditdataCity === undefined) EditdataCity = '';
					if(EditdataBPlace === undefined) EditdataBPlace = '';
					if(EditdataBDate === undefined) EditdataBDate = '';
					if(EditdataIDCNumber === undefined) EditdataIDCNumber = '';
					if(EditdataDesc === undefined) EditdataDesc = '';
					if(EditdataYLink === undefined) EditdataYLink = '';
					
					getPeople.name = ucfirst(EditdataName);
					getPeople.nameEng = EditdataDesc.substr(0, 160);
					getPeople.sex = EditdataGender;
					getPeople.phone = EditdataPhone;
					getPeople.updated_at = dateNow;
					getPeopleInfo.address = EditdataAddress;
					getPeopleInfo.province = EditdataProvince;
					getPeopleInfo.city = EditdataCity;
					getPeopleInfo.religion = EditdataReligion;
					getPeopleInfo.postalcode = EditdataPostal;
					getPeopleInfo.gender = EditdataGender;
					getPeopleInfo.birthDate = EditdataBDate;
					getPeopleInfo.birthPlace = EditdataBPlace;
					getPeopleInfo.avatarUrl = EditdataYLink;
					getPeopleInfo.cardId = EditdataIDCNumber;
					getPeopleInfo.cardType = EditdataIDCType;
					getPeopleInfo.updated_at = dateNow;
					await getPeople.save();
					await getPeopleInfo.save();
					
					req.flash('postStatus', 'success');
					req.flash('postMessage', 'Data pribadi berhasil disimpan!');
				};
			}
			return res.redirect('/profile');
		}catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	checkImg: async(req, res)=>{
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var ER = false;
		
		const { uid, emails } = req.params;
		var {imgProfile, imgSelfie, imgIDCard, imgCertificate} = req.files;
		
		try{
			var getIdentities = await Identities.findOne({_id: uid});
			//console.log(getIdentities);
			var totImage = 0;
			
			if(getIdentities == '' || getIdentities == null || getIdentities === undefined){
				res.status(500).send({message: 'ID Not Found!'});
			} else {
				var getPeople = await People.findOne({_id: getIdentities.peopleId, email: emails});
				if(getPeople == '' || getPeople == null || getPeople === undefined){
					res.status(500).send({message: 'ID & Email Not Same!'});
				}else{
					if(imgProfile !== undefined){
						var typeImg = 'profile';
						totImage++;
						
						imgProfile = imgProfile[0];
						var fileType = path.extname(imgProfile.filename);
						var thumbFile = 'thumb-'+ getIdentities._id + fileType;
						var thumbPathDest = 'images/profile/thumbnails/' + thumbFile;
						var pathImage = 'images/profile/'+ getIdentities._id + fileType;
						var newPathImg = 'public/'+pathImage;
						
						var searchImg = await Imageurl.findOne({identitiesId: getIdentities._id, type: typeImg});
						//console.log(imgProfile);
						if(searchImg){
							var oldPathImg = 'public/' + searchImg.image;
							var OldThumbPath = 'public/' + searchImg.thumbnail;
							
							// Delete image
							if (fs.existsSync(oldPathImg)) {
								//console.log('Image Exist');
								fs.unlinkSync(oldPathImg);
							};
							// Delete Thumbnails
							if (fs.existsSync(OldThumbPath)) {
								//console.log('Thumbnail Exist');
								fs.unlinkSync(OldThumbPath);
							};

							searchImg.image = pathImage;
							searchImg.thumbnail = thumbPathDest;
							searchImg.updated_at = dateNow;
							
							await searchImg.save();
						} else {
							var newValues = {
								identitiesId: getIdentities._id,
								type: typeImg,
								description: '',
								image: pathImage,
								thumbnail: thumbPathDest,
								created_at: dateNow,
								updated_at: dateNow
							};
							
							await Imageurl.create(newValues);
						}
						
						// Rename Filename With ArticleID
						fs.rename( imgProfile.path, newPathImg, function (err){
							if (err) console.log(err);
						});
						
						sharp(newPathImg).resize(200, 200).toFile('public/' + thumbPathDest, (err, resizeImage) => {
							if (err) console.log(err);
						});
						
						//fs.unlinkSync(imgProfile.path);
						res.status(200).send({urlpath: pathImage});
					}
					
					if(imgSelfie !== undefined) {
						var typeImg = 'selfie';
						totImage++;
						imgSelfie = imgSelfie[0];
						var fileType = path.extname(imgSelfie.filename);
						var thumbFile = 'thumb-'+ getIdentities._id + fileType;
						var thumbPathDest = 'images/selfie/thumbnails/' + thumbFile;
						var pathImage = 'images/selfie/'+ getIdentities._id + fileType;
						var newPathImg = 'public/'+pathImage;
						
						var searchImg = await Imageurl.findOne({identitiesId: getIdentities._id, type: typeImg});
						//console.log(imgSelfie);
						if(searchImg){
							var oldPathImg = 'public/' + searchImg.image;
							var OldThumbPath = 'public/' + searchImg.thumbnail;
							
							// Delete image
							if (fs.existsSync(oldPathImg)) {
								//console.log('Image Exist');
								fs.unlinkSync(oldPathImg);
							};
							// Delete Thumbnails
							if (fs.existsSync(OldThumbPath)) {
								//console.log('Thumbnail Exist');
								fs.unlinkSync(OldThumbPath);
							};
							
							searchImg.image = pathImage;
							searchImg.thumbnail = thumbPathDest;
							searchImg.updated_at = dateNow;
							
							await searchImg.save();
						} else {
							var newValues = {
								identitiesId: getIdentities._id,
								type: typeImg,
								description: '',
								image: pathImage,
								thumbnail: thumbPathDest,
								created_at: dateNow,
								updated_at: dateNow
							};
							
							await Imageurl.create(newValues);
						}
						
						// Rename Filename With ArticleID
						fs.rename( imgSelfie.path, newPathImg, function (err){
							if (err) console.log(err);
						});
						
						sharp(newPathImg).resize(200, 200).toFile('public/' + thumbPathDest, (err, resizeImage) => {
							if (err) console.log(err);
						});
						
						//fs.unlinkSync(imgSelfie.path);
						res.status(200).send({urlpath: pathImage});
					}
					
					if(imgIDCard !== undefined) {
						var typeImg = 'idcard';
						totImage++;
						imgIDCard = imgIDCard[0];
						var fileType = path.extname(imgIDCard.filename);
						var thumbFile = 'thumb-'+ getIdentities._id + fileType;
						var thumbPathDest = 'images/idcard/thumbnails/' + thumbFile;
						var pathImage = 'images/idcard/'+ getIdentities._id + fileType;
						var newPathImg = 'public/'+pathImage;
						
						var searchImg = await Imageurl.findOne({identitiesId: getIdentities._id, type: typeImg});
						//console.log(imgIDCard);
						if(searchImg){
							var oldPathImg = 'public/' + searchImg.image;
							var OldThumbPath = 'public/' + searchImg.thumbnail;
							
							// Delete image
							if (fs.existsSync(oldPathImg)) {
								//console.log('Image Exist');
								fs.unlinkSync(oldPathImg);
							};
							// Delete Thumbnails
							if (fs.existsSync(OldThumbPath)) {
								//console.log('Thumbnail Exist');
								fs.unlinkSync(OldThumbPath);
							};
							
							searchImg.image = pathImage;
							searchImg.thumbnail = thumbPathDest;
							searchImg.updated_at = dateNow;
							
							await searchImg.save();
						} else {
							var newValues = {
								identitiesId: getIdentities._id,
								type: typeImg,
								description: '',
								image: pathImage,
								thumbnail: thumbPathDest,
								created_at: dateNow,
								updated_at: dateNow
							};
							
							await Imageurl.create(newValues);
						}
						
						// Rename Filename With ArticleID
						fs.rename( imgIDCard.path, newPathImg, function (err){
							if (err) console.log(err);
						});
						
						sharp(newPathImg).resize(200, 200).toFile('public/' + thumbPathDest, (err, resizeImage) => {
							if (err) console.log(err);
						});
						
						//fs.unlinkSync(imgIDCard.path);
						res.status(200).send({urlpath: pathImage});
					}
					
					if(imgCertificate !== undefined) {
						var typeImg = 'certificate';
						totImage++;
						imgCertificate = imgCertificate[0];
						var fileType = path.extname(imgCertificate.filename);
						var thumbFile = 'thumb-'+ getIdentities._id + fileType;
						var thumbPathDest = 'images/certificate/thumbnails/' + thumbFile;
						var pathImage = 'images/certificate/'+ getIdentities._id + fileType;
						var newPathImg = 'public/'+pathImage;
						
						var searchImg = await Imageurl.findOne({identitiesId: getIdentities._id, type: typeImg});
						//console.log(imgCertificate);
						if(searchImg){
							var oldPathImg = 'public/' + searchImg.image;
							var OldThumbPath = 'public/' + searchImg.thumbnail;
							
							// Delete image
							if (fs.existsSync(oldPathImg)) {
								//console.log('Image Exist');
								fs.unlinkSync(oldPathImg);
							};
							// Delete Thumbnails
							if (fs.existsSync(OldThumbPath)) {
								//console.log('Thumbnail Exist');
								fs.unlinkSync(OldThumbPath);
							};
							
							searchImg.image = pathImage;
							searchImg.thumbnail = thumbPathDest;
							searchImg.updated_at = dateNow;
							
							await searchImg.save();
						} else {
							var newValues = {
								identitiesId: getIdentities._id,
								type: typeImg,
								description: '',
								image: pathImage,
								thumbnail: thumbPathDest,
								created_at: dateNow,
								updated_at: dateNow
							};
							
							await Imageurl.create(newValues);
						}
						
						// Rename Filename With ArticleID
						fs.rename( imgCertificate.path, newPathImg, function (err){
							if (err) console.log(err);
						});
						
						sharp(newPathImg).resize(200, 200).toFile('public/' + thumbPathDest, (err, resizeImage) => {
							if (err) console.log(err);
						});
						
						//fs.unlinkSync(imgCertificate.path);
						res.status(200).send({urlpath: pathImage});
					}
					
					if(totImage == 0)
						res.status(200).send({data: 'No Data Retreive!'});
				}
			}
		}catch(err){
			res.status(500).send({message: err.message});
		};
	},
	
	remTeachExp: async(req, res) => {
		const { uid, emails, id } = req.params;
		try{
			var getIdentities = await Identities.findOne({_id: uid});
			
			if(getIdentities == '' || getIdentities == null || getIdentities === undefined){
				res.status(500).send({message: 'ID Not Found!'});
			} else {
				var getPeople = await People.findOne({_id: getIdentities.peopleId, email: emails});
				if(getPeople == '' || getPeople == null || getPeople === undefined){
					res.status(500).send({message: 'ID & Email Not Same!'});
				} else {
					var getTeachExp = await TeachExp.findOne({_id: id, identitiesId: getIdentities._id});
					if(getTeachExp === undefined || getTeachExp == '' || getTeachExp == null){
						res.status(500).send({message: 'Teaching Experience Not Found!'});
					} else {
						await getTeachExp.remove();
						res.status(200).send({messsage: 'OK'});
					}
				}
			}
		}catch(err){
			res.status(500).send({message: err.message});
		};
	},
	
	remEduBgn: async(req, res) => {
		const { uid, emails, id } = req.params;
		try{
			var getIdentities = await Identities.findOne({_id: uid});
			
			if(getIdentities == '' || getIdentities == null || getIdentities === undefined){
				res.status(500).send({message: 'ID Not Found!'});
			} else {
				var getPeople = await People.findOne({_id: getIdentities.peopleId, email: emails});
				if(getPeople == '' || getPeople == null || getPeople === undefined){
					res.status(500).send({message: 'ID & Email Not Same!'});
				} else {
					var getEduBgn = await EduBackground.findOne({_id: id, identitiesId: getIdentities._id});
					if(getEduBgn === undefined || getEduBgn == '' || getEduBgn == null){
						res.status(500).send({message: 'Education Background Not Found!'});
					} else {
						await getEduBgn.remove();
						res.status(200).send({messsage: 'OK'});
					}
				}
			}
		}catch(err){
			res.status(500).send({message: err.message});
		};
	},
	
	editImage: async(req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var regId = req.cookies.regId;
		try{
			var totImage = 0;
			var getIdentities = await Identities.findOne({ regId: regId });
			//var {dataCategory, dataTags, dataTitle, dataSubtitle, dataContentCK, published} = req.body;
			var {imgProfile, imgSelfie, imgIDCard, imgCertificate} = req.files;
			//var thumbnImage = '';
			if(getIdentities.userType == 'pteacher' || getIdentities.userType == 'bteacher'){
				req.flash('postStatus', 'error');
				req.flash('postMessage', 'Pengajuan menjadi tutor sedang dalam proses, harap tunggu sampai kami telah membatalkan/menyetujui pengajuan anda!');
			} else {
				if(imgProfile !== undefined){
					var typeImg = 'profile';
					totImage++;
					
					imgProfile = imgProfile[0];
					var fileType = path.extname(imgProfile.filename);
					var thumbFile = 'thumb-'+ getIdentities._id + fileType;
					var thumbPathDest = 'images/profile/thumbnails/' + thumbFile;
					var pathImage = 'images/profile/'+ getIdentities._id + fileType;
					var newPathImg = 'public/'+pathImage;
					
					var searchImg = await Imageurl.findOne({identitiesId: getIdentities._id, type: typeImg});
					
					if(searchImg){
						var oldPathImg = 'public/' + searchImg.image;
						var OldThumbPath = 'public/' + searchImg.thumbnail;
						
						// Delete image
						if (fs.existsSync(oldPathImg)) {
							//console.log('Image Exist');
							fs.unlinkSync(oldPathImg);
						};
						// Delete Thumbnails
						if (fs.existsSync(OldThumbPath)) {
							//console.log('Thumbnail Exist');
							fs.unlinkSync(OldThumbPath);
						};

						searchImg.image = pathImage;
						searchImg.thumbnail = thumbPathDest;
						searchImg.updated_at = dateNow;
						
						await searchImg.save();
					} else {
						var newValues = {
							identitiesId: getIdentities._id,
							type: typeImg,
							description: '',
							image: pathImage,
							thumbnail: thumbPathDest,
							created_at: dateNow,
							updated_at: dateNow
						};
						
						await Imageurl.create(newValues);
					}
					
					// Rename Filename With ArticleID
					fs.rename( imgProfile.path, newPathImg, function (err){
						if (err) console.log(err);
					});
					
					sharp(newPathImg).resize(200, 200).toFile('public/' + thumbPathDest, (err, resizeImage) => {
						if (err) console.log(err);
					});
					
					//fs.unlinkSync(imgProfile.path);
				}
				
				if(imgSelfie !== undefined) {
					var typeImg = 'selfie';
					totImage++;
					imgSelfie = imgSelfie[0];
					var fileType = path.extname(imgSelfie.filename);
					var thumbFile = 'thumb-'+ getIdentities._id + fileType;
					var thumbPathDest = 'images/selfie/thumbnails/' + thumbFile;
					var pathImage = 'images/selfie/'+ getIdentities._id + fileType;
					var newPathImg = 'public/'+pathImage;
					
					var searchImg = await Imageurl.findOne({identitiesId: getIdentities._id, type: typeImg});
					if(searchImg){
						var oldPathImg = 'public/' + searchImg.image;
						var OldThumbPath = 'public/' + searchImg.thumbnail;
						
						// Delete image
						if (fs.existsSync(oldPathImg)) {
							//console.log('Image Exist');
							fs.unlinkSync(oldPathImg);
						};
						// Delete Thumbnails
						if (fs.existsSync(OldThumbPath)) {
							//console.log('Thumbnail Exist');
							fs.unlinkSync(OldThumbPath);
						};
						
						searchImg.image = pathImage;
						searchImg.thumbnail = thumbPathDest;
						searchImg.updated_at = dateNow;
						
						await searchImg.save();
					} else {
						var newValues = {
							identitiesId: getIdentities._id,
							type: typeImg,
							description: '',
							image: pathImage,
							thumbnail: thumbPathDest,
							created_at: dateNow,
							updated_at: dateNow
						};
						
						await Imageurl.create(newValues);
					}
					
					// Rename Filename With ArticleID
					fs.rename( imgSelfie.path, newPathImg, function (err){
						if (err) console.log(err);
					});
					
					sharp(newPathImg).resize(200, 200).toFile('public/' + thumbPathDest, (err, resizeImage) => {
						if (err) console.log(err);
					});
					
					//fs.unlinkSync(imgSelfie.path);
				}
				
				if(imgIDCard !== undefined) {
					var typeImg = 'idcard';
					totImage++;
					imgIDCard = imgIDCard[0];
					var fileType = path.extname(imgIDCard.filename);
					var thumbFile = 'thumb-'+ getIdentities._id + fileType;
					var thumbPathDest = 'images/idcard/thumbnails/' + thumbFile;
					var pathImage = 'images/idcard/'+ getIdentities._id + fileType;
					var newPathImg = 'public/'+pathImage;
					
					var searchImg = await Imageurl.findOne({identitiesId: getIdentities._id, type: typeImg});
					if(searchImg){
						var oldPathImg = 'public/' + searchImg.image;
						var OldThumbPath = 'public/' + searchImg.thumbnail;
						
						// Delete image
						if (fs.existsSync(oldPathImg)) {
							//console.log('Image Exist');
							fs.unlinkSync(oldPathImg);
						};
						// Delete Thumbnails
						if (fs.existsSync(OldThumbPath)) {
							//console.log('Thumbnail Exist');
							fs.unlinkSync(OldThumbPath);
						};
						
						searchImg.image = pathImage;
						searchImg.thumbnail = thumbPathDest;
						searchImg.updated_at = dateNow;
						
						await searchImg.save();
					} else {
						var newValues = {
							identitiesId: getIdentities._id,
							type: typeImg,
							description: '',
							image: pathImage,
							thumbnail: thumbPathDest,
							created_at: dateNow,
							updated_at: dateNow
						};
						
						await Imageurl.create(newValues);
					}
					
					// Rename Filename With ArticleID
					fs.rename( imgIDCard.path, newPathImg, function (err){
						if (err) console.log(err);
					});
					
					sharp(newPathImg).resize(200, 200).toFile('public/' + thumbPathDest, (err, resizeImage) => {
						if (err) console.log(err);
					});
					
					//fs.unlinkSync(imgIDCard.path);
				}
				
				if(imgCertificate !== undefined) {
					var typeImg = 'certificate';
					totImage++;
					imgCertificate = imgCertificate[0];
					var fileType = path.extname(imgCertificate.filename);
					var thumbFile = 'thumb-'+ getIdentities._id + fileType;
					var thumbPathDest = 'images/certificate/thumbnails/' + thumbFile;
					var pathImage = 'images/certificate/'+ getIdentities._id + fileType;
					var newPathImg = 'public/'+pathImage;
					
					var searchImg = await Imageurl.findOne({identitiesId: getIdentities._id, type: typeImg});
					if(searchImg){
						var oldPathImg = 'public/' + searchImg.image;
						var OldThumbPath = 'public/' + searchImg.thumbnail;
						
						// Delete image
						if (fs.existsSync(oldPathImg)) {
							//console.log('Image Exist');
							fs.unlinkSync(oldPathImg);
						};
						// Delete Thumbnails
						if (fs.existsSync(OldThumbPath)) {
							//console.log('Thumbnail Exist');
							fs.unlinkSync(OldThumbPath);
						};
						
						searchImg.image = pathImage;
						searchImg.thumbnail = thumbPathDest;
						searchImg.updated_at = dateNow;
						
						await searchImg.save();
					} else {
						var newValues = {
							identitiesId: getIdentities._id,
							type: typeImg,
							description: '',
							image: pathImage,
							thumbnail: thumbPathDest,
							created_at: dateNow,
							updated_at: dateNow
						};
						
						await Imageurl.create(newValues);
					}
					
					// Rename Filename With ArticleID
					fs.rename( imgCertificate.path, newPathImg, function (err){
						if (err) console.log(err);
					});
					
					sharp(newPathImg).resize(200, 200).toFile('public/' + thumbPathDest, (err, resizeImage) => {
						if (err) console.log(err);
					});
					
					//fs.unlinkSync(imgCertificate.path);
				}
				
				req.flash('postStatus', 'success');
				req.flash('postMessage', 'Foto berhasil disimpan!');
			}
			return res.redirect('/profile');
		}catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	addTeachExp: async(req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var regId = req.cookies.regId;
		var ER = false;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			var {
					TeachPorto,
					TeachSchool, 
					TeachCity, 
					TeachGrade, 
					TeachCourse,
					TeachStatus,
					TeachFromDateV, 
					TeachToDateV
				} = req.body;
				
				if(TeachSchool === undefined || TeachSchool=='') ER = true;
				if(TeachCity === undefined || TeachCity=='') ER = true;
				if(TeachGrade === undefined || TeachGrade=='') ER = true;
				if(TeachCourse === undefined || TeachCourse=='') ER = true;
				if(TeachStatus === undefined || TeachStatus=='') ER = true;
				if(TeachFromDateV === undefined || TeachFromDateV=='') ER = true;
				if(TeachToDateV === undefined) TeachToDateV = '';
				if(TeachPorto === undefined) TeachPorto = '';
				
				if(!ER){
					if(getIdentities.userType == 'pteacher' || getIdentities.userType == 'bteacher'){
						req.flash('postStatus', 'error');
						req.flash('postMessage', 'Pengajuan menjadi tutor sedang dalam proses, harap tunggu sampai kami telah membatalkan/menyetujui pengajuan anda!');
					} else {
						var newValues = {
							identitiesId: getIdentities._id,
							fromDate: TeachFromDateV,
							toDate: TeachToDateV,
							school: TeachSchool.toUpperCase(),
							city: TeachCity.toLowerCase(),
							status: TeachStatus.toLowerCase(),
							desc: TeachPorto,
							grade: TeachGrade,
							course: TeachCourse.toUpperCase(),
							created_at: dateNow,
							updated_at: dateNow
						};
						
						await TeachExp.create(newValues);
						
						req.flash('postStatus', 'success');
						req.flash('postMessage', 'Pengalaman mengajar sudah ditambahkan!');
					}
					return res.redirect('/profile');
				}else{
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'Semua formulir harus diisi terlebih dahulu!');
					return res.redirect('/profile');
				}
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/profile');
		};
	},
	
	addEduBackground: async(req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var regId = req.cookies.regId;
		var ER = false;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			var {
					EduMajors, 
					EduStrata, 
					EduCampus, 
					EduThesis,
					EduFromDateV,
					EduToDateV, 
					EduScore
				} = req.body;
				
				if(EduMajors === undefined || EduMajors=='') ER = true;
				if(EduStrata === undefined || EduStrata=='') ER = true;
				if(EduCampus === undefined || EduCampus=='') ER = true;
				if(EduThesis === undefined || EduThesis=='') ER = true;
				if(EduFromDateV === undefined || EduFromDateV=='') ER = true;
				if(EduToDateV === undefined || EduToDateV=='') ER = true;
				if(EduScore === undefined || EduScore=='') ER = true;
				
				if(!ER){
					if(getIdentities.userType == 'pteacher' || getIdentities.userType == 'bteacher'){
						req.flash('postStatus', 'error');
						req.flash('postMessage', 'Pengajuan menjadi tutor sedang dalam proses, harap tunggu sampai kami telah membatalkan/menyetujui pengajuan anda!');
					} else {
						var newValues = {
							identitiesId: getIdentities._id,
							fromDate: EduFromDateV,
							toDate: EduToDateV,
							institution: EduCampus.toUpperCase(),
							major: EduMajors.toUpperCase(),
							thesis: EduThesis.toLowerCase(),
							strata: EduStrata.toLowerCase(),
							score: EduScore,
							created_at: dateNow,
							updated_at: dateNow
						};
						
						await EduBackground.create(newValues);
						
						req.flash('postStatus', 'success');
						req.flash('postMessage', 'Latar belakang pendidikan berhasil ditambahkan!');
					}
					return res.redirect('/profile');
				}else{
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'Semua formulir harus diisi terlebih dahulu!');
					return res.redirect('/profile');
				}
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/profile');
		};
	},
	
	editTeachExp: async(req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var regId = req.cookies.regId;
		var ER = false;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			var {
					idTeachExp,
					EditTeachPorto,
					EditTeachSchool, 
					EditTeachCity, 
					EditTeachGrade, 
					EditTeachCourse,
					EditTeachStatus,
					EditTeachFromDateV, 
					EditTeachToDateV
				} = req.body;
				
				if(idTeachExp === undefined || idTeachExp=='') ER = true;
				if(EditTeachSchool === undefined || EditTeachSchool=='') ER = true;
				if(EditTeachCity === undefined || EditTeachCity=='') ER = true;
				if(EditTeachGrade === undefined || EditTeachGrade=='') ER = true;
				if(EditTeachCourse === undefined || EditTeachCourse=='') ER = true;
				if(EditTeachStatus === undefined || EditTeachStatus=='') ER = true;
				if(EditTeachFromDateV === undefined || EditTeachFromDateV=='') ER = true;
				if(EditTeachToDateV === undefined) EditTeachToDateV = '';
				if(EditTeachPorto === undefined) EditTeachPorto = '';
				
				if(!ER){
					if(getIdentities.userType == 'pteacher' || getIdentities.userType == 'bteacher'){
						req.flash('postStatus', 'error');
						req.flash('postMessage', 'Pengajuan menjadi tutor sedang dalam proses, harap tunggu sampai kami telah membatalkan/menyetujui pengajuan anda!');
					} else {
						var editTeachData = await TeachExp.findOne({_id: idTeachExp, identitiesId: getIdentities._id});
						
						if(editTeachData !== undefined && editTeachData != ''){
							editTeachData.fromDate = EditTeachFromDateV;
							editTeachData.toDate = EditTeachToDateV;
							editTeachData.school = EditTeachSchool.toUpperCase();
							editTeachData.city = EditTeachCity.toLowerCase();
							editTeachData.status = EditTeachStatus.toLowerCase();
							editTeachData.desc = EditTeachPorto;
							editTeachData.grade = EditTeachGrade;
							editTeachData.course = EditTeachCourse.toUpperCase();
							editTeachData.updated_at = dateNow;
							
							await editTeachData.save();
							
							req.flash('postStatus', 'success');
							req.flash('postMessage', 'Pengalaman mengajar berhasil disimpan!');
						}else{
							req.flash('postStatus', 'error');
							req.flash('postMessage', 'Pengalaman mengajar tidak valid!');
						}
					}
					return res.redirect('/profile');
				}else{
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'Semua formulir harus diisi terlebih dahulu!');
					return res.redirect('/profile');
				}
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/profile');
		};
	},
	
	editEduBackground: async(req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var regId = req.cookies.regId;
		var ER = false;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			var {
					idEduBackground,
					EditEduMajors, 
					EditEduStrata, 
					EditEduCampus, 
					EditEduThesis,
					EditEduFromDateV,
					EditEduToDateV, 
					EditEduScore
				} = req.body;
				
				if(idEduBackground === undefined || idEduBackground=='') ER = true;
				if(EditEduMajors === undefined || EditEduMajors=='') ER = true;
				if(EditEduStrata === undefined || EditEduStrata=='') ER = true;
				if(EditEduCampus === undefined || EditEduCampus=='') ER = true;
				if(EditEduThesis === undefined || EditEduThesis=='') ER = true;
				if(EditEduFromDateV === undefined || EditEduFromDateV=='') ER = true;
				if(EditEduToDateV === undefined || EditEduToDateV=='') ER = true;
				if(EditEduScore === undefined || EditEduScore=='') ER = true;
				
				if(!ER){
					if(getIdentities.userType == 'pteacher' || getIdentities.userType == 'bteacher'){
						req.flash('postStatus', 'error');
						req.flash('postMessage', 'Pengajuan menjadi tutor sedang dalam proses, harap tunggu sampai kami telah membatalkan/menyetujui pengajuan anda!');
					} else {
						var editEduData = await EduBackground.findOne({_id: idEduBackground, identitiesId: getIdentities._id});
						
						if(editEduData !== undefined && editEduData!=''){
							editEduData.fromDate = EditEduFromDateV;
							editEduData.toDate = EditEduToDateV;
							editEduData.institution = EditEduCampus.toUpperCase();
							editEduData.major = EditEduMajors.toUpperCase();
							editEduData.thesis = EditEduThesis.toLowerCase();
							editEduData.strata = EditEduStrata.toLowerCase();
							editEduData.score = EditEduScore;
							editEduData.updated_at = dateNow;
							
							await editEduData.save();
							
							req.flash('postStatus', 'success');
							req.flash('postMessage', 'Latar belakang pendidikan berhasil disimpan!');
						}else{
							req.flash('postStatus', 'error');
							req.flash('postMessage', 'Latar belakang pendidikan tidak valid!');
						}
					}
					return res.redirect('/profile');
				}else{
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'Semua formulir harus diisi terlebih dahulu!');
					return res.redirect('/profile');
				}
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/profile');
		};
	},
	
	verifiedData: async(req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var regId = req.cookies.regId;
		var ER = false;
		var ermsg = '';
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			
			if(getIdentities !== undefined && getIdentities != ''){
				var utype = getIdentities.userType;
				if(utype != 'public'){
					ER = true;
					ermsg = 'Pengajuan tutor hanya ditujukkan untuk user umum!';
				}
				
				if(utype == 'pteacher'){
					ER = true;
					ermsg = 'Pengajuan sedang dalam proses, mohon mengecek email!';
				}
				
				if(utype == 'bteacher'){
					ER = true;
					ermsg = 'Pengajuan anda diblokir, silahkan kontak administrator';
				}
				
				if(utype == 'teacher'){
					ER = true;
					ermsg = 'Anda seorang guru!';
				}
				
				if(!ER){
					var getPeople = await People.findOne({ _id: getIdentities.peopleId });
					var getPeopleInfo = await PeopleInfo.findOne({peopleId: getPeople._id});
					var imageData = await Imageurl.find({identitiesId: getIdentities._id});
					var getTeachData = await TeachExp.find({identitiesId: getIdentities._id});
					var getEduData = await EduBackground.find({identitiesId: getIdentities._id});
					
					if(getPeople.name == ""){
						ER = true;
						ermsg = 'Harap isi nama!';
					};
					if(getPeople.sex == "" && getPeopleInfo.gender == ""){
						ER = true;
						ermsg = 'Silahkan isi gender anda!';
					};
					if(getPeople.nameEng == ""){
						ER = true;
						ermsg = 'Harap isi seputar tentang anda!';
					};
					if(getPeopleInfo.address == ""){
						ER = true;
						ermsg = 'Harap isi alamat domisili anda!';
					};
					if(getPeopleInfo.province == ""){
						ER = true;
						ermsg = 'Harap isi provinsi domisili anda!';
					};
					if(getPeopleInfo.city == ""){
						ER = true;
						ermsg = 'Harap isi kota domisili anda!';
					};
					if(getPeopleInfo.birthDate == ""){
						ER = true;
						ermsg = 'Harap isi tanggal lahir anda!';
					};
					if(getPeopleInfo.birthPlace == ""){
						ER = true;
						ermsg = 'Harap isi tempat lahir anda!';
					};
					if(getPeopleInfo.cardId == ""){
						ER = true;
						ermsg = 'Harap isi nomor kartu identitas anda!';
					};
					if(getPeopleInfo.cardType == ""){
						ER = true;
						ermsg = 'Harap pilih jenis kartu identitas anda!';
					};
					
					if(imageData !== undefined && imageData.length > 0){
						for(var imd=0; imd<4; imd++){
							var tempImg = imageData[imd];
							if(tempImg === undefined || tempImg == ''){
								ER = true;
								ermsg = 'Harap lengkapi foto anda!';
							}
						};
					} else {
						ER = true;
						ermsg = 'Harap upload foto profil, foto selfie, kartu identitas dan foto ijazah!';
					};
					
					if(getTeachData === undefined || getTeachData == '' || getTeachData.length == 0){
						ER = true;
						ermsg = 'Harap isi pengalaman mengajar anda!';
					};
					
					if(getEduData === undefined || getEduData == '' || getEduData.length == 0){
						ER = true;
						ermsg = 'Harap isi sejarah pendidikan anda!';
					};
					
					if(!ER){
						getIdentities.userType = 'pteacher';
						await getIdentities.save();
						
						req.flash('postStatus', 'success');
						req.flash('postMessage', 'Pengajuan anda telah di kirim. Kami akan menghubungi anda kembali ketika pengajuan anda ditolak/diterima. Terima kasih sudah bergabung dengan kami!');
						
					} else {
						req.flash('postStatus', 'error');
						req.flash('postMessage', ermsg);
					}
					
					return res.redirect('/profile');
				}else{
					req.flash('postStatus', 'error');
					req.flash('postMessage', ermsg);
					return res.redirect('/profile');
				}
			}else{
				req.flash('postStatus', 'error');
				req.flash('postMessage', 'Data identitas tidak valid!');
				return res.redirect('/profile');
			}
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/profile');
		}
	},
	
	sendEmail: async(req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var regId = req.cookies.regId;
		var ermsg = '';
		var ER = false;
		var baseurl = 'https://'+req.get('host');
		var randomNumber = randomstring.generate({length: 6, charset:'hex'}); // Verification Code
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			var getPeople = await People.findOne({ _id: getIdentities.peopleId });
			var getVerify = await VerifyEmail.findOne({peopleId: getPeople._id});
			var jtoken = jwt.sign({ id: getPeople._id }, getPeople.email, { expiresIn: "1h" });
			var linkUri = baseurl + "/verify/" + jtoken;
			
			var textEmail 	 = "Halo " + getPeople.name + ", <br>";
			textEmail		+= "Terima kasih sudah bergabung dengan SebisLes. Kami yakin anda akan senang disini! Untuk melanjutkan proses pendaftaran anda, harap klik link validasi dibawah ini:";
			textEmail		+= "<br>";
			textEmail		+= "<a href='" + linkUri + "'>" + linkUri + "</a><br>";
			textEmail		+= "*nb: Link hanya bertahan selama 1 jam<br>";
			textEmail		+= "Apabila anda tidak mendaftarkan akun di <a href='" + baseurl + "'>" + baseurl + "</a>, tidak ada aksi lanjutan yang dibutuhkan, anda dapat meninggalkan email ini dengan aman.";
			textEmail		+= "<br>";
			textEmail		+= "Regards,<br>";
			textEmail		+= "SebisLes Staff";
			
			// create reusable transporter object using the default SMTP transport
			let transporter = nodemailer.createTransport({
				host: "m005.dapurhosting.com",
				port: 465,
				secure: true, // true for 465, false for other ports
				auth: {
					user: "noreply@sbstech.co.id", 
					pass: "fvjvCY^%*3423", 
				},
			});
			
			//console.log(getVerify);
			if(getVerify === undefined || getVerify==null){
				if(getPeople.email != ""){
					var insertVerify = {
						peopleId: getPeople._id,
						email: getPeople.email,
						status: "0",
						token: jtoken,
						created_at: dateNow,
						updated_at: dateNow
					};
					
					await VerifyEmail.create(insertVerify);
					let info = await transporter.sendMail({
						from: '"No-Reply System Admin" <noreply@sbstech.co.id>',
						to: getPeople.email,
						subject: "SebisLes User Email Validation",
						text: "",
						html: textEmail
					});
					req.flash('postStatus', 'success');
					req.flash('postMessage', 'Email verifikasi sudah terkirim! harap cek email inbox/spam. *Link aktif hanya 1 jam');
				} else {
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'Email kosong!');
				};
				
				return res.redirect('/profile');
			} else if(getVerify.status == "0") {
				jwt.verify(getVerify.token, getVerify.email, function(err, decoded){
					if(err){
						ER = true;
						data = err.message;
					}
				});
				
				if(ER){
					let info = await transporter.sendMail({
						from: '"No-Reply System Admin" <noreply@sbstech.co.id>',
						to: getVerify.email,
						subject: "SebisLes User Email Validation",
						text: "",
						html: textEmail
					});
					req.flash('postStatus', 'success');
					req.flash('postMessage', 'Email verifikasi sudah terkirim! harap cek email inbox/spam. *Link aktif hanya 1 jam');
				} else {
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'Link validasi anda sebelumnya sudah dikirim, harap coba lagi di jam berikutnya');
				};
				
				return res.redirect('/profile');
			} else {
				req.flash('postStatus', 'error');
				req.flash('postMessage', 'Email anda sudah di validasi sebelumnya!');
				return res.redirect('/profile');
			}
		} catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/profile');
		};
	},
	
	editPassWord: async(req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var regId = req.cookies.regId;
		var ER = false;
		var ERmsg = '';
		var { EditPassNew, EditPassAgain, EditPassOld } = req.body;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			if(EditPassNew === undefined || EditPassNew == null || EditPassNew == ''){
				ER = true;
				ERmsg = 'Bad Request, Please Contact Your Administrator!';
			}
			
			if(EditPassAgain === undefined || EditPassAgain == null || EditPassAgain == ''){
				ER = true;
				ERmsg = 'Bad Request, Please Contact Your Administrator!';
			}
						
			if(EditPassAgain != EditPassNew){
				ER = true;
				ERmsg = 'Password baru harus sama dengan pengulangan password';
			}
			
			if(!/^([a-z]|[A-Z]|[0-9]){8,13}$/.test(EditPassNew)){
				ER = true;
				ERmsg = 'Password baru harus memiliki 8-13 huruf dan jenis (a-z A-Z 0-9)';
			}
			
			var getIdentities = await Identities.findOne({ regId: regId });
			if(!getIdentities){
				ER = true;
				ERmsg = 'Bad Request, Please Contact Your Administrator!';
			}
			
			if(!ER){
				var getPeople = await People.findOne({ _id: getIdentities.peopleId });
				var getPassword = getPeople.password;
				
				if(getPassword == ""){
					var nPassword = await bcrypt.hashSync(EditPassNew, 10);
					getPeople.password = nPassword;
					await getPeople.save();
					
					req.flash('postStatus', 'success');
					req.flash('postMessage', 'Password anda sudah berubah!');
				} else {
					if(!bcrypt.compareSync(EditPassOld, getPassword)){
						req.flash('postStatus', 'error');
						req.flash('postMessage', 'Password salah!');
					} else {
						var nPassword = await bcrypt.hashSync(EditPassNew, 10);
						getPeople.password = nPassword;
						await getPeople.save();
						
						req.flash('postStatus', 'success');
						req.flash('postMessage', 'Password anda sudah berubah!');
					}
				}
			} else {
				req.flash('postStatus', 'error');
				req.flash('postMessage', ERmsg);
			}
			
			return res.redirect('/profile');
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/profile');
		}
	},
}