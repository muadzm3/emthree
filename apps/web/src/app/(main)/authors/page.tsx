
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Author = {
  id: string;
  name: string;
  publicJournalCount: number;
};

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAuthors() {
      try {
        const response = await fetch(
          `${API_URL}/api/public-authors`
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil daftar penulis.");
        }

        const data = await response.json();

        setAuthors(Array.isArray(data) ? data : data.authors ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAuthors();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#292820] transition-colors duration-300 dark:bg-neutral-900 dark:text-stone-100">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/explore"
          className="text-sm text-gray-500 transition hover:text-black dark:text-stone-400 dark:hover:text-white"
        >
          ← Kembali ke Explore
        </Link>

        <header className="mb-10 mt-8 !bg-transparent">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-gray-500 dark:text-stone-400">
            EmThree Community
          </p>

          <h1 className="text-4xl font-serif md:text-5xl">
            Temukan penulis
          </h1>

          <p className="mt-4 max-w-xl leading-7 text-gray-600 dark:text-stone-300">
            Kenali orang-orang di balik cerita dan temukan
            tulisan yang menarik untuk dibaca.
          </p>
        </header>

        {loading ? (
          <p className="text-gray-500 dark:text-stone-400">
            Memuat daftar penulis...
          </p>
        ) : error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        ) : authors.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-stone-300">
            Belum ada penulis dengan jurnal publik.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <Link
                key={author.id}
                href={`/authors/${encodeURIComponent(author.id)}`}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#e9e5dc] text-xl font-serif text-stone-800 dark:bg-neutral-700 dark:text-stone-100">
                  {author.name?.charAt(0).toUpperCase() || "P"}
                </div>

                <h2 className="text-xl font-serif">
                  {author.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-stone-400">
                  {author.publicJournalCount} jurnal publik
                </p>

                <p className="mt-5 text-sm font-medium text-emerald-800 dark:text-emerald-400">
                  Lihat profil
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
