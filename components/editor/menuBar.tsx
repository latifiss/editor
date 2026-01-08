import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold as BoldIcon,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic as ItalicIcon,
  List as ListIcon,
  ListOrdered,
  Strikethrough,
} from "lucide-react";
  import { Editor } from "@tiptap/react";
  import { useEffect, useState } from "react";

  export default function MenuBar({ editor }: { editor: Editor | null }) {
    const [, setState] = useState(0);
    useEffect(() => {
      if (!editor) return;
      const update = () => setState((s) => s + 1);
      editor.on("update", update);
      editor.on("selectionUpdate", update);
      return () => {
        editor.off("update", update);
        editor.off("selectionUpdate", update);
      };
    }, [editor]);

    if (!editor) return null;

    const chain = () => editor.chain().focus();

    const options = [
      {
        icon: <Heading1 className="size-4" />,
        onClick: () => chain().toggleHeading({ level: 1 }).run(),
        pressed: editor.isActive("heading", { level: 1 }),
      },
      {
        icon: <Heading2 className="size-4" />,
        onClick: () => chain().toggleHeading({ level: 2 }).run(),
        pressed: editor.isActive("heading", { level: 2 }),
      },
      {
        icon: <Heading3 className="size-4" />,
        onClick: () => chain().toggleHeading({ level: 3 }).run(),
        pressed: editor.isActive("heading", { level: 3 }),
      },
      {
        icon: <BoldIcon className="size-4" />,
        onClick: () => chain().toggleBold().run(),
        pressed: editor.isActive("bold"),
      },
      {
        icon: <ItalicIcon className="size-4" />,
        onClick: () => chain().toggleItalic().run(),
        pressed: editor.isActive("italic"),
      },
      {
        icon: <Strikethrough className="size-4" />,
        onClick: () => chain().toggleStrike().run(),
        pressed: editor.isActive("strike"),
      },
      {
        icon: <AlignLeft className="size-4" />,
        onClick: () => chain().setTextAlign("left").run(),
        pressed: editor.isActive({ textAlign: "left" }),
      },
      {
        icon: <AlignCenter className="size-4" />,
        onClick: () => chain().setTextAlign("center").run(),
        pressed: editor.isActive({ textAlign: "center" }),
      },
      {
        icon: <AlignRight className="size-4" />,
        onClick: () => chain().setTextAlign("right").run(),
        pressed: editor.isActive({ textAlign: "right" }),
      },
      {
        icon: <ListIcon className="size-4" />,
        onClick: () => chain().toggleBulletList().run(),
        pressed: editor.isActive("bulletList"),
      },
      {
        icon: <ListOrdered className="size-4" />,
        onClick: () => chain().toggleOrderedList().run(),
        pressed: editor.isActive("orderedList"),
      },
      {
        icon: <Highlighter className="size-4" />,
        onClick: () => chain().toggleHighlight().run(),
        pressed: editor.isActive("highlight"),
      },
    ];

    const btnClass = (active: boolean) =>
      `p-1 text-sm rounded-md border transition flex items-center justify-center ${
        active
          ? "bg-black text-white border-black"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }`;

    return (
      <div className="border rounded-md p-1 mb-1 bg-slate-50 space-x-2 z-50">
        {options.map((opt, i) => (
          <button key={i} onClick={opt.onClick} className={btnClass(opt.pressed)}>
            {opt.icon}
          </button>
        ))}
      </div>
    );
  }
