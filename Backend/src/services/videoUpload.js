const cloudinary = require("../config/cloudinaryConfig");

exports.uploadVideoToCloudinary = (file, folder = "videos") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "video",
          chunk_size: 6000000,
        },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            public_id: result.public_id,
            duration: result.duration,
            bytes: result.bytes,
            url: result.secure_url,
          });
        }
      )
      .end(file.buffer);
  });
};
