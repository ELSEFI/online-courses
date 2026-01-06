const instructorRequest = require("../models/instructorRequest");
const instructorProfile = require("../models/instructorProfile");
const User = require("../models/User");
const { uploadCvToCloudinary } = require("../services/cvUpload");
const { deleteFromCloudinary } = require("../services/cloudinaryDestroy");

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

exports.getAllInstructors = async (req, res) => {
  const instructors = await instructorProfile
    .find()
    .populate("userId", "name email profileImage")
    .sort({ createdAt: -1 });
  if (instructors.length === 0)
    return res.status(200).json({ message: "Not Instructors Founded!" });
  res.status(200).json(instructors);
};

exports.getInstructor = async (req, res) => {
  try {
    const instructor = await instructorProfile
      .findById(req.params.instructorId)
      .populate("userId", "name email profileImage");
    if (!instructor)
      return res.status(404).json({ message: "Not Instructor With That Id" });

    res.status(200).json(instructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeInstructor = async (req, res) => {
  try {
    const instructor = await instructorProfile.findById(
      req.params.instructorId
    );
    if (!instructor)
      return res.status(400).json({ message: "No Instructor Founded" });

    await User.findByIdAndUpdate(instructor.userId, { role: "user" });
    await deleteFromCloudinary(instructor.cvFile);
    await instructorProfile.findByIdAndDelete(req.params.instructorId);

    res.status(200).json({ message: "instructor Has Been Removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addInstructor = async (req, res) => {
  const {
    name,
    email,
    password,
    bioEn,
    bioAr,
    jobTitleEn,
    jobTitleAr,
    experienceYears,
  } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !bioEn ||
    !bioAr ||
    !jobTitleEn ||
    !jobTitleAr ||
    !experienceYears
  )
    return res.status(400).json({ message: "All Inputs Required" });

  if (!req.file) {
    return res.status(400).json({
      message: "CV file is required",
    });
  }
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User Already Exist" });

    user = new User({
      name,
      email,
      password,
      role: "instructor",
      emailVerified: true,
    });
    await user.save();
    const cv = await uploadCvToCloudinary(req.file.buffer, "instructors-cvs");
    const instructor = await instructorProfile.create({
      userId: user._id,
      bio: {
        en: bioEn,
        ar: bioAr,
      },
      experienceYears,
      jobTitle: {
        en: jobTitleEn,
        ar: jobTitleAr,
      },
      cvFile: cv.public_id,
    });

    res
      .status(200)
      .json({ message: "Instructor Created Successfully", instructor });
  } catch (error) {
    if (req.file) {
      await deleteFromCloudinary(cv.public_id);
    }
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await instructorRequest
      .find()
      .populate("userId", "name email profileImage")
      .sort({ createdAt: -1 });
    if (requests.length === 0)
      return res.status(404).json({ message: "No Requests Found" });

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await instructorRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request No Found!" });
    await request.populate("userId", "name email profileImage");
    res.status(200).json({
      request: {
        ...request.toObject(),
        cvURL: `${req.protocol}://${req.get("host")}/cvs/${request.cvFile}`,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.acceptInstructor = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await instructorRequest.findById(requestId);

    if (!request)
      return res.status(400).json({ message: "No Request With That Id" });

    if (request.status !== "pending")
      return res
        .status(400)
        .json({ message: "That Request Already Processed" });

    request.status = "approved";
    await request.save();

    const instructor = await instructorProfile.create({
      userId: request.userId,
      bio: {
        en: request.bio.en,
        ar: request.bio.ar,
      },
      experienceYears: request.experienceYears,
      jobTitle: {
        en: request.jobTitle.en,
        ar: request.jobTitle.ar,
      },
      cvFile: request.cvFile,
    });
    await User.findByIdAndUpdate(request.userId, { role: "instructor" });

    res.status(201).json({
      message: "Instructor approved successfully",
      profile: instructor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.rejectInstructor = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await instructorRequest.findById(requestId);
    const { rejectionReason_en, rejectionReason_ar } = req.body;

    if (!rejectionReason_en || !rejectionReason_ar) {
      return res.status(400).json({
        message: "Rejection reason is required in both languages",
      });
    }

    if (!request)
      return res.status(404).json({ message: "No Request With That Id" });

    if (request.status !== "pending")
      return res
        .status(400)
        .json({ message: "That Request Already Processed" });

    request.status = "rejected";
    request.rejectionReason.en = rejectionReason_en;
    request.rejectionReason.ar = rejectionReason_ar;
    await request.save();

    res.status(201).json({
      message: "Instructor rejected",
      profile: request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
