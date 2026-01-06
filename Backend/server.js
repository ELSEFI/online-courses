const dotenv = require("dotenv");
const express = require("express");
const path = require("path");

const cors = require("cors");
dotenv.config();
const connectDB = require("./src/config/db");
// ==ROUTES == //
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
// ==ROUTES == //

const app = express();

app.use(express.json()); // JSON body
app.use(express.urlencoded({ extended: true }));

app.use(cors());
const PORT = process.env.PORT || 5000;

// CONNECT TO DATABASE
connectDB();
// CONNECT TO DATABASE

app.use(
  "/cvs",
  (req, res, next) => {
    // Only for PDF files
    if (req.path.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    }
    next();
  },
  express.static(path.join(__dirname, "public/cvs"))
);
app.use(express.static("public"));

// ROUTES

// USERS //
app.use("/api/v1/", logsRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/user", coursesRoutes);
app.use("/api/v1/:courseSlug/sections", sectionRoutes);
app.use("/api/v1/:courseSlug/sections/:sectionId/lessons", lessonRoutes);
app.use("/api/v1/lessons/:lessonId/quiz", quizRoutes);
app.use("/api/v1/messages", contactRoutes);
app.use("/api/v1/:courseSlug/reviews", reviewsRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/auth", authRoutes);
// USERS //

// ADMIN //
app.use("/api/v1/admin/instructors", instructorsRoutes);
app.use("/api/v1/admin/users", usersRoutes);
// ADMIN //

// ROUTES
app.get("/", (req, res) => {
  res.send("Welcome To Online Courses");
});

app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});
