// DB
const People = require("../models/People");
const Identities = require("../models/Identities");
const Course = require("../models/Course_material");
const Crs = require("../models/Course");
const Grade = require("../models/Grade");
const Menu = require("../models/Menu");
const Schedule = require("../models/Schedule");
const Study = require("../models/Study");

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
	viewSchedule: async(req, res) => {
		var MonthNow = dt.format('m');
		MonthNow--;
		MonthNow++;
		var YearNow = dt.format('Y');
		var days_of_month = new Date(YearNow, MonthNow, 0).getDate();
		
		var startMonth = YearNow+'-'+dt.format('m')+'-01 00:00';
		var endMonth = YearNow+'-'+dt.format('m')+'-'+days_of_month+' 23:59';
		
		// console.log(startMonth);
		// console.log(endMonth);
		
		var PName = '';
		var userType = '';
		var regId = req.cookies.regId;
		var Status = req.flash('postStatus');
		var msg = req.flash('postMessage');
		var currPage = req.flash('currPage');
		var nextNumber = req.flash('nextNumber');
		var userMenu = '';
		var tokens = req.csrfToken();
		var baseurl = 'https://'+req.get('host');
		
		msg = (msg < 1) ? '' : msg[0];
		Status = (Status < 1) ? '' : Status[0];
		
		// console.log(Date.now());
		if (regId === undefined || global.USERTYPE === undefined) {
			return res.redirect("/login");
		}
		
		if(nextNumber === undefined) nextNumber = 0;
		if(currPage === undefined || currPage < 1) currPage = 1;
		
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
			//var CourseMaterial = await Course.find({identitiesId: getIdentities._id, status:'2', disable: 'enable', delete:'0'}).sort({name: 'asc'});
			var getTypeCourse = await Crs.find({disable: 'enable'}).sort({name: 'asc'});
			var getGrade = await Grade.find();
			var getSchedule = [];
			var getStudy = await Study.find({identitiesId: getIdentities._id, disable: 'enable', status: '1'});
			/*
			for(var dd=0; dd<days_of_month; dd++){ var dy = dd+1;
				if(dy<10) dy = '0'+dy;
				
				var thisDate = YearNow+'-'+dt.format('m')+'-'+dy;
				
				console.log(thisDate);
				
				var tempSchedule = await Schedule.find({
					identitiesId: getIdentities._id,
					$and:[{dateStart: {$gte: thisDate+" 00:00"}, dateEnd:{$lte: thisDate+" 23:59"}}]
				}).sort({dateStart: 1});
				console.log(tempSchedule);
				
				if(tempSchedule){
					getSchedule[dd] = tempSchedule;
				}
				
			};
			*/
			//console.log(getSchedule);
			
			if(getPeople) PName = getPeople.name;

			userType = getIdentities.userType;
			if(getIdentities.pushType == 'google') isGoogle = true;
			console.log(isGoogle);
			if(userType != 'public')
				global.USERTYPE = userType;
			else
				return res.redirect('/home');
			
			var userMenu = await Menu.find({userType: userType, disable: 'enable', parent: ''}).sort({name: 'asc'});
			var subMenu = [];
			for(var sm=0; sm<userMenu.length; sm++){
				var tempSub = await Menu.find({parent: userMenu[sm]._id}).sort({name: 'asc'});
				if(tempSub) subMenu.push(tempSub);
				else subMenu.push('');
			};
			
			var valuesData = {
					getIdentities,
					getStudy,
					getTypeCourse,
					getGrade,
					getSchedule,
					Status, 
					msg, 
					peopleName: PName, 
					userType: ucfirst(userType), 
					menu: userMenu, 
					submenu: subMenu,
					tokens,
					baseurl,
					regId
				};
			
			new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-schedule.ejs', 'js/schedule-editable.js', 'content-header/schedule-head.ejs');
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	getData: async(req, res) => {
		var tokens = req.csrfToken();
		var baseurl = 'http://'+req.get('host');
		try{
			var {getMonth, getYear, regId} = req.body;
			
			var getIdentities = await Identities.findOne({ regId: regId });
			//var CourseMaterial = await Course.find({identitiesId: getIdentities._id, status:'2', disable: 'enable', delete:'0'}).sort({name: 'asc'});
			var getStudy = await Study.find({identitiesId: getIdentities._id, disable: 'enable'});
			var getTypeCourse = await Crs.find({disable: 'enable'}).sort({name: 'asc'});
			var getGrade = await Grade.find();
			var getSchedule = [];
			getMonth++;
			
			var days_of_month = new Date(getYear, getMonth, 0).getDate();
			for(var dd=0; dd<days_of_month; dd++){ 
				var dy = dd+1;
				if(dy<10) dy = '0'+dy;
				var monthNow = getMonth;
				if(monthNow < 10) monthNow = '0' + monthNow;
				
				var thisDate = getYear+'-'+monthNow+'-'+dy;
				
				var tempSchedule = await Schedule.find({ identitiesId: getIdentities._id, 
				$and:[{dateStart: {$gte: thisDate+" 00:00"}, dateEnd:{$lte: thisDate+" 23:59"}}]}).sort({dateStart: 1});
				
				//console.log(tempSchedule);
				
				if(tempSchedule){
					getSchedule[dd] = tempSchedule;
				}
			};
			
			var valuesData = {
					getStudy,
					getTypeCourse,
					getGrade,
					getSchedule,
					tokens,
					baseurl,
					regId
			};
			
			res.json({
				'status': 200,
				'message': 'OK',
				'data': valuesData
			});
		}catch(error){
			res.json({
				'status': 500,
				'message': error.message
			});
		};
	},
	
	addSchedule: async(req, res) => {
		var datee = new Date();
		//var getIdentities = await Identities.findOne({ regId: regId });
		var StartTime = '13:00';
		var TSplit = StartTime.split(":");
		var STime = TSplit[0];
		var ETime = TSplit[1];
		var tokens = req.csrfToken();
		
		datee.setHours(STime);
		datee.setMinutes(ETime + 90);
		
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		justDate = dt.format('Y-m-d H:M:S');
		
		try{
			var {dataHour, dataMinute, dataDate, regId} = req.body;
			console.log(dataDate);
			var DSplit = dataDate.split("/");
			var YDate = DSplit[0];
			var MDate = DSplit[1];
			var DDate = DSplit[2];
			var getIdentities = await Identities.findOne({
				regId: regId,
				$or: [{userType: 'administrator'}, {userType: 'teacher'}]
			});
			
			if(getIdentities != null && getIdentities != ''){
				var getStudy = await Study.find({identitiesId: getIdentities._id, disable: 'enable', status: '1'});
				if(getStudy.length > 0 && getStudy != undefined){
					MDate++;
					if(MDate < 10) MDate = '0'+MDate;
					if(DDate < 10) DDate = '0'+DDate;
					//if(DDate < 10) DDate = '0'+DDate;
					if(dataHour < 10) dataHour = '0'+dataHour;
					if(dataMinute < 10) dataMinute = '0'+dataMinute;
					dataDate = YDate+"/"+MDate+"/"+DDate;
					
					var NewDate = new Date(dataDate+' '+dataHour+':'+dataMinute+' GMT+0700');
					NewDate.setHours( NewDate.getHours() + 1 );
					
					var NDate = NewDate.getDate();
					var NMonth = NewDate.getMonth();
					var NYear = NewDate.getFullYear();
					var NHour = NewDate.getHours();
					var NMinute = NewDate.getMinutes();
					
					NMonth++;
					if(NMonth < 10) NMonth = '0'+NMonth;
					if(NDate < 10) NDate = '0'+NDate;
					if(NHour < 10) NHour = '0'+NHour;
					if(NMinute < 10) NMinute = '0'+NMinute;
					
					var NFormatDate = NYear+'-'+NMonth+'-'+NDate+' '+NHour+':'+NMinute;
					
					var dateStart = YDate +'-'+MDate+'-'+DDate+' '+dataHour+':'+dataMinute;
					var dateEnd = NYear+'-'+NMonth+'-'+NDate+' '+NHour+':'+NMinute;
					//console.log(dateStart);
					var searchDuplicate = await Schedule.findOne({
						identitiesId: getIdentities._id,
						$and:[{dateStart: {$lt: dateStart}, dateEnd:{$gt: dateStart}}]
					});
					
					//console.log(searchDuplicate);
					
					if(searchDuplicate == null || searchDuplicate === undefined){
						//var courseName = await Course.findOne({_id: dataCourse});
						//var gradeName = await Grade.findOne({_id: courseName.gradeId});
						//var typename = await Crs.findOne({_id: courseName.typeId});
						//var dataGC = gradeName.name +' - '+ typename.name;
						
						var valuesData = {
							identitiesId: getIdentities._id,
							studyId: '',
							clientId: '',
							dateStart,
							dateEnd,
							status: '0',
							updated_at: dateNow,
							created_at: dateNow
						};
						
						var insertSchedule = await Schedule.create(valuesData);
						
						var postStatus = 'success';
						var postMessage = 'Schedule has been added!';
						var stt = 200;
						var message = 'OK';
						var returnData = {
							scheduleId: insertSchedule._id,
							studyId: '',
							clientId: '',
							dateStart,
							dateEnd,
							status: '0',
							dataGC: '',
							dataName: ''
						};
						
					} else {
						var postStatus = 'error';
						var postMessage = 'You have a schedule on this Date & Time';
						var stt = 500;
						var message = 'Failed';
						var returnData = '';
					}
				} else {
					var postStatus = 'error';
					var postMessage = 'You dont have any study approved yet';
					var stt = 500;
					var message = 'Failed';
					var returnData = '';
				}
			} else {
				var postStatus = 'error';
				var postMessage = 'Identities not found!';
				var stt = 500;
				var message = 'Failed';
				var returnData = '';
			}
			return res.status(stt).send({message: message, postStatus: postStatus, postMessage: postMessage, _csrf: tokens, regId, returnData});
		}catch(error){
			res.status(500).send({message: error.message});
		}
				
	}
}