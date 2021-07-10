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
const TechExp = require("../models/Teaching_exp");
const EduExp = require("../models/Edu_background");

const nodemailer = require("nodemailer");
const fs = require('fs');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
var path = require('path');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var randomstring = require("randomstring");

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

const dateTime = require('node-datetime');
var dt = dateTime.create();
var dateNow = dt.format('Y-m-d H:M:S');

var kode = 'MUHAMMADARIFIN';

function ucfirst(str) {
	var firstLetter = str.slice(0, 1);
	return firstLetter.toUpperCase() + str.substring(1);
}

module.exports = {
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

	searchFilter: async (req, res) => {
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var ER = false;

		try {
			var { JWTTOKEN } = req.body;
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
						if (data == tokenOwner) {
							var GradeAll = await Grade.find();
							var CourseAll = await Crs.find();

							res.status(200).send({
								'status': 200,
								'message': 'OK',
								'data': { 'grade': GradeAll, 'course': CourseAll }
							});
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
		}
	},

	searchCourse: async (req, res) => {
		var data = '';
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');
		var ER = false;

		try {
			var { JWTTOKEN, grade, course, currentPage } = req.body;
			if (JWTTOKEN === undefined) {
				ER = true;
				data = 'Token is empty';
			}
			if (grade === undefined) {
				ER = true;
				data = 'Grade is empty';
			}
			if (course === undefined) {
				ER = true;
				data = 'Course is empty';
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
						}
					});

					if (!ER) {
						if (data == tokenOwner) {
							if (currentPage === undefined || currentPage == '' || currentPage < 1) currentPage = 1;
							var optPaginate = {
								sort: { gradeId: 'asc' },
								page: currentPage,
								limit: 10,
							};

							var query = {};
							var resultVal = [];
							var totalPaginate = 0;
							var indexPaginate = 0;
							var totalData = 0;

							query.disable = 'enable';
							//query.delete = '0';

							//if(study !== undefined) query.name = {'$regex': '.*'+study+'.*', '$options': 'i'};

							if (grade != '-') query.gradeId = grade;

							if (course != '-') query.typeId = course;

							//resultVal = await Course.find(query);

							await Study.paginate(query, optPaginate).then(function (result) {
								resultVal = result.docs;
								totalData = result.totalDocs;
								totalPaginate = result.totalPages;
								if (result.pagingCounter !== undefined) indexPaginate = result.pagingCounter;
							});

							if (resultVal == '') {
								resultVal = '';
							} else {

								for (var x = 0; x < resultVal.length; x++) {
									var teacherId = await Identities.findOne({ _id: resultVal[x].identitiesId });
									var teacherData = await People.findOne({ _id: teacherId.peopleId });
									var ImgSelfieThumb = await Imageurl.findOne({ type: 'profile', identitiesId: resultVal[x].identitiesId });
									//console.log(ImgSelfieThumb);
									if (ImgSelfieThumb == '' || ImgSelfieThumb == null) {
										var TImg = '';
										var TThumb = '';
									} else {
										var TImg = ImgSelfieThumb.image;
										var TThumb = ImgSelfieThumb.thumbnail;
									}

									var tempData = {
										"_id": resultVal[x]._id,
										"identitiesId": resultVal[x].identitiesId,
										"gradeId": resultVal[x].gradeId,
										"typeId": resultVal[x].typeId,
										"disable": resultVal[x].disable,
										"updated_at": resultVal[x].updated_at,
										"teacherName": teacherData.name,
										"teacherGender": teacherData.sex,
										"teacherImg": TImg,
										"teacherThumb": TThumb
									};

									resultVal[x] = tempData;
								}
							}

							res.status(200).send({
								'status': 200,
								'message': 'OK',
								'totalData': totalData,
								'totalPages': totalPaginate,
								'indexPaginate': indexPaginate,
								'currentPage': currentPage,
								'data': resultVal
							});
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
		}
	},

	addCart: async (req, res) => {
		var ER = false;
		var dt = dateTime.create();
		var dateNow = dt.format('Y-m-d H:M:S');

		try {
			var { JWTTOKEN, getScheduleId, getStudyId, getClientId, getStatus } = req.body;
			if (JWTTOKEN === undefined) {
				ER = true;
				data = 'Token is empty';
			}
			if (getScheduleId === undefined) {
				ER = true;
				data = 'Schedule ID is empty';
			}
			if (getStudyId === undefined) {
				ER = true;
				data = 'Study ID is empty';
			}
			if (getClientId === undefined) {
				ER = true;
				data = 'Client ID is empty';
			}
			if (getStatus === undefined) {
				ER = true;
				data = 'Status Course is empty';
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
						var decodeSchedule = decodeURIComponent(getScheduleId);
						var jsonparse = JSON.parse(decodeSchedule);

						var studiesId = await Study.findOne({ _id: getStudyId });
						var teacherId = studiesId.identitiesId;
						var insertCart = await Cart.create({
							'identitiesId': teacherId,
							'studyId': getStudyId,
							'clientId': getClientId,
							'totalSchedule': jsonparse.length,
							'status': getStatus,
							'created_at': dateNow,
							'updated_at': dateNow
						});

						for (var sh = 0; sh < jsonparse.length; sh++) {
							var insertDetail = await CartDetail.create({
								'cartId': insertCart._id,
								'scheduleId': jsonparse[sh],
								'created_at': dateNow,
								'updated_at': dateNow
							});
						};

						res.status(200).send({
							'status': 200,
							'message': 'OK',
							'data': insertCart._id
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
		}
	},

	checkOut: async (req, res) => {
		var ER = false;

		try {
			var { JWTTOKEN, getCartId, payMethod, ccData } = req.body;
			if (JWTTOKEN === undefined) {
				ER = true;
				data = 'Token is empty';
			}
			if (getCartId === undefined) {
				ER = true;
				data = 'Cart ID is empty';
			}
			if (payMethod === undefined) {
				ER = true;
				data = 'Cart ID is empty';
			} else {
				if (payMethod != 'bcava' && payMethod != 'indomaret' && payMethod != 'cc') {
					ER = true;
					data = 'Payment Method is empty';
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
							if (data != tokenOwner) {
								ER = true;
								data = 'Bad Token';
							}
						}
					});

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

					var cartData = await Cart.findOne({ _id: getCartId });
					if (cartData != '' && cartData != null) {
						if (cartData.clientId != tokenOwner) {
							ER = true;
							data = 'Bad Cart / Token';
						}
					} else {
						ER = true;
						data = 'Cart Not Found';
					};
					// console.log(cartData);
					if (!ER) {
						var codeNumber = '00000';
						var TransactionId = '00000-00000-00000-00000';
						var dt = dateTime.create();
						var dateNow = dt.format('Y-m-d H:M:S');
						var getPrice = await Price.findOne({ name: cartData.status });
						var studyID = cartData.studyId;
						var dataDetail = await CartDetail.find({ cartId: cartData._id });
						var TotalAmount = cartData.totalSchedule;
						var TotalPrice = getPrice.nprice1 * TotalAmount;
						var item_details = [];
						var order_id = 'po' + studyID.substr(4, 20) + Math.round((new Date()).getTime() / 1000);
						var customer_detail = {
							"first_name": FirstName,
							"last_name": LastName,
							"email": getPeople.email,
							"phone": getPeople.phone
						};

						for (var id = 0; id < TotalAmount; id++) {
							var DT = dataDetail[id];
							var getSchedule = await Schedule.findOne({ _id: DT.scheduleId });
							var itemNameDetail = getPrice.desc + ' ' + getSchedule.dateStart;
							var tempDT = {
								"id": DT._id,
								"price": getPrice.nprice1,
								"quantity": 1,
								"name": itemNameDetail
							};

							item_details.push(tempDT);
						};

						var rawBody = {
							"transaction_details": {
								"gross_amount": TotalPrice,
								"order_id": order_id
							},
							"item_details": item_details
						};

						if (payMethod != 'cc') {
							if (payMethod == 'bcava') {
								var bnk = 'bca';
								var dataVA = await VirtualAccount.findOne({ identitiesId: cartData.clientId, bank: bnk });

								codeNumber = dataVA.number;
								rawBody.customer_details = customer_detail;
								rawBody.payment_type = "bank_transfer";
								rawBody.bank_transfer = {
									"bank": bnk,
									"va_number": dataVA.number
								};
								rawBody.expiry = {
									"start_time": dateNow + " +0700",
									"unit": "hour",
									"duration": 1
								};
							};

							if (payMethod == 'indomaret') {
								rawBody.customer_details = customer_detail;
								rawBody.payment_type = "cstore";
								rawBody.cstore = {
									"store": "Indomaret",
									"message": "Saya orang dalam"
								};
								rawBody.expiry = {
									"start_time": dateNow + " +0700",
									"unit": "hour",
									"duration": 1
								};
							};

							try {
								var apiResponse = await core.charge(rawBody);
								TransactionId = apiResponse.transaction_id;
								if (payMethod == 'indomaret') codeNumber = apiResponse.payment_code;
							} catch (err) {
								res.status(500).send(`${JSON.stringify(err.ApiResponse, null, 2)}`);
							};

							var paymentData = {
								'checkoutId': order_id,
								'payment_type': payMethod,
								'codeNumber': codeNumber,
								'TransactionId': TransactionId,
								'statusTrans': '0',
								'identitiesId': cartData.identitiesId,
								'studyId': cartData.studyId,
								'clientId': cartData.clientId,
								'status': cartData.status,
								'totalSchedule': TotalAmount,
								'discountId': '',
								'discountAmount': 0,
								'grossAmount': TotalPrice,
								'request': '',
								'requestImg': '',
								'requestThumb': '',
								'created_at': dateNow,
								'updated_at': dateNow
							};

							var PaymentProcess = await OrderDB.create(paymentData);

							for (var id = 0; id < TotalAmount; id++) {
								var DT = dataDetail[id];
								await OrderDetail.create({
									'orderId': PaymentProcess._id,
									'scheduleId': DT.scheduleId,
									'price': getPrice.nprice1,
									'created_at': dateNow,
									'updated_at': dateNow
								});
							};

							await Cart.deleteOne({ _id: getCartId });
							await CartDetail.deleteMany({ cartId: getCartId });

							res.status(200).send({
								'status': 200,
								'message': "OK",
								'data': paymentData
							});
						} else {
							/*
							*
							*	CREDIT CARD BACKEND PROCESS
							*	FROM GITHUB MIDTRANS-CLIENT
							*
							*/
							console.log('Payment via: Credit Card');
							var custData = {
								"first_name": FirstName,
								"last_name": LastName,
								"email": getPeople.email,
								"phone": getPeople.phone,
								"address": getPeopleInfo.address,
								"city": getPeopleInfo.city,
								"postal_code": "00000",
								"country_code": "IDN"
							};
							let parameter = {
								'card_number': '4811111111111114',
								'card_exp_month': '01',
								'card_exp_year': '2025',
								'card_cvv': '123',
								'client_key': core.apiConfig.clientKey,
							};
							//console.log(parameter);
							core.cardToken(parameter).then((cardTokenResponse) => {
								console.log(cardTokenResponse);

								var tokenID = cardTokenResponse.token_id;
								customer_detail.billing_address = custData;
								customer_detail.shipping_address = custData;
								rawBody.customer_details = customer_detail;
								rawBody.payment_type = "credit_card";
								rawBody.credit_card = {
									"token_id": tokenID,
									"authentication": true
								};

								console.log(rawBody);

								return core.charge(rawBody);

							})
								.then((chargeResponse) => {
									console.log('chargeResponse:', JSON.stringify(chargeResponse));
									res.status(200).send({
										'status': 200,
										'message': "OK",
										'data': chargeResponse
									});
								})
								.catch((e) => {
									console.log('Error occured:', e.message);
									res.status(500).send({
										'status': 500,
										'message': e.message
									});
								});
						};

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

	paymentNotif: async (req, res) => {
		var ER = false;

		try {
			let receivedJson = req.body;
			var transactionStatusObject = await core.transaction.notification(receivedJson);
			//console.log('Notif Received: ' + JSON.stringify(transactionStatusObject, null, 2));

			var order_id = transactionStatusObject.order_id;
			var transaction_status = transactionStatusObject.transaction_status;
			var fraud_status = transactionStatusObject.fraud_status;

			if (order_id === undefined) {
				ER = true;
			}
			if (transaction_status === undefined) {
				ER = true;
			}
			if (fraud_status === undefined) {
				ER = true;
			}

			if (!ER) {
				var dt = dateTime.create();
				var dateNow = dt.format('Y-m-d H:M:S');
				var OrderData = await OrderDB.findOne({ checkoutId: order_id });
				let summary = `Transaction notification received. Order ID: ${order_id}. Transaction status: ${transaction_status}. Fraud status: ${fraud_status}.<br>Raw notification object:<pre>${JSON.stringify(transactionStatusObject, null, 2)}</pre>`;
				var getStatusTrans = await core.transaction.status(order_id);
				var getTransStatus = getStatusTrans.transaction_status;
				var getFraudStatus = getStatusTrans.fraud_status;

				console.log(summary);
				if (transaction_status == 'capture' && getTransStatus == 'capture') {
					if (fraud_status == 'accept' && getFraudStatus == 'accept') {
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
					if (getTransStatus == 'cancel' || getTransStatus == 'deny' || getTransStatus == 'expire') {
						OrderData.statusTrans = '2';
						OrderData.updated_at = dateNow;

					}
				}
				await OrderData.save();
				res.status(200).send({
					'status': 200,
					'message': summary
				});
			} else {
				res.status(500).send({
					status: 500,
					'message': transactionStatusObject
				});
			}
		} catch (error) {
			res.status(500).send({
				status: 500,
				'message': error.message
			});
		};
	},

	// STUDENT
	getStudent: async (req, res) => {
		var ER = false;
		var data = '';
		try {
			const { JWTTOKEN } = req.body;
			if (JWTTOKEN !== undefined) {

				const checkUser = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN, userType: 'student' });
				// console.log(checkUser)
				if (checkUser !== undefined && checkUser !== '' && checkUser !== null) {
					const tokenOwner = checkUser._id;
					const tokenSecret = checkUser.secret;
					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
						}
					})
					if (!ER) {
						const peopleId = await checkUser.peopleId;
						const getUserById = await People.findOne({ _id: peopleId });
						const getInfoUserId = await PeopleInfo.findOne({ peopleId });
						const getSchoolById = await School.findOne({ peopleId });
						const getPhotoProfile = await Imageurl.findOne({ identitiesId: tokenOwner });

						if (getPhotoProfile !== null) {
							// show student data in profile screen
							data = {
								name: getUserById.name,
								email: getUserById.email,
								phone: getUserById.phone,
								school: getSchoolById.name,
								grade: getSchoolById.grade,
								profile: getPhotoProfile.image
							};

							res.status(200).send({
								status: 200,
								message: 'Success',
								data
							});
						} else {
							data = {
								name: getUserById.name,
								email: getUserById.email,
								phone: getUserById.phone,
								school: getSchoolById.name,
								grade: getSchoolById.grade,
								profile: ''
							};

							res.status(200).send({
								status: 200,
								message: 'Success',
								data
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
						status: 500,
						message: 'Bad Token'
					});
				}
			} else {
				res.status(500).send({
					status: 500,
					message: 'Bad requrest'
				});
			}
		} catch (error) {
			res.status(500).send({
				status: 500,
				'message': error.message
			});
		}
	},
	updateStudent: async (req, res) => {
		try {
			var data = '';
			var ER = false;
			var totImage = 0;
			const {
				JWTTOKEN,
				name,
				phone,
				address,
				school,
				cityOfSchool,
				schoolAddress,
				grade,
				curriculum
			} = req.body;

			if (JWTTOKEN !== undefined) {
				const compareToken = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (compareToken !== undefined && compareToken !== '' && compareToken !== null) {
					const tokenOwner = compareToken._id;
					const tokenSecret = compareToken.secret;

					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
						}
					})

					if (!ER) {
						if (tokenOwner == data) {
							const { peopleId } = compareToken;
							const getUserById = await People.findOne({ _id: peopleId });
							const getInfoUserId = await PeopleInfo.findOne({ peopleId });
							const getUserSchool = await School.findOne({ peopleId });

							// data people
							const dataFromCollectPeople = {
								name: name || getUserById.name,
								phone: phone || getUserById.phone,
								updated_at: dateNow
							};

							// data people info
							const dataFromCollectPeopleInfo = {
								address: address || getInfoUserId.address,
								updated_at: dateNow
							};

							// data school
							const dataFromCollectSchool = {
								name: school || getUserSchool.name,
								grade: grade || getUserSchool.grade,
								cityOfSchool: cityOfSchool || getUserSchool.cityOfSchool,
								schoolAddress: schoolAddress || getUserSchool.schoolAddress,
								curriculum: curriculum || getUserSchool.curriculum,
								updated_at: dateNow
							}

							if (req.file === undefined) {
								// if don't have req.file
								// update table people
								const updatingFromPeople = await People.updateOne(
									{ _id: peopleId },
									{ $set: dataFromCollectPeople }
								);

								if (updatingFromPeople.ok) {
									// update people info
									const updatingFromPeopleInfo = await PeopleInfo.updateOne(
										{ peopleId },
										{
											$set: {
												address: dataFromCollectPeopleInfo.address
											}
										}
									);

									if (updatingFromPeopleInfo.ok) {
										// update school
										const updatingFromSchool = await School.updateOne(
											{ peopleId },
											{
												$set: {
													name: school || dataFromCollectSchool.name,
													grade: grade || dataFromCollectSchool.grade,
													schoolAddress: schoolAddress || dataFromCollectSchool.schoolAddress,
													updated_at: dateNow
												}
											}
										);

										if (updatingFromSchool.ok) {
											data = {
												name: name || getUserById.name,
												phone: phone || getUserById.phone,
												school: school || getUserSchool.name,
												grade: grade || getUserSchool.grade,
												address: address || getInfoUserId.address,
												schoolAddress: schoolAddress || getUserSchool.schoolAddress,
												curriculum: curriculum || getUserSchool.curriculum,
												cityOfSchool: cityOfSchool || getUserSchool.cityOfSchool,
											};
											res.status(200).send({
												status: 200,
												message: 'OK',
												data
											});
										} else {
											res.status(500).send({
												status: 500,
												message: 'Update fail'
											});
										}
									} else {
										res.status(500).send({
											status: 500,
											message: 'Updating fail'
										});
									}
								} else {
									res.status(500).send({
										status: 500,
										message: 'Updating fail'
									});
								}
							} else {
								// if have req.file
								const typeImage = 'profile';
								totImage++;
								const fileType = path.extname(req.file.filename);
								const thumbFile = `thumb-${tokenOwner}${fileType}`;
								const thumbPathDest = `images/profile/thumbnails/${thumbFile}`;
								const pathImage = `images/profile/${tokenOwner}${fileType}`;
								const newPathImg = `public/${pathImage}`;
								const searchImg = await Imageurl.findOne({ identitiesId: tokenOwner, type: typeImage });

								if (searchImg) {
									var oldPathImg = `public/${searchImg.image}`;
									var oldThumbPath = `public/${searchImg.thumbnail}`;
									// Delete Image
									// console.log('old', oldPathImg)
									if (fs.existsSync(oldPathImg)) {
										fs.unlinkSync(oldPathImg);
									}
									// Delete Thumbnail
									// if (fs.unlinkSync(oldThumbPath)) {
									// 	fs.unlinkSync(oldThumbPath)
									// }

									searchImg.image = pathImage;
									// searchImg.thumbnail = thumbPathDest
									searchImg.updated_at = dateNow;

									await searchImg.save();
								} else {
									const newValues = {
										identitiesId: tokenOwner,
										type: typeImage,
										description: '',
										image: pathImage,
										thumbnail: thumbPathDest,
										created_at: dateNow,
										updated_at: dateNow
									};

									await Imageurl.create(newValues);
								}

								// Rename filename with articleID
								fs.rename(req.file.path, newPathImg, function (err) {
									if (err) res.status(500).send({ status: 500, message: err });
								})

								// sharp(newPathImg).resize(200, 200).toFile(`public/${pathImage}`, (err, rezieImage) => {
								// 	if (err) res.status(500).send({ status: 500, message: err })
								// })
								// update table people
								const updatingFromPeople = await People.updateOne(
									{ _id: peopleId },
									{ $set: dataFromCollectPeople }
								);

								if (updatingFromPeople.ok) {
									// update people info
									const updatingFromPeopleInfo = await PeopleInfo.updateOne(
										{ peopleId },
										{
											$set: {
												address: dataFromCollectPeopleInfo.address
											}
										}
									);

									if (updatingFromPeopleInfo.ok) {
										// update school
										const updatingFromSchool = await School.updateOne(
											{ peopleId },
											{
												$set: {
													name: school || dataFromCollectSchool.name,
													grade: grade || dataFromCollectSchool.grade,
													schoolAddress: schoolAddress || dataFromCollectSchool.schoolAddress,
													updated_at: dateNow
												}
											}
										);

										if (updatingFromSchool.ok) {
											data = {
												name: name || getUserById.name,
												phone: phone || getUserById.phone,
												school: school || getUserSchool.name,
												grade: grade || getUserSchool.grade,
												address: address || getInfoUserId.address,
												schoolAddress: schoolAddress || getUserSchool.schoolAddress,
												curriculum: curriculum || getUserSchool.curriculum,
												cityOfSchool: cityOfSchool || getUserSchool.cityOfSchool,
											};
											res.status(200).send({
												status: 200,
												message: 'OK',
												data
											});
										} else {
											res.status(500).send({
												status: 500,
												message: 'Update fail'
											});
										}
									} else {
										res.status(500).send({
											status: 500,
											message: 'Updating fail'
										});
									}
								} else {
									res.status(500).send({
										status: 500,
										message: 'Updating fail'
									});
								}
							}
						} else {
							res.status(500).send({
								status: 500,
								message: 'Bad Token'
							});
						}
					} else {
						res.status(500).send({
							status: 500,
							message: data
						});
					}
				} else {
					res.status(500).send({
						status: 500,
						message: 'Bad Token'
					});
				}
			} else {
				res.status(500).send({
					status: 500,
					message: 'Bad request'
				});
			}
		} catch (error) {
			res.status(500).send({
				status: 500,
				message: error.message
			});
		}
	},
	changePasswordStudent: async (req, res) => {
		try {
			var ER = false;
			var data = '';

			const {
				JWTTOKEN,
				oldPassword,
				newPassword
			} = req.body;

			if (JWTTOKEN !== undefined) {
				const compareToken = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });

				if (compareToken !== undefined && compareToken !== '' && compareToken !== null) {
					const tokenOwner = compareToken._id;
					const tokenSecret = compareToken.secret;

					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message;
						} else {
							data = decoded.id;
						}
					})

					if (!ER) {
						if (tokenOwner == data) {
							const { peopleId } = compareToken;

							const checkUserStudent = await People.findOne({ _id: peopleId });
							const passwordDB = checkUserStudent.password;
							if (newPassword !== '' && oldPassword !== '') {
								const comparePassword = await bcrypt.compareSync(oldPassword, passwordDB);
								if (comparePassword) {
									const hashing = await bcrypt.hashSync(newPassword, 10);
									const updatingPassword = await People.updateOne(
										{ _id: peopleId },
										{
											$set: {
												password: hashing
											}
										}
									)

									if (updatingPassword.ok) {
										res.status(200).send({
											status: 200,
											message: 'OK',
											data: checkUserStudent
										});
									} else {
										res.status(500).send({
											status: 500,
											message: 'Fail to change password'
										});
									}
								} else {
									res.status(500).send({
										status: 500,
										message: 'Old password doest\'t match'
									});
								}
							} else {
								res.status(500).send({
									status: 500,
									message: 'Field can\t be left blank'
								});
							}
						} else {
							res.status(500).send({
								status: 500,
								message: 'Bad Token'
							});
						}
					} else {
						res.status(500).send({
							status: 500,
							message: data
						});
					}
				} else {
					res.status(500).send({
						status: 500,
						message: 'Bad Token'
					});
				}
			} else {
				res.status(500).send({
					status: 500,
					message: 'Bad request'
				});
			}
		} catch (error) {
			res.status(500).send({
				status: 500,
				message: error.message
			});
		}
	},
	berandaHome: async (req, res) => {
		try {
			const { JWTTOKEN } = req.body;
			let { filterKelas, filterCurriculum, filterGender, filterMapel, page, limit } = req.query;
			var ER = false;
			var data = '';
			var pesan = '';
			if (JWTTOKEN !== undefined) {
				const compareToken = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (compareToken !== undefined && compareToken !== '' && compareToken !== null) {
					const tokenOwner = compareToken._id;
					const tokenSecret = compareToken.secret;

					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message
						} else {
							data = decoded.id
						}
					});
					// curr, kelas, mapel, gender
					if (!ER) {
						let myData = [];
						let filtering = [];

						if (!limit) {
							limit = 10
						} else {
							limit = parseInt(limit)
						}

						if (!page) {
							page = 1
						} else {
							page = parseInt(page)
						}

						let arrayWhile = [];

						// jika ada query filter gender maka masukkan, jika tidak ganti dengan data maping defalt
						if (filterGender) {
							filterGender
						} else {
							const getAllGender = await PeopleInfo.distinct('gender')
							filterGender = getAllGender
							filterGender.shift()
						}

						let checkTeacher = await Identities.find({ userType: 'teacher', disable: 'enable' })
						let mapingIdentitiesTeacher = checkTeacher.map(o => o._id)
						let mapingPeopleId = checkTeacher.map(o => o.peopleId)
						let getPeopleInfo = await PeopleInfo.find({ peopleId: mapingPeopleId, gender: filterGender })
						let mapingToGetPeopleId = await getPeopleInfo.map(o => o.peopleId)
						let checkingIdentities = await Identities.find({ peopleId: mapingToGetPeopleId })
						let mapingToGetIdentitiesId = await checkingIdentities.map(o => o._id)
						let getStudy = await Study.find({ identitiesId: mapingToGetIdentitiesId, status: 1 })
						// console.log(getStudy)

						let mapingIdentitiesId = await getStudy.map(o => o.identitiesId)
						// to set default filtering
						let mapingGradeId = await getStudy.map(o => o.gradeId)
						let mapingTypeId = await getStudy.map(o => o.typeId);
						// console.log(mapingGradeId)

						// jika ada query filter curriculum maka masukkan, jika tidak ganti dengan data maping defalt
						if (filterCurriculum) {
							filterCurriculum
						} else {
							const getAllCurriculum = await Kelas.distinct('curriculum')
							filterCurriculum = getAllCurriculum
						}

						// jika ada query filter mapel maka masukkan, jika tidak ganti dengan data maping defalt
						if (filterMapel) {
							filterMapel
						} else {
							filterMapel = mapingTypeId
						}

						// jika ada query filter kelas maka masukkan, jika tidak ganti dengan data maping defalt
						if (filterKelas) {
							filterKelas
						} else {
							filterKelas = mapingGradeId
						}

						// console.log(getStudy)
						let getMapel = await Mapel.find({ _id: filterMapel, kelasId: filterKelas, curriculum: filterCurriculum })
						if (getMapel.length) {

							let mapingIdForQueryPaginate = await getMapel.map(o => o._id)
							let mapingGradeForQueryPaginate = await getMapel.map(o => o.kelasId)

							let offset = (page - 1) * limit
							let options = {
								page,
								limit,
								offset
							}

							var query = { typeId: mapingIdForQueryPaginate, gradeId: mapingGradeForQueryPaginate }
							var resultVal = []
							var totalPaginate = 0
							var totalData = 0

							await Study.paginate(query, options).then(function (result) {
								console.log('result', result)
								resultVal = result.docs
								totalData = result.totalDocs
								totalPaginate = result.totalPages
								page = result.page
								prevPage = result.prevPage
								nextPage = result.nextPage
								// if (result.pagingCounter !== undefined) indexPaginate = result.pagingCounter
							})

							let arrayMapingPeopleId = []
							if (resultVal.length) {

								for (x = 0; x < resultVal.length; x++) {
									var getFixIdentities = await Identities.findOne({ _id: resultVal[x].identitiesId })
									var getFixMapel = await Mapel.findOne({ _id: resultVal[x].typeId })
									var getFixPeopleInfo = await PeopleInfo.findOne({ peopleId: getFixIdentities.peopleId })
									var getFixPeople = await People.findOne({ _id: getFixIdentities.peopleId })
									var getKelas = await Kelas.findOne({ _id: resultVal[x].gradeId })
									var getImg = await Imageurl.findOne({ identitiesId: getFixIdentities._id, type: 'profile' })

									let peopleId = ''
									let nameTeacher = ''
									let gender = ''
									let level = ''
									let mapel = ''
									let curriculum = ''
									let quotes = ''
									let linkYoutube = ''
									let profile = ''
									// console.log('maping', getMapel[x].name)
									if (getImg !== null && getImg !== undefined) {
										profile = getImg.image
									}
									if (getPeopleInfo !== null && getPeopleInfo !== undefined) {
										gender = getPeopleInfo.gender
									}
									if (getFixPeople !== null && getFixPeople !== undefined) {
										peopleId = getFixPeople._id
										nameTeacher = getFixPeople.name
										quotes = getFixPeople.nameEng
										linkYoutube = getFixPeople.avatarUrl
									}
									if (getKelas !== null && getKelas !== undefined) {
										curriculum = getKelas.curriculum
										level = `${getKelas.name} (${getKelas.grade} - ${getKelas.tograde}})`
									}
									if (getFixMapel !== null && getFixMapel !== undefined) {
										mapel = getFixMapel.name
									}
									data = {
										peopleId,
										nameTeacher,
										gender,
										level,
										mapel,
										curriculum,
										quotes,
										linkYoutube,
										profile
									}
									resultVal[x] = data
								}
								res.status(200).send({
									status: 200,
									message: 'OK',
									totalData,
									totalPages: totalPaginate,
									currentPage: page,
									limitPage: limit,
									prevPage,
									nextPage,
									data: resultVal,
								})
							} else {
								res.status(500).send({
									status: 500,
									message: 'Data tidak ada',
									totalData,
									totalPages: totalPaginate,
									currentPage: page,
									limitPage: limit,
									prevPage,
									nextPage,
									data: [],
								})
							}
						} else {
							res.status(500).send({
								status: 500,
								message: 'Data tidak ada',
								totalData: 0,
								totalPages: 0,
								currentPage: 0,
								limitPage: limit,
								prevPage: null,
								nextPage: null,
								data: [],
							})
						}

					} else {
						res.status(500).send({
							status: 500,
							message: data
						});
					}
				} else {
					res.status(500).send({
						status: 500,
						message: 'Bad Token'
					});
				}
			} else {
				res.status(500).send({
					status: 500,
					message: 'Bad request'
				});
			}
		} catch (error) {
			console.log(error)
			res.status(500).send({
				status: 500,
				message: `${error}`
			});
		}
	},
	profileTeacher: async (req, res) => {
		try {
			const { peopleId } = req.params;
			const { JWTTOKEN } = req.body;
			var data = '';
			var ER = false;
			var dataTech;
			var arr = [];

			if (JWTTOKEN !== undefined) {
				const compareToken = await Identities.findOne({ pushType: 'api', api_token: JWTTOKEN });
				if (compareToken !== undefined && compareToken !== '' && compareToken !== null) {
					const tokenOwner = compareToken._id;
					const tokenSecret = compareToken.secret;

					jwt.verify(JWTTOKEN, tokenSecret, function (err, decoded) {
						if (err) {
							ER = true;
							data = err.message
						} else {
							data = decoded.id
						}
					});

					if (!ER) {
						const identities = await Identities.findOne({ peopleId });
						if (identities) {
							const people = await People.findOne({ _id: peopleId });
							const getPhoto = await Imageurl.findOne({ identitiesId: identities._id });
							const techExp = await TechExp.find({ identitiesId: identities._id });
							// console.log(techExp)
							const eduExp = await EduExp.find({ identitiesId: identities._id });
							const mapingGrade = await techExp.map(exp => {
								return exp.grade
							});
							// console.log(mapingGrade)
							const getGrade = await Grade.find({ _id: mapingGrade });

							const getStudy = await Study.find({ identitiesId: identities._id });
							// get gardeId from array getStudy
							const mapingGradeId = getStudy.map(mapingGrade => {
								return mapingGrade.gradeId
							});
							const getKelas = await Kelas.find({ _id: mapingGradeId });
							// get name kelas on array getKelas
							const mapingNameKelas = getKelas.map(kelas => {
								return kelas.name
							})

							const getMapel = await Mapel.find({ kelasId: mapingGradeId });
							// create variable kelas for name kelas
							var nameKelas = ''
							// create name kelas with array in kls
							for (var kls = 0; kls < mapingNameKelas.length; kls++) {
								nameKelas += mapingNameKelas[kls]
							}

							// maping all mapel and return it
							const mapingMapel = getMapel.map(mapMapel => {
								const dataMapel = {
									_id: mapMapel._id,
									name: mapMapel.name,
									kelas: nameKelas,
									curriculum: mapMapel.curriculum,
									disable: mapMapel.disable,
								}
								return dataMapel
							})

							for (var x = 0; x < techExp.length; x++) {
								for (var l = 0; l < getGrade.length; l++) {
									dataTech = await {
										_id: techExp[x]._id,
										fromDate: techExp[x].fromDate,
										toDate: techExp[x].toDate,
										school: techExp[x].school,
										city: techExp[x].city,
										status: techExp[x].status,
										desc: techExp[x].desc,
										grade: getGrade[l].name,
										course: techExp[x].course
									}
									await arr == arr.push(dataTech)
								}
							}
							data = await {
								profile: getPhoto.image,
								name: people.name,
								mapel: mapingMapel,
								techExp: arr,
								eduExp,
							}
							res.status(200).send({
								success: 200,
								message: 'OK',
								data
							})
						} else {
							res.status(500).send({
								status: 500,
								message: 'Data tidak ditemukan'
							})
						}
					} else {
						res.status(500).send({
							status: 500,
							message: data
						})
					}
				} else {
					res.status(500).send({
						status: 500,
						message: 'Bad Token'
					})
				}
			} else {
				res.status(500).send({
					status: 500,
					message: 'Bad request'
				})
			}

		} catch (error) {
			res.status(500).send({
				status: 500,
				message: `${error}`
			})
		}
	},
	verifForgetPassword: async (req, res) => {
		try {
			dt = dateTime.create()
			dateNow = dt.format('Y-m-d H:M:S')
			var baseurl = `http://${req.get('host')}`
			let { email, phone } = req.body

			if (email == '' || email == undefined || email == null, phone == '' || phone == undefined || phone == null) {
				res.status(500).send({
					status: 500,
					message: 'Field Tidak Boleh Kosong'
				})
			} else {
				let checking = await People.findOne({ email, phone })
				if (checking !== null) {
					var randomString = randomstring.generate({ length: 10, charset: 'alphanumeric' })
					let checkIdentities = await Identities.findOne({ peopleId: checking._id })
					let insertRandomString = await Identities.updateOne(
						{ peopleId: checking._id },
						{
							$set: {
								number: randomString,
								updated_at: dateNow
							}
						}
					)
					if (insertRandomString.n > 0 && insertRandomString.nModified > 0) {

						var linkUri = `${baseurl}/reset-password/${randomString}`
						var textEmail = "Hello " + email + ", <br>";
						// textEmail += "Selamat datang di SebisLes.<br>";
						// textEmail += "Terima kasih sudah bergabung dengan SebisLes. Kami yakin anda akan senang disini!";
						// textEmail += "<br>";
						textEmail += "Silahkan klik link dibawah ini untuk melakukan verifikasi pergatian password:<br>";
						// textEmail += "Lalu silahkan untuk masukkan Nomer validasi di bawah ini. <br>";
						//textEmail		+= "<a href='" + linkUri + "'>" + linkUri + "</a><br>";
						//textEmail		+= "<br>After you verify email account, you can login with this password below:"
						// textEmail += "Password: <u><b>" + randomNumber + "</b></u><br>";
						// textEmail += "Kode Validasi: <u><b>" + ranm + "</b></u>";
						textEmail += "Link Validasi: <u><b>" + linkUri + "</b></u>";
						textEmail += "<br><br><br>";
						textEmail += "Regards,<br>";
						textEmail += "SebisLes Staff";

						let transporter = nodemailer.createTransport({
							host: "m005.dapurhosting.com",
							port: 465,
							secure: true,
							auth: {
								user: "noreply@sbstech.co.id",
								pass: "fvjvCY^%*3423",
							}
						})

						let info = await transporter.sendMail({
							from: '"No-Reply System Admin" <noreply@sbstech.co.id>',
							to: email,
							subject: "SebisLes User Email",
							text: "",
							html: textEmail
						})

						res.status(200).send({
							status: 200,
							message: 'OK, cek email anda!'
						})
					} else {
						res.status(500).send({
							status: 500,
							message: 'Updtade untuk random number gagal'
						})
					}
				} else {
					res.status(500).send({
						status: 500,
						message: 'Email atau Nomor HP Tidak Cocok'
					})
				}
			}

		} catch (error) {
			res.status(500).send({
				status: 500,
				message: `${error}`
			})
		}
	},
	viewForgetPassword: async (req, res) => {
		try {
			let { number } = req.params
			var dt = dateTime.create()
			var regId = req.cookies.regId
			var Status = req.flash('postStatus')
			var msg = req.flash('postMessage')

			let getIdentities = await Identities.findOne({ number })
			console.log(number)
			let theNumber = getIdentities.number
			let getPeople = await People.findOne({ _id: getIdentities.peopleId })
			res.status(200).send(getPeople)
		} catch (error) {
			res.status(500).send({
				status: 500,
				message: `${error}`
			})
		}
	},
	forgetPassword: async (req, res) => {
		try {
			let { newPassword, confirmPassword } = req.body
			let { number } = req.params
			var ER = false
			var data = ''
			dt = dateTime.create()
			dateNow = dt.format('Y-m-d H:M:S')

			if (newPassword == '' || newPassword == undefined || newPassword == null || confirmPassword == '' || confirmPassword == undefined || confirmPassword == null) {
				res.status(500).send({
					status: 500,
					message: 'Password dan Confirm Password tidak boleh kosong!'
				})
			} else {
				if (newPassword.length < 8) {
					res.status(500).send({
						status: 500,
						message: 'Password minimal 8 carakter'
					})
				}
				var hasNumber = /\d/;
				let checkInputNewPassword = await hasNumber.test(newPassword);  // only number and string, and result true/false
				let checkConfirmPassword = await hasNumber.test(confirmPassword)
				if (!checkInputNewPassword) {
					res.status(500).send({
						status: 500,
						message: 'Password harus ada huruf dan angka saja!'
					})
				}
				if (!checkConfirmPassword) {
					res.status(500).send({
						status: 500,
						message: 'Confirm password harus ada huruf dan angka saja!'
					})
				}
				if (checkInputNewPassword && checkConfirmPassword) {
					if (newPassword !== confirmPassword) {
						res.status(500).send({
							status: 500,
							message: 'Password tidak sama'
						})
					} else {
						let bcryptPassword = await bcrypt.hashSync(newPassword, 10)
						let getIdentities = await Identities.findOne({ number })
						let getPeople = await People.findOne({ _id: getIdentities.peopleId })
						let peopleId = getPeople._id
						let changePassword = await People.updateOne(
							{ _id: peopleId },
							{
								$set: {
									password: bcryptPassword
								}
							}
						)
						if (changePassword) {
							res.status(200).send({
								status: 200,
								message: 'Password berhasil diganti',
							})
						} else {
							res.status(500).send({
								status: 500,
								message: 'Gagal mengganti password'
							})
						}
					}
				}
			}

		} catch (error) {
			res.status(500).send({
				status: 500,
				message: `${error}`
			})
		}
	}
}

// get riwayat mengajar dan pendidikan buat tutor