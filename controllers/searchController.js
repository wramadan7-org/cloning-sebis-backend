// DB
const People = require("../models/People");
const PeopleInfo = require("../models/People_info");
const Identities = require("../models/Identities");
const Crs = require("../models/Course");
const Study = require("../models/Study");
const Grade = require("../models/Grade");
const Menu = require("../models/Menu");
const Imageurl = require("../models/Image_url");

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
	viewSearch: async (req, res) => {
		var PName = '';
		var userType = '';
		var regId = req.cookies.regId;
		var Status = req.flash('postStatus');
		var msg = req.flash('postMessage');
		var currPage = req.flash('currPage');
		//var nextNumber = req.flash('nextNumber');
		var userMenu = '';
		var tokens = req.csrfToken();
		
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
			
			userType = getIdentities.userType;
			if(getIdentities.pushType == 'google') isGoogle = true;
			
			if(userType == 'administrator'){
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
			
			if(getPeople) PName = getPeople.name;
						
			var valuesData = {
				getIdentities,
				Status, 
				msg, 
				peopleName: PName, 
				userType: ucfirst(userType), 
				menu: userMenu, 
				submenu: subMenu,
				tokens
			};
			//console.log(imageData);
			new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-search.ejs', '', 'content-header/search-head.ejs');
			
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
	letSearch: async(req, res) => {
		var PName = '';
		var userType = '';
		var regId = req.cookies.regId;
		var Status = req.flash('postStatus');
		var msg = req.flash('postMessage');
		var currPage = req.flash('currPage');
		//var nextNumber = req.flash('nextNumber');
		var userMenu = '';
		var tokens = req.csrfToken();
		
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
			var getPeople = await People.findOne({ _id: getIdentities.peopleId });
			var getPeopleInfo = await PeopleInfo.findOne({peopleId: getPeople._id});
			var getTypeCourse = await Crs.find({disable: 'enable'}).sort({name: 'asc'});
			var getGrade = await Grade.find();
			var imageData = await Imageurl.find({identitiesId: getIdentities._id});
			
			userType = getIdentities.userType;
			if(getIdentities.pushType == 'google') isGoogle = true;
			
			if(userType == 'administrator'){
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
			
			if(getPeople) PName = getPeople.name;
						
			var valuesData = {
				getIdentities,
				Status, 
				msg, 
				peopleName: PName, 
				userType: ucfirst(userType), 
				menu: userMenu, 
				submenu: subMenu,
				tokens
			};
			//console.log(imageData);
			new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-search.ejs', '', 'content-header/search-head.ejs');
			
		} catch(error){
			res.status(500).send({message: error.message});
		};
	},
	
}