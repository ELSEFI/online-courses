const express = require("express");
const categoriesController = require("../controllers/categoriesController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const uploadImage = require("../Middleware/uploadImage");
const resize = require("../Middleware/resizeImage");
const router = express.Router();

router.post(
  "/categories/add-category",
  protected,
  restrictTo("admin"),
  uploadImage.single("image"),
  resize.resizeCategoryImage,
  categoriesController.addCategory
);

router.get("/", categoriesController.getAllCategories);

router.get("/:categoryId", categoriesController.getSubCategories);

router.patch(
  "/:categoryId/disable-category",
  protected,
  restrictTo("admin"),
  categoriesController.disableCategory
);

router.patch(
  "/:categoryId/restore-category",
  protected,
  restrictTo("admin"),
  categoriesController.restoreCategory
);

router.patch(
  "/:categoryId/update-category",
  protected,
  restrictTo("admin"),
  uploadImage.single("image"),
  resize.resizeCategoryImage,
  categoriesController.updateCategory
);

module.exports = router;
