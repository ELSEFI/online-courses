const instructorRequest = require("../models/instructorRequest");
const mongoose = require("mongoose");
const instructorProfile = require("../models/instructorProfile");
const User = require("../models/User");
const Contact = require("../models/contactWithUs");
const Category = require("../models/Category");
const Course = require("../models/Course");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const quizService = require("../services/quiz");
const { sendReplyEmail } = require("../services/emailSender");
const { uploadCvToCloudinary } = require("../services/cvUpload");
const { uploadImageToCloudinary } = require("../services/imageUpload");
const { uploadVideoToCloudinary } = require("../services/videoUpload");
const { deleteFromCloudinary } = require("../services/cloudinaryDestroy");
const path = require("path");

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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
    if (users.length === 0)
      return res.status(404).json({ message: "No Users" });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).json({ message: "No User With That Id" });

    if (user.role === "admin" || user.role === "instructor")
      return res.status(400).json({ message: "That Id Not Regular User" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All Inputs Required" });

  try {
    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ message: "User Already Signed Up" });

    user = new User({
      name,
      email,
      password,
      emailVerified: true,
    });
    await user.save();

    res.status(200).json({ message: "User Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "Not User Founded" });

    user.status = !user.status;
    await user.save();
    res.status(200).json({ message: "User Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).json({ message: "User Not Founded" });
    const instructor = await instructorProfile.findOne({ userId: user._id });
    if (!instructor) {
      await User.findByIdAndDelete(user._id);
      return res.status(200).json({ message: "User Deleted Successfully" });
    }

    await instructorProfile.findByIdAndDelete(instructor._id);
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find();
    if (messages.length === 0)
      return res.status(400).json({ message: "No Messages Yet!" });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId);
    if (!message)
      return res.status(400).json({ message: "No Message Founded" });

    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId).select(
      "email"
    );
    const { reply } = req.body;
    if (!reply)
      return res.status(400).json({ message: "You Must Fill a reply input" });
    await sendReplyEmail(message.email, reply);

    res.status(200).json({ message: "Reply sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteMessages = async (req, res) => {
  try {
    await Contact.deleteMany();
    res.status(200).json({ message: "Messages Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message Not Found" });
    await Contact.findByIdAndDelete(message._id);
    res.status(200).json({ message: "Message Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ========== CATEGORIES ========== //
exports.addCategory = async (req, res) => {
  const {
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
    parentsCategory,
    order,
  } = req.body;
  try {
    let result = null;
    if (req.file) {
      result = await uploadImageToCloudinary(req.file.buffer, "Categories");
    }
    const category = await Category.create({
      name: {
        en: nameEn,
        ar: nameAr,
      },
      description: {
        en: descriptionEn,
        ar: descriptionAr,
      },
      parent: parentsCategory || null,
      order: order ?? 0,
      image: result?.public_id || null,
    });
    res
      .status(201)
      .json({ message: "Category Created Successfully", category });
  } catch (error) {
    if (req.file) {
      await deleteFromCloudinary(result.public_id);
    }
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Category with same name already exists in this level",
      });
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const categories = await Category.getCategoryTree({ includeInactive });
    res.status(200).json({ results: categories.length, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { includeInactive } = req.query;

  try {
    const filter = {
      _id: categoryId,
    };

    if (includeInactive !== "true") {
      filter.isActive = true;
    }

    const populateOptions = {
      path: "subcategories",
      options: { sort: { order: 1, "name.en": 1 } },
    };

    if (includeInactive !== "true") {
      populateOptions.match = { isActive: true };
    }
    const category = await Category.findOne(filter).populate(populateOptions);

    if (!category)
      return res.status(400).json({ message: "Not Founded Category" });

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

async function getAllDescendantCategoryIds(categoryId) {
  const children = await Category.find({ parent: categoryId }).select("_id");

  let ids = children.map((child) => child._id);

  for (const child of children) {
    const childIds = await getAllDescendantCategoryIds(child._id);
    ids = ids.concat(childIds);
  }

  return ids;
}

exports.disableCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category Not Found" });

    const children = await getAllDescendantCategoryIds(categoryId);
    await Category.updateMany(
      {
        _id: { $in: [categoryId, ...children] },
      },
      { isActive: false }
    );

    res.status(200).json({
      message: "Category and all subcategories disabled successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
exports.restoreCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category Not Found" });

    const children = await getAllDescendantCategoryIds(categoryId);
    await Category.updateMany(
      {
        _id: { $in: [categoryId, ...children] },
      },
      { isActive: true }
    );

    res.status(200).json({
      message: "Category and all subcategories restored successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const {
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
    parentCategory,
    order,
  } = req.body;
  try {
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({
        message: "Category Not Found",
      });
    let imageId = category.image;
    if (req.file) {
      await deleteFromCloudinary(category.image);
      const result = await uploadImageToCloudinary(
        req.file.buffer,
        "Categories"
      );
      imageId = result.public_id;
    }
    await Category.findByIdAndUpdate(
      categoryId,
      {
        name: {
          en: nameEn ?? category.name.en,
          ar: nameAr ?? category.name.ar,
        },
        description: {
          en: descriptionEn ?? category.description.en,
          ar: descriptionAr ?? category.description.ar,
        },
        parent: parentCategory ?? category.parent,
        order: order ?? category.order,
        image: imageId,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Category Updated Successfully" });
  } catch (error) {
    if (result) {
      await deleteFromCloudinary(result.public_id);
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

// ========== COURSES ========== //
exports.createCourse = async (req, res) => {
  const {
    titleEn,
    titleAr,
    shortDescEn,
    shortDescAr,
    descEn,
    descAr,
    requirementsEn,
    requirementsAr,
    price,
    discountPrice,
    instructorId,
    category,
    levelEn,
    levelAr,
  } = req.body;
  let uploadThumbnail = null;
  try {
    if (!req.file)
      return res.status(400).json({ message: "Course thumbnail is Required" });
    uploadThumbnail = await uploadImageToCloudinary(req.file.buffer, "Courses");

    const course = await Course.create({
      title: {
        en: titleEn,
        ar: titleAr,
      },
      shortDescription: {
        en: shortDescEn ?? undefined,
        ar: shortDescAr ?? undefined,
      },
      description: {
        en: descEn,
        ar: descAr,
      },
      requirements: {
        en: requirementsEn ? [requirementsEn] : undefined,
        ar: requirementsAr ? [requirementsAr] : undefined,
      },
      price: price ?? 0,
      discountPrice: discountPrice ?? undefined,
      instructor: instructorId,
      createdBy: req.user._id,
      category,
      level: {
        en: levelEn,
        ar: levelAr,
      },
      thumbnail: uploadThumbnail.public_id,
    });
    const instructor = await instructorProfile.findById(instructorId);
    if (!instructor)
      return res.status(404).json({ message: "Instructor Not Found" });
    res.status(201).json({ message: "Course Added Successfully", course });
  } catch (error) {
    if (uploadThumbnail) {
      await deleteFromCloudinary(uploadThumbnail.public_id);
    }
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Course with same name already exists",
      });
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getAllCourses = async (req, res) => {
  const { categoryId } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  try {
    const allCategories = await getAllDescendantCategoryIds(categoryId);
    allCategories.push(categoryId);

    const filter = {
      status: true,
      isPublished: true,
      category: { $in: allCategories },
    };

    if (req.user.role !== "admin") {
      filter.isPublished = true;
    } else if (req.query.isPublished !== undefined) {
      filter.isPublished = req.query.isPublished === "true";
    }

    if (req.query.subCategory) {
      filter.category = req.query.subCategory;
    }

    if (req.query.level) {
      filter["level.en"] = req.query.level;
    }

    if (req.query.minRating) {
      filter.rating = { $gte: Number(req.query.minRating) };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === "rating") sort = { rating: -1 };
    if (req.query.sort === "popular") sort = { enrollmentCount: -1 };

    const courses = await Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      results: courses.length,
      courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID" });
    }

    const filter = { _id: courseId, status: true };

    if (req.user?.role !== "admin") {
      filter.isPublished = true;
    }

    const course = await Course.findOne(filter);

    if (!course) return res.status(404).json({ message: "Course Not Found" });

    res.status(200).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.changePublishStatus = async (req, res) => {
  const { courseId } = req.params;
  const { isPublished } = req.body;

  try {
    if (typeof isPublished !== "boolean") {
      return res.status(400).json({ message: "isPublished must be boolean" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    course.isPublished = isPublished;
    course.publishedAt = isPublished ? new Date() : null;

    await course.save();

    res.status(200).json({
      message: isPublished
        ? "Course Published Successfully"
        : "Course Unpublished Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.updateCourse = async (req, res) => {
  const {
    titleEn,
    titleAr,
    shortDescEn,
    shortDescAr,
    descEn,
    descAr,
    requirementsEn,
    requirementsAr,
    price,
    discountPrice,
    instructorId,
    category,
    levelEn,
    levelAr,
  } = req.body;

  const { courseId } = req.params;
  let updatedThumbnail = null;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });
    let oldThumbnail = course.thumbnail;
    // Handle thumbnail
    if (req.file) {
      updatedThumbnail = await uploadToCloudinary(req.file.buffer, "Courses");
      course.thumbnail = updatedThumbnail.public_id;
    }

    course.title.en = titleEn ?? course.title.en;
    course.title.ar = titleAr ?? course.title.ar;

    course.shortDescription.en = shortDescEn ?? course.shortDescription.en;
    course.shortDescription.ar = shortDescAr ?? course.shortDescription.ar;

    course.description.en = descEn ?? course.description.en;
    course.description.ar = descAr ?? course.description.ar;

    if (requirementsEn) course.requirements.en = [requirementsEn];
    if (requirementsAr) course.requirements.ar = [requirementsAr];

    course.price = price ?? course.price;
    course.discountPrice = discountPrice ?? course.discountPrice;

    course.instructor = instructorId ?? course.instructor;
    course.category = category ?? course.category;

    course.level.en = levelEn ?? course.level.en;
    course.level.ar = levelAr ?? course.level.ar;

    await course.save();

    // delete old thumbnail AFTER save
    if (updatedThumbnail) {
      await deleteFromCloudinary(oldThumbnail);
    }

    res.status(200).json({ message: "Course Updated Successfully" });
  } catch (error) {
    if (updatedThumbnail) {
      await deleteFromCloudinary(updatedThumbnail.public_id);
    }

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Course with same title already exists" });
    }

    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    if (!course.status)
      return res.status(400).json({ message: "Course already deleted" });

    course.status = false;
    course.isPublished = false;

    await course.save();

    res.status(200).json({ message: "Course Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
exports.restoreCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    if (course.status)
      return res.status(400).json({ message: "Course already active" });

    course.status = true;
    course.isPublished = false;

    await course.save();

    res.status(200).json({ message: "Course restored Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

// ========== SECTIONS ========== //

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

    const filter = { course: course._id };

    if (req.user?.role !== "admin") {
      filter.isActive = true;
    } else if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
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

exports.getSection = async (req, res) => {
  const { courseSlug, sectionId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({ message: "Invalid Section ID" });
    }

    const course = await Course.findOne({ slug: courseSlug, status: true });
    if (!course) {
      return res.status(404).json({ message: "Course Not Found" });
    }

    const filter = {
      _id: sectionId,
      course: course._id,
    };

    if (req.user?.role !== "admin") {
      filter.isActive = true;
    } else if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    const section = await Section.findOne(filter).populate("lessons");

    if (!section) {
      return res.status(404).json({ message: "Section Not Found" });
    }

    res.status(200).json(section);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

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

// ========== LESSON ========== //
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
    const isAdmin = ["admin", "instructor"].includes(req.user.role);

    const courseFilter = {
      slug: courseSlug,
      status: true,
    };

    if (!isAdmin) {
      courseFilter.isPublished = true;
    } else if (req.query.isPublished !== undefined) {
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

    if (!isAdmin) {
      sectionFilter.isActive = true;
    } else if (req.query.sectionActive !== undefined) {
      sectionFilter.isActive = req.query.sectionActive === "true";
    }

    const section = await Section.findOne(sectionFilter);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    let lessonFilter = {
      section: section._id,
    };

    if (!isAdmin) {
      lessonFilter.isActive = true;
    } else if (req.query.lessonActive !== undefined) {
      lessonFilter.isActive = req.query.lessonActive === "true";
    }

    const lessons = await Lesson.find(lessonFilter)
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
    const isAdmin = ["admin", "instructor"].includes(req.user.role);

    const courseFilter = {
      slug: courseSlug,
      status: true,
    };

    if (!isAdmin) {
      courseFilter.isPublished = true;
    } else if (req.query.isPublished !== undefined) {
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

    if (!isAdmin) {
      sectionFilter.isActive = true;
    } else if (req.query.sectionActive !== undefined) {
      sectionFilter.isActive = req.query.sectionActive === "true";
    }

    const section = await Section.findOne(sectionFilter);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const lessonFilter = {
      _id: lessonId,
      section: section._id,
    };

    if (!isAdmin) {
      lessonFilter.isActive = true;
    } else if (req.query.lessonActive !== undefined) {
      lessonFilter.isActive = req.query.lessonActive === "true";
    }

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
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getQuiz = async (req, res) => {
  const { lessonId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson id" });
    }

    let quizFilter = {
      lesson: lessonId,
      isActive: true,
    };

    if (req.user.role !== "admin" && req.user.role !== "instructor") {
      quizFilter.isActive = true;
    } else if (req.query["quiz.isActive"] !== undefined) {
      quizFilter.isActive = req.query["quiz.isActive"] === "true";
    }

    const quiz = await Quiz.findOne(quizFilter);
    if (!quiz)
      return res.status(404).json({ message: "No Quiz Found For This Lesson" });

    res.status(200).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
