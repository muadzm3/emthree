
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Journal = {
  id: string;
  title: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PRIVATE" | "PUBLIC";
};

function EditJournalContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const journalId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] =
    useState<Journal["status"]>("DRAFT");
  const [visibility, setVisibility] =
    useState<Journal["visibility"]>("PRIVATE");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadJournal() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/journals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil jurnal.");
        }

        const journal = (data.journals as Journal[]).find(
          (item) => item.id === journalId
        );

        if (!journal) {
          throw new Error("Jurnal tidak ditemukan.");
        }

        if (!cancelled) {
          setTitle(journal.title);
          setContent(journal.content);
          setStatus(journal.status);
          setVisibility(journal.visibility);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengambil jurnal."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJournal();

    return () => {
      cancelled = true;
    };
  }, [journalId, router]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const plainText = cleanContent
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!cleanTitle || (!plainText && !cleanContent.includes("<img"))) {
  setMessage("Judul dan isi jurnal tidak boleh kosong.");
  return;
}





    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/api/journals/${encodeURIComponent(journalId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
          title: cleanTitle,
          content,
          status,
          visibility,
        }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui jurnal.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan jurnal."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-5 transition-colors duration-300 dark:bg-[#171717]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-emerald-700 dark:border-neutral-700 dark:border-t-emerald-400" />
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Memuat jurnal kamu...
          </p>
        </div>
      </main>
    );
  }

  

  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900 transition-colors duration-300 dark:bg-[#171717] dark:text-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#faf9f6]/95 backdrop-blur dark:border-neutral-800 dark:bg-[#171717]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-sm text-white dark:bg-emerald-700">
              E
            </span>
            <span>
              EmThree<span className="text-emerald-600 dark:text-emerald-400">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:inline dark:text-stone-400">
              Mode edit
            </span>
            <Link
              href="/dashboard"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium transition hover:bg-stone-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Keluar dari editor
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14 lg:py-12">
        {/* Editor utama */}
        <section className="min-w-0">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-sm text-stone-500 transition hover:text-emerald-800 dark:text-stone-400 dark:hover:text-emerald-400"
            >
              ← Kembali ke dashboard
            </Link>

            <div className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 dark:bg-emerald-400" />
              Editor jurnal
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Lanjutkan ceritamu.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 sm:text-base dark:text-stone-400">
              Perbaiki tulisan, tambahkan pemikiran baru, atau ubah
              pengaturan jurnalmu.
            </p>
          </div>

          {message && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-[#202020]">
              {/* Judul */}
              <div className="border-b border-stone-100 px-5 py-4 sm:px-8 dark:border-neutral-800">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="title"
                    className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400"
                  >
                    Judul tulisan
                  </label>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {title.length}/200
                  </span>
                </div>

                <input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Tuliskan judul yang menarik..."
                  required
                  maxLength={200}
                  className="mt-3 w-full border-0 bg-transparent text-2xl font-semibold leading-tight tracking-tight text-stone-900 outline-none placeholder:text-stone-300 focus:ring-0 sm:text-3xl dark:text-stone-100 dark:placeholder:text-neutral-600"
                />
              </div>

              {/* Isi tulisan */}
              <div className="px-5 py-5 sm:px-8 sm:py-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <label
                    htmlFor="content"
                    className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400"
                  >
                    Isi tulisan
                  </label>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {content.length.toLocaleString("id-ID")} karakter
                  </span>
                </div>

                 <RichTextEditor
                  initialContent={content}
                  onChange={setContent}
                />
              </div>

              {/* Informasi tulisan */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/70 px-5 py-4 sm:px-8 dark:border-neutral-800 dark:bg-neutral-900/70">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Tulisan yang baik dimulai dari kejujuran.
                </p>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {content.trim().split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium transition hover:bg-stone-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={saving || !title.trim() || !content.trim()}
                className="rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                {saving ? "Menyimpan perubahan..." : "Simpan perubahan"}
              </button>
            </div>
          </form>
        </section>

        {/* Panel pengaturan */}
        <aside className="space-y-5 lg:pt-24">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#202020]">
            <h2 className="font-semibold">Pengaturan jurnal</h2>
            <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-stone-400">
              Atur status dan siapa yang dapat melihat tulisanmu.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200"
                >
                  Status tulisan
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as Journal["status"])
                  }
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:focus:border-emerald-400"
                >
                  <option value="DRAFT">Draf</option>
                  <option value="PUBLISHED">Dipublikasikan</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
                  {status === "DRAFT"
                    ? "Simpan sebagai draf untuk dilanjutkan nanti."
                    : "Tandai tulisan sebagai sudah dipublikasikan."}
                </p>
              </div>

              <div>
                <label
                  htmlFor="visibility"
                  className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200"
                >
                  Visibilitas
                </label>
                <select
                  id="visibility"
                  value={visibility}
                  onChange={(event) =>
                    setVisibility(
                      event.target.value as Journal["visibility"]
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:focus:border-emerald-400"
                >
                  <option value="PRIVATE">Pribadi</option>
                  <option value="PUBLIC">Publik</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
                  {visibility === "PRIVATE"
                    ? "Hanya kamu yang seharusnya dapat mengakses jurnal ini."
                    : "Jurnal ditandai sebagai publik."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/50">
            <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
              Ruang untuk refleksi
            </h3>
            <p className="mt-2 text-sm leading-6 text-emerald-900/70 dark:text-emerald-100/80">
              Tidak semua tulisan harus sempurna. Yang penting,
              kamu memberi ruang untuk menuangkan pikiranmu.
            </p>
          </div>

          <p className="px-1 text-xs leading-5 text-stone-500 dark:text-stone-400">
            Perubahan hanya tersimpan setelah kamu menekan tombol
            “Simpan perubahan”.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default function EditJournalPage() {
  return (
    <Suspense fallback={<div>Memuat editor jurnal...</div>}>
      <EditJournalContent />
    </Suspense>
  );
}

