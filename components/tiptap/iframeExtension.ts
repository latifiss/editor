import { Node, mergeAttributes } from "@tiptap/core";

const IframeExtension = Node.create({
  name: "iframe",

  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "100%" },
      height: { default: "400" },
      frameborder: { default: 0 },
      allowfullscreen: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(
        {
          class: "rounded-xl w-full",
        },
        HTMLAttributes
      ),
    ];
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src: options.src },
          });
        },
    } as any;
  },
});

export default IframeExtension;
