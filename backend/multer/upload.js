var multer = require('multer');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    var filetype = '';
    if(file.mimetype === 'image/gif') filetype = 'gif';
    else if(file.mimetype === 'image/png') filetype = 'png';
    else if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') filetype = 'jpg';
    else filetype = 'bin';

    cb(null, 'image-' + Date.now() + '.' + filetype);
  }
});

var upload = multer({storage: storage});

module.exports = upload;
