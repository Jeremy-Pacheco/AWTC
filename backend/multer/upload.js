var multer = require('multer');
var fs = require('fs');
var path = require('path');

// Ensure the upload directory exists
var uploadDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created upload directory:', uploadDir);
}

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before each upload (in case it was deleted)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Recreated upload directory:', uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    var filetype = '';
    if(file.mimetype === 'image/gif') filetype = 'gif';
    else if(file.mimetype === 'image/png') filetype = 'png';
    else if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') filetype = 'jpg';
    else if(file.mimetype === 'image/webp') filetype = 'webp';
    else filetype = 'bin';

    cb(null, 'image-' + Date.now() + '.' + filetype);
  }
});

// File filter to only accept images
var fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.'), false);
  }
};

var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
