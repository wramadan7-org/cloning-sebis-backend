
const router = require("express").Router();
const mainController = require("../controllers/mainController");
const articleController = require("../controllers/articleController");
const apiController = require("../controllers/apiController");
const menuController = require("../controllers/menuController");
const gradeController = require("../controllers/gradeController");
const courseController = require("../controllers/courseController");
const mentorController = require("../controllers/mentorController");
const scheduleController = require("../controllers/scheduleController");
const profileController = require("../controllers/profileController");
const paymentController = require("../controllers/paymentController");
const costController = require("../controllers/costController");
const balanceController = require("../controllers/balanceController");
const monitoringController = require("../controllers/monitoringController");
const searchController = require("../controllers/searchController");
const studyController = require("../controllers/mystudyController");
const apiV2Controller = require("../controllers/apiV2Controller");

// authentication Bearer
const tokenAuth = require('../middlewares/auth');

const multer = require('multer');
var path = require('path');
const helpers = require('../helpers/Helpers');
const ExpressBrute = require("express-brute");
const MongooseStore = require("express-brute-mongoose");
const BruteForceSchema = require("express-brute-mongoose/dist/schema");
const mongoose = require("mongoose");
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true, httpOnly: true });

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/images/');
	},

	// By default, multer removes file extensions so let's add them back
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
	}
});

const model = mongoose.model(
	"bruteforce",
	new mongoose.Schema(BruteForceSchema)
);
const store = new MongooseStore(model);

var bruteforce = new ExpressBrute(store);
var upload = multer({ storage: storage, fileFilter: helpers.imageFilter });

// Main Route
router.get("/", function (req, res, next) { res.redirect('/login'); }); // Untuk view
router.get("/home", mainController.viewHome);
//router.get("/test",  mainController.viewTest);
router.post("/verification", mainController.getVerification);
//router.post("/tist", mainController.viewTist);
router.get("/verify/:token", mainController.getVerifiyEmail);

// Register & Add Data
//router.get("/register", mainController.viewRegister);
//router.post("/register", mainController.postRegister);
router.get("/add_data", mainController.addFirstData);

// Login & Logout
router.get("/logout", mainController.logoutProccess);
router.get("/login", mainController.viewLogin);
router.post("/login", mainController.loginProcess);
router.get("/google/:param1/:param2/:param3", mainController.googleProcess);

// Article Route
router.get("/article", articleController.viewPublic);
router.post("/article", articleController.articlePage);
router.delete("/article/:id", articleController.deleteArticle);
router.put("/article", upload.single('imgfile2'), articleController.editArticle);
router.post("/article/add", upload.single('imgfile'), articleController.addArticle);

// Api Route
//router.get("/api" , bruteforce.prevent, apiController.firstAccess);
//router.get("/api/test" , apiController.test);
router.get("/api/test", apiController.test);
router.get("/api/cekpassword/:email/:pass", apiController.testPassword);
router.post("/api/getuser", apiController.getIdUser);
router.post("/api/regis", apiController.registerEmail);
//router.post("/api/login", cors(), apiController.userLogin);
router.post("/api/login", apiController.userLogin);
router.post("/api/verification", apiController.userVerification);
router.post("/api/refreshtoken", apiController.refreshToken);
router.post("/api/searchgrade", apiController.searchGrade);
//router.post("/api/search", apiController.searchCourse);
router.post("/api/getschedule", apiController.getNewSchedule);
//router.post("/api/setschedule", apiController.setSchedule);
router.post("/api/addcart", apiController.addNewCart);
router.post("/api/viewcart", apiController.viewCart);
router.post("/api/deletecart", apiController.deleteCart);
router.post("/api/checkout", apiController.NewCheckout);
router.post("/api/paymentnotif", apiController.paymentNotif);


