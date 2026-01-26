const express = require("express");
const cors = require("cors");
const path = require("path");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");

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
const authRoutes = require("./src/Routes/authRoutes");
const publicRoutes = require("./src/Routes/publicRoutes");
const enrollmentRoutes = require("./src/Routes/enrollmentRoutes");
const statsRoutes = require("./src/Routes/statesRoute");

const app = express();

app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  require("./src/controllers/enrollmentController").payMobWebhook
);

/* ================= SECURITY ================= */

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow localhost on any port
      if (process.env.NODE_ENV !== "production") {
        if (
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:")
        ) {
          return callback(null, true);
        }
      }

      // In production, use CLIENT_URL
      const allowedOrigins = process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(",")
        : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:3000",
        ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

app.use("/api/v1/auth", authLimiter);

// Serve static files (videos, files) with CORS headers
app.use("/public", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type, Range");
  res.header("Access-Control-Expose-Headers", "Content-Length, Content-Range");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "public")));

// app.use(mongoSanitize());
// app.use(xss());

/* ================= STATIC ================= */

app.use(express.static("public"));

/* ================= ROUTES ================= */

// AUTH
app.use("/api/v1", publicRoutes);
app.use("/api/v1/auth", authRoutes);

// PUBLIC
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1", coursesRoutes);
app.use("/api/v1/:courseSlug/sections", sectionRoutes);
app.use("/api/v1/:courseSlug/sections/:sectionId/lessons", lessonRoutes);
app.use("/api/v1/:courseSlug/lessons/:lessonId/quiz", quizRoutes);
app.use("/api/v1/messages", contactRoutes);
app.use("/api/v1/:courseSlug/reviews", reviewsRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/courses/:courseId/enroll", enrollmentRoutes);

// ADMIN
app.use("/api/v1/admin/instructors", instructorsRoutes);
app.use("/api/v1/admin/users", usersRoutes);
app.use("/api/v1/admin/stats", statsRoutes);

// ROOT
app.get("/", (req, res) => {
  res.send("Welcome To Online Courses");
});

module.exports = app;
