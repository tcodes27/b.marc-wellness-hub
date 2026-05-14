import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote,
  Link as LinkIcon, Image as ImageIcon,
} from "lucide-react";

type Props = {
  value: unknown;
  onChange: (json: unknown) => void;
  onInsertImage?: () => Promise<string | null>;
  placeholder?: string;
};

export function RichEditor({ value, onChange, onInsertImage, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Write your post…" }),
    ],
    content: (value as any) ?? "",
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[280px] focus:outline-none [&_h2]:font-serif [&_h3]:font-serif text-espresso",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(value) && value) {
      editor.commands.setContent((value as any) ?? "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const Btn = ({
    on, active, children, label,
  }: { on: () => void; active?: boolean; children: React.ReactNode; label: string }) => (
    <button
      type="button"
      title={label}
      onClick={on}
      className={`p-2 rounded-md text-sm transition-colors ${
        active ? "bg-espresso text-ivory" : "text-espresso hover:bg-sand"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-tan/40 rounded-2xl bg-white overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-tan/30 bg-sand/30">
        <Btn label="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold size={14} />
        </Btn>
        <Btn label="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic size={14} />
        </Btn>
        <Btn label="Heading 2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2 size={14} />
        </Btn>
        <Btn label="Heading 3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          <Heading3 size={14} />
        </Btn>
        <Btn label="Bullet list" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List size={14} />
        </Btn>
        <Btn label="Numbered list" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered size={14} />
        </Btn>
        <Btn label="Quote" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote size={14} />
        </Btn>
        <Btn
          label="Link"
          on={() => {
            const url = window.prompt("URL");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().unsetLink().run();
            } else {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }
          }}
          active={editor.isActive("link")}
        >
          <LinkIcon size={14} />
        </Btn>
        {onInsertImage && (
          <Btn
            label="Image"
            on={async () => {
              const url = await onInsertImage();
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
          >
            <ImageIcon size={14} />
          </Btn>
        )}
      </div>
      <div className="p-5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
