
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

type Props = {
  journalId: string;
};

export default function JournalInteractions({ journalId }: Props) {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      try {
        const response = await fetch(
          `${API_URL}/api/journals/${encodeURIComponent(journalId)}/comments`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal memuat komentar.");
        }

        if (!cancelled) {
          setComments(data.comments || []);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Gagal memuat komentar."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [journalId]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadInteractions() {
      try {
        const response = await fetch(
          `${API_URL}/api/journals/${encodeURIComponent(journalId)}/interactions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          if (!cancelled) setToken("");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal memuat interaksi.");
        }

        if (!cancelled) {
          setLikeCount(data.likeCount ?? 0);
          setLiked(Boolean(data.liked));
          setBookmarked(Boolean(data.bookmarked));
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Gagal memuat interaksi."
          );
        }
      }
    }

    loadInteractions();

    return () => {
      cancelled = true;
    };
  }, [journalId, token]);

  async function handleLike() {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/journals/${encodeURIComponent(journalId)}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.message || "Gagal memproses like.");
      }

      setLiked(data.liked);
      setLikeCount(data.likeCount);
      setMessage(data.message);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal memproses like."
      );
    }
  }

  async function handleBookmark() {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/journals/${encodeURIComponent(journalId)}/bookmark`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.message || "Gagal memproses bookmark.");
      }

      setBookmarked(data.bookmarked);
      setMessage(data.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal memproses bookmark."
      );
    }
  }

  async function handleComment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      router.push("/login");
      return;
    }

    const content = newComment.trim();
    if (!content) return;

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/journals/${encodeURIComponent(journalId)}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.message || "Gagal menambahkan komentar.");
      }

      setComments((current) => [data.comment, ...current]);
      setNewComment("");
      setMessage("Komentar berhasil ditambahkan.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan komentar."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12 border-t border-stone-200 pt-8">
      <h2 className="text-xl font-bold">Interaksi pembaca</h2>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleLike}
          className="rounded-full border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100"
        >
          {liked ? "❤️ Disukai" : "🤍 Suka"} ({likeCount})
        </button>

        <button
          type="button"
          onClick={handleBookmark}
          className="rounded-full border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100"
        >
          {bookmarked ? "🔖 Tersimpan" : "📑 Simpan"}
        </button>

        <span className="text-sm text-stone-500">
          💬 {comments.length} komentar
        </span>
      </div>

      {!token && (
        <p className="mt-3 text-sm text-stone-500">
          Login untuk menyukai, menyimpan, atau menulis komentar.
        </p>
      )}

      <form onSubmit={handleComment} className="mt-8 space-y-3">
        <label
          htmlFor="journal-comment"
          className="block text-sm font-semibold"
        >
          Tulis komentar
        </label>

        <textarea
          id="journal-comment"
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Bagikan pendapatmu tentang tulisan ini..."
          className="w-full rounded-xl border border-stone-300 bg-white p-4 outline-none focus:border-emerald-800"
        />

        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"
        >
          {submitting ? "Mengirim..." : "Kirim komentar"}
        </button>
      </form>

      {message && (
        <p role="status" className="mt-4 text-sm text-stone-600">
          {message}
        </p>
      )}

      <div className="mt-8 space-y-4">
        <h3 className="font-semibold">Komentar pembaca</h3>

        {loading ? (
          <p className="text-sm text-stone-500">Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-stone-500">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-xl border border-stone-200 bg-white p-5"
            >
              <p className="font-semibold">{comment.user.name}</p>
              <p className="mt-2 whitespace-pre-wrap break-words leading-7 text-stone-700">
                {comment.content}
              </p>
              <p className="mt-3 text-xs text-stone-500">
                {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
