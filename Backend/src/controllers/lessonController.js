const mongoose = require("mongoose");
const Course = require("../models/Course");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const Enrollment = require("../models/Enrollment");
const quizService = require("../services/quiz");

const path = require("path");
exports.addLesson = async (req, res) => {
  try {
    const { courseSlug, sectionId } = req.params;
    const { titleEn, titleAr, hasVideo, hasQuiz, order } = req.body;

    const course = await Course.findOne({ slug: courseSlug, status: true });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const section = await Section.findOne({ _id: sectionId, isActive: true });
    if (!section) return res.status(404).json({ message: "Section not found" });

    let video = null;
    let files = [];
    let quizId = null;

    if (hasVideo === "true") {
      if (!req.files?.video) {
        return res.status(400).json({ message: "Video file is required" });
      }

      const file = req.files.video[0];

      video = {
        provider: "local",
        fileName: file.filename,
        size: file.size,
        duration: null,
      };
    }

    if (req.files?.files) {
      req.files.files.forEach((file, index) => {
        files.push({
          name: req.body[`fileName${index}`] || file.originalname,
          type: path.extname(file.originalname).replace(".", ""),
          fileName: file.filename,
          size: file.size,
        });
      });
    }

    if (hasQuiz === "true") {
      if (!req.body.quiz) {
        return res.status(400).json({ message: "Quiz data is required" });
      }

      let quizData;

      try {
        quizData =
          typeof req.body.quiz === "string"
            ? JSON.parse(req.body.quiz)
            : req.body.quiz;
      } catch (err) {
        return res.status(400).json({ message: "Invalid quiz format" });
      }

      quizId = await quizService.createQuiz({
        ...quizData,
        lesson: lesson._id,
      });
    }

    if (!video && files.length === 0 && !quizId) {
      return res.status(400).json({
        message:
          "Lesson must have at least one content (video, Files, or quiz)",
      });
    }

    const lesson = await Lesson.create({
      section: section._id,
      title: { en: titleEn, ar: titleAr },
      order: order ?? 0,
      isFree: req.body.isFree ?? false,
      video,
      files,
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
      quizId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating lesson",
      error: error.message,
    });
  }
};

exports.getAllLessons = async (req, res) => {
  const { courseSlug, sectionId } = req.params;
  try {
    const courseFilter = {
      slug: courseSlug,
      status: true,
      isPublished: true,
    };

    const course = await Course.findOne(courseFilter);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const sectionFilter = {
      _id: sectionId,
      course: course._id,
      isActive: true,
    };

    const section = await Section.findOne(sectionFilter);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    let lessonFilter = {
      section: section._id,
      isActive: true,
    };

    const lessons = await Lesson.find(lessonFilter)
      .select("title order isFree hasQuiz")
      .populate("quiz", "title totalScore")
      .sort({ order: 1 });

    res.status(200).json({
      result: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getLesson = async (req, res) => {
  const { courseSlug, sectionId, lessonId } = req.params;

  try {
    const courseFilter = {
      slug: courseSlug,
      status: true,
      isPublished: true,
    };

    const course = await Course.findOne(courseFilter);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const sectionFilter = {
      _id: sectionId,
      course: course._id,
      isActive: true,
    };

    const section = await Section.findOne(sectionFilter);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const lessonFilter = {
      _id: lessonId,
      section: section._id,
      isActive: true,
    };

    const lesson = await Lesson.findOne(lessonFilter).populate(
      "quiz",
      "title totalScore"
    );
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.deleteLesson = async (req, res) => {
  const { courseSlug, sectionId, lessonId } = req.params;
  try {
    const courseFilter = {
      slug: courseSlug,
      status: true,
    };

    if (req.query.isPublished !== undefined) {
      courseFilter.isPublished = req.query.isPublished === "true";
    }

    const course = await Course.findOne(courseFilter);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const sectionFilter = {
      _id: sectionId,
      course: course._id,
    };

    if (req.query.sectionActive !== undefined) {
      sectionFilter.isActive = req.query.sectionActive === "true";
    }

    const section = await Section.findOne(sectionFilter);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const lesson = Lesson.findOne({
      _id: lessonId,
      section: sectionId,
      isActive: true,
    });
    if (!lesson) return res.status(404).json({ message: "Lesson Not Found" });
    lesson.isActive = false;
    await lesson.save();
    res.status(200).json({ message: "Lesson Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.restoreLesson = async (req, res) => {
  const { courseSlug, sectionId, lessonId } = req.params;
  try {
    const courseFilter = {
      slug: courseSlug,
      status: true,
    };

    if (req.query.isPublished !== undefined) {
      courseFilter.isPublished = req.query.isPublished === "true";
    }

    const course = await Course.findOne(courseFilter);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const sectionFilter = {
      _id: sectionId,
      course: course._id,
    };

    if (req.query.sectionActive !== undefined) {
      sectionFilter.isActive = req.query.sectionActive === "true";
    }

    const section = await Section.findOne(sectionFilter);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const lesson = Lesson.findOne({
      _id: lessonId,
      section: sectionId,
      isActive: false,
    });
    if (!lesson) return res.status(404).json({ message: "Lesson Not Found" });
    lesson.isActive = true;
    await lesson.save();
    res.status(200).json({ message: "Lesson Activated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.editLesson = async (req, res) => {
  const { courseSlug, sectionId, lessonId } = req.params;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(sectionId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const course = await Course.findOne({
      slug: courseSlug,
      status: true,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const section = await Section.findOne({
      _id: sectionId,
      course: course._id,
    });
    if (!section) return res.status(404).json({ message: "Section not found" });

    const lesson = await Lesson.findOne({
      _id: lessonId,
      section: section._id,
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    lesson.title.en = req.body.titleEn ?? lesson.title.en;
    lesson.title.ar = req.body.titleAr ?? lesson.title.ar;
    lesson.order = req.body.order ?? lesson.order;

    await lesson.save();

    if (lesson.hasQuiz) {
      const quiz = await Quiz.findOne({ lesson: lesson._id });
      if (quiz) {
        quiz.title.en = req.body.quizTitleEn ?? quiz.title.en;
        quiz.title.ar = req.body.quizTitleAr ?? quiz.title.ar;

        quiz.questions =
          typeof req.body.questions === "string"
            ? JSON.parse(req.body.questions)
            : req.body.questions;

        await quiz.save();
      }
    }

    res.status(200).json({
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.completeLesson = async (req, res) => {
  const { courseSlug, sectionId, lessonId } = req.params;
  try {
    const course = await Course.findOne({
      slug: courseSlug,
      status: true,
      isPublished: true,
    });
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    const section = await Section.findOne({
      course: course._id,
      isActive: true,
      _id: sectionId,
    });
    if (!section) return res.status(404).json({ message: "Section Not Found" });

    const lesson = await Lesson.findOne({
      section: section._id,
      isActive: true,
      _id: lessonId,
    });
    if (!lesson) return res.status(404).json({ message: "Lesson Not Found" });

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });
    await enrollment.completeLesson(lesson._id);
    rea.status;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
