const router = require('express').Router();
const { upload } = require('../middlewares/multer.middleware.js');
const { verifyToken } = require('../middlewares/auth.middleware.js');
const { isAdmin } = require('../middlewares/isAdmin.middleware.js');
const { addHouse, getAllHouses, getHouseById, updateHouse, deleteHouse } = require('../constrollers/house.controller.js');


router.route('/').post(
    verifyToken,
    isAdmin,
    upload.fields([{ name: 'image', maxCount: 1 }]),
    addHouse
);

router.route('/').get(
    getAllHouses,
);

router.route('/:id').get(
    getHouseById
);

router.route('/:houseId').put(
    verifyToken,
    isAdmin,
    upload.fields([{ name: 'image', maxCount: 1 }]),
    updateHouse
)

router.route('/:houseId').delete(
    verifyToken,
    isAdmin,
    deleteHouse
)


module.exports = router;