const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowedVideoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/mkv",
    ];
    const allowedFileTypes = [
      "application/pdf",
      "application/zip",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const isVideo = allowedVideoTypes.includes(file.mimetype);
    const isFile = allowedFileTypes.includes(file.mimetype);

    if (!isVideo && !isFile) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

module.exports = upload;
