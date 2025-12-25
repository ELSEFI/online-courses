const sharp = require("sharp");

exports.resizeProfileImage = async (req, res, next) => {
  if (!req.file) return next();

  req.file.buffer = await sharp(req.file.buffer)
    .resize(300, 300)
    .jpeg({ quality: 80 })
    .toBuffer();

  next();
};

exports.resizeCategoryImage = async (req, res, next) => {
  if (!req.file) return next();

  req.file.buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .jpeg({ quality: 80 })
    .toBuffer();

  next();
};

exports.resizeThumbnail = async (req, res, next) => {
  if (!req.file) return next();

  req.file.buffer = await sharp(req.file.buffer)
    .resize(750, 422, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  next();
};
