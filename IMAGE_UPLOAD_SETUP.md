# Image Upload Feature - Setup & Implementation Guide

## Overview

The editor component now supports uploading images from your device directly into the editor content. Images are uploaded to Cloudinary and inserted as properly formatted elements.

## Features Implemented

### 1. **Image Upload Button**

- Located in the editor's toolbar (EditorMenu component)
- Icon: Camera/Image icon from lucide-react
- Disabled state while uploading with animated spinner
- Accessible with keyboard navigation

### 2. **File Validation**

- **File Type**: Only image files are accepted (`image/*`)
- **File Size**: Maximum 5MB per image
- User-friendly error messages for validation failures

### 3. **Upload Process**

- Files are uploaded to Cloudinary (your configured cloud storage)
- Uses `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Returns secure HTTPS URL from Cloudinary
- Images are automatically inserted into the editor at cursor position

### 4. **Image Styling**

Images are automatically styled with:

- Responsive width (max-w-full)
- Auto height adjustment
- Rounded corners (border-radius: 8px)
- Border and shadow for visual separation
- Centered alignment within content
- Margin spacing above and below

## Files Modified

### `/utils/uploadImage.ts`

**Before**: Simple blob URL creation for local preview only
**After**: Full Cloudinary integration with proper error handling

Features:

- FormData creation for multipart upload
- Cloudinary API endpoint integration
- Secure HTTPS URL response
- Try-catch error handling with descriptive messages

### `/components/editor/index.tsx`

**Enhanced `addImage` function** with:

- File size validation (max 5MB)
- Better error messages with error type detection
- Loading state management
- Proper UI feedback during upload

### `/components/editor/editorMenu.tsx`

**Image button already implemented** with:

- Proper disabled state during upload
- Loading spinner animation
- Hover states and transitions
- Accessibility titles

## Usage

### For Users

1. Click the **Image button** (camera icon) in the editor toolbar
2. Select an image file from your device
3. Wait for the upload to complete
4. The image will automatically appear in the editor content

### For Developers

**To add an image programmatically:**

```typescript
const imageUrl = await uploadImage(file);
editor.commands.insertContent(`<img src="${imageUrl}" class="..." />`);
```

**To handle custom upload errors:**

```typescript
try {
  const imageUrl = await uploadImage(file);
  // Insert image
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  // Handle error
}
```

## Required Environment Variables

Make sure your `.env.local` file contains:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
```

These are already configured in your project and used across multiple components.

## Image Insertion Details

When an image is inserted, it includes:

- **Responsive classes**: `max-w-full h-auto` for flexibility
- **Visual styling**: `rounded-lg` for modern appearance
- **Spacing**: `my-4` for vertical separation
- **Border**: `border border-gray-200` for definition
- **Shadow**: `shadow-sm` for depth
- **Alignment**: `mx-auto block` for center alignment

## Error Handling

The upload system handles:

- ✅ Network errors
- ✅ Cloudinary API errors
- ✅ Invalid file types
- ✅ Files exceeding size limit
- ✅ Missing environment variables

All errors display user-friendly messages.

## Browser Compatibility

Works in all modern browsers that support:

- File API
- FormData API
- Fetch API
- ES6+ Promise support

## Performance Considerations

- Images are uploaded asynchronously (non-blocking)
- Loading state prevents multiple simultaneous uploads
- File size limit (5MB) prevents performance issues
- Images are optimized by Cloudinary

## Testing the Feature

1. Start your dev server: `npm run dev`
2. Navigate to the editor
3. Click the image button
4. Select an image from your device
5. Verify:
   - Upload spinner appears
   - Image appears in content
   - Image is properly styled and centered
   - No console errors

## Troubleshooting

**Images don't upload:**

- Verify Cloudinary environment variables are set
- Check browser console for error messages
- Ensure upload preset allows unsigned uploads

**Images appear broken:**

- Verify image URL is accessible
- Check Cloudinary dashboard for upload records
- Confirm network connectivity

**Upload takes too long:**

- Check file size (should be < 5MB)
- Verify internet connection
- Monitor Cloudinary status

## Future Enhancements

Potential improvements:

- Drag-and-drop image upload
- Paste image from clipboard
- Image resizing before upload
- Alt text input for accessibility
- Image gallery/library browser
- Batch upload support
