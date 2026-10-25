
"use client";

import DOMPurify from "dompurify";

type Props = {
  content: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

export default function JournalPreview({ content }: Props) {
  const safeHtml = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
  });

  const parser = new DOMParser();
  const documentHtml = parser.parseFromString(safeHtml, "text/html");

  const image = documentHtml.querySelector("img");
  const imageSrc = image?.getAttribute("src");

  const resolvedImageSrc = imageSrc?.replace(
    /^https?:\/\/localhost:3001(?=\/uploads\/)/,
    API_URL
  );

  const text = documentHtml.body.textContent?.trim() || "";

  return (
    <div className="mt-4 flex items-start gap-4">
      {resolvedImageSrc && (
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-neutral-800 sm:h-36 sm:w-36">
          <img
            src={resolvedImageSrc}
            alt={image?.getAttribute("alt") || "Gambar jurnal"}
            className="block h-full w-full object-cover"
            onError={(event) => {
              console.error(
                "Gagal memuat gambar jurnal:",
                resolvedImageSrc,
                event.currentTarget
              );
            }}
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="line-clamp-4 break-words text-sm leading-7 text-stone-600 dark:text-stone-300">
          {text || "Belum ada tulisan."}
        </p>
      </div>
    </div>
  );
}
