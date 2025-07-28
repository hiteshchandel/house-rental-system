const House = require('../moduls/House');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.js');

exports.addHouse = async (req, res) => {
    try {
        const { plotNumber, location, city } = req.body;
        const owner = req.user._id;

        if (!plotNumber || !city) {
            console.log("plotNumber or city is missing");
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        if (!owner) {
            return res.status(400).json({ message: "Owner is required" });
        }

        let image = { url: null, public_id: null };

        const localFilePath = req.files?.image?.[0]?.path;

        if (localFilePath) {
            
            const uploadResponse = await uploadToCloudinary(localFilePath);

            if (uploadResponse) {
                image.url = await uploadResponse.url;
                image.public_id = await uploadResponse.public_id;
            } else {
                console.log("Failed to upload image to Cloudinary");
                return res.status(500).json({ message: "Failed to upload image to Cloudinary" });
            }
        }

        const newHouse = await House.create({
            owner,
            plotNumber,
            location,
            city,
            image,
        })

        return res.status(201).json({
            success: true,
            message: "House created successfully",
            house: newHouse
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getAllHouses = async (req, res) => {
    try {
        const houses = await House.find().populate('owner', 'name email phone profileImage').sort({ createdAt: -1 });

        if (!houses || houses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No houses found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Houses fetched successfully",
            house: houses
        })
    } catch (error) {
        console.error("Error fetching houses:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.getHouseById = async (req, res) => {
    try {
        const ownerId = req.params.id;
        const houses = await House.find({owner : ownerId}).populate('owner', 'name email phone profileImage');

        if (houses.length == 0) {
            return res.status(404).json({
                success: false,
                message: "No houses found for this owner"
            })
        }
        // console.log("✅Houses fetched successfully for owner ID:", ownerId);
        // console.log("✅Houses:", houses);

        return res.status(200).json({
            success: true,
            message: "Houses fetched successfully",
            houses: houses
        });
    } catch (error) {
        console.error("Error fetching houses by owner ID:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.updateHouse = async (req, res) => {
    try {
        const { plotNumber, location, city } = req.body;
        const houseId = req.params.houseId;

        const house = await House.findById(houseId);
        if(!house) {
            return res.status(404).json({
                success: false,
                message: "House not found"
            });
        }

        const localFilePath = req.files?.image?.[0]?.path;

        if (localFilePath) {
            if (house.image.public_id) {
                await deleteFromCloudinary(house.image.public_id);
            }

            const uploadResponse = await uploadToCloudinary(localFilePath);
            if (uploadResponse) {
                house.image.url = uploadResponse.url;
                house.image.public_id = uploadResponse.public_id;
            }

            house.plotNumber = plotNumber || house.plotNumber;
            house.location = location || house.location;
            house.city = city || house.city;

            await house.save();

            return res.status(200).json({
                success: true,
                message: "House updated successfully",
                updated_House: house
            });
        }
    } catch (error) {
        console.error("Error updating house:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}

exports.deleteHouse = async (req, res) => {
    try {
        const houseId = req.params.houseId;
        const house = await House.findById(houseId);

        if(!house) {
            return res.status(404).json({
                success: false,
                message: "House not found"
            });
        }

        //Delete the house image from Cloudinary if it exists
        if (house.image?.public_id) {
            await deleteFromCloudinary(house.image?.publicId);
        }

        await House.findByIdAndDelete(houseId);

        return res.status(200).json({
            success: true,
            message: "House deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting house:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}