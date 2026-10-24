"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import JournalContent from "@/components/JournalContent";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Journal = {
  id: string;
  title: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PRIVATE" | "PUBLIC";
  createdAt: string;
  updatedAt: string;
};

function JournalDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
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

        const found = (data.journals as Journal[]).find(
          (item) => item.id === params.id
        );

        if (!found) {
          throw new Error("Jurnal tidak ditemukan.");
        }

        if (!cancelled) {
          setJournal(found);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan."
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
  }, [params.id, router]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] transition-colors duration-300 dark:bg-[#171717]">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Memuat jurnal...
        </p>
      </main>
    );
  }

  if (!journal) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-5 py-16 text-stone-900 transition-colors duration-300 dark:bg-[#171717] dark:text-stone-100">
        <div className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-8 dark:border-neutral-800 dark:bg-[#202020]">
          <h1 className="text-2xl font-semibold">
            Jurnal tidak tersedia
          </h1>

          <p className="mt-3 text-sm leading-6 text-stone-500 dark:text-stone-400">
            {message || "Jurnal tidak ditemukan."}
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900 transition-colors duration-300 dark:bg-[#171717] dark:text-stone-100">
      <header className="border-b border-stone-200 bg-transparent dark:border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-white dark:bg-emerald-700">
              E
            </span>
            EmThree
            <span className="text-emerald-600 dark:text-emerald-400">
              .
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="text-sm text-stone-500 transition hover:text-emerald-800 dark:text-stone-400 dark:hover:text-emerald-400"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`rounded-full px-3 py-1 font-medium ${
              journal.status === "PUBLISHED"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            {journal.status === "PUBLISHED"
              ? "Dipublikasikan"
              : "Draf"}
          </span>

          <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-600 dark:bg-neutral-800 dark:text-stone-300">
            {journal.visibility === "PUBLIC" ? "Publik" : "Pribadi"}
          </span>
        </div>

        <h1 className="mt-7 break-words text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {journal.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-6 text-sm text-stone-500 dark:border-neutral-800 dark:text-stone-400">
          <div>
            <p>Dibuat {formatDate(journal.createdAt)}</p>
            <p className="mt-1 text-xs">
              Diperbarui {formatDate(journal.updatedAt)}
            </p>
          </div>

          <Link
            href={`/journals/${encodeURIComponent(journal.id)}/edit`}
            className="rounded-full border border-stone-300 px-5 py-2.5 font-medium text-stone-700 transition hover:border-emerald-800 hover:text-emerald-800 dark:border-neutral-700 dark:text-stone-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
          >
            Edit jurnal
          </Link>
        </div>

        <div className="mt-9 whitespace-pre-wrap break-words text-base leading-8 text-stone-700 sm:text-lg sm:leading-9 dark:text-stone-200">
          <JournalContent content={journal.content} />
        </div>

        <div className="mt-14 border-t border-stone-200 pt-6 dark:border-neutral-800">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-emerald-800 transition hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Kembali ke semua jurnal
          </Link>
        </div>
      </article>

      <footer className="border-t border-stone-200 px-5 py-6 text-center text-sm text-stone-500 dark:border-neutral-800 dark:text-stone-400">
        EmThree — Mind, Mindset, Mastery
      </footer>
    </main>
  );
}

export default function JournalDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] dark:bg-[#171717]">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Memuat jurnal...
          </p>
        </main>
      }
    >
      <JournalDetailContent />
    </Suspense>
  );
}