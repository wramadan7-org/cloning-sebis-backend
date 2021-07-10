// DB
const People = require("../models/People");
const PeopleInfo = require("../models/People_info");
const Identities = require("../models/Identities");
const Crs = require("../models/Course");
const Study = require("../models/Study");
const Grade = require("../models/Grade");
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
	viewCost: async (req, res) => {
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
			
			userType = getIdentities.userType;
			if(getIdentities.pushType == 'google') isGoogle = true;
			
			if(userType == 'administrator' || userType == 'finance'){
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
				sort: {name: 'asc'},
				page: currPage,
				limit: 10,
			};
			
			var getTeacher = '';
			var PageCounter = '';
			var TotPages = '';
			var PInfo = [];
			var Pip = [];
			var PStudy = [];
			
			if(PageCounter === undefined) PageCounter = 1;
			if(getPeople) PName = getPeople.name;
						
			if(Pip.length<1) Pip = '';
			if(PInfo.length<1) PInfo = '';
			if(PStudy.length<1) PStudy = '';
			
			var valuesData = {
				getIdentities,
				Status, 
				msg, 
				peopleName: PName, 
				userType: ucfirst(userType), 
				menu: userMenu, 
				submenu: subMenu, 
			};
			
			new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-cost.ejs', '', 'content-header/cost-head.ejs');
			
		} catch(error){
			res.status(500).send({message: error.message});
		};
	}
	
}