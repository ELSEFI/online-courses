const express = require("express");
const quizController = require("../controllers/quizController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const { isEnrollment } = require("../Middleware/isEnrollment");
const { isAttempts } = require("../Middleware/isAttempts");
const router = express.Router({ mergeParams: true });

router.get(
  "/:quizId/grades",
  protected,
  restrictTo("admin"),
  quizController.getGrades
);

router.get(
  "/:quizId/preview",
  protected,
  isEnrollment,
  quizController.getQuizPreview
);

router.get("/:quizId", protected, isEnrollment, isAttempts, quizController.getQuiz);

router.post(
  "/:quizId",
  protected,
  restrictTo("user"),
  isEnrollment,
  isAttempts,
  quizController.solveQuiz
);
module.exports = router;
