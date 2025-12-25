const cloudinary = require("../config/cloudinaryConfig");

exports.uploadCvToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "raw",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
      )
      .end(file.buffer);
  });
};
