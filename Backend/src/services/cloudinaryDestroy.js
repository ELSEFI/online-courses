const cloudinary = require("../config/cloudinaryConfig");

exports.deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    if (!publicId) return resolve();

    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
