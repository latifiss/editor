"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Iframe } from "@/components/tiptap/iFrame";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

export interface TiptapEditorRef {
  getHTML: () => string;
  getText: () => string;
  setContent: (content: string) => void;
  clearContent: () => void;
}

interface EditorProps {
  output?: "html" | "json";
  minHeight?: number;
  maxHeight?: number;
  placeholder?: {
    paragraph?: string;
    imageCaption?: string;
  };
  onInit?: () => void;
}

const TiptapEditor = forwardRef<TiptapEditorRef, EditorProps>(({
  output = "html",
  minHeight = 320,
  maxHeight = 640,
  placeholder = {
    paragraph: "Write something…",
    imageCaption: "Type caption for image (optional)",
  },
  onInit
}, ref) => {
  const [mounted, setMounted] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder.paragraph,
      }),
      Iframe,
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
    },
  });

  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
    getText: () => editor?.getText() || '',
    setContent: (content: string) => {
      if (editor) {
        try {
          editor.commands.clearContent();
          
          setTimeout(() => {
            if (editor && content) {
              editor.commands.setContent(content, false);
            }
          }, 10);
        } catch (error) {
          console.error('Error setting editor content:', error);
        }
      }
    },
    clearContent: () => {
      if (editor) {
        editor.commands.clearContent();
      }
    },
  }));

  useEffect(() => {
    setMounted(true);
    if (onInit) onInit();
  }, [onInit]);

  const addImage = () => {
    const url = prompt("Image URL:");
    if (url) editor?.commands.setImage({ src: url });
  };

  const addEmbed = () => {
    const url = prompt("Paste iframe src URL:");
    if (url)
      editor?.commands.insertContent({
        type: "iframe",
        attrs: { src: url },
      });
  };

  if (!mounted || !editor) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Bullet List
        </button>

        <button
          type="button"
          onClick={addImage}
          className="px-3 py-1 bg-gray-200 rounded text-sm"
        >
          Image
        </button>

        <button
          type="button"
          onClick={addEmbed}
          className="px-3 py-1 bg-gray-200 rounded text-sm"
        >
          Embed
        </button>
      </div>

      <div 
        className="border rounded-lg p-4 prose max-w-none"
        style={{ 
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: 'auto'
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;