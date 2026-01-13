require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const Category = require("./src/models/Category");
const InstructorProfile = require("./src/models/instructorProfile");
const InstructorRequest = require("./src/models/instructorRequest");
const Course = require("./src/models/Course");
const Section = require("./src/models/Section");
const Lesson = require("./src/models/Lesson");
const Quiz = require("./src/models/Quiz");
const QuizAttempt = require("./src/models/QuizAttempt");
const Enrollment = require("./src/models/Enrollment");
const Review = require("./src/models/Reviews");
const Payment = require("./src/models/payment");
const Wishlist = require("./src/models/Wishlist");
const Contact = require("./src/models/contactWithUs");
const connectDB = require("./src/config/db");

// Dataset كبير وشامل
const seedData = {
  users: [
    {
      name: "Ahmed Hassan",
      email: "ahmed.hassan@example.com",
      password: "Password123!",
      role: "admin",
      emailVerified: true,
      status: true,
    },
    {
      name: "Sara Mohamed",
      email: "sara.mohamed@example.com",
      password: "Password123!",
      role: "instructor",
      emailVerified: true,
      status: true,
    },
    {
      name: "Mohamed Ali",
      email: "mohamed.ali@example.com",
      password: "Password123!",
      role: "instructor",
      emailVerified: true,
      status: true,
    },
    {
      name: "Fatma Ibrahim",
      email: "fatma.ibrahim@example.com",
      password: "Password123!",
      role: "instructor",
      emailVerified: true,
      status: true,
    },
    {
      name: "Omar Khaled",
      email: "omar.khaled@example.com",
      password: "Password123!",
      role: "user",
      emailVerified: true,
      status: true,
    },
    {
      name: "Mona Sayed",
      email: "mona.sayed@example.com",
      password: "Password123!",
      role: "user",
      emailVerified: true,
      status: true,
    },
    {
      name: "Khaled Mahmoud",
      email: "khaled.mahmoud@example.com",
      password: "Password123!",
      role: "user",
      emailVerified: true,
      status: true,
    },
    {
      name: "Noha Ahmed",
      email: "noha.ahmed@example.com",
      password: "Password123!",
      role: "user",
      emailVerified: true,
      status: true,
    },
    {
      name: "Youssef Adel",
      email: "youssef.adel@example.com",
      password: "Password123!",
      role: "user",
      emailVerified: true,
      status: true,
    },
    {
      name: "Heba Gamal",
      email: "heba.gamal@example.com",
      password: "Password123!",
      role: "user",
      emailVerified: true,
      status: true,
    },
    {
      name: "Amr Essam",
      email: "amr.essam@example.com",
      password: "Password123!",
      role: "user",
      emailVerified: false,
      status: true,
    },
    {
      name: "Dina Hassan",
      email: "dina.hassan@example.com",
      password: "Password123!",
      role: "user",
      emailVerified: true,
      status: true,
    },
  ],

  categories: [
    {
      name: {
        en: "Programming",
        ar: "البرمجة",
      },
      description: {
        en: "Learn programming languages and software development",
        ar: "تعلم لغات البرمجة وتطوير البرمجيات",
      },
      image: "categories/programming_img",
      order: 1,
      isActive: true,
    },
    {
      name: {
        en: "Web Development",
        ar: "تطوير الويب",
      },
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
      name: {
        en: "Mobile Development",
        ar: "تطوير تطبيقات الموبايل",
      },
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
      name: {
        en: "Data Science",
        ar: "علم البيانات",
      },
      description: {
        en: "Master data analysis and machine learning",
        ar: "إتقان تحليل البيانات والتعلم الآلي",
      },
      image: "categories/data_science_img",
      order: 4,
      isActive: true,
    },
    {
      name: {
        en: "Design",
        ar: "التصميم",
      },
      description: {
        en: "Learn graphic design and user experience",
        ar: "تعلم التصميم الجرافيكي وتجربة المستخدم",
      },
      image: "categories/design_img",
      order: 5,
      isActive: true,
    },
    {
      name: {
        en: "UI/UX Design",
        ar: "تصميم واجهات المستخدم",
      },
      description: {
        en: "Design beautiful and user-friendly interfaces",
        ar: "تصميم واجهات جميلة وسهلة الاستخدام",
      },
      image: "categories/uiux_img",
      order: 6,
      isActive: true,
      parentName: "Design",
    },
    {
      name: {
        en: "Business",
        ar: "الأعمال",
      },
      description: {
        en: "Develop business and entrepreneurship skills",
        ar: "تطوير مهارات الأعمال وريادة الأعمال",
      },
      image: "categories/business_img",
      order: 7,
      isActive: true,
    },
    {
      name: {
        en: "Marketing",
        ar: "التسويق",
      },
      description: {
        en: "Master digital marketing strategies",
        ar: "إتقان استراتيجيات التسويق الرقمي",
      },
      image: "categories/marketing_img",
      order: 8,
      isActive: true,
    },
  ],

  instructorProfiles: [
    {
      userEmail: "sara.mohamed@example.com",
      bio: {
        en: "Full-stack developer with 10 years of experience in web development and teaching",
        ar: "مطورة full-stack مع 10 سنوات خبرة في تطوير الويب والتدريس",
      },
      experienceYears: 10,
      jobTitle: {
        en: "Senior Full-Stack Developer",
        ar: "مطورة full-stack أول",
      },
      cvFile: "cvs/sara_mohamed_cv.pdf",
      socials: {
        linkedin: "https://linkedin.com/in/sara-mohamed",
        twitter: "https://twitter.com/sara_mohamed",
        website: "https://saramohamed.dev",
      },
    },
    {
      userEmail: "mohamed.ali@example.com",
      bio: {
        en: "Mobile app developer specializing in React Native and Flutter with 8 years experience",
        ar: "مطور تطبيقات موبايل متخصص في React Native و Flutter مع 8 سنوات خبرة",
      },
      experienceYears: 8,
      jobTitle: {
        en: "Lead Mobile Developer",
        ar: "مطور موبايل رئيسي",
      },
      cvFile: "cvs/mohamed_ali_cv.pdf",
      socials: {
        linkedin: "https://linkedin.com/in/mohamed-ali",
        youtube: "https://youtube.com/mohamedali",
      },
    },
    {
      userEmail: "fatma.ibrahim@example.com",
      bio: {
        en: "UI/UX Designer with passion for creating beautiful and functional designs",
        ar: "مصممة UI/UX شغوفة بإنشاء تصاميم جميلة وعملية",
      },
      experienceYears: 6,
      jobTitle: {
        en: "Senior UI/UX Designer",
        ar: "مصممة UI/UX أول",
      },
      cvFile: "cvs/fatma_ibrahim_cv.pdf",
      socials: {
        facebook: "https://facebook.com/fatma.ibrahim",
        linkedin: "https://linkedin.com/in/fatma-ibrahim",
      },
    },
  ],

  instructorRequests: [
    {
      userEmail: "omar.khaled@example.com",
      bio: {
        en: "Aspiring instructor with background in data science and machine learning",
        ar: "مدرس طموح مع خلفية في علم البيانات والتعلم الآلي",
      },
      experienceYears: 4,
      jobTitle: {
        en: "Data Scientist",
        ar: "عالم بيانات",
      },
      cvFile: "cvs/omar_khaled_cv.pdf",
      status: "pending",
    },
  ],

  courses: [
    {
      title: {
        en: "Complete Web Development Bootcamp",
        ar: "دورة تطوير الويب الشاملة",
      },
      shortDescription: {
        en: "Learn full-stack web development from scratch",
        ar: "تعلم تطوير الويب الكامل من الصفر",
      },
      description: {
        en: "Master web development with HTML, CSS, JavaScript, Node.js, Express, MongoDB and React. Build real-world projects and deploy them to production.",
        ar: "أتقن تطوير الويب باستخدام HTML و CSS و JavaScript و Node.js و Express و MongoDB و React. قم ببناء مشاريع حقيقية ونشرها على الإنترنت.",
      },
      requirements: {
        en: [
          "Basic computer skills",
          "Internet connection",
          "Willingness to learn",
        ],
        ar: ["مهارات كمبيوتر أساسية", "اتصال بالإنترنت", "الرغبة في التعلم"],
      },
      price: 499,
      discountPrice: 299,
      instructorEmail: "sara.mohamed@example.com",
      categoryName: "Web Development",
      level: {
        en: "Beginner",
        ar: "مبتدئ",
      },
      thumbnail: "thumbnails/web_dev_bootcamp.jpg",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: {
        en: "React Native Mobile Development",
        ar: "تطوير تطبيقات الموبايل بـ React Native",
      },
      shortDescription: {
        en: "Build cross-platform mobile apps with React Native",
        ar: "بناء تطبيقات موبايل متعددة المنصات باستخدام React Native",
      },
      description: {
        en: "Learn to build professional mobile applications for both iOS and Android using React Native. Cover navigation, state management, API integration, and publishing to app stores.",
        ar: "تعلم بناء تطبيقات موبايل احترافية لكل من iOS و Android باستخدام React Native. تغطية التنقل وإدارة الحالة ودمج API والنشر في متاجر التطبيقات.",
      },
      requirements: {
        en: ["JavaScript basics", "React fundamentals", "Node.js installed"],
        ar: ["أساسيات JavaScript", "أساسيات React", "تثبيت Node.js"],
      },
      price: 599,
      discountPrice: 399,
      instructorEmail: "mohamed.ali@example.com",
      categoryName: "Mobile Development",
      level: {
        en: "Intermediate",
        ar: "متوسط",
      },
      thumbnail: "thumbnails/react_native_course.jpg",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: {
        en: "UI/UX Design Masterclass",
        ar: "دورة احترافية في تصميم UI/UX",
      },
      shortDescription: {
        en: "Master user interface and user experience design",
        ar: "إتقان تصميم واجهات المستخدم وتجربة المستخدم",
      },
      description: {
        en: "Learn the complete process of UI/UX design from research to prototyping. Master Figma, design systems, user research, wireframing, and creating stunning interfaces.",
        ar: "تعلم العملية الكاملة لتصميم UI/UX من البحث إلى النماذج الأولية. إتقان Figma وأنظمة التصميم وبحث المستخدم والرسومات التخطيطية وإنشاء واجهات مذهلة.",
      },
      requirements: {
        en: ["Basic design knowledge", "Figma installed"],
        ar: ["معرفة أساسية بالتصميم", "تثبيت Figma"],
      },
      price: 399,
      discountPrice: 249,
      instructorEmail: "fatma.ibrahim@example.com",
      categoryName: "UI/UX Design",
      level: {
        en: "Beginner",
        ar: "مبتدئ",
      },
      thumbnail: "thumbnails/uiux_masterclass.jpg",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: {
        en: "Advanced JavaScript Course",
        ar: "دورة JavaScript المتقدمة",
      },
      shortDescription: {
        en: "Deep dive into advanced JavaScript concepts",
        ar: "غوص عميق في مفاهيم JavaScript المتقدمة",
      },
      description: {
        en: "Master advanced JavaScript topics including closures, prototypes, async programming, design patterns, and performance optimization. Build complex applications with confidence.",
        ar: "إتقان مواضيع JavaScript المتقدمة بما في ذلك الإغلاقات والنماذج الأولية والبرمجة غير المتزامنة وأنماط التصميم وتحسين الأداء. بناء تطبيقات معقدة بثقة.",
      },
      requirements: {
        en: ["Good understanding of JavaScript basics", "Experience with ES6+"],
        ar: ["فهم جيد لأساسيات JavaScript", "خبرة مع ES6+"],
      },
      price: 349,
      instructorEmail: "sara.mohamed@example.com",
      categoryName: "Web Development",
      level: {
        en: "Advanced",
        ar: "متقدم",
      },
      thumbnail: "thumbnails/advanced_js.jpg",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: {
        en: "Data Science with Python",
        ar: "علم البيانات باستخدام Python",
      },
      shortDescription: {
        en: "Learn data analysis and machine learning with Python",
        ar: "تعلم تحليل البيانات والتعلم الآلي باستخدام Python",
      },
      description: {
        en: "Comprehensive course covering Python for data science, pandas, NumPy, matplotlib, scikit-learn, and machine learning algorithms. Work on real datasets and projects.",
        ar: "دورة شاملة تغطي Python لعلم البيانات و pandas و NumPy و matplotlib و scikit-learn وخوارزميات التعلم الآلي. العمل على مجموعات بيانات ومشاريع حقيقية.",
      },
      requirements: {
        en: ["Python basics", "Statistics fundamentals"],
        ar: ["أساسيات Python", "أساسيات الإحصاء"],
      },
      price: 549,
      discountPrice: 349,
      instructorEmail: "sara.mohamed@example.com",
      categoryName: "Data Science",
      level: {
        en: "Intermediate",
        ar: "متوسط",
      },
      thumbnail: "thumbnails/data_science_python.jpg",
      isPublished: true,
      publishedAt: new Date(),
    },
  ],

  sections: {
    "Complete Web Development Bootcamp": [
      {
        title: { en: "HTML & CSS Fundamentals", ar: "أساسيات HTML و CSS" },
        description: {
          en: "Learn the building blocks of web development",
          ar: "تعلم أساسيات تطوير الويب",
        },
        order: 1,
      },
      {
        title: { en: "JavaScript Basics", ar: "أساسيات JavaScript" },
        description: {
          en: "Master JavaScript fundamentals and DOM manipulation",
          ar: "إتقان أساسيات JavaScript والتلاعب بـ DOM",
        },
        order: 2,
      },
      {
        title: { en: "Backend with Node.js", ar: "الخادم باستخدام Node.js" },
        description: {
          en: "Build server-side applications with Node.js and Express",
          ar: "بناء تطبيقات من جانب الخادم باستخدام Node.js و Express",
        },
        order: 3,
      },
    ],
    "React Native Mobile Development": [
      {
        title: { en: "React Native Basics", ar: "أساسيات React Native" },
        description: {
          en: "Get started with React Native development",
          ar: "البدء في تطوير React Native",
        },
        order: 1,
      },
      {
        title: { en: "Navigation & Routing", ar: "التنقل والتوجيه" },
        description: {
          en: "Implement navigation in mobile apps",
          ar: "تنفيذ التنقل في تطبيقات الموبايل",
        },
        order: 2,
      },
    ],
    "UI/UX Design Masterclass": [
      {
        title: { en: "Design Principles", ar: "مبادئ التصميم" },
        description: {
          en: "Learn fundamental design principles",
          ar: "تعلم مبادئ التصميم الأساسية",
        },
        order: 1,
      },
      {
        title: { en: "Figma Masterclass", ar: "إتقان Figma" },
        description: {
          en: "Master Figma for UI/UX design",
          ar: "إتقان Figma لتصميم UI/UX",
        },
        order: 2,
      },
    ],
  },

  lessons: {
    "HTML & CSS Fundamentals": [
      {
        title: { en: "Introduction to HTML", ar: "مقدمة إلى HTML" },
        order: 1,
        isFree: true,
        video: {
          provider: "cloudinary",
          fileName: "intro_html.mp4",
          size: 45000000,
          duration: 1200,
        },
        files: [
          {
            name: "HTML Cheat Sheet",
            type: "pdf",
            fileName: "html_cheatsheet.pdf",
            size: 500000,
          },
        ],
      },
      {
        title: { en: "CSS Styling Basics", ar: "أساسيات تنسيق CSS" },
        order: 2,
        isFree: false,
        hasQuiz: true,
        video: {
          provider: "cloudinary",
          fileName: "css_basics.mp4",
          size: 52000000,
          duration: 1500,
        },
      },
      {
        title: { en: "Responsive Design", ar: "التصميم المتجاوب" },
        order: 3,
        isFree: false,
        video: {
          provider: "cloudinary",
          fileName: "responsive_design.mp4",
          size: 48000000,
          duration: 1350,
        },
      },
    ],
    "JavaScript Basics": [
      {
        title: {
          en: "Variables and Data Types",
          ar: "المتغيرات وأنواع البيانات",
        },
        order: 1,
        isFree: true,
        hasQuiz: true,
        video: {
          provider: "cloudinary",
          fileName: "js_variables.mp4",
          size: 35000000,
          duration: 900,
        },
      },
      {
        title: { en: "Functions in JavaScript", ar: "الدوال في JavaScript" },
        order: 2,
        isFree: false,
        hasQuiz: true,
        video: {
          provider: "cloudinary",
          fileName: "js_functions.mp4",
          size: 42000000,
          duration: 1100,
        },
      },
    ],
  },

  quizzes: {
    "CSS Styling Basics": {
      title: { en: "CSS Basics Quiz", ar: "اختبار أساسيات CSS" },
      questions: [
        {
          questionText: "What does CSS stand for?",
          options: [
            "Computer Style Sheets",
            "Cascading Style Sheets",
            "Creative Style Sheets",
            "Colorful Style Sheets",
          ],
          correctAnswerIndex: 1,
          score: 10,
        },
        {
          questionText:
            "Which property is used to change the background color?",
          options: ["color", "bgcolor", "background-color", "bg-color"],
          correctAnswerIndex: 2,
          score: 10,
        },
        {
          questionText: "How do you select an element with id 'header'?",
          options: [".header", "#header", "*header", "header"],
          correctAnswerIndex: 1,
          score: 10,
        },
      ],
      totalAttempts: 3,
    },
    "Variables and Data Types": {
      title: {
        en: "JavaScript Variables Quiz",
        ar: "اختبار متغيرات JavaScript",
      },
      questions: [
        {
          questionText:
            "Which keyword is used to declare a constant in JavaScript?",
          options: ["var", "let", "const", "constant"],
          correctAnswerIndex: 2,
          score: 15,
        },
        {
          questionText: "What is the result of typeof null?",
          options: ["null", "undefined", "object", "number"],
          correctAnswerIndex: 2,
          score: 15,
        },
      ],
      totalAttempts: 3,
    },
    "Functions in JavaScript": {
      title: { en: "JavaScript Functions Quiz", ar: "اختبار دوال JavaScript" },
      questions: [
        {
          questionText: "What is a closure in JavaScript?",
          options: [
            "A function that returns another function",
            "A function with access to outer scope",
            "A closed function",
            "A function without parameters",
          ],
          correctAnswerIndex: 1,
          score: 20,
        },
      ],
      totalAttempts: 2,
    },
  },

  contacts: [
    {
      name: "Ali Ahmed",
      email: "ali.ahmed@example.com",
      message: "I'm interested in becoming an instructor. How can I apply?",
    },
    {
      name: "Layla Hassan",
      email: "layla.hassan@example.com",
      message: "Great platform! I have a question about course certificates.",
    },
    {
      name: "Karim Youssef",
      email: "karim.youssef@example.com",
      message: "Can I get a refund if I'm not satisfied with a course?",
    },
  ],
};

