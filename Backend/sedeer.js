require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const Category = require("./src/models/Category");
const InstructorProfile = require("./src/models/instructorProfile");
const Course = require("./src/models/Course");
const Section = require("./src/models/Section");
const Lesson = require("./src/models/Lesson");
const Enrollment = require("./src/models/Enrollment");
const Review = require("./src/models/Reviews");
const Wishlist = require("./src/models/Wishlist");
const connectDB = require("./src/config/db");

// دالة لتوليد بيانات عشوائية
function generateUsers(count) {
  const users = [];
  const roles = ["user", "instructor", "admin"];
  const names = ["Ahmed", "Sara", "Mohamed", "Fatma", "Omar", "Mona", "Khaled", "Noha", "Youssef", "Heba"];

  for (let i = 1; i <= count; i++) {
    users.push({
      name: `${names[i % names.length]} User${i}`,
      email: `user${i}@example.com`,
      password: "Password123!",
      role: i <= 5 ? "admin" : i <= 20 ? "instructor" : "user",
      emailVerified: true,
      status: true,
    });
  }
  return users;
}

function generateCourses(count, instructorEmails) {
  const courses = [];
  const categories = ["Web Development", "Mobile Development", "Data Science", "UI/UX Design", "Programming"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  for (let i = 1; i <= count; i++) {
    courses.push({
      title: {
        en: `Complete Course ${i} - ${categories[i % categories.length]}`,
        ar: `الدورة الكاملة ${i} - ${categories[i % categories.length]}`,
      },
      shortDescription: {
        en: `Learn ${categories[i % categories.length]} from scratch to advanced`,
        ar: `تعلم ${categories[i % categories.length]} من الصفر إلى المتقدم`,
      },
      description: {
        en: `Comprehensive course covering all aspects of ${categories[i % categories.length]}. Build real projects and master the skills needed.`,
        ar: `دورة شاملة تغطي جميع جوانب ${categories[i % categories.length]}. بناء مشاريع حقيقية وإتقان المهارات المطلوبة.`,
      },
      requirements: {
        en: ["Basic computer skills", "Internet connection", "Willingness to learn"],
        ar: ["مهارات كمبيوتر أساسية", "اتصال بالإنترنت", "الرغبة في التعلم"],
      },
      price: 299 + (i * 50),
      discountPrice: 199 + (i * 30),
      instructorEmail: instructorEmails[i % instructorEmails.length],
      categoryName: categories[i % categories.length],
      level: {
        en: levels[i % levels.length],
        ar: levels[i % levels.length],
      },
      thumbnail: `thumbnails/course_${i}.jpg`,
      isPublished: true,
      publishedAt: new Date(),
    });
  }
  return courses;
}

function generateSections(courseTitle, count) {
  const sections = [];
  const topics = [
    "Fundamentals", "Basics", "Advanced Concepts", "Practical Projects",
    "Best Practices", "Real World Examples", "Deep Dive", "Mastery",
    "Professional Techniques", "Industry Standards"
  ];

  for (let i = 1; i <= count; i++) {
    sections.push({
      title: {
        en: `Section ${i}: ${topics[i % topics.length]}`,
        ar: `القسم ${i}: ${topics[i % topics.length]}`,
      },
      description: {
        en: `Learn ${topics[i % topics.length]} in this comprehensive section`,
        ar: `تعلم ${topics[i % topics.length]} في هذا القسم الشامل`,
      },
      order: i,
    });
  }
  return sections;
}

function generateLessons(sectionTitle, count) {
  const lessons = [];
  const types = ["Introduction", "Tutorial", "Practice", "Quiz", "Project"];

  for (let i = 1; i <= count; i++) {
    lessons.push({
      title: {
        en: `Lesson ${i}: ${types[i % types.length]}`,
        ar: `الدرس ${i}: ${types[i % types.length]}`,
      },
      order: i,
      isFree: i === 1 || i === 2, // أول درسين مجانيين
      hasQuiz: i % 3 === 0, // كل 3 دروس فيه كويز
      video: {
        provider: "cloudinary",
        fileName: `lesson_${i}.mp4`,
        size: 40000000 + (i * 1000000),
        duration: 600 + (i * 60),
      },
      files: i % 2 === 0 ? [{
        name: `Lesson ${i} Resources`,
        type: "pdf",
        fileName: `lesson_${i}_resources.pdf`,
        size: 500000,
      }] : [],
    });
  }
  return lessons;
}

// البيانات الأساسية
const seedData = {
  users: generateUsers(100), // 100 مستخدم

  categories: [
    {
      name: { en: "Programming", ar: "البرمجة" },
      description: {
        en: "Learn programming languages and software development",
        ar: "تعلم لغات البرمجة وتطوير البرمجيات",
      },
      image: "categories/programming_img",
      order: 1,
      isActive: true,
    },
    {
      name: { en: "Web Development", ar: "تطوير الويب" },
      description: {
        en: "Build modern websites and web applications",
        ar: "بناء مواقع وتطبيقات ويب حديثة",
      },
      image: "categories/web_dev_img",
      order: 2,
      isActive: true,
      parentName: "Programming",
    },
    {
      name: { en: "Mobile Development", ar: "تطوير تطبيقات الموبايل" },
      description: {
        en: "Create mobile applications for iOS and Android",
        ar: "إنشاء تطبيقات الموبايل لنظامي iOS و Android",
      },
      image: "categories/mobile_dev_img",
      order: 3,
      isActive: true,
      parentName: "Programming",
    },
    {
      name: { en: "Data Science", ar: "علم البيانات" },
      description: {
        en: "Master data analysis and machine learning",
        ar: "إتقان تحليل البيانات والتعلم الآلي",
      },
      image: "categories/data_science_img",
      order: 4,
      isActive: true,
    },
    {
      name: { en: "UI/UX Design", ar: "تصميم واجهات المستخدم" },
      description: {
        en: "Design beautiful and user-friendly interfaces",
        ar: "تصميم واجهات جميلة وسهلة الاستخدام",
      },
      image: "categories/uiux_img",
      order: 5,
      isActive: true,
    },
  ],
};

// دالة إنشاء المستخدمين
async function createUsers() {
  const createdUsers = [];
  for (const userData of seedData.users) {
    const user = await User.create(userData);
    createdUsers.push(user);
  }
  return createdUsers;
}

// دالة إنشاء الفئات
async function createCategories() {
  const createdCategories = [];
  const categoryMap = {};

  // إنشاء الفئات الرئيسية أولاً
  for (const categoryData of seedData.categories.filter((c) => !c.parentName)) {
    const category = await Category.create({
      name: categoryData.name,
      description: categoryData.description,
      image: categoryData.image,
      order: categoryData.order,
      isActive: categoryData.isActive,
    });
    createdCategories.push(category);
    categoryMap[categoryData.name.en] = category;
  }

  // إنشاء الفئات الفرعية
  for (const categoryData of seedData.categories.filter((c) => c.parentName)) {
    const parent = categoryMap[categoryData.parentName];
    if (parent) {
      const category = await Category.create({
        name: categoryData.name,
        description: categoryData.description,
        image: categoryData.image,
        order: categoryData.order,
        isActive: categoryData.isActive,
        parent: parent._id,
      });
      createdCategories.push(category);
      categoryMap[categoryData.name.en] = category;
    }
  }

  return createdCategories;
}

// دالة إنشاء ملفات المدرسين
async function createInstructorProfiles(users) {
  const instructors = [];
  const instructorUsers = users.filter((u) => u.role === "instructor");

  for (let i = 0; i < instructorUsers.length; i++) {
    const user = instructorUsers[i];
    const instructor = await InstructorProfile.create({
      userId: user._id,
      bio: {
        en: `Experienced instructor with ${5 + i} years in the industry`,
        ar: `مدرس ذو خبرة ${5 + i} سنوات في المجال`,
      },
      experienceYears: 5 + i,
      jobTitle: {
        en: `Senior Developer ${i + 1}`,
        ar: `مطور أول ${i + 1}`,
      },
      cvFile: `cvs/instructor_${i + 1}_cv.pdf`,
      socials: {
        linkedin: `https://linkedin.com/in/instructor${i + 1}`,
        twitter: `https://twitter.com/instructor${i + 1}`,
      },
    });
    instructors.push(instructor);
  }

  return instructors;
}

// دالة إنشاء الكورسات والأقسام والدروس
async function createCoursesWithContent(users, instructors, categories) {
  const instructorUsers = users.filter((u) => u.role === "instructor");
  const instructorEmails = instructorUsers.map((u) => u.email);

  // توليد 20 كورس
  const coursesData = generateCourses(20, instructorEmails);
  const createdCourses = [];
  const allSections = [];
  const allLessons = [];

  for (const courseData of coursesData) {
    const instructor = instructors.find(
      (i) => i.userId.toString() === instructorUsers.find((u) => u.email === courseData.instructorEmail)._id.toString()
    );

    const category = categories.find((c) => c.name.en === courseData.categoryName);

    const course = await Course.create({
      ...courseData,
      instructor: instructor._id,
      category: category._id,
      createdBy: instructorUsers.find((u) => u.email === courseData.instructorEmail)._id,
    });

    createdCourses.push(course);

    // إنشاء 10 sections لكل كورس
    const sectionsData = generateSections(course.title.en, 10);

    for (const sectionData of sectionsData) {
      const section = await Section.create({
        ...sectionData,
        course: course._id,
      });

      allSections.push(section);

      // إنشاء 10 lessons لكل section
      const lessonsData = generateLessons(section.title.en, 10);

      for (const lessonData of lessonsData) {
        const lesson = await Lesson.create({
          ...lessonData,
          section: section._id,
        });

        allLessons.push(lesson);
      }
    }
  }

  return { courses: createdCourses, sections: allSections, lessons: allLessons };
}

// دالة إنشاء التسجيلات والمراجعات
async function createEnrollmentsAndReviews(users, courses, lessons) {
  const studentUsers = users.filter((u) => u.role === "user");

  // كل طالب يسجل في 3-5 كورسات عشوائية
  for (const student of studentUsers) {
    const numEnrollments = 3 + Math.floor(Math.random() * 3);
    const enrolledCourses = courses.sort(() => 0.5 - Math.random()).slice(0, numEnrollments);

    for (const course of enrolledCourses) {
      await Enrollment.create({
        user: student._id,
        course: course._id,
        enrolledAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // آخر 90 يوم
        progress: Math.floor(Math.random() * 50), // تقدم عشوائي من 0 إلى 50%
      });

      // إضافة مراجعة لبعض الكورسات
      if (Math.random() > 0.5) {
        await Review.create({
          user: student._id,
          course: course._id,
          rating: 3 + Math.floor(Math.random() * 3), // من 3 إلى 5
          comment: `Great course! Learned a lot from this. Highly recommended for anyone interested in ${course.title.en}.`,
        });
      }
    }
  }
}

// دالة إنشاء قوائم الرغبات
async function createWishlists(users, courses) {
  const studentUsers = users.filter((u) => u.role === "user");

  for (const student of studentUsers) {
    const wishlistCourses = courses.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 4));

    for (const course of wishlistCourses) {
      await Wishlist.create({
        user: student._id,
        course: course._id,
      });
    }
  }
}

