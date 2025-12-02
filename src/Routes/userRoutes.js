const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const protected = require("../Middleware/jwtMiddleware");

// ROUTES
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/login", protected, authController.logout);
router.get("/me", protected, authController.profile);

module.exports = router;
