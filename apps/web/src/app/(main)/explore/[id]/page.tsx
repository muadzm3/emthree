
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import JournalInteractions from "../../../../components/JournalInteractions";
import JournalPreview from "@/components/JournalPreview";
import JournalContent from "@/components/JournalContent";

type PublicJournal = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PublicJournalDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [journal, setJournal] = useState<PublicJournal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchJournal() {
      try {
        const response = await fetch(
          `${API_URL}/api/public-journals/${encodeURIComponent(id)}`
        );

        if (response.status === 404) {
          throw new Error(
            "Jurnal tidak ditemukan atau tidak tersedia untuk publik."
          );
        }

        if (!response.ok) {
          throw new Error("Gagal mengambil detail jurnal.");
        }

        const data = await response.json();
        setJournal(data.journal);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil jurnal."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchJournal();
  }, [id]);

  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900 transition-colors duration-300 dark:bg-[#171717] dark:text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-200 bg-transparent dark:border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">

          <Link
            href="/explore"
            className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Kembali ke Explore
          </Link>
        </div>
      </header>

      {/* Isi jurnal */}
      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        {loading ? (
          <p className="py-16 text-center text-stone-500 dark:text-stone-400">
            Memuat jurnal...
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <h1 className="text-2xl font-bold">
              Jurnal tidak tersedia
            </h1>

            <p className="mt-3 leading-7 text-stone-600 dark:text-stone-300">
              {error}
            </p>

            <Link
              href="/explore"
              className="mt-6 inline-block rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
              Kembali ke Explore
            </Link>
          </div>
        ) : journal ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">
              Jurnal publik
            </p>

            <h1 className="mt-5 break-words text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {journal.title}
            </h1>

            <p className="mt-4 text-stone-600 dark:text-stone-300">
              Oleh{" "}
              <Link
                href={`/authors/${encodeURIComponent(journal.user.id)}`}
                className="font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
              >
                {journal.user.name}
              </Link>
            </p>

            <div className="mt-6 border-b border-stone-200 pb-6 text-sm text-stone-500 dark:border-neutral-800 dark:text-stone-400">
              Diperbarui pada{" "}
              {new Date(journal.updatedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-stone-700 sm:text-lg sm:leading-9 dark:text-stone-200">
              <JournalContent content={journal.content} />
            </div>

            <div className="mt-10">
              <JournalInteractions journalId={journal.id} />
            </div>

            <div className="mt-12 border-t border-stone-200 pt-6 dark:border-neutral-800">
              <Link
                href="/explore"
                className="font-semibold text-emerald-800 transition hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Jelajahi tulisan lainnya
              </Link>
            </div>
          </>
        ) : null}
      </article>

      {/* Footer */}
      <footer className="border-t border-stone-200 px-5 py-6 text-center text-sm text-stone-500 dark:border-neutral-800 dark:text-stone-400">
        EmThree — ruang untuk menulis dan berbagi cerita.
      </footer>
    </main>
  );
}
