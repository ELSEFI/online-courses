const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

exports.getQuiz = async (req, res) => {
  const { lessonId, quizId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson id" });
    }
    res.status(200).json({ quiz: req.quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getGrades = async (req, res) => {
  const { lessonId, quizId } = req.params;
  try {
    const quiz = await Quiz.findOne({ _id: quizId, lesson: lessonId });
    if (!quiz) return res.status(404).json({ message: "Quiz Not Found" });

    const totalGrades = await QuizAttempt.find({ quiz: quiz._id })
      .sort({
        obtainedScore: -1,
      })
      .populate("user");
    const topGrades = await QuizAttempt.find({ quiz: quizId })
      .sort({
        obtainedScore: -1,
      })
      .populate("user")
      .limit(10);
    res.status(200).json({
      totalGrades,
      topGrades,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.solveQuiz = async (req, res) => {
  const { lessonId, quizId } = req.params;
  const answers = req.body;
  const quiz = req.quiz;
  try {
    if (!Array.isArray(answers))
      return res.status(404).json({ message: "Answers Must be Array" });
    let obtainedScore = 0;
    const attemptAnswers = [];

    for (const answer of answers) {
      const question = quiz.question.id(answers.questionId);
      if (!question) continue;

      const isCorrect =
        answer.selectedOptionIndex === question.correctAnswerIndex;

      const score = isCorrect ? question.score : 0;
      obtainedScore += score;

      attemptAnswers.push({
        questionId: question._id,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect,
        score,
      });
    }

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      lesson: lessonId,
      answers: attemptAnswers,
      totalScore: quiz.totalScore,
      obtainedScore,
      submittedAt: new Date(),
    });

    res.status(200).json({
      message: "Quiz submitted successfully",
      attempt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
