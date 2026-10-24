
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import JournalPreview from "@/components/JournalPreview";

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
  _count: {
  likes: number;
  comments: number;
  bookmarks: number;
  };
};

type SortOption = "newest" | "oldest" | "title";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ExplorePage() {
  const [journals, setJournals] = useState<PublicJournal[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPublicJournals() {
      try {
        const response = await fetch(
          `${API_URL}/api/public-journals`
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil jurnal publik.");
        }

        const data = await response.json();
        setJournals(data.journals ?? []);
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

    fetchPublicJournals();
  }, []);

  const filteredJournals = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return journals
      .filter(
        (journal) =>
          journal.title.toLowerCase().includes(keyword) ||
          journal.content.toLowerCase().includes(keyword)
      )
      .sort((a, b) => {
        if (sort === "title") {
          return a.title.localeCompare(b.title, "id");
        }

        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();

        return sort === "newest"
          ? dateB - dateA
          : dateA - dateB;
      });
  }, [journals, search, sort]);

  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900 transition-colors duration-300 dark:bg-neutral-900 dark:text-stone-100">
      <section className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">
          Explore EmThree
        </p>

        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Temukan cerita yang membuka perspektif baru.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300 sm:text-lg">
          Baca pengalaman, gagasan, dan cerita yang dibagikan
          secara publik oleh komunitas EmThree.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div>
            <label
              htmlFor="journal-search"
              className="mb-2 block text-sm font-semibold"
            >
              Cari jurnal
            </label>

            <input
              id="journal-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari berdasarkan judul atau isi..."
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 dark:border-neutral-600 dark:bg-neutral-800 dark:text-stone-100 dark:placeholder:text-stone-400 dark:focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="journal-sort"
              className="mb-2 block text-sm font-semibold"
            >
              Urutkan berdasarkan
            </label>

            <select
              id="journal-sort"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as SortOption)
              }
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-emerald-800 dark:border-neutral-600 dark:bg-neutral-800 dark:text-stone-100 dark:focus:border-emerald-500"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="title">Judul A–Z</option>
            </select>
          </div>
        </div>

        <div className="mb-6 mt-8 flex items-center justify-between border-b border-stone-200 pb-4 dark:border-neutral-700">
          <h2 className="text-xl font-bold">
            Tulisan komunitas
          </h2>

          <span className="text-sm text-stone-500 dark:text-stone-400">
            {filteredJournals.length} tulisan
          </span>
        </div>

        {loading ? (
          <p className="py-12 text-stone-500 dark:text-stone-400">
            Memuat jurnal publik...
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-3 font-semibold underline"
            >
              Coba lagi
            </button>
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center dark:border-neutral-600 dark:bg-neutral-800">
            <h3 className="text-xl font-bold">
              {search.trim()
                ? "Jurnal tidak ditemukan"
                : "Belum ada jurnal publik"}
            </h3>

            <p className="mx-auto mt-3 max-w-md leading-7 text-stone-600 dark:text-stone-300">
              {search.trim()
                ? "Coba kata kunci lain atau periksa ejaan pencarianmu."
                : "Jurnal yang sudah dipublikasikan secara umum akan muncul di sini."}
            </p>

            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredJournals.map((journal) => (
              <article
                key={journal.id}
                className="rounded-2xl border border-stone-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Emthree
                </p>

                <h3 className="mt-3 break-words text-2xl font-bold leading-snug tracking-tight">
                  <Link
                    href={`/explore/${encodeURIComponent(journal.id)}`}
                    className="transition-colors hover:text-emerald-800 hover:underline dark:hover:text-emerald-400"
                  >
                    {journal.title}
                  </Link>
                </h3>

                <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                  Ditulis oleh{" "}
                  <Link
                    href={`/authors/${encodeURIComponent(journal.user.id)}`}
                    className="font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
                  >
                    {journal.user.name}
                  </Link>
                </p>

                <div className="mt-3">
                <JournalPreview content={journal.content} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-stone-100 pt-4 text-sm text-stone-500 dark:border-neutral-700 dark:text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">♡</span>
                  {journal._count.likes} suka
                </span>

                <span className="flex items-center gap-1.5">
                  <span>💬</span>
                  {journal._count.comments} komentar
                </span>

                <span className="flex items-center gap-1.5">
                  <span>🔖</span>
                  {journal._count.bookmarks} tersimpan
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-neutral-700">
                <time className="text-xs text-stone-500 dark:text-stone-400">
                  {new Date(journal.updatedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>

                <Link
                  href={`/explore/${encodeURIComponent(journal.id)}`}
                  className="text-sm font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Baca selengkapnya
                </Link>
              </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-stone-200 px-6 py-6 text-center text-sm text-stone-500 dark:border-neutral-700 dark:text-stone-400">
        EmThree: A slow journey from Mind to Mastery.
      </footer>
    </main>
  );
}
