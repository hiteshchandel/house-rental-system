const router = require('express').Router();
const { registerUser, loginUser, getUserProfile, getUserById, getAllUsers } = require('../constrollers/user.controller.js');
const { upload } = require('../middlewares/multer.middleware.js'); // ✅ FIXED
const { verifyToken } = require('../middlewares/auth.middleware.js');
const { isAdmin } = require('../middlewares/isAdmin.middleware.js');

router.route('/register').post(
  upload.fields([
    { name: 'profileImage', maxCount: 1 }
  ]),
  registerUser
);

router.route('/login').post(
  // login logic will be implemented here
  loginUser
);

router.route('').get(
  verifyToken,
  getUserProfile
)

router.route('/all').get(
  verifyToken,
  isAdmin,
  getAllUsers
)

router.route('/:id').get(
  verifyToken,
  isAdmin,
  getUserById
)
module.exports = router;
