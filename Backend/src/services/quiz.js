const Quiz = require("../models/Quiz");
exports.createQuiz = async ({ title, questions }) => {
  const quiz = await Quiz.create({ title, questions });
  return quiz._id;
};
