// Middlewares/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads/products directory
const uploadDir = 'uploads/products/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created upload directory:', uploadDir);
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Clean filename: remove spaces and special characters
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.originalname.replace(ext, '').replace(/\s+/g, '-').toLowerCase() + 
                     '-' + uniqueSuffix + ext;
    console.log('✓ File saved as:', filename);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Export single and array upload options
module.exports = {
  singleUpload: upload.single('image'),
  arrayUpload: upload.array('images', 10), // Max 10 images
  fieldsUpload: upload.fields([
    { name: 'images', maxCount: 10 }
  ])
};