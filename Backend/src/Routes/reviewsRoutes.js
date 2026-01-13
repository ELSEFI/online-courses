const express = require("express");
const reviewsController = require("../controllers/reviewsController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const { isEnrollment } = require("../Middleware/isEnrollment");
const { isCompleted } = require("../Middleware/isCompleted");
const router = express.Router();

router.get("/", reviewsController.getReviews);

router.post(
  "/",
  protected,
  isEnrollment,
  isCompleted,
  restrictTo("user"),
  reviewsController.addReview
);

router.delete("/:reviewId", protected, restrictTo("user", "admin"), reviewsController.deleteReview);

module.exports = router;
