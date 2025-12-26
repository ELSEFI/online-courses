const cloudinary = require("../config/cloudinaryConfig");

exports.deleteFromCloudinary = (publicId, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    if (!publicId) return resolve();

    cloudinary.uploader.destroy(
      publicId,
      { resource_type: resourceType },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};
