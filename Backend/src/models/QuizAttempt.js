const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedOptionIndex: {
          type: Number,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],

    totalScore: {
      type: Number,
      required: true,
    },

    obtainedScore: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    passed: {
      type: Boolean,
      default: false,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* ================= Indexes ================= */
quizAttemptSchema.index({ user: 1, quiz: 1, lesson: 1 }, { unique: true });

quizAttemptSchema.index({ quiz: 1, obtainedScore: -1 });

/* ================= Hooks ================= */
quizAttemptSchema.pre("save", function (next) {
  if (this.totalScore > 0) {
    this.percentage = Math.round((this.obtainedScore / this.totalScore) * 100);
  }
  next();
});

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
