const cloudinary = require("../config/cloudinaryConfig");

exports.uploadImageToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    // If file is a string (URL), use uploader.upload
    if (typeof file === 'string') {
      cloudinary.uploader.upload(file, { folder }, (error, result) => {
        if (error) return reject(error);
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      });
    } else {
      // If file is a buffer, use upload_stream
      cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error) return reject(error);

          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
        })
        .end(file);
    }
  });
};
