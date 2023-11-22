
const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');


storage = new GridFsStorage({
  url:  process.env.MONGODB_URI,
  //url:   process.env.TEST_MONGODB_URI,
  file: (req, file) => {
      return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {

          //can change filename to something more appropriate

          filename: file.fieldname + "_" + Date.now() + "_" + filename,
          bucketName: 'uploads'
      };
      resolve(fileInfo);
      });
  }
});
const checkFileType = function (file, cb) {
  //Allowed file extensions
  if (file != null) {
    const fileTypes = /jpeg|jpg|png|gif|svg/;

    //check extension names
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

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

module.exports = upload;
