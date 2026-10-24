
"use client";

import DOMPurify from "dompurify";

type Props = {
  content: string;
};

export default function JournalContent({ content }: Props) {
  const safeHtml = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
  });

  return (
    <>
      <style jsx global>{`
        .journal-content {
          overflow-wrap: anywhere;
          line-height: 1.9;
        }

        .journal-content p {
          margin: 1rem 0;
        }

        .journal-content h2 {
          margin: 1.75rem 0 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .journal-content img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 1.5rem auto;
          border-radius: 0.75rem;
        }

        .journal-content ul {
          list-style: disc;
          padding-left: 1.5rem;
        }

        .journal-content ol {
          list-style: decimal;
          padding-left: 1.5rem;
        }
      `}</style>

      <article
        className="journal-content"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </>
  );
}
