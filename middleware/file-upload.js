const multer = require('multer'); 
const {v1: uuidv1} = require('uuid');

const MIME_TYPE_MAP = {
  'image:png': 'png',
  'image:jpg': 'jpg',
  'image:jpeg': 'jpeg' 
};

const fileUpload = multer({
  //limit in bytes
  limits: 500000, 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images')
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype]; // Multer will automatically extract the 
      cb(null, uuidv1() + '.' + ext);
    }
  }), 
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null: new Error('Invalid MIME Type!');
    cb(error, isValid);
  }
});

module.exports = fileUpload;