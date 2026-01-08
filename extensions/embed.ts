import { Node } from '@tiptap/core'

export const Embed = Node.create({
  name: 'embed',

  group: 'block',

  content: 'text*',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      type: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="embed"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {}
          const element = dom as HTMLElement
          return {
            src: element.getAttribute('data-src'),
            type: element.getAttribute('data-type'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      { 
        'data-type': 'embed',
        'data-src': HTMLAttributes.src,
        'data-type': HTMLAttributes.type,
        class: 'embed-wrapper'
      }, 
      0
    ]
  },

  addCommands() {
    return {
      setEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div')
      dom.className = 'embed-wrapper'
      dom.setAttribute('data-type', 'embed')
      dom.setAttribute('data-src', node.attrs.src)
      dom.setAttribute('data-platform', node.attrs.type)

      const { src, type } = node.attrs

      const embedContent = createEmbedContent(src, type)
      dom.innerHTML = embedContent

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) return false
          return true
        },
      }
    }
  },
})

function createEmbedContent(src: string, type: string): string {
  const platformIcons = {
    facebook: '🔵',
    twitter: '🐦', 
    youtube: '📺',
    instagram: '📷',
    linkedin: '💼',
    tiktok: '🎵'
  }

  const platformNames = {
    facebook: 'Facebook',
    twitter: 'Twitter', 
    youtube: 'YouTube',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok'
  }

  const icon = platformIcons[type as keyof typeof platformIcons] || '🔗'
  const name = platformNames[type as keyof typeof platformNames] || 'Social Media'

  if (type === 'facebook') {
    return `
      <div class="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded text-lg">
            ${icon}
          </div>
          <div>
            <div class="font-semibold text-sm">${name} Embed</div>
            <div class="text-xs text-gray-500 truncate">${src}</div>
          </div>
        </div>
        <iframe 
          src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(src)}&show_text=true&width=500" 
          width="500" 
          height="300" 
          style="border:none;overflow:hidden;max-width:100%;" 
          scrolling="no" 
          frameborder="0" 
          allowfullscreen="true" 
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
        <div class="mt-2 text-center">
          <a href="${src}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 text-sm underline">
            View original post on Facebook
          </a>
        </div>
      </div>
    `
  }

  if (type === 'youtube') {
    const videoId = extractYouTubeId(src)
    if (videoId) {
      return `
        <div class="border-2 border-dashed border-red-200 rounded-lg p-4 bg-red-50">
          <div class="flex items-center gap-3 mb-3">
            <div class="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded text-lg">
              ${icon}
            </div>
            <div>
              <div class="font-semibold text-sm">${name} Embed</div>
              <div class="text-xs text-gray-500 truncate">${src}</div>
            </div>
          </div>
          <iframe 
            width="560" 
            height="315" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="max-width:100%;">
          </iframe>
        </div>
      `
    }
  }

  return `
    <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center justify-center w-8 h-8 bg-gray-500 text-white rounded text-lg">
          ${icon}
        </div>
        <div>
          <div class="font-semibold text-sm">${name} Embed</div>
          <div class="text-xs text-gray-500 truncate">${src}</div>
        </div>
      </div>
      <div class="text-center py-4">
        <p class="text-sm text-gray-600 mb-2">Live ${name} content will be displayed here</p>
        <a href="${src}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 text-sm underline">
          View original content
        </a>
      </div>
    </div>
  `
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[7].length === 11) ? match[7] : null
}