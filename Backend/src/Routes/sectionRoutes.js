const express = require("express");
const sectionController = require("../controllers/sectionController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const router = express.Router();


router.get("/", sectionController.getAllSections);

// router.get(
//   "/:sectionId",
//   sectionController.getSection
// );

// ADMIN
router.post("/", protected, restrictTo("admin"), sectionController.addSection);

router.patch(
  "/:sectionId/restore",
  protected,
  restrictTo("admin"),
  sectionController.restoreSection
);

router.patch(
  "/:sectionId",
  protected,
  restrictTo("admin"),
  sectionController.editSection
);

router.delete(
  "/:sectionId",
  protected,
  restrictTo("admin"),
  sectionController.deleteSection
);

module.exports = router;
