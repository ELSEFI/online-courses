const express = require("express");
const contactController = require("../controllers/contactContrller");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");

const router = express.Router();

router.post("/", contactController.contactWithUs);

// ADMIN
router.get(
  "/",
  protected,
  restrictTo("admin"),
  contactController.getAllMessages
);

router.delete(
  "/delete-messages",
  protected,
  restrictTo("admin"),
  contactController.deleteMessages
);

router.get(
  "/:messageId",
  protected,
  restrictTo("admin"),
  contactController.getMessage
);

router.post(
  "/:messageId/reply-message",
  protected,
  restrictTo("admin"),
  contactController.replyMessage
);

router.delete(
  "/:messageId/delete-message",
  protected,
  restrictTo("admin"),
  contactController.deleteMessage
);

module.exports = router;
