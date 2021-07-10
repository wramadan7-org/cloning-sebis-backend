const router = require("express").Router();
const apiController = require("../controllers/apiController");

router.get("/", apiController.viewApi);
router.post("/", apiController.addApi);
router.put("/", apiController.editApi);
router.delete("/:id", apiController.deleteApi);

// Lalu export routernya
module.exports = router;