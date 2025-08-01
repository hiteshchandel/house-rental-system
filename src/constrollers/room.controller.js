const Room = require('../moduls/Room');
const House = require('../moduls/House');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

exports.addRoom = async (req, res) => {
    try {
        const { roomNumber, type, attachedKitchen, attachedBathroom, rentAmount } = req.body;
        const houseId = req.params.id;
        
        if (!roomNumber || !rentAmount || !houseId) {
            return res.status(400).json({
                success: false,
                message: "houseId, roomNumber, rentAmount are required"
            })
        }

        const house = await House.findById(houseId);
        if (!house) {
            return res.status(404).json({
                success: false,
                message: "House not found"
            })
        }

        const files = req.files?.images || [];
        const images = [];
        for (const file of files) {
            const uploadResponse = await uploadToCloudinary(file.path);
            if (uploadResponse) {
                images.push({
                    public_Id: uploadResponse.public_id,
                    url: uploadResponse.url
                })
            } else {
                console.log("Failed to upload image to Cloudinary");
                return res.status(500).json({ message: "Failed to upload image to Cloudinary" });
            }
        }

        const newRoom = new Room({
            house: houseId,
            roomNumber,
            type: type || 'single',
            attachedKitchen: attachedKitchen || false,
            attachedBathroom: attachedBathroom || false,
            rentAmount,
            images,
            isAvailable: true,
        });

        await newRoom.save();

        return res.status(201).json({
            success: true,
            message: "Room added successfully",
            room: newRoom
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

exports.getRoomsByHouseId = async (req, res) => {
    try {
        const houseId = req.params.id;
        const rooms = await Room.find({ house: houseId }).populate('house', 'plotNumber location city image');

        if (!rooms || rooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No rooms found for this house"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Rooms fetched successfully",
            rooms
        });
    } catch (error) {
        console.error("Error fetching rooms by house ID:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}

exports.getRoomById = async (req, res) => {
    try {
        const roomId = req.params.id;
        const room = await Room.findById(roomId).populate('house', 'plotNumber location city image');
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Room fetched successfully",
            room
        });
    } catch (error) {
        console.error("Error fetching room by ID:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}

exports.getAvailableRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isAvailable: true })
            .sort({rentAmount : 1})
            .populate('house', 'plotNumber location city image');
        
        if (!rooms || rooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No available rooms found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Available rooms fetched successfully",
            rooms
        });
    } catch (error) {
        console.error("Error fetching available rooms:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}

exports.updateRoomStatus = async (req, res) => {
    try {
        const roomId = req.params.id;
        const { isAvailable, status } = req.body;
        
        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { isAvailable, status },
            { new: true }
        );

        if(!updatedRoom) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Room status updated successfully",
            room: updatedRoom
        });
    } catch (error) {
        console.error("Error updating room status:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}

exports.deleteRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }
        // Delete images from Cloudinary
        for (const image of room.images) {
            await deleteFromCloudinary(image.public_Id );
        }
        await Room.findByIdAndDelete(roomId);

        return res.status(200).json({
            success: true,
            message: "Room deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting room:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}

exports.updateRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const { roomNumber, type, attachedKitchen, attachedBathroom, rentAmount,isAvailable, status } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        //upload new images if provided
        let newImages = room.images || [];
        const localFiles = req.files?.images;

        if (localFiles && localFiles.length > 0) {
            for (const image of room.images) {
                // Delete old images from Cloudinary
                await deleteFromCloudinary(image.public_Id );
            }

            newImages = [];

            for (const file of localFiles) {
                const uploadResponse = await uploadToCloudinary(file.path);
                if (uploadResponse) {
                    newImages.push({
                        public_Id: uploadResponse.public_id,
                        url: uploadResponse.url
                    });
                } else {
                    console.log("Failed to upload image to Cloudinary");
                    return res.status(500).json({ message: "Failed to upload image to Cloudinary" });
                }
            }
        }

        const updateRoom = await Room.findByIdAndUpdate(
            roomId,
            {
                roomNumber: roomNumber || room.roomNumber,
                type: type || room.type,
                attachedKitchen: attachedKitchen !== undefined ? attachedKitchen : room.attachedKitchen,
                attachedBathroom: attachedBathroom !== undefined ? attachedBathroom : room.attachedBathroom,
                rentAmount: rentAmount || room.rentAmount,
                isAvailable: isAvailable !== undefined ? isAvailable : room.isAvailable,
                status: status || room.status,
                images: newImages
            },
            { new: true }
            
        );

        return res.status(200).json({
            success: true,
            message: "Room updated successfully",
            room: updateRoom
        })
    } catch (error) {
        console.error("Error updating room:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}