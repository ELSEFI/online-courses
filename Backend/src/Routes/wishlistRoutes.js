const express = require("express");
const wishlistController = require("../controllers/wishlistController");
const protected = require("../Middleware/jwtMiddleware");
const router = express.Router();

router.post("/:courseId", protected, wishlistController.addWishlist);

router.get("/", protected, wishlistController.GetWishlist);

router.delete("/:courseId", protected, wishlistController.deleteWishlist);

module.exports = router;
