/** @jsxImportSource @tiptap/core */
import { Node, mergeAttributes } from "@tiptap/core";

import { getEmbedUrlFromInstagramUrl } from "./utils";

type SetInstagramPostOptions = {
  src: string;
  width?: number;
  height?: number;
};

export const Instagram = Node.create({
  name: "instagram",

  group: "block",

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => Number.parseInt(element.style.width) || null,
        renderHTML: (attrs) =>
          attrs.width ? { style: `width: ${attrs.width}%` } : {},
      },
      height: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-type='instagram']",
        getAttrs: (element) => {
          if (typeof element === "string") return {};
          const dom = element as HTMLElement;
          return {
            src: dom.getAttribute("data-src"),
            width: dom.getAttribute("data-width")
              ? Number.parseInt(dom.getAttribute("data-width") || "100")
              : null,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        "data-type": "instagram",
        "data-src": HTMLAttributes.src,
        class: "social-embed social-embed-instagram",
        style: `width: ${HTMLAttributes.width || 100}%`,
      },
      [
        "iframe",
        mergeAttributes(
          {
            src: HTMLAttributes.src,
            width: "100%",
            frameborder: "0",
            scrolling: "no",
            allowtransparency: "true",
            style: "border: none; overflow: hidden;",
          },
          HTMLAttributes
        ),
      ],
    ];
  },

  addCommands() {
    return {
      setInstagramPost:
        (options: SetInstagramPostOptions) =>
        ({ commands }) => {
          const embedUrl = getEmbedUrlFromInstagramUrl({
            url: options.src,
          });

          if (!embedUrl) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: { ...options, src: embedUrl },
          });
        },
    };
  },
});

