const express = require("express");
const quizController = require("../controllers/quizController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const { isEnrollment } = require("../Middleware/isEnrollment");
const { isAttempts } = require("../Middleware/isAttempts");
const router = express.Router();

router.get(
  "/:quizId",
  protected,
  restrictTo("admin"),
  quizController.getGrades
);

router.get("/", protected, isEnrollment, quizController.getQuiz);

router.post(
  "/:quizId",
  protected,
  restrictTo("user"),
  isEnrollment,
  isAttempts,
  quizController.solveQuiz
);
module.exports = router;
