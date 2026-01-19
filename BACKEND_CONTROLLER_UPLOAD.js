// For your backend - controllers/shared/upload.controller.js

const { uploadToR2 } = require('../../utils/r2');

exports.uploadImage = async (req, res) => {
  try {
    // Get file from multer middleware (req.file or req.files.image)
    const file = req.file || req.files?.image?.[0];

    if (!file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded',
      });
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        status: 'fail',
        message: 'File must be an image',
      });
    }

    // Upload to R2
    const imageUrl = await uploadToR2(
      file.buffer,
      file.mimetype,
      'editor-uploads'
    );

    res.status(200).json({
      status: 'success',
      url: imageUrl,
      image_url: imageUrl, // Provide both field names for compatibility
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload image',
    });
  }
};
