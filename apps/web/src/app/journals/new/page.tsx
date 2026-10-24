
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function NewJournalPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [visibility, setVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

      const plainText = content
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

    if (!title.trim() || (!plainText && !content.includes("<img"))) {
      setMessage("Judul dan isi jurnal tidak boleh kosong.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/journals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: 
          status,
          visibility,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan jurnal.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900 transition-colors duration-300 dark:bg-[#171717] dark:text-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-[#faf9f6]/95 backdrop-blur dark:border-neutral-800 dark:bg-[#171717]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/dashboard"
            className="shrink-0 text-2xl font-extrabold tracking-tight"
          >
            EmThree<span className="text-emerald-600 dark:text-emerald-400">.</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:inline dark:text-stone-400">
              {loading ? "Menyimpan..." : "Ruang menulismu"}
            </span>

            <Link
              href="/dashboard"
              className="rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Keluar editor
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
        {/* Editor utama */}
        <section className="min-w-0">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
              RUANG MENULIS
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Apa yang ingin kamu ceritakan?
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600 sm:text-base dark:text-stone-300">
              Tidak harus sempurna. Mulailah dengan satu ide, satu pengalaman,
              atau satu hal kecil yang berarti bagimu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-colors sm:p-8 dark:border-neutral-800 dark:bg-[#202020]">
              <label
                htmlFor="title"
                className="mb-3 block text-sm font-semibold text-stone-700 dark:text-stone-200"
              >
                Judul tulisan
              </label>

              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={200}
                placeholder="Berikan judul yang menarik..."
                className="w-full border-0 border-b border-stone-200 bg-transparent pb-5 text-2xl font-bold tracking-tight text-stone-900 outline-none placeholder:font-normal placeholder:text-stone-300 focus:border-emerald-600 sm:text-3xl dark:border-neutral-700 dark:text-stone-100 dark:placeholder:text-neutral-600 dark:focus:border-emerald-400"
              />

              <div className="mt-7">
                <label
                  htmlFor="content"
                  className="mb-3 block text-sm font-semibold text-stone-700 dark:text-stone-200"
                >
                  Ceritamu
                </label>

                 <RichTextEditor onChange={setContent} />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-4 text-xs text-stone-500 dark:border-neutral-800 dark:text-stone-400">
                  <span>Luangkan waktu untuk dirimu sendiri.</span>
                  <span className="shrink-0">
                    {content.length.toLocaleString("id-ID")} / 100.000
                  </span>
                </div>
              </div>
            </div>

            {message && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300"
              >
                {message}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-stone-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                {loading ? "Menyimpan..." : "Simpan jurnal"}
              </button>
            </div>
          </form>
        </section>

        {/* Panel pengaturan */}
        <aside className="space-y-5 lg:pt-1">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#202020]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              PENGATURAN TULISAN
            </p>

            <div className="mt-5">
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "DRAFT" | "PUBLISHED")
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 outline-none focus:border-emerald-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:focus:border-emerald-400"
              >
                <option value="DRAFT">Draf — belum selesai</option>
                <option value="PUBLISHED">Dipublikasikan</option>
              </select>

              <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
                Draf untuk tulisan yang masih ingin kamu kembangkan.
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="visibility"
                className="mb-2 block text-sm font-semibold"
              >
                Visibilitas
              </label>

              <select
                id="visibility"
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as "PRIVATE" | "PUBLIC")
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 outline-none focus:border-emerald-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:focus:border-emerald-400"
              >
                <option value="PRIVATE">Pribadi</option>
                <option value="PUBLIC">Publik</option>
              </select>

              <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
                Pilih siapa yang boleh melihat tulisanmu. Pastikan API juga
                menerapkan aturan visibilitas ini.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-900 p-6 text-white dark:bg-emerald-950">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
              CATATAN KECIL
            </p>

            <p className="mt-3 text-lg font-semibold leading-7">
              Tulisan sederhana hari ini bisa menjadi kenangan berharga esok
              hari.
            </p>
          </div>

          <div className="px-1 text-xs leading-6 text-stone-500 dark:text-stone-400">
            Tulislah dengan jujur. Tidak semua cerita harus dibagikan kepada
            orang lain.
          </div>
        </aside>
      </div>
    </main>
  );
}
