const express = require("express");
const statsController = require("../controllers/statsControllers");
const protected = require("../Middleware/jwtMiddleware");
const restrictedTo = require("../Middleware/roleMiddleware");
const router = express.Router();

router.get("/", protected, restrictedTo("admin"), statsController.getStats);

module.exports = router;
