import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Minus, AlignLeft, AlignCenter, AlignRight, Sparkles, Calendar,
  MousePointerClick, Film, MessageSquareQuote,
} from "lucide-react";

type Props = {
  value: unknown;
  onChange: (json: unknown) => void;
  onInsertImage?: () => Promise<string | null>;
  placeholder?: string;
};

export function RichEditor({ value, onChange, onInsertImage, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Begin your story…" }),
    ],
    content: (value as any) ?? "",
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[420px] focus:outline-none " +
          "[&_h1]:font-serif [&_h1]:text-3xl [&_h1]:mt-8 [&_h1]:mb-3 " +
          "[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-7 [&_h2]:mb-2 " +
          "[&_h3]:font-serif [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-2 " +
          "[&_blockquote]:border-l-2 [&_blockquote]:border-espresso/40 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-clay " +
          "[&_hr]:my-10 [&_hr]:border-tan/40 " +
          "[&_a]:text-espresso [&_a]:underline [&_a]:underline-offset-4 " +
          "text-espresso leading-relaxed",
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

  const Sep = () => <span className="w-px self-stretch bg-tan/40 mx-1" />;

  // Insert structured "blocks" by injecting pre-styled content.
  const insertCallout = () => {
    editor.chain().focus().insertContent({
      type: "blockquote",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Editorial callout — share a meaningful note, intention, or invitation." }] }],
    }).run();
  };

  const insertWellnessTip = () => {
    editor.chain().focus().insertContent([
      { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "✦ Wellness Tip" }] },
      { type: "paragraph", content: [{ type: "text", text: "Slow your morning. Begin with breath, water, and movement before you reach for your phone." }] },
      { type: "horizontalRule" },
    ]).run();
  };

  const insertEventBanner = () => {
    editor.chain().focus().insertContent([
      { type: "horizontalRule" },
      { type: "heading", attrs: { level: 2, textAlign: "center" }, content: [{ type: "text", text: "Upcoming Event" }] },
      { type: "paragraph", attrs: { textAlign: "center" }, content: [{ type: "text", text: "Add date · location · short description here." }] },
      { type: "paragraph", attrs: { textAlign: "center" }, content: [
        { type: "text", marks: [{ type: "link", attrs: { href: "https://" } }, { type: "bold" }], text: "Reserve your spot →" },
      ] },
      { type: "horizontalRule" },
    ]).run();
  };

  const insertButton = () => {
    const url = window.prompt("Button URL", "https://");
    if (!url) return;
    const label = window.prompt("Button label", "Learn more") ?? "Learn more";
    editor.chain().focus().insertContent({
      type: "paragraph",
      attrs: { textAlign: "center" },
      content: [{ type: "text", marks: [{ type: "link", attrs: { href: url, class: "btn-inline" } }, { type: "bold" }], text: `→ ${label}` }],
    }).run();
  };

  const insertEmbed = () => {
    const url = window.prompt("Embed URL (YouTube, Spotify, Vimeo, IG…)") ?? "";
    if (!url) return;
    editor.chain().focus().insertContent([
      { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: `[Embed placeholder — ${url}] · Will render on the published page.` }] }] },
    ]).run();
  };

  return (
    <div className="border border-tan/40 rounded-2xl bg-white overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-tan/30 bg-sand/30 sticky top-0 z-10">
        <Btn label="H1" on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}><Heading1 size={14} /></Btn>
        <Btn label="H2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 size={14} /></Btn>
        <Btn label="H3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 size={14} /></Btn>
        <Sep />
        <Btn label="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold size={14} /></Btn>
        <Btn label="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic size={14} /></Btn>
        <Btn label="Underline" on={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><UnderlineIcon size={14} /></Btn>
        <Sep />
        <Btn label="Bullet list" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List size={14} /></Btn>
        <Btn label="Numbered list" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered size={14} /></Btn>
        <Btn label="Quote" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote size={14} /></Btn>
        <Sep />
        <Btn label="Align left" on={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}><AlignLeft size={14} /></Btn>
        <Btn label="Align center" on={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}><AlignCenter size={14} /></Btn>
        <Btn label="Align right" on={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}><AlignRight size={14} /></Btn>
        <Sep />
        <Btn label="Divider" on={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></Btn>
        <Btn
          label="Link"
          on={() => {
            const url = window.prompt("URL");
            if (url === null) return;
            if (url === "") editor.chain().focus().unsetLink().run();
            else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
        ><LinkIcon size={14} /></Btn>
        {onInsertImage && (
          <Btn label="Image" on={async () => {
            const url = await onInsertImage();
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}><ImageIcon size={14} /></Btn>
        )}
        <Sep />
        <Btn label="Callout" on={insertCallout}><MessageSquareQuote size={14} /></Btn>
        <Btn label="Wellness tip" on={insertWellnessTip}><Sparkles size={14} /></Btn>
        <Btn label="Event banner" on={insertEventBanner}><Calendar size={14} /></Btn>
        <Btn label="Button / CTA" on={insertButton}><MousePointerClick size={14} /></Btn>
        <Btn label="Embed" on={insertEmbed}><Film size={14} /></Btn>
      </div>
      <div className="p-6 sm:p-10 bg-ivory/40">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
