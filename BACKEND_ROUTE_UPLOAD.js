// For your backend - routes/shared/upload.routes.js

const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload'); // Your existing multer middleware
const uploadController = require('../../controllers/shared/upload.controller');

// POST endpoint for image uploads
// Uses multer middleware to handle file upload
router.post('/image', upload.single('image'), uploadController.uploadImage);

module.exports = router;
