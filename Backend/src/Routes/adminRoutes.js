const express = require("express");

const adminController = require("../controllers/adminController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");

const uploadCvs = require("../Middleware/uploadCvs");
const uploadImage = require("../Middleware/uploadImage");
const resize = require("../Middleware/resizeImage");
const uploadFile = require("../Middleware/uploadFile");
const uploadVideo = require("../Middleware/uploadVideo");

const router = express.Router();
router.use(protected, restrictTo("admin"));

// ==================== INSTRUCTOR ROUTES ====================
router.get("/instructors", adminController.getAllInstructors);
router.post(
  "/instructors/add-instructor",
  uploadCvs.single("cvFile"),
  adminController.addInstructor
);
router.get("/instructors/:instructorId", adminController.getInstructor);
router.delete(
  "/instructors/:instructorId/remove-instructor",
  adminController.removeInstructor
);

// ==================== MESSAGES ROUTES ====================
router.get("/users/messages", adminController.getAllMessages);
router.delete(
  "/users/messages/delete-messages",
  adminController.deleteMessages
);
router.get("/users/messages/:messageId", adminController.getMessage);
router.post(
  "/users/messages/:messageId/reply-message",
  adminController.replyMessage
);
router.delete(
  "/users/messages/:messageId/delete-message",
  adminController.deleteMessage
);

// ==================== REQUEST ROUTES ====================
router.get("/users/requests", adminController.getAllRequests);
router.get("/users/requests/:requestId", adminController.getRequest);
router.patch(
  "/users/requests/:requestId/approve-request",
  adminController.acceptInstructor
);
router.patch(
  "/users/requests/:requestId/reject-request",
  adminController.rejectInstructor
);

// ==================== USERS ROUTES ====================
router.get("/users", adminController.getAllUsers);
router.post("/users/add-user", adminController.addUser);
router.get("/users/:userId", adminController.getUser);
router.delete("/users/:userId", adminController.deleteUser);
router.patch("/users/:userId/update-status", adminController.updateStatus);

// ==================== CATEGORIES ROUTES ====================
router.post(
  "/categories/add-category",
  uploadImage.single("image"),
  resize.resizeCategoryImage,
  adminController.addCategory
);

router.get("/categories", adminController.getAllCategories);
router.get("/categories/:categoryId", adminController.getCategory);
router.patch(
  "/categories/:categoryId/disable-category",
  adminController.disableCategory
);
router.patch(
  "/categories/:categoryId/restore-category",
  adminController.restoreCategory
);
router.patch(
  "/categories/:categoryId/update-category",
  uploadImage.single("image"),
  resize.resizeCategoryImage,
  adminController.updateCategory
);

// ==================== COURSES ROUTES ====================

router.get("/courses", adminController.getAllCourses);

router.post(
  "/courses/add-course",
  uploadImage.single("courseThumbnail"),
  resize.resizeThumbnail,
  adminController.createCourse
);

router.get("/courses/:courseId", adminController.getCourse);
router.patch(
  "/courses/:courseId/publish-status",
  adminController.changePublishStatus
);

router.patch("/courses/:courseId/disable-course", adminController.deleteCourse);

router.patch(
  "/courses/:courseId/restore-course",
  adminController.restoreCourse
);

router.patch("/courses/:courseId/update-course", adminController.updateCourse);

module.exports = router;

// ==================== SECTIONS ROUTES ====================
router.post(
  "/courses/:courseSlug/sections/add-section",
  adminController.addSection
);

router.get("/courses/:courseSlug/sections", adminController.getAllSections);

router.get(
  "/courses/:courseSlug/sections/:sectionId",
  adminController.getSection
);

router.patch(
  "/courses/:courseSlug/sections/:sectionId/disable-section",
  adminController.disableSection
);

router.patch(
  "/courses/:courseSlug/sections/:sectionId/restore-section",
  adminController.restoreSection
);

router.patch(
  "/courses/:courseSlug/sections/:sectionId/edit-section",
  adminController.editSection
);

// ==================== LESSONS ROUTES ====================
router.post(
  "/courses/:courseSlug/sections/:sectionId/lessons",
  adminController.addLesson
);
