const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

exports.isAttempts = async (req, res, next) => {
  const { lessonId, quizId } = req.params;
  try {
    const quiz = await Quiz.findOne({
      _id: quizId,
      lesson: lessonId,
      isActive: true,
    });
    if (!quiz) return res.status(404).json({ message: "Quiz Not Found" });
    const attempt = await QuizAttempt.countDocuments({
      user: req.user._id,
      quiz: quiz._id,
      lesson: quiz.lesson,
    });

    if (attempt < quiz.totalAttempts) {
      req.quiz = quiz;
      return next();
    }

    return res
      .status(403)
      .json({ message: "You have reached the maximum number of attempts" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
