const express = require("express");
const lessonController = require("../controllers/lessonController");
const uploadLesson = require("../Middleware/uploadLesson");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const { isEnrollment } = require("../Middleware/isEnrollment");
const router = express.Router();

router.post(
  "/",
  protected,
  restrictTo("admin"),
  uploadLesson.fields([
    { name: "video", maxCount: 1 },
    { name: "files", maxCount: 5 },
  ]),
  lessonController.addLesson
);

router.get("/", lessonController.getAllLessons);

router.get("/:lessonId", protected, isEnrollment, lessonController.getLesson);

router.delete(
  "/:lessonId",
  protected,
  restrictTo("admin"),
  lessonController.deleteLesson
);

router.patch(
  "/:lessonId/restore",
  protected,
  restrictTo("admin"),
  lessonController.deleteLesson
);

router.patch(
  "/:lessonId",
  protected,
  restrictTo("admin"),
  uploadLesson.fields([{ name: "files", maxCount: 5 }]),
  lessonController.editLesson
);

module.exports = router;
