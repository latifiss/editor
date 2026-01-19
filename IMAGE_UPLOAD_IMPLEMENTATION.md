# Image Upload with Blob URL Replacement - Implementation Guide

## Overview

The image upload feature with blob URL replacement is now **reusable across all pages** that use the TiptapEditor. This includes:

- ✅ `create-article` pages
- ✅ `create-graphic` pages
- ✅ `create-feature` pages
- ✅ `create-opinion` pages
- ✅ `edit-*` pages
- ✅ Any other page using TiptapEditor

## How It Works

### 1. Image Button Component (Automatic)

**Location:** `/components/tiptap-editor/components/controls/image-button-2.tsx`

The image button automatically:

- Creates blob preview URL when image selected
- Stores mapping of `blob:URL → actual R2 URL` in `window.imageUrlMap`
- Uploads to R2 in background
- No changes needed in parent pages

### 2. Blob URL Replacement (Reusable Hook)

**Location:** `/hooks/useImageUrlReplacement.ts`

Use the `useImageUrlReplacement()` hook in any page that submits editor content.

## Implementation Steps

### Step 1: Import the Hook

```typescript
import { useImageUrlReplacement } from '@/hooks/useImageUrlReplacement';
```

### Step 2: Initialize in Component

```typescript
export default function CreateGraphicPage() {
  const { notify } = useNotify();
  const { processHTMLContent } = useImageUrlReplacement();
  const editorRef = useRef<TiptapEditorRef>(null);

  // ... rest of component
}
```

### Step 3: Use in Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const editor = editorRef.current;
  if (!editor) return;

  const htmlContent = editor.getHTML();

  // Process HTML content - replace blob URLs with actual URLs
  const finalHtmlContent = processHTMLContent(htmlContent, (warning) => {
    notify(warning, 'warning');
  });

  // If processing failed (images still uploading), stop submission
  if (!finalHtmlContent) {
    return;
  }

  // Use finalHtmlContent in FormData
  const formData = new FormData();
  formData.append('content', finalHtmlContent);
  // ... append other fields

  // Submit form
  try {
    await yourMutation(formData).unwrap();
    notify('Success!', 'success');
  } catch (error) {
    notify('Error', 'error');
  }
};
```

## What the Hook Does

### `processHTMLContent(htmlContent, onWarning?)`

**Parameters:**

- `htmlContent` (string) - HTML from editor
- `onWarning` (function, optional) - Callback to show warning message

**Returns:**

- `string` - HTML with blob URLs replaced, or
- `null` - If validation fails (images still uploading)

**Behavior:**

1. Checks for any blob URLs in the HTML
2. Verifies all blob URLs have been mapped to actual URLs
3. If unmapped blobs exist → calls `onWarning()` and returns `null`
4. If all mapped → replaces blob URLs with actual R2 URLs and returns processed HTML
5. Logs replacements to console for debugging

## Example: Adding to create-graphic Page

```typescript
'use client';

import { useImageUrlReplacement } from '@/hooks/useImageUrlReplacement';
import TiptapEditor from '@/components/tiptap-editor';

export default function CreateGraphicPage() {
  const { notify } = useNotify();
  const { processHTMLContent } = useImageUrlReplacement(); // ← Add this
  const editorRef = useRef<TiptapEditorRef>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const editor = editorRef.current;
    if (!editor) return;

    const htmlContent = editor.getHTML();

    // ← Add these 7 lines
    const finalHtmlContent = processHTMLContent(htmlContent, (warning) => {
      notify(warning, 'warning');
    });

    if (!finalHtmlContent) {
      return;
    }

    const formData = new FormData();
    formData.append('content', finalHtmlContent); // ← Use finalHtmlContent instead
    // ... append other fields

    // ... submit mutation
  };

  return (
    <form onSubmit={handleSubmit}>
      <TiptapEditor ref={editorRef} />
      {/* ... other form fields */}
    </form>
  );
}
```

## Pages That Need This Implementation

### Already Implemented ✅

- `/app/ghanapolitan/create-article/page.tsx`

### Need Implementation ❌

- `/app/ghanapolitan/create-graphic/page.tsx`
- `/app/ghanapolitan/create-feature/page.tsx`
- `/app/ghanapolitan/create-opinion/page.tsx`
- `/app/ghanascore/create-article/page.tsx`
- `/app/ghanascore/create-feature/page.tsx`
- `/app/afrobeatsrep/create-article/page.tsx`
- `/app/afrobeatsrep/create-feature/page.tsx`
- Any edit pages using TiptapEditor

## Testing

1. Select image in editor → Image appears with blob URL
2. Wait for upload to complete → Blob URL mapped to R2 URL
3. Try submitting **before** upload completes → Shows warning "Please wait for all images to finish uploading"
4. Wait for upload → Submit successfully
5. Check database → Image stored with actual R2 URL, not blob URL

## Debugging

### Check if images are uploaded

Open browser console and run:

```javascript
console.log(window.imageUrlMap);
```

Should show:

```
Map {
  "blob:http://localhost:3000/xxx-xxx" => "https://pub-xxx.r2.dev/editor-uploads/xxx"
}
```

### Check replaced content

Browser console will show:

```
Replaced blob URLs with actual URLs
```

### Pending uploads

If images are still uploading:

```
Unmapped blob URLs: ["blob:http://localhost:3000/xxx-xxx"]
```

## Summary

✅ **Image Button** - Automatically handles upload and mapping (reusable)  
✅ **useImageUrlReplacement Hook** - Simple, reusable blob URL replacement  
✅ **Easy to add** - Just 2-3 lines per page  
✅ **Works everywhere** - Any page using TiptapEditor

Just import the hook and use `processHTMLContent()` before form submission!
