const User = require('../moduls/User.js');
const { uploadToCloudinary } = require('../utils/cloudinary.js');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    //get user detail from frontend
    //validation - not empty
    //cheak if user already exists : username and email
    //cheak for image and avtar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //cheak for user creation
    //return res

    try {
        const { name, email, password, phone ,role} = req.body;
        
        if(!name || !email || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { name }]
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email or name" });
        }

        const profileImagePath = req.files?.profileImage?.[0]?.path;

        let profileImageUrl = null;
        if (profileImagePath) {
            const uploadResponse = await uploadToCloudinary(profileImagePath);
            if (uploadResponse) {
                profileImageUrl = uploadResponse.url;
            } else {
                return res.status(500).json({ message: "Failed to upload profile image" });
            }
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            phone,
            role,
            profileImage: profileImageUrl
        });

        const createdUser = await User.findById(user._id).select('-password');

        if(!createdUser) {
            return res.status(500).json({ message: "Failed to create user" });
        }

        return res.status(201).json({
            message: "User registered successfully",
            user: createdUser,
            token: createdUser.generateAuthToken()
        });
    } catch (error) {
        console.error("Registration Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}
