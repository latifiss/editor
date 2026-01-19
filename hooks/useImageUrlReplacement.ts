/**
 * Hook to handle blob URL replacement before form submission
 * Use this in any page that uses TiptapEditor with image uploads
 */

import { useCallback } from 'react';
import { replaceBlobUrlsInHTML, getBlobUrlsFromHTML } from '@/utils/imageUrlUtils';

export const useImageUrlReplacement = () => {
  /**
   * Processes HTML content and replaces blob URLs with actual uploaded URLs
   * Should be called before submitting form with editor content
   * 
   * @param htmlContent The HTML content from the editor
   * @param onWarning Callback for warning (e.g., to show notification)
   * @returns The processed HTML with blob URLs replaced, or null if validation fails
   */
  const processHTMLContent = useCallback(
    (
      htmlContent: string,
      onWarning?: (message: string) => void
    ): string | null => {
      // Get the image URL map from the window object (set by image button)
      const imageUrlMap = (window as any).imageUrlMap as Map<string, string> || new Map();

      // Check for pending blob URLs
      const blobUrls = getBlobUrlsFromHTML(htmlContent);
      if (blobUrls.length > 0) {
        const unmappedBlobs = blobUrls.filter(url => !imageUrlMap.has(url));
        if (unmappedBlobs.length > 0) {
          const message = 'Please wait for all images to finish uploading';
          onWarning?.(message);
          console.warn('Unmapped blob URLs:', unmappedBlobs);
          return null;
        }
      }

      // Replace blob URLs with actual uploaded URLs
      let finalHtmlContent = htmlContent;
      if (imageUrlMap.size > 0) {
        finalHtmlContent = replaceBlobUrlsInHTML(htmlContent, imageUrlMap);
        console.log('Replaced blob URLs with actual URLs');
      }

      return finalHtmlContent;
    },
    []
  );

  return { processHTMLContent };
};
