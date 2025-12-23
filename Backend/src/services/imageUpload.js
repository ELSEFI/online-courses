const cloudinary = require("../config/cloudinaryConfig");

exports.uploadImageToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);

        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      })
      .end(buffer);
  });
};
