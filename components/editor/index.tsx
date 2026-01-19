"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorMenu } from "./editorMenu";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { uploadImage } from "@/utils/uploadImage";
import { useState } from "react";
import { Embed } from "@/extensions/embed"; 

export default function RichTextEditor() {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class:
            "max-w-full h-auto rounded-lg my-4 border border-gray-200 mx-auto block",
        },
      }),
      Embed,
    ],

    content: "<p>Hello World!</p>",

    editorProps: {
      attributes: {
        class:
          "flex-1 resize-none outline-none text-sm font-semibold text-gray-900 bg-transparent " +
          "dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-32",
      },
    },

    immediatelyRender: false,
  });

  if (editor && typeof window !== "undefined") {
    (window as any).editor = editor;
  }

  const addImage = async () => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.match("image.*")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("Image size must be less than 5MB");
        return;
      }

      setIsUploading(true);

      try {
        const imageUrl = await uploadImage(file);

        editor.commands.insertContent(
          `<img src="${imageUrl}" 
                 class="max-w-full h-auto rounded-lg my-4 border border-gray-200 shadow-sm mx-auto block" />`
        );
      } catch (error) {
        console.error("Error uploading image:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        alert(`Error uploading image: ${errorMessage}`);
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  };

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="relative flex flex-col items-start font-semibold text-gray-900 rounded-md px-3 py-2 bg-[#fcfcfc] border-[0.8px] border-[#e0e0e0] dark:bg-neutral-800 dark:border-neutral-700 focus-within:border-green-500 focus-within:border-2 transition-colors w-[310px] min-h-64">
      <EditorMenu editor={editor} onAddImage={addImage} isUploading={isUploading} />

      <EditorContent
        editor={editor}
        className="w-full 
          [&_.ProseMirror]:outline-none 
          [&_.ProseMirror]:min-h-32 

          [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:my-4
          [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:my-3
          [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:my-2

          [&_.ProseMirror_p]:my-2

          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 
          [&_.ProseMirror_li]:my-1 

          [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded-lg 
          [&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:border [&_.ProseMirror_img]:border-gray-200 
          [&_.ProseMirror_img]:shadow-sm [&_.ProseMirror_img]:mx-auto [&_.ProseMirror_img]:block

          /* EMBED STYLING */
          [&_.embed-wrapper]:my-4
          [&_.embed-wrapper_iframe]:rounded-xl 
        "
      />

      {isUploading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-black/40 flex items-center justify-center rounded-md">
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 px-3 py-2 rounded-lg shadow-sm">
            Uploading image...
          </div>
        </div>
      )}
    </div>
  );
}
