const Booking = require('../moduls/Booking.js');
const Room = require('../moduls/Room.js');

exports.bookRoom = async (req, res) => {
    try {
        const userId = req.user._id; 
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ success: false, message: "Room ID is required" });
        }

        const room = await Room.findById(roomId);
        if (!room || room.status !== 'available') {
            return res.status(400).json({ success: false, message: "Room is not available for booking" });
        }
        
        const newBooking = await Booking.create({
            user: userId,
            room: roomId
        });

        room.status = 'booked';
        room.isAvailable = false;
        await room.save();

        return res.status.json({
            success: true,
            message: "Room booked SuccessFully",
            booking: newBooking
        });
    } catch (error) {
        console.error("Booking error : ", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    };
}
