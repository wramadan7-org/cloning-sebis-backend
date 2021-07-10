// DB
const People = require("../models/People");
const Identities = require("../models/Identities");
const Course = require("../models/Course_material");
const Crs = require("../models/Course");
const Grade = require("../models/Grade");
const Menu = require("../models/Menu");
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
	addCourse: async (req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try {
			var courses = [
				{
					name: 'BAHASA INGGRIS',
					disable: 'enable',
					updated_at: dateNow,
					created_at: dateNow
				},
				{
					name: 'BAHASA INDONESIA',
					disable: 'enable',
					updated_at: dateNow,
					created_at: dateNow
				},
				{
					name: 'BAHASA MANDARIN',
					disable: 'enable',
					updated_at: dateNow,
					created_at: dateNow
				},
				{
					name: 'MATEMATIKA',
					disable: 'enable',
					updated_at: dateNow,
					created_at: dateNow
				},
				{
					name: 'FISIKA',
					disable: 'enable',
					updated_at: dateNow,
					created_at: dateNow
				},
				{
					name: 'KIMIA',
					disable: 'enable',
					updated_at: dateNow,
					created_at: dateNow
				},
				{
					name: 'SOSIOLOGI',
					disable: 'enable',
					updated_at: dateNow,
					created_at: dateNow
				},
				{
					name: 'SEJARAH',
					disable: 'enable',
					updated_at: dateNow,
					created_at: dateNow
				},
				{
					name: 'AGAMA',
					disable: 'enable',
					updated_at: dateNow,
					created_at: dateNow
				}
			];
			
			for(var x=0; x<courses.length; x++){
				var values = courses[x];
	
				await Course.create(values);
			};
			res.status(200).send({ status: 'OK', message: 'Your data has been submitted' });
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	viewMaterial: async (req, res) => {
		var PName = '';
		var userType = '';
		var regId = req.cookies.regId;
		var Status = req.flash('postStatus');
		var msg = req.flash('postMessage');
		var currPage = req.flash('currPage');
		var nextNumber = req.flash('nextNumber');
		var userMenu = '';
		
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
			var getStudy = await Study.find({ identitiesId: getIdentities._id });
			var getPeople = await People.findOne({ _id: getIdentities.peopleId });
			var getTypeCourse = await Crs.find({disable: 'enable'}).sort({name: 'asc'});
			var getGrade = await Grade.find();

			userType = getIdentities.userType;
			if(getIdentities.pushType == 'google') isGoogle = true;
			
			if(userType != 'public')
				global.USERTYPE = userType;
			else
				return res.redirect('/home');
			
			if(getStudy.length<1 || getStudy===undefined) getStudy = '';
			
			var userMenu = await Menu.find({userType: userType, disable: 'enable', parent: ''}).sort({name: 'asc'});
			var subMenu = [];
			for(var sm=0; sm<userMenu.length; sm++){
				var tempSub = await Menu.find({parent: userMenu[sm]._id}).sort({name: 'asc'});
				if(tempSub) subMenu.push(tempSub);
				else subMenu.push('');
			};
			
			var options = {
				sort: {gradeId: 'asc', name: 'asc'},
				page: currPage,
				limit: 10,
			};
			
			Course.paginate({identitiesId: getIdentities._id, delete: '0'}, options).then(function (result){
				req.flash('totalPages', result.totalPages);
				
				var getCourse = result.docs;
				var PageCounter = result.pagingCounter;
				
				if(PageCounter === undefined) PageCounter = 1;
				if(getPeople) PName = getPeople.name;
				if(getCourse.length < 1) getCourse = '';
				
				var valuesData = {
					getIdentities,
					getStudy,
					getCourse, 
					getTypeCourse,
					getGrade,
					Status, 
					msg, 
					peopleName: PName, 
					userType: ucfirst(userType), 
					menu: userMenu, 
					submenu: subMenu, 
					currPage: currPage, 
					totalPages: result.totalPages,
					pagingCounter: PageCounter
				};
				
				new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-coursematerial.ejs', '', 'content-header/coursematerial-head.ejs');
			});
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	coursePage: async(req, res) => {
		var {nextPage} = req.body;
		var totalPages = req.flash('totalPages');
		
		if(totalPages === undefined) totalPages = 1;
		
		try{
			if(nextPage > totalPages) nextPage = totalPages;
			req.flash('currPage', nextPage);
			return res.redirect("/course"); 
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	},
	
	addMaterial: async (req, res) => {
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
			
			
			var {dataStudy, dataYear, dataName, dataDesc, published} = req.body;
			published = (published === undefined) ? 'disable' : 'enable';
			dataYear = (dataYear === undefined) ? '': dataYear;
			
			dataStudy = dataStudy.split("_");
			var dataGrade = dataStudy[0];
			var dataType = dataStudy[1];
			
			var values = {
				identitiesId: getIdentities._id,
				gradeId: dataGrade,
				name: ucfirst(dataName),
				desc: dataDesc,
				typeId: dataType,
				year: dataYear,
				status: '0',
				disable: published,
				delete: '0',
				created_at: dateNow,
				updated_at: dateNow
			};
			
			var checkAvailable = await Course.findOne({name: ucfirst(dataName), gradeId: dataGrade, typeId: dataType});
			if(checkAvailable) {
				req.flash('postStatus', 'error');
				req.flash('postMessage', 'This Course has Been Exist !');
			} else {
				var insertCourse = await Course.create(values);
				var CourseID = insertCourse._id;
				
				req.flash('postStatus', 'success');
				req.flash('postMessage', 'Course has been saved!');
			}
			
			return res.redirect('/course');
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	editMaterial: async(req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		};
		
		try {
			dt = dateTime.create();
			dateNow = dt.format('Y-m-d H:M:S');
			
			var getIdentities = await Identities.findOne({ regId: regId });
			if(getIdentities.userType != 'public')
				global.USERTYPE = getIdentities.userType;
			else
				return res.redirect('/home');
			
			var {idCourseMaterial, EditdataYear, EditdataName, EditdataDesc, published2} = req.body;
			const courseMaterialEdit = await Course.findOne({ _id: idCourseMaterial, identitiesId: getIdentities._id });
			if(courseMaterialEdit){
				var que = {
					identitiesId: getIdentities._id,
					gradeId: courseMaterialEdit.gradeId,
					typeId: courseMaterialEdit.typeId,
					disable: 'enable'
				};
				const studyListMentor = await Study.findOne(que);
				if(studyListMentor){
					published2 = (published2 === undefined) ? 'disable' : 'enable';
					EditdataYear = (EditdataYear === undefined) ? '': EditdataYear;
					
					courseMaterialEdit.name       = ucfirst(EditdataName);
					courseMaterialEdit.desc       = EditdataDesc;
					courseMaterialEdit.year       = EditdataYear;
					courseMaterialEdit.status     = '0';
					courseMaterialEdit.disable    = published2;
					courseMaterialEdit.updated_at = dateNow;
					await courseMaterialEdit.save();
					
					req.flash('postStatus', 'success');
					req.flash('postMessage', 'Course has been saved !');
				} else {
					req.flash('postStatus', 'error');
					req.flash('postMessage', 'You dont have privilege to maintain this course!');
				}
			}
			
			return res.redirect('/course');
		} catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/course');
		};
	},
}