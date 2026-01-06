const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },

    merchantOrderId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paidAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
