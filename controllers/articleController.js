// DB
const People = require("../models/People");
const Identities = require("../models/Identities");
const Users = require("../models/Users");
const Article = require("../models/Article");
const Menu = require("../models/Menu");
const fs = require('fs');
const sharp = require('sharp');
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
		
		if(global.USERTYPE == 'public') {
			return res.redirect("/home");
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
			
			var userMenu = await Menu.find({userType: userType, disable: 'enable', parent: ''}).sort({name: 'asc'});
			var subMenu = [];
			for(var sm=0; sm<userMenu.length; sm++){
				var tempSub = await Menu.find({parent: userMenu[sm]._id}).sort({name: 'asc'});
				if(tempSub) subMenu.push(tempSub);
				else subMenu.push('');
			};
			
			var options = {
				sort: { title: 'asc'},
				page: currPage,
				limit: 10,
			};
			
			if(getIdentities.pushType == 'google') isGoogle = true;
			
			Article.paginate({identitiesId: getIdentities._id}, options).then(function (result) {
				req.flash('totalPages', result.totalPages);
				
				var getArticle = result.docs;
				var PageCounter = result.pagingCounter;
				
				if(PageCounter === undefined) PageCounter = 1;
				if(getPeople) PName = getPeople.name;
				if(getArticle.length < 1) getArticle = '';
				
				var valuesData = {
					getIdentities,
					getArticle, 
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
				
				new renderEJS(valuesData, req,res, 'admin/index.ejs', 'content-main/main-article.ejs', '', 'content-header/article-head.ejs');
			});
			
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	},
	
	articlePage: async(req, res) => {
		var {nextPage} = req.body;
		var totalPages = req.flash('totalPages');
		
		if(totalPages === undefined) totalPages = 1;
		
		try{
			if(nextPage > totalPages) nextPage = totalPages;
			req.flash('currPage', nextPage);
			return res.redirect("/article"); 
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	},
	
	addArticle: async (req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			req.flash('errorMessage', 'Please login first!');
			return res.redirect("/login");
		}
		
		try {
			var getIdentities = await Identities.findOne({ regId: regId });
			var {dataCategory, dataTags, dataTitle, dataSubtitle, dataContentCK, published} = req.body;
			var dataUpload = req.file;
			var thumbnImage = '';
			
			switch(dataCategory){
				case 'video' :
					dataCategory = 'video';
					break;
				case 'news' :
					dataCategory = 'news';
					break;
				default :
					dataCategory = 'blog';
			};
			
			published = (published === undefined) ? '0' : '1';
			
			var values = {
				identitiesId: getIdentities._id,
				category: dataCategory,
				tags: dataTags,
				title: ucfirst(dataTitle),
				subtitle: dataSubtitle,
				headerImage: '',
				content: dataContentCK,
				published: published,
				thumbnail: '',
				created_at: dateNow,
				updated_at: dateNow
			};
			
			var insertArticle = await Article.create(values);
			var ArticleID = insertArticle._id;
			
			if(dataUpload !== undefined){
				const updateArticle = await Article.findOne({ _id: ArticleID });
				// Manipulate File
				var fileType = path.extname(dataUpload.filename);
				var thumbFile = 'thumb-'+ ArticleID + fileType;
				var thumbPathDest = 'images/thumbnails/' + thumbFile;
				var pathImage = 'images/'+ ArticleID + fileType;
				var newPathImg = 'public/'+pathImage;
				
				// Rename Filename With ArticleID
				fs.rename( dataUpload.path, newPathImg, function (err){
					if (err) console.log(err);
				});
				
				sharp(newPathImg).resize(200, 200).toFile('public/' + thumbPathDest, (err, resizeImage) => {
					if (err) console.log(err);
				});
				
				updateArticle.headerImage = pathImage;
				updateArticle.thumbnail = thumbPathDest;
				insertArticle = await updateArticle.save();
			}
			
			req.flash('postStatus', 'success');
			req.flash('postMessage', 'Article has been saved !');
			return res.redirect('/article');
			
		} catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/article');
		};
	},
	
	deleteArticle: async (req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try {
			const { id } = req.params;
			const article = await Article.findOne({ _id: id });
			var headerImg = 'public/' + article.headerImage;
			var thumbImg = 'public/' + article.thumbnail;
			
			fs.unlinkSync(thumbImg);
			fs.unlinkSync(headerImg);
			await article.remove();
			
			req.flash('postStatus', 'delete');
			req.flash('postMessage', 'Article has been deleted !');
			return res.redirect('/article');
		} catch(error){
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/article');
		};
	},
	
	editArticle: async (req, res) => {
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			return res.redirect("/login");
		}
		
		try {
			dt = dateTime.create();
			dateNow = dt.format('Y-m-d H:M:S');
			
			var {idArticle, EditdataTitle, EditdataSubtitle, EditdataTags, EditdataCategory, dataContentCK2, published2} = req.body;
			var dataUpload = req.file;
			var thumbnImage = '';
			const ArtEdit = await Article.findOne({ _id: idArticle });
			
			if(ArtEdit){
				if(dataUpload !== undefined){
					console.log('Has post an image');
					var fileType = path.extname(dataUpload.filename);
					var thumbFile = 'thumb-'+ idArticle + fileType;
					var thumbPath = 'images/thumbnails/' + thumbFile;
					var pathImage = 'images/'+ idArticle + fileType;
					var newPathImg = 'public/' + pathImage;
					var newPathThumb = 'public/' + thumbPath;
					var oldPathImg = 'public/' + ArtEdit.headerImage;
					var OldThumbPath = 'public/' + ArtEdit.thumbnail;
					
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
					
					// Rename Filename With ArticleID
					fs.rename( dataUpload.path, newPathImg, function (err){
						if (err) console.log(err);
					});
					
					// Creating Thumbnails Image
					sharp(newPathImg).resize(200, 200).toFile(newPathThumb, (err, resizeImage) => {
						if (err) console.log(err);
					});
					
					ArtEdit.headerImage = pathImage;
					ArtEdit.thumbnail = thumbPath;
				};
				
				switch(EditdataCategory){
					case 'video' :
						EditdataCategory = 'video';
						break;
					case 'news' :
						EditdataCategory = 'news';
						break;
					default :
						EditdataCategory = 'blog';
				};
				
				published2 = (published2 === undefined) ? '0' : '1';
				
				ArtEdit.title = ucfirst(EditdataTitle);
				ArtEdit.subtitle = EditdataSubtitle;
				ArtEdit.tags = EditdataTags;
				ArtEdit.category = EditdataCategory;
				ArtEdit.content = dataContentCK2;
				ArtEdit.published = published2;
				ArtEdit.updated_at = dateNow;
				await ArtEdit.save();
				req.flash('postStatus', 'success');
				req.flash('postMessage', 'Article has been saved !');
			}
			
			return res.redirect('/article');
		} catch(error) {
			req.flash('postStatus', 'error');
			req.flash('postMessage', error.message);
			return res.redirect('/article');
		};
	},
	
}