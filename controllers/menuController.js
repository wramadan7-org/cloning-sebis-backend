// DB
const People = require("../models/People");
const Identities = require("../models/Identities");
const Menu = require("../models/Menu");
var path = require('path');

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
	viewPublic: async (req, res) => {
		var dt = dateTime.create();
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
				
		try{
			var getIdentities = await Identities.findOne({ regId: regId });
			if(!getIdentities){
				res.clearCookie("regId");
				return res.redirect("/login");
			}
			var getPeople = await People.findOne({ _id: getIdentities.peopleId });
			
			userType = getIdentities.userType;
			if(getIdentities.pushType == 'google') isGoogle = true;
			
			if(userType == 'administrator')
				global.USERTYPE = userType;
			else
				return res.redirect('/home');
			
			var queOne = {
				userType: userType,
				disable: 'enable'
			};
			
			//Menu.paginate(queOne, {sort:{name: 'asc'}}).then(function (result){userMenu = result.docs });
			var userMenu = await Menu.find({userType: userType, disable: 'enable', parent: ''}).sort({name: 'asc'});
			var subMenu = [];
			for(var sm=0; sm<userMenu.length; sm++){
				var tempSub = await Menu.find({parent: userMenu[sm]._id}).sort({name: 'asc'});
				if(tempSub) subMenu.push(tempSub);
				else subMenu.push('');
			};
			
			//console.log(subMenu);
			var options = {
				sort: { name: 'asc'},
				page: currPage,
				limit: 10,
			};
			
			var getParent = await Menu.find({disable: 'enable', parent:''}).sort({name: 'asc'});

			Menu.paginate(null, options).then(function (result) {
				req.flash('totalPages', result.totalPages);
				
				var getMenu = result.docs;
				var PageCounter = result.pagingCounter;
				
				if(PageCounter === undefined) PageCounter = 1;
				if(getPeople) PName = getPeople.name;
				if(getMenu.length < 1) getMenu = '';
				
				var valuesData = {
					getIdentities,
					getMenu, 
					getParent,
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
				new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-menu.ejs', '', 'content-header/menu-head.ejs');
				
			});
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	},
	
	menuPage: async(req, res) => {
		var {nextPage} = req.body;
		var totalPages = req.flash('totalPages');
		
		if(totalPages === undefined) totalPages = 1;
		
		try{
			if(nextPage > totalPages) nextPage = totalPages;
			req.flash('currPage', nextPage);
			return res.redirect("/menu"); 
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	},
	
	addMenu: async (req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try {
			var getIdentities = await Identities.findOne({ regId: regId });
			if(getIdentities.userType == 'administrator')
				global.USERTYPE = getIdentities.userType;
			else
				return res.redirect('/home');
			
			
			var {dataParent, dataName, dataUserType, dataURI, dataHTML, published} = req.body;
			published = (published === undefined) ? 'disable' : 'enable';
			dataHTML = (dataHTML === undefined) ? '': dataHTML;
			
			if(dataParent=="-" || dataParent=="") dataParent = "";
			
			var values = {
				name: ucfirst(dataName),
				parent: dataParent,
				uri: dataURI,
				html: dataHTML,
				userType: dataUserType,
				disable: published,
				created_at: dateNow,
				updated_at: dateNow
			};
			
			var checkAvailable = await Menu.findOne({uri: dataURI, userType: dataUserType, parent: dataParent});
			if(checkAvailable) {
				req.flash('postStatus', 'error');
				req.flash('postMessage', 'This Menu has Already Added on Database !');
			} else {
				var insertMenu = await Menu.create(values);
				var MenuID = insertMenu._id;
				
				req.flash('postStatus', 'success');
				req.flash('postMessage', 'Menu has been saved!');
			}
			
			return res.redirect('/menu');
		} catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/menu');
		};
	},
	
	deleteMenu: async(req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try{
			const { id } = req.params;
			const menu = await Menu.findOne({ _id: id });
			await menu.remove();
			
			req.flash('postStatus', 'delete');
			req.flash('postMessage', 'Menu has been deleted !');
			return res.redirect('/menu');
		} catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/menu');
		};
	},
	
	editMenu: async (req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try {
			dt = dateTime.create();
			dateNow = dt.format('Y-m-d H:M:S');
			
			var {idMenu, EditdataName, EditdataUserType, EditdataURI, EditdataHTML, EditdataParent, published2} = req.body;
			const MenuEdit = await Menu.findOne({ _id: idMenu });
			if(MenuEdit){
				
				published2 = (published2 === undefined) ? 'disable' : 'enable';
				EditdataHTML = (EditdataHTML === undefined) ? '': EditdataHTML;
				if(EditdataParent=="-" || EditdataParent=="") EditdataParent = "";
				
				MenuEdit.name = ucfirst(EditdataName);
				MenuEdit.uri = EditdataURI;
				MenuEdit.parent = EditdataParent;
				MenuEdit.html = EditdataHTML;
				MenuEdit.disable = published2;
				MenuEdit.userType = EditdataUserType
				MenuEdit.updated_at = dateNow;
				await MenuEdit.save();
				
				req.flash('postStatus', 'success');
				req.flash('postMessage', 'Article has been saved !');
			}
			
			return res.redirect('/menu');
		} catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/menu');
		};
	},
}