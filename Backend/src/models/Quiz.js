const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      default: 1,
    },
  }
);

const quizSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    questions: [questionSchema],
    totalAttempts: {
      type: Number,
      default: 1,
    },
    totalScore: Number,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
quizSchema.index({ lesson: 1 });

quizSchema.pre("save", function () {
  this.totalScore = this.questions.reduce((sum, q) => sum + q.score, 0);
});

module.exports = mongoose.model("Quiz", quizSchema);
