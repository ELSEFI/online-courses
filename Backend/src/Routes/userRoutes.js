const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const { verifyEmail } = require("../Middleware/verifyEmail");
const protected = require("../Middleware/jwtMiddleware");
const uploadCvs = require("../Middleware/uploadCvs");
const uploadImage = require("../Middleware/uploadImage");
const resize = require("../Middleware/resizeImage");
const isEnrollment = require("../Middleware/checkEnrollment");

const router = express.Router();
// ===== MAIN PAGE ===== //
router.get("/categories", adminController.getAllCategories);
router.get("/categories/:categoryId", adminController.getSubCategories);
// ===== MAIN PAGE ===== //

// ===== COURSES ===== //
router.get("/:categoryId/courses", adminController.getAllCourses);
router.get("/courses/:courseSlug", adminController.getCourse);
router.get("/courses/:courseSlug/sections", adminController.getAllSections);
router.get(
  "/courses/:courseSlug/sections/:sectionId/lessons",
  adminController.getAllLessons
);
router.get(
  "/courses/:courseSlug/sections/:sectionId/lessons/:lessonId",
  protected,
  isEnrollment,
  adminController.getLesson
);
// ===== COURSES ===== //

// ===== QUIZZES ===== //
router.get(
  "/lesson//:lessonId/quiz",
  protected,
  isEnrollment,
  adminController.getQuiz
);
// ===== QUIZZES ===== //

// ===== REVIEWS ===== //
router.get("/courses/:/courseSlug/reviews", adminController.getReviews);
// ===== REVIEWS ===== //

// ROUTES
router.post("/contact-with-us", userController.contactWithUs);
router.post("/register", authController.register);
router.post("/verify-email", verifyEmail);
router.post("/login", authController.login);
router.post("/google", authController.loginGoogle);
router.post("/forget-password", authController.forgetPassword);
router.post("/resend-verification", authController.resendVerification);
router.delete("/delete-me", protected, authController.deleteMe);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch(
  "/update-profile",
  protected,
  uploadImage.single("profileImage"),
  resize.resizeProfileImage,
  authController.updateProfile
);
router.patch("/update-password", protected, authController.updatePassword);
router.post("/logout", protected, authController.logout);
router.get("/me", protected, authController.profile);
router.get("/:userId", authController.getUser);

router.post(
  "/be-instructor",
  protected,
  uploadCvs.single("cv"),
  userController.beInstructor
);

module.exports = router;
