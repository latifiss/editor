import React from "react";

import { useEditorState } from "@tiptap/react";

import { MenuButton } from "../menu-button";
import { useTiptapEditor } from "../provider";

const TikTokButton = () => {
  const { editor } = useTiptapEditor();
  const editorState = useEditorState({
    editor,
    selector({ editor }) {
      return {
        isActive: editor.isActive("tiktok"),
        canSet:
          editor.isEditable &&
          editor.can().setTikTokPost({
            src: "https://www.tiktok.com/@user/video/123456",
          }),
      };
    },
  });

  const insertTikTokPost = () => {
    const src = prompt(
      "Embed TikTok Video",
      "https://www.tiktok.com/@user/video/123456"
    );
    if (src) {
      editor.chain().focus().setTikTokPost({ src }).run();
    }
  };

  return (
    <MenuButton
      icon="TikTok"
      tooltip="TikTok"
      active={editorState.isActive}
      disabled={!editorState.canSet}
      onClick={insertTikTokPost}
    />
  );
};

export default TikTokButton;

