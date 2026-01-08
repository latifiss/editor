export const INSTAGRAM_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i;

export const isValidInstagramUrl = (url: string) => {
  return url.match(INSTAGRAM_REGEX) || url.includes("instagram.com");
};

export interface GetInstagramEmbedUrlOptions {
  url: string;
}

export const getEmbedUrlFromInstagramUrl = (options: GetInstagramEmbedUrlOptions) => {
  const { url } = options;

  if (!isValidInstagramUrl(url)) {
    return null;
  }

  // Extract post ID from URL
  const match = url.match(INSTAGRAM_REGEX);
  if (!match || !match[1]) {
    // Try to extract from any Instagram URL format
    const altMatch = url.match(/instagram\.com\/[^\/]+\/([A-Za-z0-9_-]+)/);
    if (altMatch && altMatch[1]) {
      return `https://www.instagram.com/p/${altMatch[1]}/embed/`;
    }
    return null;
  }

  const postId = match[1];
  // Instagram embeds use oEmbed format
  // Format: https://www.instagram.com/p/POST_ID/embed/
  return `https://www.instagram.com/p/${postId}/embed/`;
};

