"use client";

import { Editor } from "@tiptap/react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  UnderlineIcon,
  List as BulletListIcon,
  Image as ImageIcon,
  Loader2,
  Share2,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Music,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface EditorMenuProps {
  editor: Editor | null;
  onAddImage: () => void;
  isUploading?: boolean;
}

export const EditorMenu = ({ editor, onAddImage, isUploading = false }: EditorMenuProps) => {
  const [isActive, setIsActive] = useState({
    heading1: false,
    heading2: false,
    heading3: false,
    paragraph: false,
    bold: false,
    italic: false,
    underline: false,
    bulletList: false,
  });
  
  const [showEmbedMenu, setShowEmbedMenu] = useState(false);

  // Update active states when editor changes
  const updateActiveStates = useCallback(() => {
    if (!editor) return;
    
    setIsActive({
      heading1: editor.isActive("heading", { level: 1 }),
      heading2: editor.isActive("heading", { level: 2 }),
      heading3: editor.isActive("heading", { level: 3 }),
      paragraph: editor.isActive("paragraph"),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      bulletList: editor.isActive("bulletList"),
    });
  }, [editor]);

  // Listen to editor state changes
  useEffect(() => {
    if (!editor) return;

    editor.on('transaction', updateActiveStates);
    editor.on('selectionUpdate', updateActiveStates);
    editor.on('update', updateActiveStates);

    return () => {
      editor.off('transaction', updateActiveStates);
      editor.off('selectionUpdate', updateActiveStates);
      editor.off('update', updateActiveStates);
    };
  }, [editor, updateActiveStates]);

 const addEmbed = (platform: string) => {
  if (!editor) return;

  const url = prompt(`Enter ${platform} URL:`);
  if (!url) return;

  if (!url.startsWith('http')) {
    alert('Please enter a valid URL starting with http:// or https://');
    return;
  }

  try {
    editor.commands.setEmbed({ 
      src: url, 
      type: platform 
    });
  } catch (error) {
    console.error('Error adding embed:', error);
    editor.commands.insertContent(`
      <div class="embed-wrapper border-2 border-dashed border-gray-300 rounded-lg p-4 my-4 bg-gray-50">
        <div class="text-center">
          <p class="font-semibold">${platform.charAt(0).toUpperCase() + platform.slice(1)} Embed</p>
          <p class="text-sm text-gray-600 mt-1">${url}</p>
        </div>
      </div>
    `);
  }
  
  setShowEmbedMenu(false);
};


  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-2 text-sm rounded-md border transition flex items-center justify-center
     ${active ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}
     ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`;

  return (
    <div className="w-full mb-2 rounded-lg p-2 bg-gray-50 border-[0.8px] border-[#e0e0e0]">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={btn(isActive.heading1)}
          title="Heading 1"
          disabled={isUploading}
        >
          <Heading1 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btn(isActive.heading2)}
          title="Heading 2"
          disabled={isUploading}
        >
          <Heading2 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btn(isActive.heading3)}
          title="Heading 3"
          disabled={isUploading}
        >
          <Heading3 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btn(isActive.paragraph)}
          title="Paragraph"
          disabled={isUploading}
        >
          <Pilcrow size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(isActive.bold)}
          title="Bold"
          disabled={isUploading}
        >
          <BoldIcon size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(isActive.italic)}
          title="Italic"
          disabled={isUploading}
        >
          <ItalicIcon size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btn(isActive.underline)}
          title="Underline"
          disabled={isUploading}
        >
          <UnderlineIcon size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(isActive.bulletList)}
          title="Bullet List"
          disabled={isUploading}
        >
          <BulletListIcon size={18} />
        </button>

        {/* Image Upload Button */}
        <button
          onClick={onAddImage}
          disabled={isUploading}
          className={`p-2 text-sm rounded-md border transition flex items-center justify-center
            ${isUploading 
              ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed" 
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          title={isUploading ? "Uploading..." : "Insert Image"}
        >
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowEmbedMenu(!showEmbedMenu)}
            disabled={isUploading}
            className={`p-2 text-sm rounded-md border transition flex items-center justify-center
              ${isUploading 
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            title="Add Social Media Embed"
          >
            <Share2 size={18} />
          </button>

          {showEmbedMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 mb-2 px-2">Add Embed</div>
                
                <button
                  onClick={() => addEmbed('facebook')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Facebook size={16} className="text-blue-600" />
                  Facebook
                </button>
                
                <button
                  onClick={() => addEmbed('twitter')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Twitter size={16} className="text-blue-400" />
                  Twitter
                </button>
                
                <button
                  onClick={() => addEmbed('youtube')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Youtube size={16} className="text-red-600" />
                  YouTube
                </button>
                
                <button
                  onClick={() => addEmbed('instagram')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                >
                  <Instagram size={16} className="text-pink-600" />
                  Instagram
                </button>
                
                <button
                  onClick={() => addEmbed('linkedin')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Linkedin size={16} className="text-blue-700" />
                  LinkedIn
                </button>
                
                <button
                  onClick={() => addEmbed('tiktok')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Music size={16} className="text-[#000000]" />
                  TikTok
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEmbedMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowEmbedMenu(false)}
        />
      )}
    </div>
  );
};