// مسح قاعدة البيانات
async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    InstructorProfile.deleteMany({}),
    Course.deleteMany({}),
    Section.deleteMany({}),
    Lesson.deleteMany({}),
    Enrollment.deleteMany({}),
    Review.deleteMany({}),
    Wishlist.deleteMany({}),
  ]);
}

// الدالة الرئيسية
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    await connectDB();
    await clearDatabase();

    console.log("👥 Creating 100 users...");
    const users = await createUsers();

    console.log("📚 Creating categories...");
    const categories = await createCategories();

    console.log("👨‍🏫 Creating instructor profiles...");
    const instructors = await createInstructorProfiles(users);

    console.log("🎓 Creating 20 courses with 10 sections each (10 lessons per section = 2000 lessons total)...");
    const { courses, sections, lessons } = await createCoursesWithContent(users, instructors, categories);

    console.log("✍️ Creating enrollments and reviews...");
    await createEnrollmentsAndReviews(users, courses, lessons);

    console.log("💝 Creating wishlists...");
    await createWishlists(users, courses);

    console.log("✅ Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - Users: ${users.length} (${users.filter(u => u.role === 'admin').length} admins, ${users.filter(u => u.role === 'instructor').length} instructors, ${users.filter(u => u.role === 'user').length} students)`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Instructors: ${instructors.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Sections: ${sections.length}`);
    console.log(`   - Lessons: ${lessons.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// تشغيل السكريبت
seedDatabase();
