import React from "react";

import { MenuButton } from "../menu-button";
import { useTiptapEditor } from "../provider";
import { DropdownMenuItem } from "../ui/dropdown";

const InsertDropdown = () => {
  const { editor } = useTiptapEditor();

  const toggleCodeBlock = () =>
    editor.chain().focus().clearNodes().toggleCodeBlock().run();

  const toggleBlockquote = () =>
    editor.chain().focus().clearNodes().toggleBlockquote().run();

  const insertYoutube = () => {
    const src = prompt(
      "Embed Youtube Video",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
    if (src) {
      editor.chain().focus().setYoutubeVideo({ src }).run();
    }
  };

  const insertFacebook = () => {
    const src = prompt(
      "Embed Facebook Post",
      "https://www.facebook.com/example/posts/123456"
    );
    if (src) {
      editor.chain().focus().setFacebookPost({ src }).run();
    }
  };

  const insertInstagram = () => {
    const src = prompt(
      "Embed Instagram Post",
      "https://www.instagram.com/p/ABC123/"
    );
    if (src) {
      editor.chain().focus().setInstagramPost({ src }).run();
    }
  };

  const insertTwitter = () => {
    const src = prompt(
      "Embed Twitter/X Post",
      "https://twitter.com/user/status/123456"
    );
    if (src) {
      editor.chain().focus().setTwitterPost({ src }).run();
    }
  };

  const insertTikTok = () => {
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
      type="dropdown"
      tooltip="Insert"
      disabled={!editor?.isEditable}
      icon="Plus"
      dropdownStyle={{ minWidth: "8rem" }}
    >
      <DropdownMenuItem asChild>
        <MenuButton
          text="Blockquote"
          hideText={false}
          tooltip={false}
          icon="Quote"
          onClick={toggleBlockquote}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuButton
          text="Code block"
          hideText={false}
          tooltip={false}
          icon="CodeBlock"
          onClick={toggleCodeBlock}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuButton
          text="Youtube"
          hideText={false}
          tooltip={false}
          icon="Youtube"
          onClick={insertYoutube}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuButton
          text="Facebook"
          hideText={false}
          tooltip={false}
          icon="Facebook"
          onClick={insertFacebook}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuButton
          text="Instagram"
          hideText={false}
          tooltip={false}
          icon="Instagram"
          onClick={insertInstagram}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuButton
          text="Twitter/X"
          hideText={false}
          tooltip={false}
          icon="Twitter"
          onClick={insertTwitter}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuButton
          text="TikTok"
          hideText={false}
          tooltip={false}
          icon="TikTok"
          onClick={insertTikTok}
        />
      </DropdownMenuItem>
    </MenuButton>
  );
};

export default InsertDropdown;
