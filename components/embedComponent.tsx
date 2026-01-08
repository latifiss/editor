import { NodeViewWrapper } from '@tiptap/react'
import { Facebook, Twitter, Youtube, Instagram, Linkedin, Music, ExternalLink } from 'lucide-react'

interface EmbedComponentProps {
  node: {
    attrs: {
      src: string
      type: string
    }
  }
}

const getPlatformIcon = (type: string) => {
  switch (type) {
    case 'facebook': return <Facebook size={20} className="text-blue-600" />
    case 'twitter': return <Twitter size={20} className="text-blue-400" />
    case 'youtube': return <Youtube size={20} className="text-red-600" />
    case 'instagram': return <Instagram size={20} className="text-pink-600" />
    case 'linkedin': return <Linkedin size={20} className="text-blue-700" />
    case 'tiktok': return <Music size={20} className="text-black" />
    default: return <ExternalLink size={20} />
  }
}

const getPlatformName = (type: string) => {
  switch (type) {
    case 'facebook': return 'Facebook'
    case 'twitter': return 'Twitter'
    case 'youtube': return 'YouTube'
    case 'instagram': return 'Instagram'
    case 'linkedin': return 'LinkedIn'
    case 'tiktok': return 'TikTok'
    default: return 'Social Media'
  }
}

const generateEmbedPreview = (src: string, type: string) => {
  if (type === 'youtube') {
    const videoId = src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    if (videoId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-48 rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }
  }

  if (type === 'twitter') {
    const tweetId = src.match(/status\/(\d+)/)?.[1]
    if (tweetId) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
              <Twitter size={16} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">Twitter User</div>
              <div className="text-xs text-gray-500">@username</div>
            </div>
          </div>
          <p className="text-sm text-gray-800 mb-2">This is a preview of the tweet content.</p>
          <div className="text-xs text-gray-500">View original tweet for full content</div>
        </div>
      )
    }
  }

  if (type === 'instagram') {
    return (
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="flex items-center gap-2 p-3 border-b border-gray-300">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
          <span className="font-semibold text-sm">instagram_user</span>
        </div>
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <Instagram size={32} className="text-gray-400" />
        </div>
        <div className="p-3">
          <div className="text-sm text-gray-800">Instagram post preview</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-3">
        {getPlatformIcon(type)}
      </div>
      <h4 className="font-semibold text-gray-800 mb-1">{getPlatformName(type)} Content</h4>
      <p className="text-sm text-gray-600 mb-3">Live content will be embedded when published</p>
      <a 
        href={src} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        <ExternalLink size={14} />
        View original content
      </a>
    </div>
  )
}

export const EmbedComponent = ({ node }: EmbedComponentProps) => {
  const { src, type } = node.attrs

  return (
    <NodeViewWrapper className="social-embed my-4" data-drag-handle>
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            {getPlatformIcon(type)}
            <span className="font-semibold text-sm text-gray-700">
              {getPlatformName(type)} Embed
            </span>
          </div>
          <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
            Embed
          </div>
        </div>

        <div className="p-4">
          {generateEmbedPreview(src, type)}
        </div>

        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 truncate flex-1 mr-2">
              {src}
            </span>
            <a 
              href={src} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium whitespace-nowrap"
            >
              <ExternalLink size={12} />
              Open
            </a>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}