const express = require("express");
const authController = require("../controllers/authController");
const instructorsController = require("../controllers/instructorsController");
const protected = require("../Middleware/jwtMiddleware");
const uploadCvs = require("../Middleware/uploadCvs");
const uploadImage = require("../Middleware/uploadImage");
const resize = require("../Middleware/resizeImage");
const router = express.Router();

router.post("/forget-password", authController.forgetPassword);

router.patch("/reset-password/:token", authController.resetPassword);

router.post("/resend-verification", authController.resendVerification);

router.get("/me", protected, authController.profile);

router.get("/:userId", authController.getUser);

router.patch(
  "/update-profile",
  protected,
  uploadImage.single("profileImage"),
  resize.resizeProfileImage,
  authController.updateProfile
);

router.patch("/update-password", protected, authController.updatePassword);

router.delete("/delete-me", protected, authController.deleteMe);

router.post(
  "/be-instructor",
  protected,
  uploadCvs.single("cv"),
  instructorsController.beInstructor
);

router.post("/verify-email", authController.verifyEmail);

module.exports = router;
