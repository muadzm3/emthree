"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserProfile = {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Gagal memuat profil.");
        }

        setProfile(data.user ?? data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f6] p-10 text-stone-500 transition-colors dark:bg-neutral-950 dark:text-neutral-400">
        Memuat profil kamu...
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-6 py-16 text-stone-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
        <div className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-2xl font-bold">Profil belum tersedia</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-neutral-400">
            {error || "Data profil belum berhasil dimuat."}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const initial = profile.name?.charAt(0).toUpperCase() || "J";

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-8 text-stone-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="h-36 bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-600 sm:h-48" />

          <section className="px-6 pb-8 sm:px-10">
           <div className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#e9e5dc] text-4xl font-serif text-emerald-950 dark:border-neutral-900 dark:bg-neutral-800 dark:text-emerald-200 sm:-mt-14 sm:h-28 sm:w-28 sm:text-5xl">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`Foto profil ${profile.name}`}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              initial
            )}
          </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-emerald-800 dark:text-emerald-300">
              Ruang pribadimu
            </p>

            <h1 className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl">
              {profile.name}
            </h1>

            <p className="mt-3 break-all text-stone-500 dark:text-neutral-400">
              {profile.email}
            </p>

            <p className="mt-5 max-w-xl text-sm leading-7 text-stone-600 dark:text-neutral-300">
              Setiap orang punya cerita. EmThree adalah ruang untuk
              menyimpan pemikiran, pengalaman, dan perjalananmu dalam
              bentuk tulisan.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/journals/new"
                className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Tulis Jurnal
              </Link>

              <Link
                href="/dashboard"
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold transition hover:bg-stone-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Kelola Tulisan
              </Link>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 dark:text-neutral-400">
            Tentang akun
          </p>

          <h2 className="mt-3 text-xl font-bold">Informasi Profil</h2>

          <div className="mt-6 divide-y divide-stone-100 dark:divide-neutral-800">
            <div className="py-4">
              <p className="text-sm text-stone-500 dark:text-neutral-400">Nama pengguna</p>
              <p className="mt-1 font-medium">{profile.name}</p>
            </div>

            <div className="py-4">
              <p className="text-sm text-stone-500 dark:text-neutral-400">Alamat email</p>
              <p className="mt-1 break-all font-medium">{profile.email}</p>
            </div>

            <div className="py-4">
              <p className="text-sm text-stone-500 dark:text-neutral-400">ID pengguna</p>
              <p className="mt-1 break-all font-mono text-sm">
                {profile.id || "Tidak tersedia"}
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-stone-400 dark:text-neutral-500">
          EmThree · Ceritamu layak untuk disimpan.
        </p>
      </div>
    </main>
  );
}