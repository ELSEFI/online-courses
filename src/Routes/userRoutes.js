const expires = require("express");
const authController = require("../controllers/authController");
const router = expires.Router();
const protected = require("../Middleware/jwtMiddleware");

// ROUTES
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protected, authController.profile);

module.exports = router;
