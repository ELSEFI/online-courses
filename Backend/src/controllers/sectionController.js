const mongoose = require("mongoose");
const Course = require("../models/Course");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");

exports.addSection = async (req, res) => {
  const { courseSlug } = req.params;
  const { titleEn, titleAr, descriptionAr, descriptionEn, order } = req.body;
  try {
    if (!titleEn || !titleAr || !descriptionEn || !descriptionAr) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const course = await Course.findOne({ slug: courseSlug, status: true });
    if (!course)
      return res
        .status(404)
        .json({ message: "No Course Found To Add Section" });

    const section = await Section.create({
      course: course._id,
      title: {
        en: titleEn,
        ar: titleAr,
      },
      description: {
        en: descriptionEn,
        ar: descriptionAr,
      },
      order: order ?? 0,
    });
    res.status(201).json({ message: "Section Created Successfully", section });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getAllSections = async (req, res) => {
  const { courseSlug } = req.params;

  try {
    const course = await Course.findOne({ slug: courseSlug, status: true });
    if (!course) {
      return res.status(404).json({ message: "No Course Found" });
    }

    const filter = {
      course: course._id,
      isActive: true,
    };

    if (req.user?.role === "admin" && req.query.isActive) {
      if (req.query.isActive === "true") {
        filter.isActive = true;
      } else if (req.query.isActive === "false") {
        filter.isActive = false;
      }
    }

    const sections = await Section.find(filter).sort({ order: 1 });

    res.status(200).json({
      results: sections.length,
      sections,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

// exports.getSection = async (req, res) => {
//   const { courseSlug, sectionId } = req.params;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(sectionId)) {
//       return res.status(400).json({ message: "Invalid Section ID" });
//     }

//     const course = await Course.findOne({ slug: courseSlug, status: true });
//     if (!course) {
//       return res.status(404).json({ message: "Course Not Found" });
//     }

//     const filter = {
//       _id: sectionId,
//       course: course._id,
//     };

//     if (req.user?.role !== "admin") {
//       filter.isActive = true;
//     } else if (req.query.isActive !== undefined) {
//       filter.isActive = req.query.isActive === "true";
//     }

//     const section = await Section.findOne(filter).populate("lessons");

//     if (!section) {
//       return res.status(404).json({ message: "Section Not Found" });
//     }

//     res.status(200).json(section);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: `Server Error ${error.message}` });
//   }
// };

exports.restoreSection = async (req, res) => {
  const { courseSlug, sectionId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({ message: "Invalid Section ID" });
    }

    const course = await Course.findOne({ slug: courseSlug, status: true });
    if (!course) return res.status(404).json({ message: "No Course Found" });

    const section = await Section.findOne({
      course: course._id,
      _id: sectionId,
    });
    if (!section) return res.status(404).json({ message: "No Section Found" });

    if (section.isActive)
      return res.status(409).json({ message: "This Section Already Active" });
    section.isActive = false;

    await section.save();
    res.status(200).json({ message: "Section Active Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.editSection = async (req, res) => {
  const { courseSlug, sectionId } = req.params;
  const { titleEn, titleAr, descriptionEn, descriptionAr, order } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({ message: "Invalid Section ID" });
    }

    const course = await Course.findOne({ slug: courseSlug, status: true });
    if (!course) return res.status(404).json({ message: "No Course Found" });

    const section = await Section.findOne({
      course: course._id,
      _id: sectionId,
    });
    if (!section) return res.status(404).json({ message: "No Section Found" });

    section.title.en = titleEn ?? section.title.en;
    section.title.ar = titleAr ?? section.title.ar;

    section.description.en = descriptionEn ?? section.description.en;
    section.description.ar = descriptionAr ?? section.description.ar;

    section.order = order ?? section.order;

    await section.save();
    res.status(200).json({ message: "Section Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.deleteSection = async (req, res) => {
  const { courseSlug, sectionId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({ message: "Invalid Section ID" });
    }

    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const section = await Section.findOne({
      _id: sectionId,
      course: course._id,
    });

    if (!section) return res.status(404).json({ message: "Section not found" });

    if (!section.isActive)
      return res.status(409).json({ message: "This Section Already Disabled" });

    section.isActive = false;
    await section.save();

    await Lesson.updateMany({ section: section._id }, { isActive: false });

    res.status(200).json({ message: "Section disabled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
