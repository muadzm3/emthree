
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState("Pengguna");
  

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("emthree-show-welcome");

  window.location.href = "/";
}
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Gagal mengambil profil");
      return res.json();
    })
    .then((data) => {
      const user = data.user ?? data;
      setAvatarUrl(user.avatarUrl ?? null);
      setUserName(user.name ?? "Pengguna");
    })
    .catch((error) => {
      console.error("Gagal memuat foto profil:", error);
    });
}, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 dark:bg-neutral-900 dark:text-stone-100">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-stone-200 bg-white px-5 sm:px-8 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="mr-3 rounded-lg p-2 text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-neutral-700"
            aria-label={
              sidebarOpen ? "Tutup sidebar" : "Buka sidebar"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link
            href="/dashboard"
            className="text-2xl font-extrabold tracking-tight"
          >
            Emthree<span className="text-emerald-600">.</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tombol Light/Dark Mode */}
          <button
            type="button"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className="rounded-full border border-stone-300 p-2.5 transition hover:bg-stone-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
            aria-label="Ganti tema"
            title={
              theme === "dark"
                ? "Aktifkan Light Mode"
                : "Aktifkan Dark Mode"
            }
          >
            {!mounted ? (
              <span className="block h-5 w-5" />
            ) : theme === "dark" ? (
              <span aria-hidden="true">☀️</span>
            ) : (
              <span aria-hidden="true">🌙</span>
            )}
          </button>

          <Link
            href="/journals/new"
            className="rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            <span className="hidden sm:inline">Tulis Jurnal</span>
            <span className="sm:hidden">Tulis</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium hover:bg-stone-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
          >
            Logout
          </button>
          <Link
          href="/profile"
          aria-label="Buka profil"
          title="Profil saya"
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-700 bg-emerald-100 font-semibold text-emerald-900 transition hover:ring-2 hover:ring-emerald-400 dark:bg-neutral-700 dark:text-emerald-100"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Foto profil ${userName}`}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        {sidebarOpen && <Sidebar />}

        <main
          className={`min-w-0 flex-1 transition-all duration-1000 ${
            sidebarOpen ? "md:ml-60" : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
