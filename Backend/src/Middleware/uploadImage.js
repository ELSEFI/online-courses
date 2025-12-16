const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage();
const uploadImage = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
});

const resizeProfileImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const buffer = await sharp(req.file.buffer)
      .resize(300, 300)
      .jpeg({ quality: 80 })
      .toBuffer();

    req.file.buffer = buffer;
    next();
  } catch (err) {
    next(err);
  }
};

const resizeCategoryImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const buffer = await sharp(req.file.buffer)
      .resize(500, 500)
      .jpeg({ quality: 80 })
      .toBuffer();

    req.file.buffer = buffer;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadImage, resizeProfileImage, resizeCategoryImage };
