import React, { useRef, useState } from "react";

import { useImage } from "../../hooks/use-image";
import { MenuButton } from "../menu-button";
import { uploadImage } from "@/utils/uploadImage";

const ImageButton = () => {
  const { canInsert, insert } = useImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMapRef = useRef<Map<string, string>>(new Map()); // Maps blob URLs to actual URLs

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create a preview URL immediately
      const previewUrl = URL.createObjectURL(file);

      // Get image dimensions from preview
      const img = new Image();
      img.onload = async () => {
        const width = img.width;
        const height = img.height;

        // Insert image immediately with preview URL (optimistic update)
        insert({
          src: previewUrl,
          width,
          height,
        });

        // Start upload in background
        try {
          console.log("Starting upload for file:", file.name);
          
          // Upload to backend
          const imageUrl = await uploadImage(file);

          console.log("Image uploaded successfully:", imageUrl);
          
          // Store the mapping from blob URL to actual URL
          uploadMapRef.current.set(previewUrl, imageUrl);
          console.log("Blob URL mapped:", previewUrl, "->", imageUrl);
          
          // Expose the mapping for form submission to use
          if (window) {
            (window as any).imageUrlMap = uploadMapRef.current;
          }
        } catch (error) {
          console.error("Error uploading to backend:", error);
          alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          // Image remains in editor with preview URL
        }
      };
      img.src = previewUrl;
    } catch (error) {
      console.error("Error processing image:", error);
      alert(`Failed to process image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <MenuButton
        icon="Image"
        tooltip="Image"
        disabled={!canInsert || isUploading}
        onClick={handleClick}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </>
  );
};

export default ImageButton;

