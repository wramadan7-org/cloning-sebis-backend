// DB
const People = require("../models/People");
const PeopleInfo = require("../models/People_info");
const Identities = require("../models/Identities");
const Users = require("../models/Users");
const Article = require("../models/Article");
const Crs = require("../models/Course");
const Course = require("../models/Course_material");
const Study = require("../models/Study");
const Grade = require("../models/Grade");
const Imageurl = require("../models/Image_url");
const Schedule = require("../models/Schedule");
const Cart = require("../models/Cart");
const CartDetail = require("../models/Cart_detail");
const Price = require("../models/Price");
const OrderDB = require("../models/Order");
const OrderDetail = require("../models/Order_detail");
const VirtualAccount = require("../models/VirtualAccount");
const VerifyEmail = require("../models/Verify_email");
const Kelas = require("../models/Kelas");
const Mapel = require("../models/Mapel");
const Jadwal = require("../models/Jadwal");
const School = require("../models/School");
// const Notiflog = require("../models/Notiflog");

const nodemailer = require("nodemailer");
const fs = require('fs');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
var path = require('path');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var randomstring = require("randomstring");
const axios = require('axios');

/**
 * ===============
 * Midtrans Require
 * ===============
 */
const midtransClient = require('midtrans-client');

let core = new midtransClient.CoreApi({
	isProduction: false,
	serverKey: 'SB-Mid-server-5qtJYegxLC6tOYMSdrldZOyZ',
	clientKey: 'SB-Mid-client-q5IIrrIOkNz9aiZ6'
});

let snap = new midtransClient.Snap({
	isProduction: false,
	serverKey: 'SB-Mid-server-5qtJYegxLC6tOYMSdrldZOyZ',
	clientKey: 'SB-Mid-client-q5IIrrIOkNz9aiZ6'
});

const dateTime = require('node-datetime');
var dt = dateTime.create();
var dateNow = dt.format('Y-m-d H:M:S');

var kode = 'MUHAMMADARIFIN';

function ucfirst(str) {
	var firstLetter = str.slice(0, 1);
	return firstLetter.toUpperCase() + str.substring(1);
}

