// DB
const People = require("../models/People");
const PeopleInfo = require("../models/People_info");
const Identities = require("../models/Identities");
const Imageurl = require("../models/Image_url");
const Menu = require("../models/Menu");
const bcrypt = require('bcrypt'); 
const Course = require("../models/Course_material");
const Price = require("../models/Price");
const VerifyEmail = require("../models/Verify_email");
const VirtualAccount = require("../models/VirtualAccount");
const { encrypt, decrypt } = require('../helpers/crypto');

var jwt = require('jsonwebtoken');
var secret = 'jasd9aH.h&yt_sd';
var randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const dateTime = require('node-datetime');
var dt = dateTime.create();
var dateNow = dt.format('Y-m-d H:M:S');

function ucfirst(str) {
    var firstLetter = str.slice(0,1);
    return firstLetter.toUpperCase() + str.substring(1);
}

var isGoogle = false;
const renderEJS = function(ContentData = {}, req, res, fileName, ContentMain= "", ContentScript = "", ContentHeader="content-header/main.ejs"){
	ContentData.Google = isGoogle;
	res.render(fileName, {ContentHeader,ContentScript,ContentMain,ContentData});
}

module.exports = {
	viewPublic: async (req, res) => {
		try{
			var msg = req.flash('info');
			msg = (msg < 1) ? 'Kosong' : msg[0];
			// res.render('goath', {title: 'Hello World..', locationID: '#', buttonGoogle: false});
			res.json({
				'status': 200,
				'messages': 'OK',
				'data': msg
			});
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	  
    },
	
	getRefreshT: async (req, res) => {
		var {JWTTOKEN, snumber} = req.body;
		var data = '';
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		
		try{
			var IdUpdate = await Identities.findOne({ secret: snumber, pushType: 'api', api_token: JWTTOKEN});
			if(IdUpdate !== undefined && IdUpdate != ''){
				jwt.verify(JWTTOKEN, snumber, function(err, decoded){
					if(err){
						data = err.message;
					} else {
						data = decoded.id;
					}
				});
				
				if(IdUpdate._id == data){
					var ranm = randomstring.generate({length: 16, charset:'hex'});
					var api_token = jwt.sign({id: data}, ranm, { expiresIn: '12h' });
					
					IdUpdate.secret = ranm;
					IdUpdate.code = '';
					IdUpdate.api_token = api_token;
					IdUpdate.pushType = 'api';
					IdUpdate.regId = '';
					IdUpdate.updated_at = dateNow;
					
					await IdUpdate.save();
					res.json({
						'status': 200,
						'message': 'OK',
						'data': {'token': api_token, 'secret': ranm}
					});
				} else {
					res.json({
						'status' : 500,
						'message' : error.message
					});
				}
			} else {
				res.json({
					'status' : 500,
					'message' : error.message
				});
			};
		}catch(error){
			res.json({
				'status' : 500,
				'message' : error.message
			});
		};
	},
	
	getVerification: async(req,res) => {
		// token generated from login api with secret number where is send to email
		// and have user code identities for update login table
		
		var {JWTTOKEN, snumber} = req.body;
		var data = '';
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var ER = false;
		
		try{
			if(JWTTOKEN === undefined || JWTTOKEN == null || JWTTOKEN == ""){
				ER = true;
				data = 'Bad request!';
			}
			
			if(snumber === undefined || snumber == null || snumber == ""){
				ER = true;
				data = 'Bad request!';
			}
			
			if(!ER){
				jwt.verify(JWTTOKEN, snumber, function(err, decoded){
					if(err){
						ER = true;
						data = err.message;
					} else {
						data = decoded.code;
					}
				});
			}
			
			if(!ER){
				var ranm = randomstring.generate({length: 16, charset:'hex'});
				var IdUpdate = await Identities.findOne({ code: data});
				var api_token = jwt.sign({id: IdUpdate._id}, ranm, { expiresIn: '12h' });
				
				IdUpdate.secret = ranm;
				IdUpdate.code = '';
				IdUpdate.api_token = api_token;
				IdUpdate.pushType = 'api';
				IdUpdate.regId = '';
				IdUpdate.updated_at = dateNow;
				
				await IdUpdate.save();
				res.json({
					'status': 200,
					'message': 'OK',
					'data': {'token': api_token, 'secret': ranm}
				});
			} else {
				res.json({
					'status' : 500,
					'message' : data
				});
			}
		}catch(error){
			res.json({
				'status' : 500,
				'message' : error.message
			});
		};
	},
	
	viewTest: async (req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		// var items = await bcrypt.hashSync('sebis168', 10);
		var identitiesId = '60a476c2d766ac1798d2c3e9';
		var ranm = randomstring.generate({length: 4, charset:'numeric'});
		var bank = 'bca';
		var number = '10' + ranm + Math.round((new Date()).getTime() / 1000);
		var idva = await VirtualAccount.create({
			identitiesId,
			bank,
			number,
			'created_at': dateNow,
			'updated_at': dateNow
		});
		
		res.json({
			'status': 200,
			'message': 'OK',
			'data': idva
		});
	},
	
	viewTist: async(req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		
		var passw = '$2b$10$jhxKO6mJsKCt6doDd.b5QOvaQ2uOYJC5/ZcQUe6E3ZZ3UhUGojq1W';
		try{
			var {pass} = req.body;
			if(bcrypt.compareSync(pass, passw)){
				res.json({
					'status': 200,
					'message': 'OK',
					'data': pass
				});
			} else {
				res.json({
					'status' : 500,
					'message' : 'Email or Password is incorrect!'
				});
			}
		} catch(error){
			res.json({
				'status' : 500,
				'message' : error.message
			});
		}
	},
	
	vewsTi: async(req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		
		try {
			var {email, pass} = req.params;
			var data = '';
			// verify a token symmetric
			
			if(email !== undefined && pass !== undefined){
				var ranm = randomstring.generate({length: 16, charset:'hex'});
				var IdUpdate = await Identities.findOne({ email: email});
				
				if(IdUpdate !== undefined && IdUpdate != ''){
					if(bcrypt.compareSync(pass, IdUpdate.password)){
						var api_token = jwt.sign({id: IdUpdate._id}, ranm, { expiresIn: '12h' });
				
						IdUpdate.secret = ranm;
						IdUpdate.code = '';
						IdUpdate.api_token = api_token;
						IdUpdate.pushType = 'api';
						IdUpdate.regId = '';
						IdUpdate.updated_at = dateNow;
						
						await IdUpdate.save();
						
						res.json({
							'status': 200,
							'message': 'OK',
							'data': {'token': api_token, 'secret': ranm}
						});
					} else {
						res.json({
							'status' : 500,
							'message' : 'Email or Password is incorrect!'
						});
					}
				} else {
					res.json({
						'status' : 500,
						'message' : 'Email or Password is incorrect!'
					});
				}
			} else {
				res.json({
					'status' : 500,
					'message' : 'Email and Password cant empty!'
				});
			}
		} catch(error){
			res.json({
				'status' : 500,
				'message' : error.message
			});
		}
	},
	
	viewRegister: async(req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		
		var regId = req.cookies.regId;
		if (regId !== undefined){
			return res.redirect('/home');
		}

		try{
			req.flash('paramFormRegister', 'verified');
			var ErrorMessage = req.flash('errorMessage');
			ErrorMessage = (ErrorMessage < 1) ? '' : ErrorMessage[0];
			
			res.render('register', {title: 'Halaman Register', ErrorMessage});
		}catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	},
	
	postRegister: async(req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		
		var regId = req.cookies.regId;
		if (regId !== undefined){
			return res.redirect('/home');
		}

		try{
			var paramA = req.flash('paramFormRegister');
			if(paramA < 1){
				req.flash('errorMessage', 'You detected register from other source, Please register from here.');
				return res.redirect("/register");
			};
			if(paramA[0] != 'verified'){
				req.flash('errorMessage', 'You detected register from other source, Please register from here.');
				return res.redirect("/register");
			};
			
			var {inputEmail, inputName, inputPassword} = req.body;
			
			if(inputEmail===undefined || inputName===undefined || inputPassword===undefined){
				req.flash('errorMessage', 'Please fill all form');
				return res.redirect("/register");
			};
			
			inputPassword = await bcrypt.hashSync(inputPassword, 10);
			
			var hash = encrypt(inputPassword);
			
			req.flash('paramRegister', paramA);
			req.flash('param1', inputEmail);
			req.flash('param2', inputName);
			req.flash('param3', hash.iv);
			req.flash('param4', hash.content);
			return res.redirect('/add_data');
		}catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	},
	
	logoutProccess: async(req, res) => {
		var regId = req.cookies.regId;
		if (regId !== undefined) {
			dt = dateTime.create();
			dateNow = dt.format('Y-m-d H:M:S');
			
			var getIdentities = await Identities.findOne({ regId: regId });
			getIdentities.api_token = '';
			getIdentities.pushType = '';
			getIdentities.regId = '';
			getIdentities.updated_at = dateNow;
				
			await getIdentities.save();
			await res.clearCookie("regId");
			
			console.log("Clear Cookies..!!");
		};
		return res.redirect("/login");
	},
	
	googleProcess: async (req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		var { param1, param2, param3 } = req.params;
		var paramA = req.flash('paramRegister');
		
		if(paramA < 1){
			req.flash('errorMessage', 'You detected login from other source, Please login from here.');
			return res.redirect("/login");
		}
		
		var peopleUser = await People.findOne({ email: param1 });
		if(peopleUser){
			var regId = req.cookies.regId;
			var randomNumber=Math.random().toString();
			var hour = 3600000;
				
			randomNumber=randomNumber.substring(2,randomNumber.length);
			regId = randomNumber;
			res.cookie('regId',randomNumber, { maxAge: 14 * 24 * hour, httpOnly: true });
			
			var NumberGet = await Identities.findOne({ peopleId: peopleUser._id});
			if(NumberGet){
				NumberGet.api_token = param2;
				NumberGet.pushType = 'google';
				NumberGet.regId = regId;
				NumberGet.updated_at = dateNow;
				
				await NumberGet.save();
				
				global.USERTYPE = NumberGet.userType;
				return res.redirect('/home');
			} else {
				return res.redirect("/login");
			};
			
		} else{
			req.flash('paramRegister', paramA);
			req.flash('param1', param1);
			req.flash('param2', param3) ;
			return res.redirect('/add_data');
		};
	},
	
	loginProcess: async (req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		var { email, pass } = req.body;
		var paramA = req.flash('paramRegister');
		
		var peopleUser = await People.findOne({ email: email });
		if(paramA < 1){
			req.flash('errorMessage', 'You detected login from other source, Please login from here.');
			return res.redirect("/login");
		}
		
		if(peopleUser){
			if(bcrypt.compareSync(pass, peopleUser.password)){
				var NumberGet = await Identities.findOne({ peopleId: peopleUser._id});
				var regId = req.cookies.regId;
				var randomNumber=Math.random().toString();
				var hour = 3600000;
				
				randomNumber=randomNumber.substring(2,randomNumber.length);
				
				if (regId === undefined) {
					// no: set a new cookie
					regId = randomNumber;
					res.cookie('regId',randomNumber, { maxAge: 14 * 24 * hour, httpOnly: true });
				}
				
				NumberGet.api_token = '';
				NumberGet.pushType = '';
				NumberGet.regId = regId;
				NumberGet.updated_at = dateNow;
				
				await NumberGet.save();
				
				global.USERTYPE = NumberGet.userType;
				return res.redirect('/home');
			} else {
				req.flash('errorMessage', 'Username or Password is incorect!');
				return res.redirect("/login");
			}
		}else{
			req.flash('errorMessage', 'Username or Password is incorect!');
			return res.redirect("/login");
		};
	},
	
	viewLogin: async (req, res) => {
		req.flash('paramRegister', 'verified');
		var regId = req.cookies.regId;
		var baseurl = req.get('host');
		if (regId !== undefined){
			return res.redirect('/home');
		}

		try{
			req.flash('paramRegister', 'verified');
			var ErrorMessage = req.flash('errorMessage');
			ErrorMessage = (ErrorMessage < 1) ? '' : ErrorMessage[0];
			
			//res.render('goath', {title: 'Halaman Register', locationID: 'http://localhost:3000/google', buttonGoogle: true, ErrorMessage});
			res.render('login', {title: 'Halaman Login', locationID: 'http://'+ baseurl +'/google', buttonGoogle: true, ErrorMessage});
		}catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message
			});
		};
	},
	
	viewHome: async (req, res) => {
		var regId = req.cookies.regId;
		var PName = '';
		var userType = '';
		var userMenu = '';
		var avatarThumb = '';
		
		try{
			if (regId === undefined) {
				// no: set a new cookie
				return res.redirect("/login");
			} else {
				var getIdentities = await Identities.findOne({ regId: regId });
				var imageData = await Imageurl.findOne({identitiesId: getIdentities._id, type: 'profile'});
				if(imageData != '' && imageData != null && imageData !== undefined)
					avatarThumb = imageData.image;
				
				console.log(global.USERTYPE);
				if(!getIdentities){
					res.clearCookie("regId");
					//res.cookie('regId', '', { maxAge: 14 * 24 * hour, httpOnly: true });
					return res.redirect("/login");
				} else {
					var pushType = getIdentities.pushType;
					userType = getIdentities.userType;
					
					if(pushType == 'google') isGoogle = true;
					
					var getPeople = await People.findOne({ _id: getIdentities.peopleId });
					var userMenu = await Menu.find({userType: userType, disable: 'enable', parent: ''}).sort({name: 'asc'});
					var subMenu = [];
					for(var sm=0; sm<userMenu.length; sm++){
						var tempSub = await Menu.find({parent: userMenu[sm]._id}).sort({name: 'asc'});
						if(tempSub) subMenu.push(tempSub);
						else subMenu.push('');
					};
				
					global.USERTYPE = userType;
					if(getPeople) PName = getPeople.name;
				};
			};
		
			new renderEJS({getIdentities, peopleName: PName, userType:ucfirst(userType), menu: userMenu, submenu: subMenu, avatarThumb},req,res, 'admin/index.ejs', 'content-main/main-public.ejs');
			
		} catch(error){
			res.json({
				'status': 200,
				'messages': 'OK',
				'data': 'Error. ' + error.message
			});
		};
	},
	
	addFirstData: async (req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		
		var paramA = req.flash('paramRegister');
		var param1 = req.flash('param1');
		var param2 = req.flash('param2');
		var param3 = req.flash('param3');
		var param4 = req.flash('param4');
		
		if(param1.length < 1 || param2.length < 1 || paramA.length < 1){
			return res.redirect("/login");
		};
		
		var msg = '';
		var name = param2[0];
		var nameLetter='';
		var nameEng='';
		var secret='';
		var sex='';
		var phone='';
		var password='';
		var validate='';
		var email=param1[0];
		var avatar='';
		var created_at=dateNow;
		var updated_at=dateNow;
		var regId = req.cookies.regId;
		var userType = 'public';
		var baseurl = 'https://'+req.get('host');
		
		if(param3.length > 0 && param4.length > 0){
			password = decrypt({
				'iv': param3[0],
				'content': param4[0]
			});
			
		}
		var getPeople = await People.findOne({ email: email });
				
		if(getPeople){
			req.flash('errorMessage', 'Email has been registered, please login or register with new email');
			return res.redirect('/login');
		};
		
		if (regId === undefined) {
			// no: set a new cookie
			var randomNumber=Math.random().toString();
			var hour = 3600000;
			
			randomNumber=randomNumber.substring(2,randomNumber.length);
			regId = randomNumber;
			res.cookie('regId', randomNumber, { maxAge: 14 * 24 * hour, httpOnly: true });
		}
		
		var tempPeople = await People.create({
			name,
			nameLetter,
			nameEng,
			secret,
			sex,
			phone,
			password,
			validate,
			email,
			avatar,
			created_at,
			updated_at
		});
		
		var tempPInfo = await PeopleInfo.create({
			peopleId: tempPeople._id,
			cardId: '',
			cardType: '',
			cardNation: '',
			marry: '',
			education: '',
			birthDate: '',
			birthPlace: '',
			drivingLicense: '',
			nickName: '',
			avatarUrl: '',
			gender: '',
			religion: '',
			language: '',
			address: '',
			city: '',
			province: '',
			created_at: dateNow,
			updated_at: dateNow
		});
		
		var tempData = await Identities.create({
			compId: '0',
			userType: userType,
			peopleId: tempPeople._id,
			positionId: '',
			titleId: '',
			departId: '0',
			roleId: '',
			ruleId: '',
			number: phone,
			code: '',
			secret,
			disable: 'enable',
			balance: '',
			groupType: 'normal',
			employDate: '',
			leaveDate: '',
			startTime: '',
			endTime: '',
			subscribe: '',
			registed: '',
			subscribeStart: '',
			subscribeEnd: '',
			api_token: '',
			regId,
			pushType: '',
			created_at: dateNow,
			updated_at: dateNow
		});
		
		//msg += 'Sukses menambahkan People ID: ' + tempPeople._id;
		//msg += '. Sukses menambahkan Identitas ID: ' + tempData._id;
		
		try{
			var jtoken = jwt.sign({ id: tempPeople._id }, email, { expiresIn: "1h" });
			var linkUri = baseurl + "/verify/" + jtoken;
			
			var insertVerify = await VerifyEmail.create({
				peopleId: tempPeople._id,
				email: email,
				status: "0",
				token: jtoken,
				created_at: dateNow,
				updated_at: dateNow
			});
			
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
			
			var textEmail 	 = "Halo " + name + ", <br>";
			textEmail 	 	+= "Selamat datang di SebisLes.<br>";
			textEmail		+= "Terima kasih sudah bergabung dengan SebisLes. Kami yakin anda akan senang disini!";
			textEmail		+= "<br>";
			//textEmail		+= "<a href='" + linkUri + "'>" + linkUri + "</a><br>";
			//textEmail		+= "*nb: Link hanya bertahan selama 1 jam<br>";
			//textEmail		+= "Apabila anda tidak mendaftarkan akun di <a href='" + baseurl + "'>" + baseurl + "</a>, tidak ada aksi lanjutan yang dibutuhkan, anda dapat meninggalkan email ini dengan aman.";
			textEmail		+= "<br><br><br>";
			textEmail		+= "Regards,<br>";
			textEmail		+= "SebisLes Staff";
			
			let info = await transporter.sendMail({
				from: '"No-Reply System Admin" <noreply@sbstech.co.id>',
				to: email,
				subject: "SebisLes User Email Notification",
				text: "",
				html: textEmail
			});
					
			global.USERTYPE = userType;
			return res.redirect('/home');
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Error. Message: '+error.message
			});
		};
	},
	
	viewSuccess: async (req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		
		var regId = req.cookies.regId;
		
		if (regId === undefined) {
			// no: set a new cookie
			var randomNumber=Math.random().toString();
			var hour = 3600000;
			
			randomNumber=randomNumber.substring(2,randomNumber.length);
			regId = randomNumber;
			res.cookie('regId',randomNumber, { maxAge: 14 * 24 * hour, httpOnly: true });
		}
		
		var sess = req.session;
		var name = '';
		var nameLetter='';
		var nameEng='';
		var secret='';
		var sex='';
		var phone='';
		var password=req.sessionID;
		var validate='';
		var email='';
		var avatar='';
			
		try{
			
			var created_at=dateNow;
			var updated_at=dateNow;
			
			var { namas, emails, idtoken } = req.params;
			const registeredPeople = await People.findOne({ email: emails });
			
			name = namas;
			email = emails;
			secret = '';
			
			if(registeredPeople){
				
				res.json({
					'status': 200,
					'messages': 'OK',
					'data': {
						'nama' : registeredPeople.name,
						'phone' : registeredPeople.phone,
						'email' : registeredPeople.email,
						'secret' : registeredPeople.secret,
						'password' : registeredPeople.password
					}
				});
			} else{
				var tempData = await People.create({
					name,
					nameLetter,
					nameEng,
					secret,
					sex,
					phone,
					password,
					validate,
					email,
					avatar,
					created_at,
					updated_at
				});
				
				var peopleId = '';
				var msg = '';
				
				if(tempData._id){
					peopleId = tempData._id;
					msg = 'Has been success registered as id: ' + peopleId;
					
					var tempData = await Identities.create({
						compId: '0',
						userType: 'public',
						peopleId,
						positionId: '',
						titleId: '',
						departId: '0',
						roleId: '',
						ruleId: '',
						number: '',
						code: '',
						secret,
						disable: 'enable',
						balance: '',
						groupType: 'normal',
						employDate: '',
						leaveDate: '',
						startTime: '',
						endTime: '',
						subscribe: '',
						registed: '',
						subscribeStart: '',
						subscribeEnd: '',
						api_token: idtoken,
						regId,
						pushType: 'google',
						created_at: dateNow,
						updated_at: dateNow
					});
					
					msg += ', Identities ID: ' + tempData._id;
				};
				
				res.json({
					'status': 200,
					'messages': 'OK',
					'data': 'Not registered user. ' + msg
				});
			};
		} catch(error){
			res.json({
				'status': 500,
				'messages': 'Internal Server Error, ' + error.message,
				'parameter': {
					'param1': name,
					'param2': email,
					'param3': secret
				}
			});
		};
	},
	
	getVerifiyEmail: async(req, res) => {
		var { token } = req.params;
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		var value = '';
		var ER = false;
		var ERMsg = "";
		
		try{
			if(token === undefined || token !=""){
				var getVerify = await VerifyEmail.findOne({token: token});
				if(getVerify !== undefined && getVerify != null){
					if(getVerify.status == "0"){
						jwt.verify(token, getVerify.email, function(err, decoded){
							if(err){
								ER = true;
								ERMsg = err.message;
								
								if(ERMsg == "jwt expired"){
									ERMsg = "Link validasi sudah kadaluarsa, silahkan untuk mengklik tombol validasi email di halaman profil anda";
								}
						}});
						
						if(ER){
							value = {
								Codes: "500",
								Title: "Error",
								Messages: ERMsg
							};
						}else{
							getVerify.status="1";
							getVerify.token = "";
							getVerify.updated_at = dateNow;
							await getVerify.save();
							
							value = {
								Codes: "200",
								Title: "Success",
								Messages: "Akun email anda berhasil divalidasi, silahkan login atau dengan mengklik tombol dibawah ini"
							};
						};
					}else{
						value = {
							Codes: "500",
							Title: "Error",
							Messages: "Email anda sudah di validasi sebelumnya!"
						};
					};
				} else {
					value = {
							Codes: "500",
							Title: "Error",
							Messages: "Token salah, silahkan untuk mengklik link di email dengan benar!"
					};
				};
			} else {
				value = {
							Codes: "500",
							Title: "Error",
							Messages: "Bad Request, Please Contact Your Administrator!"
					};
			};
			res.render('admin/indexverifyemail', value);
		}catch(error){
			value = {
							Codes: "500",
							Title: "Error",
							Messages: error.message
						};
			res.render('admin/indexverifyemail', value);
		};
	},
	
}