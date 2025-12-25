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
      validate: {
        validator(v) {
          return v >= 0 && v < this.options.length;
        },
      },
    },

    score: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    questions: [questionSchema],

    totalScore: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// calculate total score before save
quizSchema.pre("save", function () {
  this.totalScore = this.questions.reduce((sum, q) => sum + q.score, 0);
});

module.exports = mongoose.model("Quiz", quizSchema);
