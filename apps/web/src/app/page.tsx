
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import JournalPreview from "@/components/JournalPreview";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type PublicJournal = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
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

export default function LandingPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [journals, setJournals] = useState<PublicJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(Boolean(localStorage.getItem("token")));
    setConsent(localStorage.getItem("emthree-cookie-consent"));

    async function fetchJournals() {
      try {
        const response = await fetch(`${API_URL}/api/public-journals`);

        if (!response.ok) {
          throw new Error("Gagal mengambil jurnal");
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : data.journals ?? [];

        setJournals(list.slice(0, 3));
      } catch (error) {
        console.error("Gagal memuat jurnal publik:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJournals();
  }, []);

  function navigateTo(target: string) {
    const token = localStorage.getItem("token");
    setLoggedIn(Boolean(token));

    if (!token) {
      router.push("/login");
      return;
    }

    router.push(target);
  }

  function handleGetStarted() {
    navigateTo("/dashboard");
  }

  function handleExplore() {
    navigateTo("/explore");
  }

  function handleReadJournal(id: string) {
    navigateTo(`/explore/${encodeURIComponent(id)}`);
  }

  function saveConsent(value: "accepted" | "rejected") {
    localStorage.setItem("emthree-cookie-consent", value);
    setConsent(value);
  }

  function getExcerpt(content: string) {
    return content.length > 150
      ? `${content.slice(0, 150)}...`
      : content;
  }

  const dark = mounted && resolvedTheme === "dark";

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#24251f] transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
      {/* NAVBAR */}
      <header className="sticky top-0 z-[999] border-b border-[#e5e5dc] bg-[#faf9f6] dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            EmThree<span className="text-[#8a9b76]">.</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex !bg-transparent">
            <a href="#about" className="transition hover:text-[#8a9b76]">
              Tentang
            </a>
            <a href="#journals" className="transition hover:text-[#8a9b76]">
              Jurnal
            </a>
            <button onClick={handleExplore} className="transition hover:text-[#8a9b76]">
              Explore
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(dark ? "light" : "dark")}
              aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
              title={dark ? "Mode terang" : "Mode gelap"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#deddd4] text-lg transition hover:bg-[#efeee8] dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              {!mounted ? "◐" : dark ? "☀" : "☾"}
            </button>

            {!loggedIn && (
              <button
                onClick={() => router.push("/login")}
                className="hidden text-sm font-medium sm:block"
              >
                Masuk
              </button>
            )}

            <button
              onClick={handleGetStarted}
              className="rounded-full bg-[#344331] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#465b42]"
            >
              {loggedIn ? "Dashboard" : "Get Started"}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-10 md:py-28">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#71845f]">
            Your space to grow
          </p>

          <h1 className="max-w-xl text-5xl font-semibold leading-[1.1] tracking-tight md:text-7xl">
            EmThree —
            <br />
            <span className="font-normal italic text-[#71845f]">
              Mind, Mindset,
            </span>
            <br />
            Mastery.
          </h1>

          <p className="mt-7 text-lg leading-8 text-[#686a60] dark:text-neutral-300">
            A slow journey from Mind to Mastery.
          </p>

          <p className="mt-3 max-w-lg leading-7 text-[#77786f] dark:text-neutral-400">
            Ruang untuk menuangkan pikiran, memahami diri, dan
            bertumbuh melalui setiap cerita yang kamu tulis.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              onClick={handleGetStarted}
              className="rounded-full bg-[#344331] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#465b42]"
            >
              Mulai Menulis 
            </button>

            <button
              onClick={handleExplore}
              className="rounded-full border border-[#d8d8ce] px-7 py-3.5 text-sm font-medium transition hover:bg-white dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Jelajahi Jurnal
            </button>
          </div>

          <p className="mt-8 text-xs tracking-wide text-[#85867d] dark:text-neutral-500">
            THINK DEEPLY. GROW SLOWLY. MASTER YOURSELF.
          </p>
        </div>

        {/* HERO VISUAL */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -right-3 -top-3 h-32 w-32 rounded-full bg-[#dfe5d6] dark:bg-emerald-950" />
          <div className="relative rounded-[2rem] bg-[#e9e9df] p-5 dark:bg-neutral-800 md:p-8">
            <div className="rounded-[1.5rem] bg-[#faf9f6] p-7 shadow-sm dark:bg-neutral-900 md:p-10">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8a9b76]">
                A moment for yourself
              </p>

              <div className="my-10">
                <span className="text-5xl text-[#8a9b76]">“</span>
                <p className="text-2xl leading-relaxed text-[#44483e] dark:text-neutral-200 md:text-3xl">
                  Sometimes, slowing down is how we move forward.
                </p>
              </div>

              <div className="h-px bg-[#e6e5dc] dark:bg-neutral-700" />

              <div className="mt-5 flex items-center justify-between text-xs text-[#85867d] dark:text-neutral-500">
                <span>REFLECTION · GROWTH</span>
                <span></span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-3 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-neutral-800">
            <p className="text-xs text-[#85867d] dark:text-neutral-400">
              Your journey
            </p>
            <p className="mt-1 text-sm font-semibold">Begins within.</p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="border-y border-black/5 bg-[#f0f0e8] px-5 py-16 dark:border-white/10 dark:bg-neutral-900 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#71845f]">
            More than a journal
          </p>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
            Every thought has a place.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-[#686a60] dark:text-neutral-300">
            EmThree adalah tempat untuk merekam perjalananmu.
            Dari memahami pikiran, membangun pola pikir, hingga
            menguasai hal-hal yang berarti dalam hidup.
          </p>

          <div className="mt-12 grid gap-8 text-center md:grid-cols-3">
            <div>
              <span className="text-sm font-semibold text-[#8a9b76]">01 / Mind</span>
              <h3 className="mt-3 text-xl font-semibold">Kenali pikiran</h3>
              <p className="mt-2 text-sm leading-6 text-[#77786f] dark:text-neutral-400">
                Beri ruang bagi ide, perasaan, dan refleksi diri.
              </p>
            </div>

            <div>
              <span className="text-sm font-semibold text-[#8a9b76]">02 / Mindset</span>
              <h3 className="mt-3 text-xl font-semibold">Tumbuhkan perspektif</h3>
              <p className="mt-2 text-sm leading-6 text-[#77786f] dark:text-neutral-400">
                Belajar dari pengalaman dan melihat sesuatu dengan sudut pandang baru.
              </p>
            </div>

            <div>
              <span className="text-sm font-semibold text-[#8a9b76]">03 / Mastery</span>
              <h3 className="mt-3 text-xl font-semibold">Terus berkembang</h3>
              <p className="mt-2 text-sm leading-6 text-[#77786f] dark:text-neutral-400">
                Jadikan refleksi sebagai langkah kecil menuju penguasaan diri.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC JOURNAL PREVIEW */}
      <section id="journals" className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#71845f]">
              Stories from the community
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Temukan cerita baru.
            </h2>
            <p className="mt-3 text-[#77786f] dark:text-neutral-400">
              Sedikit intipan dari jurnal publik komunitas EmThree.
            </p>
          </div>

          <button
            onClick={handleExplore}
            className="w-fit text-sm font-semibold text-[#53674b] hover:underline dark:text-[#b8c9a7]"
          >
            Jelajahi semua jurnal 
          </button>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-[#77786f] dark:text-neutral-400">
            Memuat jurnal...
          </p>
        ) : journals.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#d8d8ce] p-10 text-center dark:border-neutral-700">
            <p className="font-medium">Belum ada jurnal publik.</p>
            <p className="mt-2 text-sm text-[#77786f] dark:text-neutral-400">
              Jurnal publik akan muncul di sini setelah tersedia.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {journals.map((journal, index) => (
              <article
                key={journal.id}
                className="flex flex-col rounded-2xl border border-[#e8e7df] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8a9b76]">
                  REFLECTION · 0{index + 1}
                </p>

                <h3 className="mt-5 line-clamp-2 text-xl font-semibold leading-7">
                  {journal.title}
                </h3>

                <p className="mt-3 flex-1 whitespace-pre-line break-words text-sm leading-7 text-[#77786f] dark:text-neutral-400">
                  <JournalPreview content={journal.content} />
                </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-stone-500 dark:text-neutral-400">
                <span>♡ {journal._count?.likes ?? 0} suka</span>
                <span>💬 {journal._count?.comments ?? 0} komentar</span>
                <span>🔖 {journal._count?.bookmarks ?? 0} tersimpan</span>
              </div>

                <div className="mt-6 border-t border-[#efeee8] pt-4 dark:border-neutral-800">
                  <p className="text-xs text-[#85867d] dark:text-neutral-500">
                    Ditulis oleh
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {journal.user?.name || "Penulis EmThree"}
                  </p>

                  <button
                    onClick={() => handleReadJournal(journal.id)}
                    className="mt-5 text-sm font-semibold text-[#53674b] hover:underline dark:text-[#b8c9a7]"
                  >
                    Baca selengkapnya 
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* FINAL CTA */}
      <section className="px-5 pb-20 md:px-10 md:pb-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#344331] px-6 py-14 text-center text-white md:px-12 md:py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c6d0bb]">
            Start your journey
          </p>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold md:text-5xl">
            Beri ruang untuk pikiranmu bertumbuh.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[#e0e5da]">
            Satu tulisan kecil hari ini bisa menjadi bagian dari perjalanan besar esok hari.
          </p>
          <button
            onClick={handleGetStarted}
            className="mt-8 rounded-full bg-[#faf9f6] px-7 py-3.5 text-sm font-semibold text-[#344331] transition hover:bg-white"
          >
            {loggedIn ? "Buka Dashboard" : "Mulai Perjalananmu"} 
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 px-5 py-8 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[#77786f] dark:text-neutral-400 sm:flex-row">
          <Link href="/" className="font-bold text-[#344331] dark:text-neutral-100">
            EmThree.
          </Link>
          <p>Mind, Mindset, Mastery.</p>
          <p>© 2026 EmThree</p>
        </div>
      </footer>

      {/* COOKIE CONSENT */}
      {mounted && consent === null && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-[#e5e3da] bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Pilihan cookie</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#77786f] dark:text-neutral-400">
                EmThree menyimpan pilihan ini di browser agar tidak
                menampilkan pemberitahuan yang sama terus-menerus.
                Kode ini hanya menyimpan preferensi, bukan memasang
                cookie pelacakan.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => saveConsent("rejected")}
                className="rounded-full border border-[#deddd4] px-4 py-2.5 text-sm dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Tolak
              </button>
              <button
                onClick={() => saveConsent("accepted")}
                className="rounded-full bg-[#344331] px-4 py-2.5 text-sm text-white hover:bg-[#465b42]"
              >
                Terima
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
