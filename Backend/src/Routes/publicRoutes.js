const express = require("express");
const authController = require("../controllers/publicController");
const enrollmentController = require("../controllers/enrollmentController");
const coursesController = require("../controllers/coursesController");
const instructorsController = require("../controllers/instructorsController");
const protected = require("../Middleware/jwtMiddleware");
const uploadCvs = require("../Middleware/uploadCvs");
const uploadImage = require("../Middleware/uploadImage");
const resize = require("../Middleware/resizeImage");
const restrictedTo = require("../Middleware/roleMiddleware");
const { isCourseOwner } = require("../Middleware/isCourseOwner");
const router = express.Router();

router.get("/home-data", authController.getHomeData);
router.get("/me", protected, authController.profile);
router.get("/my-courses", protected, enrollmentController.getMyEnrollments);

router.patch(
  "/update-profile",
  protected,
  uploadImage.single("profileImage"),
  resize.resizeProfileImage,
  authController.updateProfile
);

router.get("/users/:userId", authController.getUser);


router.delete("/delete-me", protected, authController.deleteMe);

router.post(
  "/be-instructor",
  protected,
  uploadCvs.single("cv"),
  instructorsController.beInstructor
);

// Instructor Routes
router.get("/instructor/courses", protected, restrictedTo("instructor"), instructorsController.instructorCourses);

router.patch(
  "/instructor/courses/:courseId",
  protected,
  restrictedTo("instructor"),
  isCourseOwner,
  uploadImage.single("courseThumbnail"),
  resize.resizeThumbnail,
  coursesController.updateCourse
);

router.patch(
  "/courses/:courseId/publish-status",
  protected,
  restrictedTo("instructor"),
  isCourseOwner,
  coursesController.changePublishStatus
);

module.exports = router;