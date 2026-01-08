export const TIKTOK_REGEX =
  /(?:https?:\/\/)?(?:www\.|vm\.)?(?:tiktok\.com)\/(?:@[\w\.]+\/video\/|v\/)?(\d+)/i;

export const isValidTikTokUrl = (url: string) => {
  return url.match(TIKTOK_REGEX) || url.includes("tiktok.com");
};

export interface GetTikTokEmbedUrlOptions {
  url: string;
}

export const getEmbedUrlFromTikTokUrl = (options: GetTikTokEmbedUrlOptions) => {
  const { url } = options;

  if (!isValidTikTokUrl(url)) {
    return null;
  }

  // Extract video ID from URL - try multiple formats
  let videoId: string | null = null;
  
  // Format 1: @username/video/ID
  const format1Match = url.match(/tiktok\.com\/@[\w\.]+\/video\/(\d+)/i);
  if (format1Match && format1Match[1]) {
    videoId = format1Match[1];
  }
  
  // Format 2: /v/ID or just ID
  if (!videoId) {
    const format2Match = url.match(/(?:v\/|video\/)(\d+)/i);
    if (format2Match && format2Match[1]) {
      videoId = format2Match[1];
    }
  }
  
  // Format 3: Direct ID in URL
  if (!videoId) {
    const format3Match = url.match(/tiktok\.com\/.*?(\d{19})/i);
    if (format3Match && format3Match[1]) {
      videoId = format3Match[1];
    }
  }

  if (!videoId) {
    return null;
  }

  // TikTok embeds use oEmbed format
  // Format: https://www.tiktok.com/embed/v2/VIDEO_ID
  return `https://www.tiktok.com/embed/v2/${videoId}`;
};

