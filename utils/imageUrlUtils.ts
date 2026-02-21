export const replaceBlobUrlsInHTML = (
  html: string,
  imageUrlMap: Map<string, string>
): string => {
  let updatedHtml = html;

  imageUrlMap.forEach((actualUrl, blobUrl) => {
    const blobRegex = new RegExp(`src="${blobUrl}"`, 'g');
    updatedHtml = updatedHtml.replace(blobRegex, `src="${actualUrl}"`);
  });

  return updatedHtml;
};

export const getBlobUrlsFromHTML = (html: string): string[] => {
  const blobRegex = /src="(blob:[^"]+)"/g;
  const matches = [];
  let match;

  while ((match = blobRegex.exec(html)) !== null) {
    matches.push(match[1]);
  }

  return matches;
};
