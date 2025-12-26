const InstructorRequest = require("../models/instructorRequest");
const Contact = require("../models/contactWithUs");
const uploadCvToCloudinary = require("../services/cvUpload");
const deleteFromCloudinary = require("../services/cloudinaryDestroy");

exports.beInstructor = async (req, res) => {
  let uploadedCv = null;

  try {
    const { bio_ar, bio_en, experienceYears, jobTitle_ar, jobTitle_en } =
      req.body;

    if (!bio_en || !bio_ar)
      return res
        .status(400)
        .json({ message: "Bio is required in both languages" });

    if (!experienceYears || experienceYears < 0)
      return res
        .status(400)
        .json({ message: "Valid experience years required" });

    if (!jobTitle_en || !jobTitle_ar)
      return res.status(400).json({ message: "Job title required" });

    if (!req.file)
      return res.status(400).json({ message: "CV file is required" });

    if (!req.user.status)
      return res.status(403).json({
        message: "You are not allowed to apply as instructor",
      });

    // upload CV
    uploadedCv = await uploadCvToCloudinary(req.file);

    const existingRequest = await InstructorRequest.findOne({
      userId: req.user._id,
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        await deleteFromCloudinary(uploadedCv.public_id, "raw");
        return res
          .status(400)
          .json({ message: "You already have a pending request" });
      }

      if (existingRequest.status === "approved") {
        await deleteFromCloudinary(uploadedCv.public_id, "raw");
        return res
          .status(400)
          .json({ message: "You are already an instructor" });
      }

      if (existingRequest.cvFile) {
        await deleteFromCloudinary(existingRequest.cvFile, "raw");
      }

      await InstructorRequest.findByIdAndDelete(existingRequest._id);
    }

    const request = await InstructorRequest.create({
      userId: req.user._id,
      bio: { en: bio_en, ar: bio_ar },
      experienceYears,
      jobTitle: { en: jobTitle_en, ar: jobTitle_ar },
      status: "pending",
      cvFile: uploadedCv.public_id,
    });

    await request.populate("userId", "name email profileImage");

    res.status(201).json({
      message: "Request submitted successfully",
      request,
    });
  } catch (error) {
    if (uploadedCv) {
      await deleteFromCloudinary(uploadedCv.public_id, "raw");
    }

    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.contactWithUs = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ message: "Please fill all fields" });

  try {
    const existing = await Contact.findOne({ email });
    if (existing)
      return res.status(400).json({
        message: "We already received your message",
      });

    await Contact.create({ name, email, message });

    res.status(200).json({
      message: "We will contact you soon",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
