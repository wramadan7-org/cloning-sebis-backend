
const router = require("express").Router();
const articleController = require("../controllers/articleController");

router.get("/", articleController.viewPublic);
router.get("/category/news", articleController.viewNews); 
router.get("/category/news/:param1", articleController.editNews);
router.get("/category/video", articleController.viewVideo); 
router.get("/category/video/:param1", articleController.editVideo); 
router.get("/category/blog", articleController.viewBlog);
router.get("/category/blog/:param1", articleController.editBlog); 
router.get("/category", articleController.viewCat); 

module.exports = router;