import React from "react";

import { useEditorState } from "@tiptap/react";

import { MenuButton } from "../menu-button";
import { useTiptapEditor } from "../provider";

const TwitterButton = () => {
  const { editor } = useTiptapEditor();
  const editorState = useEditorState({
    editor,
    selector({ editor }) {
      return {
        isActive: editor.isActive("twitter"),
        canSet:
          editor.isEditable &&
          editor.can().setTwitterPost({
            src: "https://twitter.com/user/status/123456",
          }),
      };
    },
  });

  const insertTwitterPost = () => {
    const src = prompt(
      "Embed Twitter/X Post",
      "https://twitter.com/user/status/123456"
    );
    if (src) {
      editor.chain().focus().setTwitterPost({ src }).run();
    }
  };

  return (
    <MenuButton
      icon="Twitter"
      tooltip="Twitter/X"
      active={editorState.isActive}
      disabled={!editorState.canSet}
      onClick={insertTwitterPost}
    />
  );
};

export default TwitterButton;

