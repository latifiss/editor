export const FACEBOOK_REGEX =
  /(?:https?:\/\/)?(?:www\.|m\.)?(?:facebook\.com|fb\.com)\/(?:.*\/)?(?:posts|videos|watch|photo|permalink\.php|groups|pages|events)\/([^\/\s?&]+)/i;

export const isValidFacebookUrl = (url: string) => {
  return url.match(FACEBOOK_REGEX) || url.includes("facebook.com");
};

export interface GetFacebookEmbedUrlOptions {
  url: string;
}

export const getEmbedUrlFromFacebookUrl = (options: GetFacebookEmbedUrlOptions) => {
  const { url } = options;

  if (!isValidFacebookUrl(url)) {
    return null;
  }

  // Facebook embeds use oEmbed format
  // The URL format for Facebook embeds is: https://www.facebook.com/plugins/post.php?href=POST_URL
  const encodedUrl = encodeURIComponent(url);
  return `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500`;
};