// الدالة الرئيسية لإدخال البيانات
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // مسح البيانات القديمة
    await clearDatabase();

    // إدخال المستخدمين
    console.log("👥 Creating users...");
    const users = await createUsers();

    // إدخال الفئات
    console.log("📚 Creating categories...");
    const categories = await createCategories();

    // إدخال ملفات المدرسين
    console.log("👨‍🏫 Creating instructor profiles...");
    const instructors = await createInstructorProfiles(users);

    // إدخال طلبات المدرسين
    console.log("📝 Creating instructor requests...");
    await createInstructorRequests(users);

    // إدخال الكورسات
    console.log("🎓 Creating courses...");
    const courses = await createCourses(users, instructors, categories);

    // إدخال الأقسام والدروس
    console.log("📖 Creating sections and lessons...");
    const { sections, lessons } = await createSectionsAndLessons(courses);

    // إدخال الكويزات
    console.log("❓ Creating quizzes...");
    const quizzes = await createQuizzes(lessons);

    // إدخال التسجيلات والمراجعات
    console.log("✍️ Creating enrollments and reviews...");
    await createEnrollmentsAndReviews(users, courses, lessons, quizzes);

    // إدخال قائمة الرغبات والمدفوعات
    console.log("💰 Creating wishlists and payments...");
    await createWishlistsAndPayments(users, courses);

    // إدخال جهات الاتصال
    console.log("📧 Creating contacts...");
    await createContacts();

    console.log("✅ Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Instructors: ${instructors.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Sections: ${sections.length}`);
    console.log(`   - Lessons: ${lessons.length}`);
    console.log(`   - Quizzes: ${quizzes.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// مسح قاعدة البيانات
async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    InstructorProfile.deleteMany({}),
    InstructorRequest.deleteMany({}),
    Course.deleteMany({}),
    Section.deleteMany({}),
    Lesson.deleteMany({}),
    Quiz.deleteMany({}),
    QuizAttempt.deleteMany({}),
    Enrollment.deleteMany({}),
    Review.deleteMany({}),
    Payment.deleteMany({}),
    Wishlist.deleteMany({}),
    Contact.deleteMany({}),
  ]);
}

// إنشاء المستخدمين
async function createUsers() {
  const createdUsers = [];
  for (const userData of seedData.users) {
    const user = await User.create(userData);
    createdUsers.push(user);
  }
  return createdUsers;
}

// إنشاء الفئات
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

// إنشاء ملفات المدرسين
async function createInstructorProfiles(users) {
  const instructors = [];
  for (const profileData of seedData.instructorProfiles) {
    const user = users.find((u) => u.email === profileData.userEmail);
    if (user) {
      const instructor = await InstructorProfile.create({
        userId: user._id,
        bio: profileData.bio,
        experienceYears: profileData.experienceYears,
        jobTitle: profileData.jobTitle,
        cvFile: profileData.cvFile,
        socials: profileData.socials,
      });
      instructors.push(instructor);
    }
  }
  return instructors;
}

// إنشاء طلبات المدرسين
async function createInstructorRequests(users) {
  for (const requestData of seedData.instructorRequests) {
    const user = users.find((u) => u.email === requestData.userEmail);
    if (user) {
      await InstructorRequest.create({
        userId: user._id,
        bio: requestData.bio,
        experienceYears: requestData.experienceYears,
        jobTitle: requestData.jobTitle,
        cvFile: requestData.cvFile,
        status: requestData.status,
      });
    }
  }
}

// إنشاء الكورسات
async function createCourses(users, instructors, categories) {
  const courses = [];
  for (const courseData of seedData.courses) {
    const instructor = instructors.find(
      (i) =>
        users.find((u) => u._id.equals(i.userId))?.email ===
        courseData.instructorEmail
    );
    const category = categories.find(
      (c) => c.name.en === courseData.categoryName
    );
    const createdBy = users.find((u) => u.role === "admin");

    if (instructor && category && createdBy) {
      const course = await Course.create({
        title: courseData.title,
        shortDescription: courseData.shortDescription,
        description: courseData.description,
        requirements: courseData.requirements,
        price: courseData.price,
        discountPrice: courseData.discountPrice,
        instructor: instructor._id,
        createdBy: createdBy._id,
        category: category._id,
        level: courseData.level,
        thumbnail: courseData.thumbnail,
        isPublished: courseData.isPublished,
        publishedAt: courseData.publishedAt,
      });
      courses.push(course);
    }
  }
  return courses;
}

// إنشاء الأقسام والدروس
async function createSectionsAndLessons(courses) {
  const allSections = [];
  const allLessons = [];
  const lessonMap = {};

  for (const course of courses) {
    const courseSections = seedData.sections[course.title.en];
    if (courseSections) {
      for (const sectionData of courseSections) {
        const section = await Section.create({
          course: course._id,
          title: sectionData.title,
          description: sectionData.description,
          order: sectionData.order,
        });
        allSections.push(section);

        // إنشاء الدروس للقسم
        const sectionLessons = seedData.lessons[sectionData.title.en];
        if (sectionLessons) {
          for (const lessonData of sectionLessons) {
            const lesson = await Lesson.create({
              section: section._id,
              title: lessonData.title,
              order: lessonData.order,
              isFree: lessonData.isFree,
              hasQuiz: lessonData.hasQuiz,
              video: lessonData.video,
              files: lessonData.files || [],
            });
            allLessons.push(lesson);
            lessonMap[lessonData.title.en] = lesson;
          }
        }
      }
    }
  }

  return { sections: allSections, lessons: allLessons };
}

// إنشاء الكويزات
async function createQuizzes(lessons) {
  const quizzes = [];
  for (const lesson of lessons) {
    const quizData = seedData.quizzes[lesson.title.en];
    if (quizData) {
      const quiz = await Quiz.create({
        lesson: lesson._id,
        title: quizData.title,
        questions: quizData.questions,
        totalAttempts: quizData.totalAttempts,
      });
      quizzes.push(quiz);
    }
  }
  return quizzes;
}

// إنشاء التسجيلات والمراجعات
async function createEnrollmentsAndReviews(users, courses, lessons, quizzes) {
  const studentUsers = users.filter((u) => u.role === "user").slice(0, 8);

  for (let i = 0; i < studentUsers.length; i++) {
    const user = studentUsers[i];
    const enrolledCourses = courses.slice(0, Math.min(i + 2, courses.length));

    for (const course of enrolledCourses) {
      // إنشاء التسجيل
      const enrollment = await Enrollment.create({
        user: user._id,
        course: course._id,
        enrolledAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
        progress: Math.floor(Math.random() * 100),
      });

      // إضافة دروس مكتملة
      const courseLessons = lessons.filter((l) =>
        l.section.toString().includes(course._id.toString().slice(0, 8))
      );
      const completedCount = Math.floor(
        courseLessons.length * (enrollment.progress / 100)
      );
      enrollment.completedLessons = courseLessons
        .slice(0, completedCount)
        .map((l) => l._id);
      await enrollment.save();

      // إنشاء محاولات للكويزات
      const courseQuizzes = quizzes.filter((q) =>
        courseLessons.some((l) => l._id.equals(q.lesson))
      );

      for (const quiz of courseQuizzes.slice(0, 2)) {
        const answers = quiz.questions.map((q, idx) => ({
          questionId: new mongoose.Types.ObjectId(),
          selectedOptionIndex: Math.random() > 0.5 ? q.correctAnswerIndex : 0,
          isCorrect: Math.random() > 0.5,
          score: Math.random() > 0.5 ? q.score : 0,
        }));

        const obtainedScore = answers.reduce((sum, a) => sum + a.score, 0);

        await QuizAttempt.create({
          user: user._id,
          quiz: quiz._id,
          lesson: quiz.lesson,
          answers,
          totalScore: quiz.totalScore,
          obtainedScore,
          submittedAt: new Date(),
        });
      }

      // إنشاء مراجعة
      if (Math.random() > 0.3) {
        const reviews = [
          "Great course! Learned a lot.",
          "Excellent instructor and well-structured content.",
          "Very practical and easy to follow.",
          "Good course but could use more examples.",
          "Outstanding! Highly recommended.",
        ];

        await Review.create({
          user: user._id,
          course: course._id,
          review: reviews[Math.floor(Math.random() * reviews.length)],
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        });
      }
    }
  }

  // تحديث إحصائيات الكورسات
  for (const course of courses) {
    await course.save();
  }
}

// إنشاء قوائم الرغبات والمدفوعات
async function createWishlistsAndPayments(users, courses) {
  const studentUsers = users.filter((u) => u.role === "user");

  for (const user of studentUsers) {
    // إضافة كورسات لقائمة الرغبات
    const wishlistCourses = courses
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);

    for (const course of wishlistCourses) {
      try {
        await Wishlist.create({
          user: user._id,
          course: course._id,
          addedAt: new Date(
            Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000
          ),
        });
      } catch (err) {
        // Skip if already exists
      }
    }

    // إنشاء مدفوعات
    const enrollments = await Enrollment.find({ user: user._id });
    for (const enrollment of enrollments) {
      const course = courses.find((c) => c._id.equals(enrollment.course));
      if (course) {
        await Payment.create({
          user: user._id,
          course: course._id,
          amount: course.discountPrice || course.price,
          merchantOrderId: `ORD-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          status: "paid",
          paidAt: enrollment.enrolledAt,
        });
      }
    }
  }
}

// إنشاء جهات الاتصال
async function createContacts() {
  for (const contactData of seedData.contacts) {
    await Contact.create(contactData);
  }
}

// استيراد دالة الاتصال بقاعدة البيانات (أضف هذا في أول الملف)

// تشغيل السكريبت
async function runSeed() {
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();

    console.log("📡 Connected to MongoDB");

    await seedDatabase();

    console.log("🎉 All done! Database is ready for testing.");
  } catch (error) {
    console.error("💥 Fatal error:", error);
    console.error(error.stack);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("👋 Database connection closed");
    }
    process.exit(0);
  }
}

// Export للاستخدام
module.exports = { seedDatabase, runSeed };

// تشغيل مباشر إذا تم استدعاء الملف
if (require.main === module) {
  runSeed();
}
