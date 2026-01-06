const express = require("express");
const cors = require("cors");
const path = require("path");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("express-xss-sanitizer");

// ROUTES
const categoriesRoutes = require("./src/Routes/categoriesRoutes");
const coursesRoutes = require("./src/Routes/coursesRoutes");
const sectionRoutes = require("./src/Routes/sectionRoutes");
const lessonRoutes = require("./src/Routes/lessonRoutes");
const quizRoutes = require("./src/Routes/quizRoutes");
const contactRoutes = require("./src/Routes/contactRoutes");
const instructorsRoutes = require("./src/Routes/instructorsRoutes");
const reviewsRoutes = require("./src/Routes/reviewsRoutes");
const wishlistRoutes = require("./src/Routes/wishlistRoutes");
const usersRoutes = require("./src/Routes/usersRoutes");
const logsRoutes = require("./src/Routes/logsRoutes");
const authRoutes = require("./src/Routes/authRoutes");
const enrollmentRoutes = require("./src/Routes/enrollmentRoutes");

const app = express();

/* ================= PAYMOB WEBHOOK (IMPORTANT) ================= */
/*
  ❗ لازم يكون قبل express.json
*/
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  require("./src/controllers/enrollmentController").payMobWebhook
);

/* ================= SECURITY ================= */

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

/* ================= BODY PARSERS ================= */

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* ================= RATE LIMIT ================= */

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

app.use("/api/v1/auth", authLimiter);

/* ================= SANITIZATION ================= */

app.use(mongoSanitize());
app.use(xss());

/* ================= STATIC ================= */

app.use(express.static("public"));

/* ================= ROUTES ================= */

// AUTH
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", logsRoutes);

// PUBLIC
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/user", coursesRoutes);
app.use("/api/v1/:courseSlug/sections", sectionRoutes);
app.use("/api/v1/:courseSlug/sections/:sectionId/lessons", lessonRoutes);
app.use("/api/v1/lessons/:lessonId/quiz", quizRoutes);
app.use("/api/v1/messages", contactRoutes);
app.use("/api/v1/:courseSlug/reviews", reviewsRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);

// PAYMENTS (create payment only)
app.use("/api/v1/courses/:courseId/payments", enrollmentRoutes);

// ADMIN
app.use("/api/v1/admin/instructors", instructorsRoutes);
app.use("/api/v1/admin/users", usersRoutes);

// ROOT
app.get("/", (req, res) => {
  res.send("Welcome To Online Courses");
});

module.exports = app;
