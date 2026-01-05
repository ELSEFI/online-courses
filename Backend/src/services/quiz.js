const Quiz = require("../models/Quiz");
exports.createQuiz = async ({
  title,
  questions,
  lesson,
  totalAttempts = 1,
}) => {
  const quiz = await Quiz.create({ lesson, title, questions, totalAttempts });
  return quiz._id;
};
