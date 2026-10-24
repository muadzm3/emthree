
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import JournalPreview from "@/components/JournalPreview";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Bookmark = {
  createdAt: string;
  journal: {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
    };
  };
};

export default function BookmarksPage() {
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function fetchBookmarks() {
      try {
        const response = await fetch(
          `${API_URL}/api/interactions/bookmarks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Gagal mengambil daftar bookmark."
          );
        }

        if (!cancelled) {
          setBookmarks(data.bookmarks ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan saat mengambil bookmark."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBookmarks();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900 dark:bg-neutral-900 dark:text-stone-100">

      <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">
          Baca nanti
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Bookmark Saya
        </h1>

        <p className="mt-3 leading-7 text-stone-600 dark:text-stone-300">
          Kumpulan tulisan yang kamu simpan untuk dibaca kembali.
        </p>

        {loading && (
          <p className="mt-10 text-stone-500">
            Memuat bookmark...
          </p>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-white p-5 dark:bg-neutral-800">
            <p className="text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-semibold text-emerald-800 dark:text-emerald-400"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && bookmarks.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-stone-300 p-8 text-center">
            <p className="text-lg font-semibold">
              Belum ada jurnal tersimpan
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Temukan tulisan menarik di Explore, lalu tekan tombol
              Simpan untuk memasukkannya ke sini.
            </p>
            <Link
              href="/explore"
              className="mt-5 inline-block rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              Jelajahi jurnal
            </Link>
          </div>
        )}

        {!loading && !error && bookmarks.length > 0 && (
          <div className="mt-10 space-y-6">
            <p className="text-sm text-stone-500">
              {bookmarks.length} jurnal tersimpan
            </p>

            {bookmarks.map((bookmark) => (
              <article
                key={bookmark.journal.id}
                className="border-b border-stone-200 pb-6 dark:border-neutral-700"
              >
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Oleh {bookmark.journal.user.name}
                </p>

                <h2 className="mt-2 text-2xl font-bold leading-snug">
                  {bookmark.journal.title}
                </h2>

                <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-stone-600 dark:text-stone-300">
                  <JournalPreview content={bookmark.journal.content} />
                </p>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    Disimpan{" "}
                    {new Date(bookmark.createdAt).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <Link
                    href={`/explore/${encodeURIComponent(
                      bookmark.journal.id
                    )}`}
                    className="shrink-0 font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Baca jurnal →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-stone-200 px-6 py-6 text-center text-sm text-stone-500 dark:border-neutral-700 dark:text-stone-400">
        Emthre — ruang untuk menulis dan berbagi cerita.
      </footer>
    </main>
  );
}