module.exports = {
	firstAccess: async (req, res) => {
		var randomNumber = bcrypt.hashSync(kode, 10);

		try {
			// console.log("Random Number: " + randomNumber);
			var token = jwt.sign({ reg: randomNumber }, config.secret);
			res.status(200).send({ auth: true, token: token });

		} catch (err) {
			console.log(err.message);
			res.status(500).send("There was a problem registering the device.");
		};
	},

	test: async (req, res) => {
		try {

			var password = await bcrypt.hashSync('rezha123', 10);

			res.status(200).send({
				'status': 200,
				'message': 'OK',
				'data': password
			});
		} catch (err) {
			console.log(err.message);
			res.status(500).send("There was a problem registering the user.");
		};
	},
	testPassword: async (req, res) => {
		try {
			var { email, pass } = req.params;
			var msg = 'Password Salah';
			var Peoples = await People.findOne({ email: email });

			if (bcrypt.compareSync(pass, Peoples.password)) {
				msg = 'BETUL';
			}

			res.status(200).send({
				'status': 200,
				'message': 'OK',
				'data': msg
			});
		} catch (err) {
			console.log(err.message);
			res.status(500).send(err.message);
		};
	},

	getIdUser: async (req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');

		try {
			var { JWTTOKEN, secret } = req.body;
			if (JWTTOKEN !== undefined && secret !== undefined) {
				var IdUpdate = await Identities.findOne({ secret: secret, pushType: 'api', api_token: JWTTOKEN });
				if (IdUpdate !== undefined && IdUpdate != '' && IdUpdate != null) {
					var getPeopleInfo = await PeopleInfo.findOne({ peopleId: IdUpdate.peopleId });
					var getPeople = await People.findOne({ _id: IdUpdate.peopleId });

					var valreturn = {
						'userId': IdUpdate._id,
						'userType': IdUpdate.userType,
						'name': getPeople.name,
						'gender': getPeopleInfo.gender,
						'phone': getPeople.phone,
						'registered_date': IdUpdate.created_at
					};
					res.status(200).send({
						'status': 200,
						'message': 'OK',
						'data': valreturn
					});
				} else {
					res.status(500).send({
						'status': 500,
						'message': 'Bad Token / Secret'
					});
				};
			} else {
				res.status(500).send({
					'status': 500,
					'message': 'Bad request'
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	registerEmail: async (req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');
		var PID = '';
		var baseurl = 'https://' + req.get('host');

		try {
			var { nama, school, phone, email } = req.body;
			console.log(req.body);
			if (nama === undefined || nama == null || nama == '' || email === undefined || email == null || email == '' || school == undefined || school == null || school == '' || phone == undefined || phone == null || phone == '') {
				res.status(500).send({
					'status': 500,
					'message': 'Field Tidak Boleh Kosong!'
				});
			} else {
				var ER = false;
				var ERmsg = '';

				var randomNumber = randomstring.generate({ length: 10, charset: 'hex' });
				var password = await bcrypt.hashSync(randomNumber, 10);
				var Peoples = await People.findOne({ email: email });
				var jtoken = jwt.sign({ message: 'success' }, email, { expiresIn: "1h" });
				var linkUri = baseurl + "/verify/" + jtoken;

				if (Peoples === undefined || Peoples == '' || Peoples == null) {
					var tempPeople = await People.create({
						name: nama,
						nameLetter: '',
						nameEng: '',
						secret: '',
						sex: '',
						phone: phone,
						password,
						validate: '',
						email,
						avatar: '',
						created_at: dateNow,
						updated_at: dateNow
					});

					var insertVerify = await VerifyEmail.create({
						peopleId: tempPeople._id,
						email: email,
						status: "0",
						token: jtoken,
						created_at: dateNow,
						updated_at: dateNow
					});

					var tempSchool = await School.create({
						peopleId: tempPeople._id,
						name: school,
						grade: '',
						cityOfSchool: '',
						curriculum: '',
						schoolAddress: '',
						created_at: dateNow,
						updated_at: dateNow
					})

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
						userType: 'student',
						peopleId: tempPeople._id,
						positionId: '',
						titleId: '',
						departId: '0',
						roleId: '',
						ruleId: '',
						number: '',
						code: '',
						secret: '',
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
						regId: '',
						pushType: '',
						created_at: dateNow,
						updated_at: dateNow
					});

					PID = tempPeople._id;
				} else {
					ER = true;
					ERmsg = 'Email sudah terdaftar, silahkan gunakan email yang lain!';

					/* THIS IS USING WITH VERIFICATION EMAIL */
					/*
					PID = Peoples._id;
					var dateSend = new Date(Peoples.updated_at);
					var dateNow = new Date(dateNow);
					var diff = (dateNow.getTime() - dateSend.getTime()) / (1000 * 3600);
					var checkVerify = await VerifyEmail.findOne({email: email});
					console.log("Milisecond Diff: " + diff);
					if(diff < 1){
						ER = true;
						ERmsg = 'Please try again in 1 hour!';
					} else {
						if(checkVerify === undefined || checkVerify == null || checkVerify != ''){
						var insertVerify = await VerifyEmail.create({
							peopleId: Peoples._id,
							email: email,
							status: "0",
							token: jtoken,
							created_at: dateNow,
							updated_at: dateNow
						});
						} else {
						if(checkVerify.status == "1"){
							ER = true;
							ERmsg = 'Your email has been verified before!';
						}
						}
					}
					*/
				}

				if (!ER) {
					var ranm = randomstring.generate({ length: 6, charset: 'hex' }); // Verification Code
					var vercode = randomstring.generate({ length: 16, charset: 'hex' });
					var api_token = jwt.sign({ code: vercode }, ranm, { expiresIn: 300000 });
					var IdUpdate = await Identities.findOne({ peopleId: PID });
					IdUpdate.code = vercode;
					IdUpdate.updated_at = dateNow;
					await IdUpdate.save();

					var textEmail = "Hello " + nama + ", <br>";
					textEmail += "Selamat datang di SebisLes.<br>";
					textEmail += "Terima kasih sudah bergabung dengan SebisLes. Kami yakin anda akan senang disini!";
					textEmail += "<br>";
					textEmail += "Silahkan untuk login di device anda dengan email yang telah di daftarkan dan password dibawah ini:<br>";
					textEmail += "Lalu silahkan untuk masukkan Nomer validasi di bawah ini. <br>";
					//textEmail		+= "<a href='" + linkUri + "'>" + linkUri + "</a><br>";
					//textEmail		+= "<br>After you verify email account, you can login with this password below:"
					textEmail += "Password: <u><b>" + randomNumber + "</b></u><br>";
					textEmail += "Kode Validasi: <u><b>" + ranm + "</b></u>";
					textEmail += "<br><br><br>";
					textEmail += "Regards,<br>";
					textEmail += "SebisLes Staff";

					let transporter = nodemailer.createTransport({
						host: "m005.dapurhosting.com",
						port: 465,
						secure: true, // true for 465, false for other ports
						auth: {
							user: "noreply@sbstech.co.id",
							pass: "fvjvCY^%*3423",
						},
					});

					let info = await transporter.sendMail({
						from: '"No-Reply System Admin" <noreply@sbstech.co.id>',
						to: email,
						subject: "SebisLes User Email",
						text: "",
						html: textEmail
					});

					if (Peoples !== undefined && Peoples != null && Peoples != '') {
						Peoples.password = password;
						Peoples.updated_at = dateNow;
						await Peoples.save();
					};

					res.status(200).send({
						'status': 200,
						'message': 'OK',
						'data': { 'token': api_token }
					});
				} else {
					res.status(500).send({
						'status': 500,
						'message': ERmsg
					});
				}
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	userLogin: async (req, res) => {
		dt = dateTime.create();
		dateNow = dt.format('Y-m-d H:M:S');

		try {
			var { email, password } = req.body;
			console.log(req.body);
			var data = '';
			// verify a token symmetric

			if (email !== undefined && password !== undefined) {
				var Peoples = await People.findOne({ email: email });
				//console.log(Peoples);
				if (Peoples !== undefined && Peoples != '' && Peoples != null) {
					if (bcrypt.compareSync(password, Peoples.password)) {

						var ranm = randomstring.generate({ length: 6, charset: 'hex' }); // Verification Code
						var vercode = randomstring.generate({ length: 16, charset: 'hex' });
						var api_token = jwt.sign({ code: vercode }, ranm, { expiresIn: 300000 });

						var textEmail = "Hello " + Peoples.name + ", <br>";
						textEmail += "Selamat datang kembali di SebisLes.<br>";
						textEmail += "Harap segera masukkan Nomer validasi di bawah ini. (Kode hanya aktif 5 menit)<br>";
						//textEmail		+= "<a href='" + linkUri + "'>" + linkUri + "</a><br>";
						//textEmail		+= "<br>After you verify email account, you can login with this password below:"
						textEmail += "Kode Validasi: <u><b>" + ranm + "</b></u>";
						textEmail += "<br><br><br>";
						textEmail += "Regards,<br>";
						textEmail += "SebisLes Staff";

						let transporter = nodemailer.createTransport({
							host: "m005.dapurhosting.com",
							port: 465,
							secure: true, // true for 465, false for other ports
							auth: {
								user: "noreply@sbstech.co.id",
								pass: "fvjvCY^%*3423",
							},
						});

						let info = await transporter.sendMail({
							from: '"No-Reply System Admin" <noreply@sbstech.co.id>',
							to: email,
							subject: "SebisLes User Email",
							text: "",
							html: textEmail
						});

						var IdUpdate = await Identities.findOne({ peopleId: Peoples._id });
						IdUpdate.code = vercode;
						IdUpdate.updated_at = dateNow;

						await IdUpdate.save();

						res.status(200).send({
							'status': 200,
							'message': 'OK',
							'data': { 'token': api_token, 'code': ranm }
						});
					} else {
						res.status(500).send({
							'status': 500,
							'message': 'Email / Password Salah!'
						});
					}
				} else {
					res.status(500).send({
						'status': 500,
						'message': 'Email / Password Salah!'
					});
				}
			} else {
				res.status(500).send({
					'status': 500,
					'message': 'Email / Password Tidak Boleh Kosong!'
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		}
	},

	userVerification: async (req, res) => {
		// token generated from login api with secret code where is send to email
		// and have user code identities for update login table

		var { JWTTOKEN, code } = req.body;
		var data = '';
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var ER = false;

		try {
			if (JWTTOKEN !== undefined && code !== undefined) {
				jwt.verify(JWTTOKEN, code, function (err, decoded) {
					if (err) {
						ER = true;
						data = err.message;
					} else {
						data = decoded.code;
					}
				});

				if (!ER) {
					var ranm = randomstring.generate({ length: 16, charset: 'hex' });
					var IdUpdate = await Identities.findOne({ code: data });
					var api_token = jwt.sign({ id: IdUpdate._id }, ranm, { expiresIn: '12h' });

					IdUpdate.secret = ranm;
					IdUpdate.code = '';
					IdUpdate.api_token = api_token;
					IdUpdate.pushType = 'api';
					IdUpdate.regId = '';
					IdUpdate.updated_at = dateNow;

					await IdUpdate.save();
					res.status(200).send({
						'status': 200,
						'message': 'OK',
						'data': { 'token': api_token, 'secret': ranm }
					});
				} else {
					res.status(500).send({
						'status': 500,
						'message': data
					});
				}
			} else {
				res.status(500).send({
					'status': 500,
					'message': 'Bad request'
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	refreshToken: async (req, res) => {
		var data = '';
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');

		try {
			var { JWTTOKEN, secret } = req.body;
			if (JWTTOKEN !== undefined && secret !== undefined) {
				var IdUpdate = await Identities.findOne({ secret: secret, pushType: 'api', api_token: JWTTOKEN });
				if (IdUpdate !== undefined && IdUpdate != '' && IdUpdate != null) {
					var ranm = randomstring.generate({ length: 16, charset: 'hex' });
					var api_token = jwt.sign({ id: IdUpdate._id }, ranm, { expiresIn: '12h' });

					IdUpdate.secret = ranm;
					IdUpdate.code = '';
					IdUpdate.api_token = api_token;
					IdUpdate.pushType = 'api';
					IdUpdate.regId = '';
					IdUpdate.updated_at = dateNow;

					await IdUpdate.save();
					res.status(200).send({
						'status': 200,
						'message': 'OK',
						'data': { 'token': api_token, 'secret': ranm }
					});
				} else {
					res.status(500).send({
						'status': 500,
						'message': 'Bad Token / Secret'
					});
				};
			} else {
				res.status(500).send({
					'status': 500,
					'message': 'Bad request'
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	searchGrade: async (req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var ER = false;

		try {
			var { JWTTOKEN, curr } = req.body;
			if (JWTTOKEN !== undefined) {
				var IdUpdate = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (IdUpdate !== undefined && IdUpdate != '' && IdUpdate != null) {
					var tokenOwner = IdUpdate._id;
					var tokenSecret = IdUpdate.secret;
					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
						}
					});

					if (!ER) {
						var getKelas = await Kelas.find({ curriculum: curr, disable: 'enable' });
						if (getKelas !== undefined && getKelas != null && getKelas != '') {
							var DataTotal = [];

							for (var gk = 0; gk < getKelas.length; gk++) {
								var dataMapel = [];
								var DataKelas = getKelas[gk];
								var getMapel = await Mapel.find({ kelasId: DataKelas._id, disable: 'enable' });

								if (getMapel !== undefined && getMapel != null && getMapel != '') {
									for (var gm = 0; gm < getMapel.length; gm++) {
										var Temp = getMapel[gm];
										var TVal = {
											"idMapel": Temp._id,
											"nameMapel": Temp.name.toUpperCase()
										};
										dataMapel.push(TVal);
									}
								} else
									dataMapel = '';

								if (DataKelas.grade == DataKelas.tograde)
									var GradeS = DataKelas.grade;
								else
									var GradeS = DataKelas.grade + ' - ' + DataKelas.tograde;

								var KVal = {
									'idTingkat': DataKelas._id,
									'nameTingkat': DataKelas.name,
									'grade': GradeS,
									'mapel': dataMapel
								};

								DataTotal.push(KVal);
							}

							//console.log(DataTotal);

							res.status(200).send({
								'status': 200,
								'message': 'OK',
								'data': DataTotal
							});
						} else {
							res.status(500).send({
								'status': 500,
								'message': 'Tingkat Kelas Tidak Ditemukan!'
							});
						}
					} else {
						res.status(500).send({
							'status': 500,
							'message': data
						});
					}
				} else {
					res.status(500).send({
						'status': 500,
						'message': 'Bad Token'
					});
				}
			} else {
				res.status(500).send({
					'status': 500,
					'message': 'Bad request'
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	getNewSchedule: async (req, res) => {
		var ER = false;
		var getSchedule = [];

		try {
			var { JWTTOKEN, getMonth, getYear, identitiesId } = req.body;
			if (JWTTOKEN === undefined) {
				ER = true;
				data = 'Token is empty';
			}
			if (getMonth === undefined) {
				ER = true;
				data = 'Month is empty';
			}
			if (getYear === undefined) {
				ER = true;
				data = 'Year is empty';
			}
			if (identitiesId === undefined) {
				ER = true;
				data = 'Teacher ID is empty';
			}

			if (!ER) {
				var IdUpdate = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (IdUpdate !== undefined && IdUpdate != '' && IdUpdate != null) {
					var tokenOwner = IdUpdate._id;
					var tokenSecret = IdUpdate.secret;
					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
							if (data != tokenOwner) {
								ER = true;
								data = 'Bad Token';
							}
						}
					});

					if (!ER) {
						var getPrice = await Price.find({ $or: [{ name: "0" }, { name: "1" }] }).sort({ name: "asc" });

						var days_of_month = new Date(getYear, getMonth, 0).getDate();
						for (var dd = 0; dd < days_of_month; dd++) {

							var dy = dd + 1;
							if (dy < 10) dy = '0' + dy;
							var monthNow = getMonth;
							if (monthNow < 10) monthNow = '0' + monthNow;

							var valDate = getYear + '-' + monthNow + '-' + dy + ' 00:00 GMT+0700';
							var trueDate = new Date(valDate);
							var getJadwal = await Jadwal.find({ identitiesId: identitiesId, day: trueDate.getDay() }).sort({ dateStart: 1 });

							var nowDay = '';
							switch (trueDate.getDay()) {
								case 0:
									nowDay = "Minggu";
									break;
								case 1:
									nowDay = "Senin";
									break;
								case 2:
									nowDay = "Selasa";
									break;
								case 3:
									nowDay = "Rabu";
									break;
								case 4:
									nowDay = "Kamis";
									break;
								case 5:
									nowDay = "Jumat";
									break;
								case 6:
									nowDay = "Sabtu";
							}


							if (getJadwal !== undefined && getJadwal != null && getJadwal != '') {
								var valTemp = [];

								for (var ts = 0; ts < getJadwal.length; ts++) {
									var tempSchedule = await Schedule.find({
										identitiesId: identitiesId,
										$and: [{ dateStart: { $lte: getJadwal[ts].dateEnd }, dateEnd: { $gte: getJadwal[ts].dateStart } }]
									});

									if (tempSchedule !== undefined && tempSchedule != null && tempSchedule != '') {
										var jadwalExpired = 0;
										for (var xxx = 0; xxx < tempSchedule.length; xxx++) {
											var tss = tempSchedule[xxx];
											if (tss.status == "0") {
												var dt = dateTime.create();
												var dateNow = dt.format('Y-m-d H:M:S');
												var nowDate = new Date(dateNow + '  GMT+0700');

												var expiredDate = new Date(tempSchedule.created_at + '  GMT+0700');
												expiredDate.setMinutes(expiredDate.getMinutes() + 15);		// SET TIME 15 MINUTES

												if (nowDate.getTime() >= expiredDate.getTime()) {
													await Schedule.findOneAndRemove({ _id: tss._id });
													jadwalExpired++;
												}
											}
										}

										if (jadwalExpired == tempSchedule.length) {
											/*	JADWAL KOSONG	*/
											valTemp[ts] = {
												'tanggal': dy + '-' + monthNow + '-' + getYear,
												'hari': nowDay,
												'timeStart': getJadwal[ts].dateStart.substr(11, 5),
												'timeEnd': getJadwal[ts].dateEnd.substr(11, 5),
												'status': '',
												'private': getPrice[0].nprice1,
												'privateId': getPrice[0]._id,
												'group': getPrice[1].nprice1,
												'groupId': getPrice[1]._id,
											}
										} else {
											valTemp[ts] = {
												'tanggal': dy,
												'day': nowDay,
												'timeStart': getJadwal[ts].dateStart.substr(11, 5),
												'timeEnd': getJadwal[ts].dateEnd.substr(11, 5),
												'status': '1',
												'private': getPrice[0].nprice1,
												'privateId': getPrice[0]._id,
												'group': getPrice[1].nprice1,
												'groupId': getPrice[1]._id,
											}
										}
									} else {
										valTemp[ts] = {
											'tanggal': dy,
											'day': nowDay,
											'timeStart': getJadwal[ts].dateStart.substr(11, 5),
											'timeEnd': getJadwal[ts].dateEnd.substr(11, 5),
											'status': '',
											'private': getPrice[0].nprice1,
											'privateId': getPrice[0]._id,
											'group': getPrice[1].nprice1,
											'groupId': getPrice[1]._id,
										}
									}
								}
								getSchedule[dd] = valTemp;
							} else {
								getSchedule[dd] = [];
							}
						}
						//console.log(getSchedule);
						res.status(200).send({
							'status': 200,
							'message': 'OK',
							'totaldata': getSchedule.length,
							'data': getSchedule
						});
					} else {
						res.status(500).send({
							'status': 500,
							'message': data
						});
					}
				} else {
					res.status(500).send({
						'status': 500,
						'message': 'Bad Token'
					});
				}
			} else {
				res.status(500).send({
					'status': 500,
					'message': data
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	viewCart: async (req, res) => {
		var ER = false;
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');

		try {
			var { JWTTOKEN, studentId } = req.body;
			if (JWTTOKEN === undefined) {
				ER = true;
				data = 'Token is empty';
			}
			if (studentId === undefined) {
				ER = true;
				data = 'Student ID is empty';
			}

			if (!ER) {
				var IdUpdate = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (IdUpdate !== undefined && IdUpdate != '' && IdUpdate != null) {
					var tokenOwner = IdUpdate._id;
					var tokenSecret = IdUpdate.secret;
					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
							if (data != tokenOwner || data != studentId) {
								ER = true;
								data = 'Bad Token';
							}
						}
					});

					if (!ER) {
						var grouping = [];

						var getDistinct = await Cart.distinct("studyId", { studentId: studentId });
						if (getDistinct != '' && getDistinct != undefined && getDistinct != null) {
							for (var d = 0; d < getDistinct.length; d++) {
								var datacart = [];
								var getStudy = await Study.findOne({ _id: getDistinct[d] });
								var getMapel = await Mapel.findOne({ _id: getStudy.typeId });
								var getKelas = await Kelas.findOne({ _id: getStudy.gradeId });
								var teacherId = await Identities.findOne({ _id: getStudy.identitiesId });
								var teacherInfo = await People.findOne({ _id: teacherId.peopleId });
								var imageData = await Imageurl.findOne({ identitiesId: teacherId._id, type: 'profile' });
								var studygrade = getKelas.name + ' (' + getKelas.grade + '-' + getKelas.tograde + ')';
								var getCart = await Cart.find({ studyId: getDistinct[d], studentId: studentId });

								if (imageData != '' && imageData !== undefined && imageData != null)
									var avatarUrl = imageData.image;
								else
									var avatarUrl = '';

								for (var gc = 0; gc < getCart.length; gc++) {
									var tempCart = getCart[gc];
									var getPrice = await Price.findOne({ _id: tempCart.priceId });
									var coursedetail = {
										'cartid': tempCart._id,
										'coursedate': tempCart.courseDate.substr(0, 10),
										'starttime': tempCart.startTime.substr(11, 5),
										'endtime': tempCart.endTime.substr(11, 5),
										'priceId': getPrice._id,
										'price': getPrice.nprice1,
										'priceName': getPrice.desc,
										'created_at': tempCart.created_at
									};
									datacart.push(coursedetail);
								};

								var Values = {
									'studyid': getDistinct[d],
									'studyname': getMapel.name,
									'studygrade': studygrade,
									'teacherid': teacherId._id,
									'teachername': teacherInfo.name,
									'teacherimage': avatarUrl,
									'schedule': datacart
								};

								grouping.push(Values);
							};

							res.status(200).send({
								'status': 200,
								'message': 'OK',
								'data': grouping
							});
						} else {
							res.status(500).send({
								'status': 200,
								'message': 'OK',
								'data': ''
							});
						}
					} else {
						res.status(500).send({
							'status': 500,
							'message': data
						});
					}
				} else {
					res.status(500).send({
						'status': 500,
						'message': 'Bad Token'
					});
				}
			} else {
				res.status(500).send({
					'status': 500,
					'message': data
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	deleteCart: async (req, res) => {
		var ER = false;
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');

		try {
			var { JWTTOKEN, studentId, cartId } = req.body;
			if (JWTTOKEN === undefined) {
				ER = true;
				data = 'Token is empty';
			}
			if (studentId === undefined) {
				ER = true;
				data = 'Student ID is empty';
			}
			if (cartId === undefined) {
				ER = true;
				data = 'Cart ID is empty';
			}

			if (!ER) {
				var IdUpdate = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (IdUpdate !== undefined && IdUpdate != '' && IdUpdate != null) {
					var tokenOwner = IdUpdate._id;
					var tokenSecret = IdUpdate.secret;
					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
							if (data != tokenOwner || data != studentId) {
								ER = true;
								data = 'Bad Token';
							}
						}
					});

					if (!ER) {
						var getCart = await Cart.findOne({ _id: cartId, studentId: studentId });
						if (getCart !== undefined && getCart != '' && getCart != null) {
							await getCart.remove();
							res.status(200).send({
								'status': 200,
								'message': 'OK',
								'data': cartId
							});
						} else {
							res.status(500).send({
								'status': 500,
								'message': 'Keranjang Tidak Ditemukan!'
							});
						}
					} else {
						res.status(500).send({
							'status': 500,
							'message': data
						});
					}
				} else {
					res.status(500).send({
						'status': 500,
						'message': 'Bad Token'
					});
				}
			} else {
				res.status(500).send({
					'status': 500,
					'message': data
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	addNewCart: async (req, res) => {
		var ER = false;
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');

		try {
			var { JWTTOKEN, teacherId, studyId, studentId, courseDate, priceId, statusCourse, startTime, endTime } = req.body;
			if (JWTTOKEN === undefined) {
				ER = true;
				data = 'Token is empty';
			}
			if (teacherId === undefined) {
				ER = true;
				data = 'Teacher ID is empty';
			}
			if (studyId === undefined) {
				ER = true;
				data = 'Study ID is empty';
			}
			if (studentId === undefined) {
				ER = true;
				data = 'Student ID is empty';
			}
			if (courseDate === undefined) {
				ER = true;
				data = 'Course Date is empty';
			}
			if (priceId === undefined) {
				ER = true;
				data = 'Price ID is empty';
			}
			if (statusCourse === undefined) {
				ER = true;
				data = 'Cart is Private / Group?';
			}
			if (startTime === undefined || endTime === undefined) {
				ER = true;
				data = 'Course Time is empty';
			}

			if (!ER) {
				var IdUpdate = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (IdUpdate !== undefined && IdUpdate != '' && IdUpdate != null) {
					var tokenOwner = IdUpdate._id;
					var tokenSecret = IdUpdate.secret;
					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
							if (data != tokenOwner || data != studentId) {
								ER = true;
								data = 'Bad Token';
							}
						}
					});

					if (!ER) {
						var hari = courseDate.substr(0, 2);
						var bulan = courseDate.substr(3, 2);
						var tahun = courseDate.substr(6, 4);
						courseDate = tahun + '-' + bulan + '-' + hari;
						var courseStart = courseDate + ' ' + startTime;
						var courseEnd = courseDate + ' ' + endTime;

						var query = {
							teacherId: teacherId,
							studyId: studyId,
							studentId: studentId,
							priceId: priceId,
							status: statusCourse,
							courseDate: courseDate + ' 00:00',
							startTime: courseStart,
							endTime: courseEnd
						};
						/*
						var tempSchedule = await Schedule.findOne({
							identitiesId: teacherId,
							studyId: studyId,
							clientId: studentId,
							$and:[{dateStart: {$lte: courseEnd}, dateEnd:{$gte: courseStart}}]
						});
						*/
						var checkCart = await Cart.findOne(query);
						if (checkCart !== undefined && checkCart != '' && checkCart != null) {
							res.status(500).send({
								'status': 500,
								'message': 'Kursus sudah ada, silahkan cek keranjang anda!'
							});
						} else {
							query.created_at = dateNow;
							query.updated_at = dateNow;

							var insertCart = await Cart.create(query);
							res.status(200).send({
								'status': 200,
								'message': 'OK',
								'data': insertCart._id
							});
						}
					} else {
						res.status(500).send({
							'status': 500,
							'message': data
						});
					}
				} else {
					res.status(500).send({
						'status': 500,
						'message': 'Bad Token'
					});
				}
			} else {
				res.status(500).send({
					'status': 500,
					'message': data
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	NewCheckout: async (req, res) => {
		var ER = false;
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');

		try {
			var { JWTTOKEN, studentId, payMethod, ccData } = req.body;
			if (JWTTOKEN === undefined) {
				ER = true;
				data = 'Token is empty!';
			}
			if (studentId === undefined) {
				ER = true;
				data = 'Student ID is empty!';
			}
			if (payMethod === undefined) {
				ER = true;
				data = 'Payment method is empty!';
			} else {
				if (payMethod == 'cc') {
					ER = false;
				} else if (payMethod == 'bcava') {
					ER = false;
				} else if (payMethod == 'permatava') {
					ER = false;
				} else if (payMethod == 'bniva') {
					ER = false;
				} else if (payMethod == 'briva') {
					ER = false;
				} else if (payMethod == 'mandiribill') {
					ER = false;
				} else if (payMethod == 'indomaret') {
					ER = false;
				} else if (payMethod == 'alfamart') {
					ER = false;
				} else if (payMethod == 'shopeepay') {
					ER = false;
				} else if (payMethod == 'gopay') {
					ER = false;
				} else {
					ER = true;
					data = 'Payment method is empty!';
				}
			}

			if (!ER) {
				var IdUpdate = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (IdUpdate !== undefined && IdUpdate != '' && IdUpdate != null) {
					var tokenOwner = IdUpdate._id;
					var tokenSecret = IdUpdate.secret;
					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
							if (data != tokenOwner || data != studentId) {
								ER = true;
								data = 'Bad Token';
							}
						}
					});

					var cartData = await Cart.find({ studentId: studentId });
					if (cartData == '' || cartData == null || cartData === undefined) {
						ER = true;
						data = 'Keranjang tidak ditemukan!';
					}

					if (!ER) {
						var getPeople = await People.findOne({ _id: IdUpdate.peopleId });
						var getPeopleInfo = await PeopleInfo.findOne({ peopleId: IdUpdate.peopleId });

						var peopleName = getPeople.name;
						if (peopleName.indexOf(" ") > 3) {
							var myName = peopleName.split(" ");
							var FirstName = myName[0];
							var LastName = myName[1];
						} else {
							var FirstName = peopleName;
							var LastName = '';
						}

						var codeNumber = '00000';
						var keyNumber = '';
						var TransactionId = '00000-00000-00000-00000';
						var dt = dateTime.create();
						var dateNow = dt.format('Y-m-d H:M:S');
						var order_id = studentId.substr(2, 22) + Math.round((new Date()).getTime() / 1000);
						var grossAmount = 0;
						var item_details = [];

						for (var tp = 0; tp < cartData.length; tp++) {
							//CHECK IF SCHEDULE IS Available
							var tempSchedule = await Schedule.findOne({
								identitiesId: cartData[tp].teacherId,
								studyId: cartData[tp].studyId,
								clientId: cartData[tp].studentId,
								$and: [{ dateStart: { $lte: cartData[tp].endTime }, dateEnd: { $gte: cartData[tp].startTime } }]
							});

							if (tempSchedule !== undefined && tempSchedule != null && tempSchedule != '') {
								ER = true;
								data = 'Ada Jadwal lain yang sudah terbooking pada tanggal ' + cartData[tp].startTime + ' - ' + cartData[tp].endTime;
							}
						};

						if (!ER) {
							var getDataVA = await VirtualAccount.findOne({ identitiesId: IdUpdate._id });

							if (getDataVA == '' || getDataVA === undefined || getDataVA == null) {
								var randomNumber = randomstring.generate({ length: 12, charset: 'numeric' });
								var dataVA = randomNumber.toString();

								var VAvalues = {
									'identitiesId': IdUpdate._id,
									'bank': '',
									'number': dataVA,
									'updated_at': dateNow,
									'created_at': dateNow
								};

								await VirtualAccount.create(VAvalues);
							} else {
								var dataVA = getDataVA.number;
							}

							for (var tp = 0; tp < cartData.length; tp++) {
								var getPrice = await Price.findOne({ _id: cartData[tp].priceId });
								grossAmount = grossAmount + parseInt(getPrice.nprice1);

								var createSchedule = {
									'identitiesId': cartData[tp].teacherId,
									'studyId': cartData[tp].studyId,
									'clientId': cartData[tp].studentId,
									'dateStart': cartData[tp].startTime,
									'dateEnd': cartData[tp].endTime,
									'status': "0",
									'updated_at': dateNow,
									'created_at': dateNow
								};
								var insertSchedule = await Schedule.create(createSchedule);

								var createDetails = {
									'checkoutId': order_id,
									'scheduleId': insertSchedule._id,
									'teacherId': cartData[tp].teacherId,
									'studyId': cartData[tp].studyId,
									'studentId': cartData[tp].studentId,
									'status': cartData[tp].status,
									'priceId': cartData[tp].priceId,
									'price': getPrice.nprice1,
									'created_at': dateNow,
									'updated_at': dateNow,
								};
								var insertDetails = await OrderDetail.create(createDetails);

								var tempDT = {
									"id": insertDetails._id,
									"price": getPrice.nprice1,
									"quantity": 1,
									"name": getPrice.desc
								};

								item_details.push(tempDT);

							}

							var customer_detail = {
								"first_name": FirstName,
								"last_name": LastName,
								"email": getPeople.email,
								"phone": getPeople.phone
							};

							var billship = {
								"first_name": FirstName,
								"last_name": LastName,
								"email": getPeople.email,
								"phone": getPeople.phone,
								"address": getPeopleInfo.address,
								"city": getPeopleInfo.city,
								"postal_code": getPeopleInfo.postalcode,
								"country_code": "IDN"
							};

							var rawBody = {
								"transaction_details": {
									"gross_amount": grossAmount,
									"order_id": order_id
								},
								"item_details": item_details
							};

							if (payMethod != 'cc') {
								if (payMethod == 'gopay') {
									rawBody.customer_details = customer_detail;
									rawBody.payment_type = "gopay";
									rawBody.gopay = {
										"enable_callback": true,
										"callback_url": "sebisles://beranda"
									};
									rawBody.custom_expiry = {
										"order_time": dateNow + " +0700",
										"expiry_duration": 10,
										"unit": "minute"
									};
								};

								if (payMethod == 'shopeepay') {
									rawBody.customer_details = customer_detail;
									rawBody.payment_type = "shopeepay";
									rawBody.shopeepay = {
										"callback_url": "sebisles://beranda"
									};
									rawBody.custom_expiry = {
										"order_time": dateNow + " +0700",
										"expiry_duration": 10,
										"unit": "minute"
									};
								};

								if (payMethod == 'bcava') {
									codeNumber = '1010' + dataVA;
									rawBody.customer_details = customer_detail;
									rawBody.payment_type = "bank_transfer";
									rawBody.bank_transfer = {
										"bank": 'bca',
										"va_number": codeNumber
									};
									rawBody.custom_expiry = {
										"order_time": dateNow + " +0700",
										"expiry_duration": 10,
										"unit": "minute"
									};
								};

								if (payMethod == 'permatava') {
									codeNumber = '1020' + dataVA;
									rawBody.customer_details = customer_detail;
									rawBody.payment_type = "bank_transfer";
									rawBody.bank_transfer = {
										"bank": 'permata',
										"va_number": codeNumber
									};
									rawBody.custom_expiry = {
										"order_time": dateNow + " +0700",
										"expiry_duration": 10,
										"unit": "minute"
									};
								};

								if (payMethod == 'bniva') {
									codeNumber = '1030' + dataVA;
									rawBody.customer_details = customer_detail;
									rawBody.payment_type = "bank_transfer";
									rawBody.bank_transfer = {
										"bank": 'bni',
										"va_number": codeNumber
									};
									rawBody.custom_expiry = {
										"order_time": dateNow + " +0700",
										"expiry_duration": 10,
										"unit": "minute"
									};
								};

								if (payMethod == 'briva') {
									codeNumber = '1040' + dataVA;
									rawBody.customer_details = customer_detail;
									rawBody.payment_type = "bank_transfer";
									rawBody.bank_transfer = {
										"bank": 'bri',
										"va_number": codeNumber
									};
									rawBody.custom_expiry = {
										"order_time": dateNow + " +0700",
										"expiry_duration": 10,
										"unit": "minute"
									};
								};

								if (payMethod == 'mandiribill') {
									rawBody.customer_details = customer_detail;
									rawBody.payment_type = "echannel";
									rawBody.echannel = {
										"bill_info1": "Payment For:",
										"bill_info2": "Sebisles Course"
									};
									rawBody.custom_expiry = {
										"order_time": dateNow + " +0700",
										"expiry_duration": 10,
										"unit": "minute"
									};
								};

								if (payMethod == 'indomaret') {
									rawBody.customer_details = customer_detail;
									rawBody.payment_type = "cstore";
									rawBody.cstore = {
										"store": "Indomaret",
										"message": "Payment For Sebisles Course"
									};
									rawBody.custom_expiry = {
										"order_time": dateNow + " +0700",
										"expiry_duration": 10,
										"unit": "minute"
									};
								};

								if (payMethod == 'alfamart') {
									rawBody.customer_details = customer_detail;
									rawBody.payment_type = "cstore";
									rawBody.cstore = {
										"store": "alfamart",
										"alfamart_free_text_1": "Payment For Sebisles Course"
									};
									rawBody.custom_expiry = {
										"order_time": dateNow + " +0700",
										"expiry_duration": 10,
										"unit": "minute"
									};
								};

								try {
									var apiResponse = await core.charge(rawBody);
									TransactionId = apiResponse.transaction_id;
									if (payMethod == 'indomaret') {
										codeNumber = await apiResponse.payment_code;
									}
									if (payMethod == 'mandiribill') {
										codeNumber = await apiResponse.biller_code;
										keyNumber = await apiResponse.bill_key;
									}
									if (payMethod == 'gopay' || payMethod == 'shopeepay') {
										var arrayActions = await apiResponse.actions;
										codeNumber = arrayActions[0].url;
									}
								} catch (err) {
									ER = true;
									data = JSON.stringify(err.ApiResponse, null, 2);

								};

								if (!ER) {
									var paymentData = {
										'checkoutId': order_id,
										'payment_type': payMethod,
										'codeNumber': codeNumber,
										'keyNumber': keyNumber,
										'TransactionId': TransactionId,
										'statusTrans': '0',
										'totalSchedule': cartData.length,
										'discountId': '',
										'discountAmount': 0,
										'grossAmount': grossAmount,
										'created_at': dateNow,
										'updated_at': dateNow
									};

									var PaymentProcess = await OrderDB.create(paymentData);
									/*
									for(var tp=0; tp<cartData.length; tp++){
										await Cart.findOneAndRemove({_id: cartData[tp]._id});
									}
									*/
									res.status(200).send({
										'status': 200,
										'message': "OK",
										'data': paymentData
									});
								} else {
									var rollOrderDetail = await OrderDetail.find({ checkoutId: order_id });
									for (var ro = 0; ro < rollOrderDetail.length; ro++) {
										var tempro = rollOrderDetail[ro];
										await Schedule.findOneAndRemove({ _id: tempro.scheduleId });
									};

									res.status(500).send({
										'status': 500,
										'message': data
									});
								}

							} else {
								var midtranAPI = 'https://api.sandbox.midtrans.com/v2/token';
								var axiosParam = {
									params: {
										client_key: 'SB-Mid-client-q5IIrrIOkNz9aiZ6',
										card_number: '4811111111111114',
										card_exp_month: '12',
										card_exp_year: '2025',
										card_cvv: '123',
									}
								};

								var response = await axios.get(midtranAPI, axiosParam);
								//console.log(response);
								var paymentData = response.data;
								if (paymentData !== undefined && paymentData != null && paymentData != '') {
									var redirecturi = '';
									var statusres = paymentData.status_code;
									if (statusres == '200') {
										customer_detail.billing_address = billship;
										customer_detail.shipping_address = billship;

										rawBody.payment_type = "credit_card";
										rawBody.customer_details = customer_detail;
										rawBody.credit_card = {
											"token_id": paymentData.token_id,
											"authentication": true
										};

										try {
											var apiResponse = await core.charge(rawBody);
											TransactionId = apiResponse.transaction_id;
											codeNumber = apiResponse.masked_card;
											redirecturi = apiResponse.redirect_url;
										} catch (err) {
											ER = true;
											data = JSON.stringify(err.ApiResponse, null, 2);
										};

										if (!ER) {
											var paymentDt = {
												'checkoutId': order_id,
												'payment_type': payMethod,
												'codeNumber': codeNumber,
												'keyNumber': keyNumber,
												'redirect_url': redirecturi,
												'TransactionId': TransactionId,
												'statusTrans': '0',
												'totalSchedule': cartData.length,
												'discountId': '',
												'discountAmount': 0,
												'grossAmount': grossAmount,
												'created_at': dateNow,
												'updated_at': dateNow
											};

											var PaymentProcess = await OrderDB.create(paymentDt);
											/*
											for(var tp=0; tp<cartData.length; tp++){
												await Cart.findOneAndRemove({_id: cartData[tp]._id});
											}
											*/
											res.status(200).send({
												'status': 200,
												'message': "OK",
												'data': paymentDt
											});
										} else {
											var rollOrderDetail = await OrderDetail.find({ checkoutId: order_id });
											for (var ro = 0; ro < rollOrderDetail.length; ro++) {
												var tempro = rollOrderDetail[ro];
												await Schedule.findOneAndRemove({ _id: tempro.scheduleId });
											};

											res.status(500).send({
												'status': 500,
												'message': data
											});
										}
									} else {
										var rollOrderDetail = await OrderDetail.find({ checkoutId: order_id });
										for (var ro = 0; ro < rollOrderDetail.length; ro++) {
											var tempro = rollOrderDetail[ro];
											await Schedule.findOneAndRemove({ _id: tempro.scheduleId });
										};

										res.status(500).send({
											'status': 500,
											'message': paymentData.status_message
										});
									}
								} else {
									var rollOrderDetail = await OrderDetail.find({ checkoutId: order_id });
									for (var ro = 0; ro < rollOrderDetail.length; ro++) {
										var tempro = rollOrderDetail[ro];
										await Schedule.findOneAndRemove({ _id: tempro.scheduleId });
									};

									res.status(500).send({
										'status': 500,
										'message': 'Server Connection Failure! Please contact your administrator!'
									});
								}
							}
						} else {
							res.status(500).send({
								'status': 500,
								'message': data
							});
						}

					} else {
						res.status(500).send({
							'status': 500,
							'message': data
						});
					}
				} else {
					res.status(500).send({
						'status': 500,
						'message': data
					});
				}
			} else {
				res.status(500).send({
					'status': 500,
					'message': data
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},

	paymentNotif: async (req, res) => {
		var ER = false;

		try {
			let receivedJson = req.body;
			var transactionStatusObject = await core.transaction.notification(receivedJson);

			var totalDataTrans = JSON.parse(JSON.stringify(transactionStatusObject, null, 2));
			var order_id = totalDataTrans.order_id;
			var transaction_status = totalDataTrans.transaction_status;

			if (order_id === undefined) {
				ER = true;
			}
			if (transaction_status === undefined) {
				ER = true;
			}

			if (!ER) {
				var dt = dateTime.create();
				var dateNow = dt.format('Y-m-d H:M:S');
				var OrderData = await OrderDB.findOne({ checkoutId: order_id });
				let summary = `Transaction notification received. Order ID: ${order_id}. Transaction status: ${transaction_status}.`;
				var getStatusTrans = await core.transaction.status(order_id);
				var getTransStatus = getStatusTrans.transaction_status;
				var getFraudStatus = getStatusTrans.fraud_status;
				var getOrderDetail = await OrderDetail.find({ checkoutId: order_id });

				console.log(summary);
				if (transaction_status == 'capture' && getTransStatus == 'capture') {
					if (getFraudStatus == 'accept') {
						// TODO set transaction status on your databaase to 'success'
						OrderData.statusTrans = '1';
						OrderData.updated_at = dateNow;

					}
				} else if (transaction_status == 'settlement' && getTransStatus == 'settlement') {
					// TODO set transaction status on your databaase to 'success'
					// Note: Non-card transaction will become 'settlement' on payment success
					// Card transaction will also become 'settlement' D+1, which you can ignore
					// because most of the time 'capture' is enough to be considered as success

					OrderData.statusTrans = '1';
					OrderData.updated_at = dateNow;

				} else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
					// TODO set transaction status on your databaase to 'failure'
					ER = true;
					if (getTransStatus == 'cancel' || getTransStatus == 'deny') {
						OrderData.statusTrans = '2';
						OrderData.updated_at = dateNow;

					}
					if (getTransStatus == 'expire') {
						OrderData.statusTrans = '9';
						OrderData.updated_at = dateNow;
					}

				}

				if (ER) {
					for (var ss = 0; ss < getOrderDetail.length; ss++) {
						var tempSchedule = await Schedule.findOne({ _id: getOrderDetail[ss].scheduleId });
						await tempSchedule.remove();
					}
				} else {
					for (var ss = 0; ss < getOrderDetail.length; ss++) {
						var tempSchedule = await Schedule.findOne({ _id: getOrderDetail[ss].scheduleId });
						tempSchedule.status = "1";
						tempSchedule.updated_at = dateNow;
						await tempSchedule.save();
					}
				}

				await OrderData.save();
				res.status(200).send({
					'status': 200,
					'message': summary
				});
			} else {
				res.status(500).send({ message: transactionStatusObject });
			}
		} catch (error) {
			res.status(500).send({ message: error.message });
		};
	},

	getLesku: async (req, res) => {
		var ER = false;
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');

		try {
			var { JWTTOKEN, studentId, statusId } = req.body;
			if (JWTTOKEN === undefined) {
				ER = true;
				data = 'Token is empty!';
			}
			if (studentId === undefined) {
				ER = true;
				data = 'Student ID is empty!';
			}
			if (statusId === undefined) {
				ER = true;
				data = 'Status ID Empty!';
			}

			if (!ER) {
				var IdUpdate = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (IdUpdate !== undefined && IdUpdate != '' && IdUpdate != null) {
					var tokenOwner = IdUpdate._id;
					var tokenSecret = IdUpdate.secret;
					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
							if (data != tokenOwner || data != studentId) {
								ER = true;
								data = 'Bad Token';
							}
						}
					});

					var totalData = [];
					if (statusId == "0") {
						var quedateEnd = { $gte: dateNow };
					} else {
						var quedateEnd = { $lt: dateNow };
					};

					var getDistinct = await Schedule.distinct("identitiesId", { studentId: studentId, status: { $not: /0/ }, dateEnd: quedateEnd });
					if (getDistinct != '' && getDistinct !== undefined && getDistinct != null) {
						for (var dt = 0; dt < getDistinct.length; dt++) {
							var tempStudy = [];

							var querys = {
								identitiesId: getDistinct[dt],
								studentId: studentId,
								status: '1',
								dateEnd: quedateEnd
							};
							var mapelDistinct = await Schedule.distinct("studyId", querys);
							for (var md = 0; md < mapelDistinct.length; md++) {
								var tempSchedule = [];

								var querys = {
									identitiesId: getDistinct[dt],
									studyId: mapelDistinct[md],
									studentId: studentId,
									status: '1',
									dateEnd: quedateEnd
								};

								var getData = await Schedule.find(querys);
								var getStudy = await Study.findOne({ _id: mapelDistinct[md] });
								var getMapel = await Mapel.findOne({ _id: getStudy.typeId });
								var getKelas = await Kelas.findOne({ _id: getMapel.kelasId });
								var studyGrade = getKelas.grade + '-' + getKelas.tograde;

								if (getData != '' && getData !== undefined && getData != null) {
									for (var tps = 0; tps < getData.length; tps++) {
										var tmp = {
											'scheduleId': getData[tps]._id,
											'dateStart': getData[tps].dateStart,
											'dateEnd': getData[tps].dateEnd
										};

										tempSchedule.push(tmp);
									};

									var mpl = {
										'studyId': mapelDistinct[md],
										'studyName': getMapel.name,
										'studyGrade': studyGrade,
										'schedule': tempSchedule
									};

									tempStudy.push(mpl);
								}
							};

							var teacherId = await Identities.findOne({ _id: getDistinct[dt] });
							var teacherInfo = await People.findOne({ _id: teacherId.peopleId });
							var imageData = await Imageurl.findOne({ identitiesId: teacherId._id, type: 'profile' });

							if (imageData != '' && imageData !== undefined && imageData != null)
								var avatarUrl = imageData.image;
							else
								var avatarUrl = '';

							var insertTotal = {
								'teacherId': getDistinct[dt],
								'teacherName': teacherInfo.name,
								'teacherImg': avatarUrl,
								'study': tempStudy
							};

							totalData.push(insertTotal);
						};
					}

					res.status(200).send({
						'status': 200,
						'message': "OK",
						'data': totalData
					});
				} else {
					res.status(500).send({
						'status': 500,
						'message': data
					});
				}
			} else {
				res.status(500).send({
					'status': 500,
					'message': data
				});
			}
		} catch (error) {
			res.status(500).send({
				'status': 500,
				'message': error.message
			});
		};
	},
}