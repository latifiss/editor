import React from "react";

import { useEditorState } from "@tiptap/react";

import { MenuButton } from "../menu-button";
import { useTiptapEditor } from "../provider";

const FacebookButton = () => {
  const { editor } = useTiptapEditor();
  const editorState = useEditorState({
    editor,
    selector({ editor }) {
      return {
        isActive: editor.isActive("facebook"),
        canSet:
          editor.isEditable &&
          editor.can().setFacebookPost({
            src: "https://www.facebook.com/example/posts/123456",
          }),
      };
    },
  });

  const insertFacebookPost = () => {
    const src = prompt(
      "Embed Facebook Post",
      "https://www.facebook.com/example/posts/123456"
    );
    if (src) {
      editor.chain().focus().setFacebookPost({ src }).run();
    }
  };

  return (
    <MenuButton
      icon="Facebook"
      tooltip="Facebook"
      active={editorState.isActive}
      disabled={!editorState.canSet}
      onClick={insertFacebookPost}
    />
  );
};

export default FacebookButton;

