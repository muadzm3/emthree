
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import GoogleOAuthWrapper from "@/components/GoogleOAuthWrapper";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal.");
      }

      if (!data.token) {
        throw new Error("Token login tidak ditemukan.");
      }

      localStorage.setItem("token", data.token);
      sessionStorage.setItem("emthree-show-welcome", "true");
      router.push("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Tidak dapat terhubung ke server."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credential: string) {
    setMessage("");
    setGoogleLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login Google gagal.");
      }

      if (!data.token) {
        throw new Error("Token login tidak ditemukan.");
      }

      localStorage.setItem("token", data.token);
      sessionStorage.setItem("emthree-show-welcome", "true");
      router.push("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Tidak dapat terhubung ke server."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-stone-900"
        >
          Emthree<span className="text-emerald-600">.</span>
        </Link>

        <h1 className="mt-5 text-2xl font-bold text-stone-900">
          Selamat datang kembali
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Masuk untuk melanjutkan ceritamu.
        </p>

        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              placeholder="Password kamu"
            />
          </div>

          {message && (
            <p role="alert" className="text-sm text-red-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-stone-200" />
          <span className="text-xs text-stone-400">atau</span>
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <div className="flex justify-center">
          <GoogleOAuthWrapper>
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) {
                  void handleGoogleLogin(response.credential);
                } else {
                  setMessage("Token Google tidak ditemukan.");
                }
              }}
              onError={() =>
                setMessage("Google Login gagal. Silakan coba lagi.")
              }
              text="continue_with"
              shape="rectangular"
              theme="outline"
              width="288"
            />
          </GoogleOAuthWrapper>
        </div>

        {googleLoading && (
          <p className="mt-2 text-center text-xs text-stone-500">
            Memproses login Google...
          </p>
        )}

        <p className="mt-4 text-center text-sm text-stone-600">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-700 hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </main>
  );
}
