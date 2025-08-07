const Booking = require('../moduls/Booking.js');
const Room = require('../moduls/Room.js');

exports.createBooking = async (req, res) => {
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

        return res.status(200).json({
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

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate({
                path: 'room',
                populate: { path: 'house', select: 'plotNumber city' }
            })
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            bookings
        })
    } catch (error) {
        console.log("Error : ", error);
        return res.status(500).json({
            success: false,
            message : "Internal server Error"
        })
    }
}

exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.user._id;

        const bookings = await Booking.find({ user: userId })
            .populate('room')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            Bookings : bookings
        })
    } catch (error) {
        console.log('Error : ', error);
        return res.status(500).json({
            success: false,
            message: "Internal server Error"
        })
    }
}


exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId).populate('room');
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        //Mark room as available again

        const room = booking.room;
        room.status = 'available';
        room.isAvailable = true;
        await room.save();

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully"
        });
    } catch (error) {
        console.log('Error : ', error);
        return res.status(500).json({
            success: false,
            message: "Internal server Error"
        });
    }
}

exports.completeBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId).populate("room");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.status = 'completed';
        await booking.save();

        //Optional : mark room as available again
        const room = booking.room;
        room.status = 'available';
        room.isAvailable = true;
        await room.save();

        return res.status(200).json({
            success: true,
            message: "Booking marked as completed"
        });
    } catch (error) {
        console.log("Error :", error);
        return res.status(500).json({
            success: false,
            message : "Internal server Error"
        })
    }
}