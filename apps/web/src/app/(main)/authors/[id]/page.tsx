"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import JournalPreview from "@/components/JournalPreview";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Journal = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type Author = {
  id: string;
  name: string;
};

function AuthorProfileContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [author, setAuthor] = useState<Author | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(
          `${API_URL}/api/public-authors/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
          throw new Error("Profil penulis tidak ditemukan.");
        }

        const data = await response.json();

        setAuthor(data.author);
        setJournals(data.journals ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f6] p-10 text-stone-500 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-400">
        Memuat profil...
      </main>
    );
  }

  if (error || !author) {
    return (
      <main className="min-h-screen bg-[#faf9f6] p-10 text-[#292820] transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
        <p>{error || "Profil tidak ditemukan."}</p>
        <Link
          href="/authors"
          className="mt-4 inline-block text-emerald-800 underline hover:text-emerald-600 dark:text-emerald-300"
        >
          Kembali ke daftar penulis
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#292820] transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/authors"
          className="text-sm text-gray-500 transition hover:text-black dark:text-neutral-400 dark:hover:text-white"
        >
          ← Semua penulis
        </Link>

        <section className="mb-12 mt-8 border-b border-gray-200 pb-10 dark:border-neutral-800">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e9e5dc] text-3xl font-serif text-emerald-950 dark:bg-neutral-800 dark:text-emerald-200">
            {author.name.charAt(0).toUpperCase()}
          </div>

          <p className="mb-3 mt-6 text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-400">
            Profil penulis
          </p>

          <h1 className="text-4xl font-serif md:text-5xl">
            {author.name}
          </h1>

          <p className="mt-4 text-gray-600 dark:text-neutral-400">
            {journals.length} jurnal publik
          </p>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-serif">
            Tulisan dari {author.name}
          </h2>

          {journals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
              Penulis ini belum memiliki jurnal publik.
            </div>
          ) : (
            <div className="space-y-5">
              {journals.map((journal) => (
                <article
                  key={journal.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <h3 className="text-xl font-serif">
                    <Link
                      href={`/explore/${encodeURIComponent(journal.id)}`}
                      className="transition hover:text-emerald-700 hover:underline dark:hover:text-emerald-300"
                    >
                      {journal.title}
                    </Link>
                  </h3>

                  <div className="mt-3 whitespace-pre-wrap break-words leading-7 text-gray-600 dark:text-neutral-300">
                    <JournalPreview content={journal.content} />
                  </div>

                  <p className="mt-4 text-xs text-gray-500 dark:text-neutral-500">
                    Diperbarui{" "}
                    {new Date(journal.updatedAt).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>

                  <Link
                    href={`/explore/${encodeURIComponent(journal.id)}`}
                    className="mt-4 inline-block text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-300"
                  >
                    Baca selengkapnya →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function AuthorProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#faf9f6] p-10 text-stone-500 dark:bg-neutral-950 dark:text-neutral-400">
          Memuat profil...
        </main>
      }
    >
      <AuthorProfileContent />
    </Suspense>
  );
}