router.get("/reset-password/:number", apiV2Controller.viewForgetPassword)
router.post("/reset-password/:number", apiV2Controller.forgetPassword)
router.post("/api/forget-password", apiV2Controller.forgetPassword)
router.post("/api/verification/forget-password", apiV2Controller.verifForgetPassword)
// Student
router.post("/api/student", apiV2Controller.getStudent);
router.patch("/api/student/update", upload.single('imgProfile'), apiV2Controller.updateStudent);
router.patch("/api/student/changePassword", apiV2Controller.changePasswordStudent);
router.post("/api/home", apiV2Controller.berandaHome);
router.post("/api/teacher/profile/:peopleId", apiV2Controller.profileTeacher);
// router.post("/api/jadwal", apiV2Controller.getJadwal);

// Menu Page Route
router.get("/menu", menuController.viewPublic);
router.post("/menu", menuController.menuPage);
router.post("/menu/add", menuController.addMenu);
router.put("/menu", menuController.editMenu);
router.delete("/menu/:id", menuController.deleteMenu);

// Grade Route
router.get("/grade", csrfProtection, gradeController.gradeView);
router.post("/grade", csrfProtection, gradeController.addKelas);
router.post("/grade/switch/:idKelas", csrfProtection, gradeController.switchKelas);
router.put("/grade", csrfProtection, gradeController.editKelas);

// Course Route
router.get("/course", courseController.viewMaterial);
router.post("/course", courseController.coursePage);
router.post("/course/add", courseController.addMaterial);
router.put("/course", courseController.editMaterial);

// Mentor Route
router.get("/mentor", csrfProtection, mentorController.viewMentor);
router.post("/mentor", csrfProtection, mentorController.mentorPage);
router.post("/mentor/approveStudy", csrfProtection, mentorController.studyApprove);
router.post("/mentor/approveMentor", csrfProtection, mentorController.mentorApprove);
router.post("/mentor/search", csrfProtection, mentorController.viewSearch);
//router.delete("/mentor/:id", mentorController.deleteStudy);

// My Study
router.get("/mystudy", studyController.viewStudy);
router.get("/mystudy/:id", studyController.disableStudy);
router.post("/mystudy", studyController.addStudy);

// Schedule Route
router.get("/schedule", csrfProtection, scheduleController.viewSchedule);
router.post("/schedule", csrfProtection, scheduleController.addSchedule);
router.post("/getSchedule", csrfProtection, scheduleController.getData);

// Profile Route
router.get("/profile", csrfProtection, profileController.viewProfile);
router.post("/profile/basicinfo", csrfProtection, profileController.editBasicInfo);
router.post("/profile/pass", csrfProtection, profileController.editPassWord);
router.post("/profile/addteachexp", csrfProtection, profileController.addTeachExp);
router.post("/profile/addeducation", csrfProtection, profileController.addEduBackground);
router.post("/profile/editeducation", csrfProtection, profileController.editEduBackground);
router.post("/profile/editteachexp", csrfProtection, profileController.editTeachExp);
router.post("/profile/becometeacher", csrfProtection, profileController.verifiedData);
//router.get("/profile/sendemail", profileController.sendEmail);
router.post("/profile/img", upload.fields([
	{ name: 'imgProfile', maxCount: 1 },
	{ name: 'imgSelfie', maxCount: 1 },
	{ name: 'imgIDCard', maxCount: 1 },
	{ name: 'imgCertificate', maxCount: 1 }
]), profileController.editImage);
// Test Upload Img
router.post("/profile/editRawData/:uid/:emails", profileController.editRawData);
router.delete("/profile/delteachexp/:uid/:emails/:id", profileController.remTeachExp);
router.delete("/profile/deledubgn/:uid/:emails/:id", profileController.remEduBgn);
router.post("/profile/sendImg/:uid/:emails", upload.fields([
	{ name: 'imgProfile', maxCount: 1 },
	{ name: 'imgSelfie', maxCount: 1 },
	{ name: 'imgIDCard', maxCount: 1 },
	{ name: 'imgCertificate', maxCount: 1 }
]), profileController.checkImg);

// Payment
router.get("/payment", paymentController.viewPayment);

// Cost
router.get("/cost", costController.viewCost);

// Balance
router.get("/balance", balanceController.viewBalance);

// Monitoring
router.get("/monitoring", monitoringController.Monitoring);

// Search
router.get("/search", csrfProtection, searchController.viewSearch);
router.post("/search", csrfProtection, searchController.letSearch);

module.exports = router;