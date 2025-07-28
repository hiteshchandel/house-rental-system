const router = require('express').Router();
const { upload } = require('../middlewares/multer.middleware.js');
const { verifyToken } = require('../middlewares/auth.middleware.js');
const { isAdmin } = require('../middlewares/isAdmin.middleware.js');
const { addRoom, getRoomsByHouseId, getRoomById, getAvailableRooms, updateRoomStatus, updateRoom, deleteRoom } = require('../constrollers/room.controller.js');

router.route('/:id').post(
    verifyToken,
    isAdmin,
    upload.fields([{ nema: 'images', maxCount: 5 }]),
    addRoom
)

router.route('/:id').get(
    getRoomsByHouseId
)

router.route('/single/:id').get(
    getRoomById
)

router.route('/available').get(
    getAvailableRooms
)

router.route('/:id/status').patch(
    verifyToken,
    isAdmin,
    updateRoomStatus
)

router.route('/:id').put(
    verifyToken,
    isAdmin,
    upload.fields([{ name: 'images', maxCount: 5 }]),
    updateRoom
)

router.route('/:id').delete(
    verifyToken,
    isAdmin,
    deleteRoom
)

module.exports = router;