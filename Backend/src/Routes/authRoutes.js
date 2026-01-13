const express = require("express");
const authController = require("../controllers/authController");
const protected = require("../Middleware/jwtMiddleware");
const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/logout", protected, authController.logout);

router.post("/google", authController.loginGoogle);

router.post("/verify-email", authController.verifyEmail);

router.post("/resend-verification", authController.resendVerification);

router.post("/forget-password", authController.forgetPassword);

router.patch("/reset-password/:token", authController.resetPassword);

router.patch("/change-password", protected, authController.updatePassword);

module.exports = router;
