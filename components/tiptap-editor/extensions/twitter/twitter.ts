/** @jsxImportSource @tiptap/core */
import { Node, mergeAttributes } from "@tiptap/core";

import { getEmbedUrlFromTwitterUrl } from "./utils";

type SetTwitterPostOptions = {
  src: string;
  width?: number;
  height?: number;
};

export const Twitter = Node.create({
  name: "twitter",

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
        tag: "div[data-type='twitter']",
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
        "data-type": "twitter",
        "data-src": HTMLAttributes.src,
        class: "social-embed social-embed-twitter",
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
      setTwitterPost:
        (options: SetTwitterPostOptions) =>
        ({ commands }) => {
          const embedUrl = getEmbedUrlFromTwitterUrl({
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

