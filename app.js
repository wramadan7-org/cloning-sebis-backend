var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('connect-flash');
var session = require('express-session');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var mainRouter = require('./routes/main');
const mongoose = require("mongoose");
const methodOverride = require("method-override");
var config = require('./config/config');

var hour = 3600000;

var app = express();

mongoose.connect("mongodb://localhost:27017/db_sbscourse", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
	secret: config.secret,
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 14 * 24 * hour }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.secret));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(flash());

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/', mainRouter);

app.locals.GClientID = function () {
	//	GOOGLE CLIENT_ID
	return "382659544808-p22gupp3iseumeaoga20ilt0qjb5k4pu.apps.googleusercontent.com";
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	if (err.code == 'EBADCSRFTOKEN') {
		res.status(403);
		res.json({ 'status': 403, 'code': 'error', 'message': 'Bad CSRF Token!', 'postStatus': 'error', 'postMessage': 'Bad CSRF Token!' });
	} else {
		// render the error page
		res.status(err.status || 500);
		res.render('error');
	}
});

module.exports = app;
