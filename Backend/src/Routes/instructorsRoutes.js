const express = require("express");
const instructorController = require("../controllers/instructorsController");
const uploadCvs = require("../Middleware/uploadCvs");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const router = express.Router();
router.use(protected, restrictTo("admin"));

router.get("/requests", instructorController.getAllRequests);

router.get("/requests/:requestId", instructorController.getRequest);

router.patch(
  "/requests/:requestId/approve-request",
  instructorController.acceptInstructor
);

router.patch(
  "/requests/:requestId/reject-request",
  instructorController.rejectInstructor
);

router.get("/", instructorController.getAllInstructors);

router.get("/top-instructors-rated", instructorController.getTopRatedInstructors);

router.get("/top-instructors-students", instructorController.getTopStudentsInstructors);

router.post(
  "/add-instructor",
  uploadCvs.single("cvFile"),
  instructorController.addInstructor
);

router.get("/:instructorId", instructorController.getInstructor);

router.delete(
  "/:instructorId/remove-instructor",
  instructorController.removeInstructor
);

module.exports = router;
