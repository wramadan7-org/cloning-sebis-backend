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
const EduBackground = require("../models/Edu_background");
const AppRate = require("../models/Approval_rating");
const RateCriteria = {
				'document': '0', 
				'data': '0', 
				'education': '0', 
				'experience': '0', 
				'knowledge': '0'
			};

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
	viewSearch: async(req, res) => {
		var {EditsearchName, EditsearchEmail, EditsearchTelp, EditsearchCity} = req.body;
		
		try{
			if(EditsearchName !== '' && EditsearchName != '') req.flash('searchName', EditsearchName);
				else req.flash('searchName', '');
				
			if(EditsearchEmail !== '' && EditsearchEmail != '') req.flash('searchEmail', EditsearchEmail);
				else req.flash('searchEmail', '');
				
			if(EditsearchTelp !== '' && EditsearchTelp != '') req.flash('searchTelp', EditsearchTelp);
				else req.flash('searchTelp', '');
			//if(EditsearchCity !== '' && EditsearchCity != '') req.flash('searchCity', EditsearchCity);
			return res.redirect('/mentor');
		}catch(err){
			req.flash('postStatus', 'error');
			req.flash('postMessage', err.message);
			return res.redirect('/mentor');
		};
	},
	viewMentor: async (req, res) => {
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
		
		var searchName = req.flash('searchName');
		var searchEmail = req.flash('searchEmail');
		var searchTelp = req.flash('searchTelp');
		//var searchCity = req.flash('searchCity');
		var goSearch = 0;
		
		msg = (msg < 1) ? '' : msg[0];
		Status = (Status < 1) ? '' : Status[0];
		
		
		if (regId === undefined || global.USERTYPE === undefined) {
			return res.redirect("/login");
		}
		
		if(nextNumber === undefined) nextNumber = 0;
		if(currPage === undefined || currPage < 1) currPage = 1;
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			if(!getIdentities){
				res.clearCookie("regId");
				return res.redirect("/login");
			}
			var imageData = await Imageurl.findOne({identitiesId: getIdentities._id, type: 'profile'});
			if(imageData != '' && imageData != null && imageData !== undefined)
				avatarThumb = imageData.image;
			var getPeople = await People.findOne({ _id: getIdentities.peopleId });
			var getTypeCourse = await Crs.find({disable: 'enable'}).sort({name: 'asc'});
			var getGrade = await Grade.find();
			
			userType = getIdentities.userType;
			if(getIdentities.pushType == 'google') isGoogle = true;
			
			if(userType == 'administrator' || userType == 'verifikator'){
				global.USERTYPE = userType;
			} else {
				return res.redirect('/home');
			}
			
			var userMenu = await Menu.find({userType: userType, disable: 'enable', parent: ''}).sort({name: 'asc'});
			var subMenu = [];
			for(var sm=0; sm<userMenu.length; sm++){
				var tempSub = await Menu.find({parent: userMenu[sm]._id}).sort({name: 'asc'});
				if(tempSub) subMenu.push(tempSub);
				else subMenu.push('');
			};
			
			var options = {
				sort: {'_id': -1},
				page: currPage,
				limit: 10,
			};
			
			var getTeacher = '';
			var PageCounter = '';
			var TotPages = '';
			var PInfo = [];
			var Pip = [];
			var PStudy = [];
			var getImage = [];
			var PTeachExp = [];
			var PEduBgn = [];
			var PTeacherRate = [];
			var idFilter = [];
			var queryPeople = {};
			
			if(searchName !== undefined && searchName != ''){
				queryPeople.name = { $regex: '.*' + searchName + '.*', $options: 'i' };
				req.flash('searchName', searchName);
				goSearch++;
			} else 
				searchName = '';
			
			if(searchEmail !== undefined && searchEmail != ''){
				queryPeople.email = { $regex: '.*' + searchEmail + '.*', $options: 'i' };
				req.flash('searchEmail', EditsearchEmail);
				goSearch++;
			} else
				searchEmail = '';
			
			if(searchTelp !== undefined && searchTelp != ''){
				queryPeople.phone = { $regex: '.*' + searchTelp + '.*', $options: 'i' };
				req.flash('searchTelp', searchTelp);
				goSearch++;
			} else 
				searchTelp = '';
			
			if(userType == 'administrator')
				var orFilter = {$or: [{userType: 'teacher'}, {userType: 'bteacher'}, {userType: 'pteacher'}, {userType: 'rteacher'}, {userType: 'public'}]};
			else
				var orFilter = {$or: [{userType: 'teacher'}, {userType: 'bteacher'}, {userType: 'pteacher'}, {userType: 'rteacher'}]};
			
			if(goSearch > 0){
				var resultPeople = await People.find(queryPeople);
				if(resultPeople!== undefined && resultPeople != null && resultPeople != ''){
					for(var rp=0; rp<resultPeople.length; rp++){
						var tempRes = resultPeople[rp];
						idFilter.push({peopleId: tempRes._id});
					};
				}
				
				var Filter = {
					$and: [ orFilter, { $or: idFilter} ]
				};
				
				//console.log(Filter);
			} else {
				var Filter = orFilter;
			}
			
			await Identities.paginate(Filter, options).then(function (result){
				TotPages = result.totalPages;
				req.flash('totalPages', TotPages);
				getTeacher = result.docs;
				PageCounter = result.pagingCounter;
			});
			
			if(PageCounter === undefined) PageCounter = 1;
			if(getPeople) PName = getPeople.name;
			
			if(getTeacher.length < 1) {
				getTeacher = '';
			} else {
				//console.log(getTeacher);
				for(let pi = 0; pi < getTeacher.length; pi++){
					var peopleDataA = await People.findOne({_id: getTeacher[pi].peopleId});
					var peopleDataB = await PeopleInfo.findOne({peopleId: getTeacher[pi].peopleId});
					var studyData = await Study.find({identitiesId: getTeacher[pi]._id});
					var imageData = await Imageurl.find({identitiesId: getTeacher[pi]._id});
					var getTeachExp = await TeachExp.find({identitiesId: getTeacher[pi]._id});
					var getEduBgn = await EduBackground.find({identitiesId: getTeacher[pi]._id});
					var getAppRate = await AppRate.find({identitiesId: getTeacher[pi]._id});
			
					if(imageData < 1) imageData = '';
					if(studyData.length<1) studyData = '';
					if(getTeachExp.length < 1) getTeachExp = '';
					if(getEduBgn.length<1) getEduBgn = '';
					if(getAppRate.length<1) getAppRate = '';
					
					//console.log(studyData);
					
					PTeacherRate.push(getAppRate);
					PTeachExp.push(getTeachExp);
					PEduBgn.push(getEduBgn);
					PStudy.push(studyData);
					Pip.push(peopleDataA);
					PInfo.push(peopleDataB);
					getImage.push(imageData);
				}
			}
			
			if(Pip.length<1) Pip = '';
			if(PInfo.length<1) PInfo = '';
			if(PStudy.length<1) PStudy = '';
			if(getImage.length<1) getImage = '';
			//console.log(PTeacherRate);
			var valuesData = {
				getIdentities,
				getTeacher, 
				getTypeCourse,
				getGrade,
				getImage,
				PeopleInfo: PInfo,
				People: Pip,
				teacherStudy: PStudy,
				teacherExp: PTeachExp,
				teacherEdu: PEduBgn,
				teacherRate: PTeacherRate,
				Status, 
				msg, 
				peopleName: PName, 
				userType: ucfirst(userType), 
				menu: userMenu, 
				submenu: subMenu, 
				currPage: currPage, 
				totalPages: TotPages,
				pagingCounter: PageCounter,
				tokens,
				avatarThumb,
				searchEmail,
				searchTelp,
				searchName
			};
			
			new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-mentor.ejs', '', 'content-header/mentor-head.ejs');
			
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	mentorPage: async(req, res) => {
		var {nextPage} = req.body;
		var totalPages = req.flash('totalPages');
		
		if(totalPages === undefined) totalPages = 1;
		
		try{
			if(nextPage > totalPages) nextPage = totalPages;
			req.flash('currPage', nextPage);
			return res.redirect("/mentor"); 
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	},
	
	addMentorStudy: async (req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		};
		
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			if(getIdentities.userType != 'public')
				global.USERTYPE = getIdentities.userType;
			else
				return res.redirect('/home');
			
			var {EditdataGrade, EditdataType, idTeacher} = req.body;
			//console.log(idTeacher);
			var values = {
				identitiesId: idTeacher,
				gradeId: EditdataGrade,
				typeId: EditdataType,
				disable: 'enable',
				created_at: dateNow,
				updated_at: dateNow
			};
			
			var insertStudy = await Study.create(values);
			var StudyID = insertStudy._id;
			
			req.flash('postStatus', 'success');
			req.flash('postMessage', 'Studi tutor berhasil ditambahkan!');
			
			return res.redirect('/mentor');
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	deleteStudy: async(req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		};
		
		try{
			const { id } = req.params;
			const std = await Study.findOne({ _id: id });
			
			await std.remove();
			
			req.flash('postStatus', 'delete');
			req.flash('postMessage', 'Studi tutor berhasil dihapus!');
			return res.redirect('/mentor');
		} catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/mentor');
		}
	},
	
	studyApprove: async(req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		};
		
		try{
			const { studyId, identitiesId } = req.body;
			const std = await Study.findOne({ _id: studyId });
			if(std.identitiesId == identitiesId){
				var stats = std.status;
				
				if(stats == "1"){
					stats = "0";
					var msg = "Pending";
				} else {
					stats = "1";
					var msg = "Setujui";
				}
				
				std.status = stats;
				await std.save();
				
				req.flash('postStatus', 'success');
				req.flash('postMessage', 'Studi berhasil di ' + ucfirst(msg) + ' !');
			} else {
				req.flash('postStatus', 'error');
				req.flash('postMessage', 'Error, Harap hubungi administrator!');
			}
			return res.redirect('/mentor');
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/mentor');
		};
	},
	
	mentorApprove: async(req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		};
		
		try{
			const { 
				idTeacher, 
				EditDataAppStatus, 
				EditDataAppNote, 
				EditDataAppPoint,
				EditDataAppDoc,
				EditDataAppData,
				EditDataAppEdu,
				EditDataAppExp,
				EditDataAppKnown
			} = req.body;
			
			if(idTeacher == '' || EditDataAppStatus == '' || EditDataAppNote == '' || EditDataAppPoint == ''){
				req.flash('postStatus', 'error');
				req.flash('postMessage', 'Harap beri alasan di kolom catatan sebelum mensetujui/menolak/blokir tutor!');
				return res.redirect('/mentor');
			} else {
				var getVerifyId = await Identities.findOne({regId: regId});
				
				if(getVerifyId.userType == 'verifikator' || getVerifyId.userType == 'administrator'){
					var getIdentities = await Identities.findOne({_id: idTeacher});
					var getPeoples = await People.findOne({_id: getIdentities.peopleId});
					var getRateDoc = await AppRate.findOne({identitiesId: idTeacher, rateName: 'document'});
					var getRateData = await AppRate.findOne({identitiesId: idTeacher, rateName: 'data'});
					var getRateEdu = await AppRate.findOne({identitiesId: idTeacher, rateName: 'education'});
					var getRateExp = await AppRate.findOne({identitiesId: idTeacher, rateName: 'experience'});
					var getRateKnown = await AppRate.findOne({identitiesId: idTeacher, rateName: 'knowledge'});
					
					if(getRateDoc !== undefined && getRateDoc != null && getRateDoc != ''){
						getRateDoc.verifiedId = getVerifyId._id;
						getRateDoc.rateScore = EditDataAppDoc;
						getRateDoc.updated_at = dateNow;
						await getRateDoc.save();
					} else {
						var newRate = {
							identitiesId: idTeacher,
							verifiedId: getVerifyId._id,
							rateName: 'document',
							rateScore: EditDataAppDoc,
							status: '1',
							updated_at: dateNow,
							created_at: dateNow
							
						};
						
						await AppRate.create(newRate);
					};
					
					if(getRateData !== undefined && getRateData != null && getRateData != ''){
						getRateData.verifiedId = getVerifyId._id;
						getRateData.rateScore = EditDataAppData;
						getRateData.updated_at = dateNow;
						await getRateData.save();
					} else {
						var newRate = {
							identitiesId: idTeacher,
							verifiedId: getVerifyId._id,
							rateName: 'data',
							rateScore: EditDataAppData,
							status: '1',
							updated_at: dateNow,
							created_at: dateNow
							
						};
						
						await AppRate.create(newRate);
					};
					
					if(getRateEdu !== undefined && getRateEdu != null && getRateEdu != ''){
						getRateEdu.verifiedId = getVerifyId._id;
						getRateEdu.rateScore = EditDataAppEdu;
						getRateEdu.updated_at = dateNow;
						await getRateEdu.save();
					} else {
						var newRate = {
							identitiesId: idTeacher,
							verifiedId: getVerifyId._id,
							rateName: 'education',
							rateScore: EditDataAppEdu,
							status: '1',
							updated_at: dateNow,
							created_at: dateNow
							
						};
						
						await AppRate.create(newRate);
					};
					
					if(getRateExp !== undefined && getRateExp != null && getRateExp != ''){
						getRateExp.verifiedId = getVerifyId._id;
						getRateExp.rateScore = EditDataAppExp;
						getRateExp.updated_at = dateNow;
						await getRateExp.save();
					} else {
						var newRate = {
							identitiesId: idTeacher,
							verifiedId: getVerifyId._id,
							rateName: 'experience',
							rateScore: EditDataAppExp,
							status: '1',
							updated_at: dateNow,
							created_at: dateNow
							
						};
						
						await AppRate.create(newRate);
					};
					
					if(getRateKnown !== undefined && getRateKnown != null && getRateKnown != ''){
						getRateKnown.verifiedId = getVerifyId._id;
						getRateKnown.rateScore = EditDataAppKnown;
						getRateKnown.updated_at = dateNow;
						await getRateKnown.save();
					} else {
						var newRate = {
							identitiesId: idTeacher,
							verifiedId: getVerifyId._id,
							rateName: 'knowledge',
							rateScore: EditDataAppKnown,
							status: '1',
							updated_at: dateNow,
							created_at: dateNow
						};
						
						await AppRate.create(newRate);
					};
					
					if (EditDataAppStatus == '0')
						getIdentities.userType = 'pteacher';
					else if (EditDataAppStatus == '1')
						getIdentities.userType = 'teacher';
					else if (EditDataAppStatus == '2')
						getIdentities.userType = 'bteacher';
					else
						getIdentities.userType = 'rteacher';
					
					getIdentities.number = EditDataAppPoint;
					getIdentities.updated_at = dateNow;
					getPeoples.secret = EditDataAppNote;
					getPeoples.updated_at = dateNow;
					
					await getIdentities.save();
					await getPeoples.save()
					
					req.flash('postStatus', 'success');
					req.flash('postMessage', 'Perubahan status tutor berhasil disimpan!');
					return res.redirect('/mentor');
				} else {
					return res.redirect('/home');
				};
			}
		}catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/mentor');
		};
	},
}