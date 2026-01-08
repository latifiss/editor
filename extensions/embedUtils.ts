export const createEmbedHTML = (url: string, type: string) => {
  const platformIcons = {
    facebook: '🔵',
    twitter: '🐦', 
    youtube: '📺',
    instagram: '📷',
    linkedin: '💼',
    tiktok: '🎵'
  };

  const platformNames = {
    facebook: 'Facebook',
    twitter: 'Twitter',
    youtube: 'YouTube',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok'
  };

  const icon = platformIcons[type as keyof typeof platformIcons] || '🔗';
  const name = platformNames[type as keyof typeof platformNames] || 'Social Media';

  return `
    <div class="social-embed border-2 border-dashed border-gray-300 rounded-lg p-4 my-4 bg-gray-50">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded text-lg">
          ${icon}
        </div>
        <div>
          <div class="font-semibold text-sm">${name} Embed</div>
          <div class="text-xs text-gray-500 truncate max-w-[200px]">${url}</div>
        </div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600 mb-2">
          This ${name} content will be embedded when published
        </div>
        <a 
          href="${url}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-blue-500 hover:text-blue-700 text-sm underline"
        >
          View original post
        </a>
      </div>
    </div>
  `;
};