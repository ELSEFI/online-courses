const express = require("express");
const coursesController = require("../controllers/coursesController");
const resize = require("../Middleware/resizeImage");
const uploadImage = require("../Middleware/uploadImage");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const router = express.Router();

router.get("/:categoryId/courses", coursesController.getAllCourses);

router.post(
  "/courses",
  protected,
  restrictTo("admin"),
  uploadImage.single("courseThumbnail"),
  resize.resizeThumbnail,
  coursesController.createCourse
);

router.get("/courses/:courseId", coursesController.getCourse);

router.patch(
  "/courses/:courseId/publish-status",
  protected,
  restrictTo("admin"),
  coursesController.changePublishStatus
);

router.delete(
  "/courses/:courseId",
  protected,
  restrictTo("admin"),
  coursesController.deleteCourse
);

router.patch(
  "/courses/:courseId/restore-course",
  protected,
  restrictTo("admin"),
  coursesController.restoreCourse
);

router.patch(
  "/courses/:courseId/update-course",
  protected,
  restrictTo("admin"),
  coursesController.updateCourse
);

module.exports = router;
