const express = require("express");
const logsController = require("../controllers/logsController");
const protected = require("../Middleware/jwtMiddleware");
const router = express.Router();

router.post("/register", logsController.register);

router.post("/login", logsController.login);

router.post("/google", logsController.loginGoogle);

router.post("/logout", protected, logsController.logout);

module.exports = router;
