const InstructorRequest = require("../models/instructorRequest");
const Contact = require("../models/contactWithUs");
const uploadCvToCloudinary = require("../services/cvUpload");
const deleteFromCloudinary = require("../services/cloudinaryDestroy");
const Course = require("../models/Course");
const Review = require("../models/Reviews");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

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

// REVIEWS
exports.addReview = async (req, res) => {
  const { courseSlug } = req.params;
  const { userRate } = req.body;
  try {
    const course = await Course.findOne({
      slug: courseSlug,
      isPublished: true,
      status: true,
    });
    if (!course) return res.status(404).json({ message: "Course Not Found" });
    if (req.user.role !== "user") {
      res.status(403).json({ message: "Your Not Allowed To Add Review" });
    }
    const review = await Review.create({
      user: req.user._id,
      course: course._id,
      review: req.body.review ?? null,
      rating: userRate,
    });
    res.status(200).json({ message: "Your Review Added Successfully", review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Your Already Rate This Course",
      });
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.solveQuiz = async (req, res) => {
  const { lessonId, quizId } = req.params;
  const answers = req.body;
  const quiz = req.quiz;
  try {
    if (!Array.isArray(answers))
      return res.status(404).json({ message: "Answers Must be Array" });
    let obtainedScore = 0;
    const attemptAnswers = [];

    for (const answer of answers) {
      const question = quiz.question.id(answers.questionId);
      if (!question) continue;

      const isCorrect =
        answer.selectedOptionIndex === question.correctAnswerIndex;

      const score = isCorrect ? question.score : 0;
      obtainedScore += score;

      attemptAnswers.push({
        questionId: question._id,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect,
        score,
      });
    }

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      lesson: lessonId,
      answers: attemptAnswers,
      totalScore: quiz.totalScore,
      obtainedScore,
      submittedAt: new Date(),
    });

    res.status(200).json({
      message: "Quiz submitted successfully",
      attempt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

// Wishlist
exports.addWishlist = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    const wishlist = await Wishlist.create({
      user: req.user._id,
      course: course._id,
      addedAt: new Date(),
    });
    res.status(200).json({ message: "Add Course To Wishlist Successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Already Added This Course To Your Wishlist ",
      });
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.GetWishlist = async (req, res) => {
  try {
    const userId = req.params.userId ? req.params.userId : req.user._id;
    const wishlist = await Wishlist.getUserWishlist(userId);
    res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
