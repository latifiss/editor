/**
 * Replaces blob URLs in HTML content with actual uploaded URLs
 * @param html HTML content with potential blob URLs
 * @param imageUrlMap Map of blob URLs to actual URLs
 * @returns HTML with blob URLs replaced
 */
export const replaceBlobUrlsInHTML = (
  html: string,
  imageUrlMap: Map<string, string>
): string => {
  let updatedHtml = html;

  imageUrlMap.forEach((actualUrl, blobUrl) => {
    // Replace the blob URL with the actual URL in image src attributes
    const blobRegex = new RegExp(`src="${blobUrl}"`, 'g');
    updatedHtml = updatedHtml.replace(blobRegex, `src="${actualUrl}"`);
  });

  return updatedHtml;
};

/**
 * Checks if HTML content contains any blob URLs
 * @param html HTML content to check
 * @returns Array of blob URLs found
 */
export const getBlobUrlsFromHTML = (html: string): string[] => {
  const blobRegex = /src="(blob:[^"]+)"/g;
  const matches = [];
  let match;

  while ((match = blobRegex.exec(html)) !== null) {
    matches.push(match[1]);
  }

  return matches;
};
