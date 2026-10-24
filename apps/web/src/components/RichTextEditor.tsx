
"use client";

import { useCallback, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Props = {
  initialContent?: string;
  onChange: (html: string) => void;
};

export default function RichTextEditor({
  initialContent = "",
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "journal-image",
        },
      }),
      Placeholder.configure({
        placeholder: "Mulai ceritakan harimu...",
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] outline-none text-base leading-8 text-stone-800 dark:text-neutral-200",
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  const insertImage = useCallback(async () => {
    if (!editor) return;

    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/jpeg,image/png,image/webp,image/gif";

    picker.onchange = async () => {
      const file = picker.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 5 MB.");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Silakan login terlebih dahulu.");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Upload gambar gagal.");
        }

        editor
          .chain()
          .focus()
          .setImage({ src: data.url, alt: file.name })
          .run();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengunggah gambar."
        );
      }
    };

    picker.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-3 py-2 font-bold ${
            editor.isActive("bold")
              ? "bg-emerald-100 text-emerald-800"
              : "hover:bg-stone-100 dark:hover:bg-neutral-800"
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-3 py-2 italic ${
            editor.isActive("italic")
              ? "bg-emerald-100 text-emerald-800"
              : "hover:bg-stone-100 dark:hover:bg-neutral-800"
          }`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="rounded px-3 py-2 hover:bg-stone-100 dark:hover:bg-neutral-800"
        >
          H2
        </button>

        <button
          type="button"
          onClick={insertImage}
          className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm hover:bg-stone-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          🖼️ Tambah gambar
        </button>
      </div>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .journal-image {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 1.5rem auto;
          border-radius: 0.75rem;
        }

        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #a8a29e;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
