const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    console.log("file is uploaded on cloudinary", response.url);

    // Clean up the local file after upload
    fs.unlinkSync(localFilePath);
    console.log("Local file deleted after upload to Cloudinary");

    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Error uploading file to Cloudinary:", error.message);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary:", response);
    return response;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error.message);
    return null;
  }
}

module.exports = { uploadToCloudinary , deleteFromCloudinary };
