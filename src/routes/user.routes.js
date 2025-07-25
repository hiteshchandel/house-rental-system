const router = require('express').Router();
const { registerUser } = require('../constrollers/user.controller.js');
const { upload } = require('../middlewares/multer.middleware.js'); // ✅ FIXED
const { verifyToken } = require('../middlewares/auth.middleware.js');

router.route('/register').post(
  upload.fields([
    { name: 'profileImage', maxCount: 1 }
  ]),
  registerUser
);

module.exports = router;
