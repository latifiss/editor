export const TWITTER_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/i;

export const isValidTwitterUrl = (url: string) => {
  return url.match(TWITTER_REGEX) || url.includes("twitter.com") || url.includes("x.com");
};

export interface GetTwitterEmbedUrlOptions {
  url: string;
}

export const getEmbedUrlFromTwitterUrl = (options: GetTwitterEmbedUrlOptions) => {
  const { url } = options;

  if (!isValidTwitterUrl(url)) {
    return null;
  }

  // Extract tweet ID from URL
  const match = url.match(TWITTER_REGEX);
  if (!match || !match[3]) {
    // Try alternative format
    const altMatch = url.match(/status(es)?\/(\d+)/);
    if (altMatch && altMatch[2]) {
      return `https://platform.twitter.com/embed/Tweet.html?id=${altMatch[2]}`;
    }
    return null;
  }

  const tweetId = match[3];
  // Twitter/X embeds use oEmbed format
  // Format: https://platform.twitter.com/embed/Tweet.html?id=TWEET_ID
  return `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;
};

