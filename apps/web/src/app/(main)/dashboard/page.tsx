
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JournalPreview from "@/components/JournalPreview";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Journal = {
  id: string;
  title: string;
  content: string;
  status: string;
  visibility: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  useEffect(() => {
  const shouldShow =
    sessionStorage.getItem("emthree-show-welcome") === "true";

  if (!shouldShow) return;

  sessionStorage.removeItem("emthree-show-welcome");

  async function loadWelcome() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const name = data.user?.name ?? data.name ?? "Pengguna";

      setWelcomeName(name);
      setShowWelcome(true);
    } catch (error) {
      console.error("Gagal memuat profil:", error);
    }
  }

  loadWelcome();
}, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("");
      return;
    }

    async function loadJournals() {
      try {
        const response = await fetch(`${API_URL}/api/journals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.replace("");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil jurnal.");
        }

        setJournals(data.journals ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    }

    loadJournals();
  }, [router]);

  function handleLogout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("emthree-show-welcome");

  router.replace("/");
}

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus jurnal ini? Tindakan ini tidak bisa dibatalkan."
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/journals/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus jurnal.");
      }

      setJournals((current) =>
        current.filter((journal) => journal.id !== id)
      );
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 text-stone-900 transition-colors duration-300 sm:px-8 sm:py-12 dark:text-stone-100">
      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Konten utama */}
        <div className="min-w-0">
          <section className="border-b border-stone-200 pb-9 dark:border-neutral-700">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
              Your personal space
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Semua cerita dimulai dari sini.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600 dark:text-stone-300">
              Tempat untuk menyimpan ide, menulis pengalaman, dan
              mendokumentasikan perjalanan hidupmu.
            </p>

            <Link
              href="/journals/new"
              className="mt-6 inline-flex rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
               Tulis jurnal baru
            </Link>
          </section>

          <section className="mt-9">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Tulisan saya
                </h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  Kelola cerita dan ide yang kamu tulis.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-white px-3 py-2 text-sm text-stone-600 ring-1 ring-stone-200 dark:bg-neutral-800 dark:text-stone-300 dark:ring-neutral-700">
                {journals.length} jurnal
              </span>
            </div>

            {loading && (
              <p className="rounded-xl bg-white p-6 text-sm text-stone-500 dark:bg-neutral-800 dark:text-stone-400">
                Memuat jurnal kamu...
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              >
                {error}
              </p>
            )}

            {!loading && !error && journals.length === 0 && (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center dark:border-neutral-600 dark:bg-neutral-800">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl dark:bg-emerald-950">
                  ✎
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  Cerita pertamamu menunggu
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500 dark:text-stone-400">
                  Mulai tulis ide, pengalaman, atau hal kecil yang ingin
                  kamu ingat.
                </p>

                <Link
                  href="/journals/new"
                  className="mt-5 inline-flex rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
                >
                  Buat jurnal pertama
                </Link>
              </div>
            )}

            <div className="divide-y divide-stone-200 dark:divide-neutral-700">
              {journals.map((journal) => (
                <article key={journal.id} className="py-7 first:pt-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {journal.status}
                    </span>

                    <span>{journal.visibility}</span>
                    <span>·</span>

                    <time dateTime={journal.createdAt}>
                      {new Date(journal.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </time>
                  </div>

                  <h3 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
                    <Link
                      href={`/journals/${encodeURIComponent(journal.id)}`}
                      className="transition hover:text-emerald-800 dark:hover:text-emerald-400"
                    >
                      {journal.title}
                    </Link>
                  </h3>

                  <p className="mt-2 overflow-hidden whitespace-pre-wrap break-words text-sm leading-7 text-stone-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] dark:text-stone-300">
                    <JournalPreview content={journal.content} />
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/journals/${encodeURIComponent(journal.id)}`}
                      className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
                    >
                      Baca jurnal
                    </Link>

                    <Link
                      href={`/journals/${encodeURIComponent(journal.id)}/edit`}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold transition hover:bg-white dark:border-neutral-600 dark:hover:bg-neutral-800"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(journal.id)}
                      className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="mt-12 border-t border-stone-200 pt-6 text-xs text-stone-500 dark:border-neutral-700 dark:text-stone-400">
            Emthree — Mind, Mindset, Mastery
          </footer>
        </div>

        {/* Panel kanan */}
        <aside className="hidden xl:block">
          <div className="sticky top-8 space-y-6">
            <section className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Emthree
              </p>

              <h2 className="mt-3 text-xl font-bold">
                Ruang untuk ceritamu
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Setiap pengalaman punya cerita. Mulai tulis ide,
                pengalaman, atau pemikiranmu hari ini.
              </p>
            </section>

            <section className="rounded-2xl bg-[#f0eee8] p-6 dark:bg-neutral-800">
              <h2 className="font-bold">Aktivitas menulismu</h2>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600 dark:text-stone-300">
                    Total jurnal
                  </span>
                  <span className="font-bold">{journals.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600 dark:text-stone-300">
                    Dipublikasikan
                  </span>
                  <span className="font-bold">
                    {journals.filter((j) => j.status === "PUBLISHED").length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600 dark:text-stone-300">
                    Draf
                  </span>
                  <span className="font-bold">
                    {journals.filter((j) => j.status === "DRAFT").length}
                  </span>
                </div>
              </div>
            </section>

            <section className="border-t border-stone-500 pt-5 text-xs leading-6 flex flex-wrap justify-center text-stone-800 dark:border-neutral-1700 dark:text-stone-400">
              <p>Emthree — tulis, simpan, dan bagikan ceritamu.</p>

              <div className="mt-3 flex flex-wrap justify-center gap-x-2">
                <Link
                  href="/explore"
                  className="hover:text-emerald-800 dark:hover:text-emerald-400"
                >
                  Jelajahi tulisan
                </Link>

                <Link
                  href="/bookmarks"
                  className="hover:text-emerald-800 dark:hover:text-emerald-400"
                >
                  Bookmark
                </Link>

                <Link
                  href="/authors"
                  className="hover:text-emerald-800 dark:hover:text-emerald-400"
                >
                  Penulis
                </Link>
              </div>
            </section>
          </div>
        </aside>
      
      </div>

      {/* POP-UP SELAMAT DATANG */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-neutral-800"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl dark:bg-emerald-950">
              ✨
            </div>

            <h2
              id="welcome-title"
              className="mt-5 text-2xl font-semibold text-emerald-900 dark:text-emerald-300"
            >
              Selamat datang, {welcomeName}!
            </h2>

            <p className="mt-3 leading-7 text-stone-600 dark:text-stone-300">
              Senang melihatmu kembali di EmThree. Mari lanjutkan
              perjalanan untuk memahami pikiran dan mengembangkan diri.
            </p>

            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              className="mt-6 rounded-full bg-emerald-800 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-900"
            >
              Mulai Perjalanan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

