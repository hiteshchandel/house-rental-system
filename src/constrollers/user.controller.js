const User = require('../moduls/User.js');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email or name" });
        }


        let profileImage = {url: null, public_id: null};
        const profileImagePath = req.files?.profileImage?.[0]?.path;
        // If profile image is provided, upload it to Cloudinary

        if (profileImagePath) {
            const uploadResponse = await uploadToCloudinary(profileImagePath);
            if (uploadResponse) {
                profileImage.url = uploadResponse.url;
                profileImage.public_id = uploadResponse.public_id;
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
            profileImage
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

exports.loginUser = async (req, res) => {
    //get user detail from frontend
    //validation - not empty
    //cheak if user exists : username and email
    //compare password
    //remove password and refresh token field from response
    //return res

    try {
        const { email, password } = req.body;

        if (!email) {
            console.log("Email is required for login");
            return res.status(400).json({ message: "Email is required for login" });
        }

        if (!password) {
            console.log("Password is required for login");
            return res.status(400).json({ message: "Password is required for login" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log("User does not exist with this email");
            return res.status(404).json({ message: "user does not exist" });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            console.log("Invalid password");
            return res.status(401).json({ message: "Invalid password" });
        }

        const userResponse = await User.findById(user._id).select('-password');

        return res.status(200).json({
            message: "User logged in successfully",
            user: userResponse,
            token: user.generateAuthToken()
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.getUserProfile = async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            message: "User profile retrieved successfully",
            user
        });
    } catch (error) {
        console.error("Get User Profile Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json({
            message: "Users retrieved successfully",
            users
        });
    } catch (error) {
        console.error("Get All Users Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User retrieved successfully",
            user
        });
    } catch (error) {
        console.error("Get User By ID Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user details
        const { name, email, phone,role,password } = req.body;
        if (name) user.name = name;
        if (email) user.email = email.toLowerCase();
        if (phone) user.phone = phone;
        if (role) user.role = role;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        

        // Handle profile image upload
        const profileImagePath = req.files?.profileImage?.[0]?.path;
        if (profileImagePath) {
            // If a new profile image is uploaded, delete the old one if it exists
            if (user.profileImage?.public_id) {
                await deleteFromCloudinary(user.profileImage?.public_id);
            }

            // Upload the new profile image to Cloudinary
            const uploadResponse = await uploadToCloudinary(profileImagePath)
            if (uploadResponse) {
                user.profileImage.url = uploadResponse.url;
                user.profileImage.public_id = uploadResponse.public_id;
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                role: user.role,
                token: user.generateAuthToken()
            },
            
        });
    } catch (error) {
        console.error("Update User Profile Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}
