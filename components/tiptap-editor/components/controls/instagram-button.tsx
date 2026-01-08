import React from "react";

import { useEditorState } from "@tiptap/react";

import { MenuButton } from "../menu-button";
import { useTiptapEditor } from "../provider";

const InstagramButton = () => {
  const { editor } = useTiptapEditor();
  const editorState = useEditorState({
    editor,
    selector({ editor }) {
      return {
        isActive: editor.isActive("instagram"),
        canSet:
          editor.isEditable &&
          editor.can().setInstagramPost({
            src: "https://www.instagram.com/p/ABC123/",
          }),
      };
    },
  });

  const insertInstagramPost = () => {
    const src = prompt(
      "Embed Instagram Post",
      "https://www.instagram.com/p/ABC123/"
    );
    if (src) {
      editor.chain().focus().setInstagramPost({ src }).run();
    }
  };

  return (
    <MenuButton
      icon="Instagram"
      tooltip="Instagram"
      active={editorState.isActive}
      disabled={!editorState.canSet}
      onClick={insertInstagramPost}
    />
  );
};

export default InstagramButton;

