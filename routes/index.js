var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var sess = req.session;
	if(sess.email) {
		res.render('index', { title: 'Express' });
	}else{
		return res.redirect('/tes');
	}
	
});

module.exports = router;
