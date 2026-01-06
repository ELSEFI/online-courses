const express = require("express");
const usersController = require("../controllers/usersController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const router = express.Router();
router.use(protected, restrictTo("admin"));

router.get("/", usersController.getAllUsers);

router.post("/add-user", usersController.addUser);

router.get("/:userId", usersController.getUser);

router.delete("/:userId", usersController.deleteUser);

router.patch("/:userId/update-status", usersController.updateStatus);

module.exports = router;
