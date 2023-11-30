/**
 * This module contains all of the functions that are used to perform 
 * database operations for the storage and retrieval of images.
 * @module server/controller/middleware/file_upload
 * 
 * @requires {@link multer-gridfs-storage}
 * @requires {@link multer}
 * @requires {@link path}
 */
const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');

/**
 * This object contains all of the functions that are used to parse file types 
 * (the webapp only accepts image type) and upload files on the database.
 * 
 * @typedef {object} upload
 * @memberof module:server/controller/middleware/file_upload
 * @inner
 * 
 * @property {Function} storage - Connects to the database and formats the filename of the image.
 * @property {Function} limits - Sets the maximum size in bytes for the image upload.
 * @property {Function} fileFilter - Filters out non image type files and prevents them from being uploaded in the database.
*/
storage = new GridFsStorage({
  url:  process.env.MONGODB_URI,
  //url:   process.env.TEST_MONGODB_URI,
  file: (req, file) => {
      return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
          filename: file.fieldname + "_" + Date.now() + "_" + filename,
          bucketName: 'uploads'
      };
      resolve(fileInfo);
      });
  }
});
const checkFileType = function (file, cb) {
  /* List all allowed file extensions. */
  if (file != null) {
    const fileTypes = /jpeg|jpg|png|gif|svg/;

    /* Then, check extension names. */
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb("Error: You can Only Upload Images!!", false);
    }
  } else {
    cb("No file uploaded", false);
  }
};

/* Finally, create the multer instance. */
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

module.exports = upload;
