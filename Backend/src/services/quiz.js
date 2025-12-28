const Quiz = require("../models/Quiz");
exports.createQuiz = async ({ title, questions, lesson }) => {
  const quiz = await Quiz.create({ lesson, title, questions });
  return quiz._id;
};
