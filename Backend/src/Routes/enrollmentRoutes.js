const express = require("express");

const enrollmentController = require("../controllers/enrollmentController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const router = express.Router({ mergeParams: true });

router.post(
  "/",
  protected,
  restrictTo("user"),
  enrollmentController.createPayment
);

module.exports = router;
