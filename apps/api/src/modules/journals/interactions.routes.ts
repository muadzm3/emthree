
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

function getParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

const commentSchema = z.object({
  content: z.string().trim().min(1, "Komentar tidak boleh kosong").max(2000),
});

async function findPublicJournal(id: string) {
  return prisma.journal.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      visibility: "PUBLIC",
    },
    select: { id: true },
  });
}

// Ringkasan interaksi pengguna pada jurnal publik
router.get("/:id/interactions", authenticate, async (req, res) => {
  try {
    const journal = await findPublicJournal(getParam(req.params.id));

    if (!journal) {
      return res.status(404).json({ message: "Jurnal publik tidak ditemukan" });
    }

    const userId = res.locals.userId as string;

    const [likeCount, commentCount, liked, bookmarked] = await Promise.all([
      prisma.journalLike.count({ where: { journalId: journal.id } }),
      prisma.journalComment.count({ where: { journalId: journal.id } }),
      prisma.journalLike.findUnique({
        where: { userId_journalId: { userId, journalId: journal.id } },
      }),
      prisma.journalBookmark.findUnique({
        where: { userId_journalId: { userId, journalId: journal.id } },
      }),
    ]);

    return res.json({
      likeCount,
      commentCount,
      liked: Boolean(liked),
      bookmarked: Boolean(bookmarked),
    });
  } catch (error) {
    console.error("Get interactions error:", error);
    return res.status(500).json({ message: "Gagal mengambil interaksi jurnal" });
  }
});

// Toggle like: klik sekali untuk like, klik lagi untuk batal
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const journal = await findPublicJournal(getParam(req.params.id));

    if (!journal) {
      return res.status(404).json({ message: "Jurnal publik tidak ditemukan" });
    }

    const userId = res.locals.userId as string;
    const where = {
      userId_journalId: { userId, journalId: journal.id },
    };

    const existing = await prisma.journalLike.findUnique({ where });

    if (existing) {
      await prisma.journalLike.delete({ where });
    } else {
      await prisma.journalLike.create({
        data: { userId, journalId: journal.id },
      });
    }

    const likeCount = await prisma.journalLike.count({
      where: { journalId: journal.id },
    });

    return res.json({
      liked: !existing,
      likeCount,
      message: existing ? "Like dibatalkan" : "Jurnal disukai",
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return res.status(500).json({ message: "Gagal memproses like" });
  }
});

// Membaca komentar jurnal publik, tidak wajib login
router.get("/:id/comments", async (req, res) => {
  try {
    const journal = await findPublicJournal(getParam(req.params.id));

    if (!journal) {
      return res.status(404).json({ message: "Jurnal publik tidak ditemukan" });
    }

    const comments = await prisma.journalComment.findMany({
      where: { journalId: journal.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ message: "Gagal mengambil komentar" });
  }
});

// Menambahkan komentar
router.post("/:id/comments", authenticate, async (req, res) => {
  const parsed = commentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Komentar tidak valid",
      errors: parsed.error.issues,
    });
  }

  try {
    const journal = await findPublicJournal(getParam(req.params.id));

    if (!journal) {
      return res.status(404).json({ message: "Jurnal publik tidak ditemukan" });
    }

    const comment = await prisma.journalComment.create({
      data: {
        content: parsed.data.content,
        userId: res.locals.userId as string,
        journalId: journal.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({
      message: "Komentar berhasil ditambahkan",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return res.status(500).json({ message: "Gagal menambahkan komentar" });
  }
});

// Menghapus komentar milik sendiri
router.delete("/:id/comments/:commentId", authenticate, async (req, res) => {
  try {
    const journal = await findPublicJournal(getParam(req.params.id));

    if (!journal) {
      return res.status(404).json({ message: "Jurnal publik tidak ditemukan" });
    }

    const result = await prisma.journalComment.deleteMany({
      where: {
        id: getParam(req.params.commentId),
        journalId: journal.id,
        userId: res.locals.userId as string,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Komentar tidak ditemukan atau bukan milikmu",
      });
    }

    return res.json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ message: "Gagal menghapus komentar" });
  }
});

// Toggle bookmark
router.post("/:id/bookmark", authenticate, async (req, res) => {
  try {
    const journal = await findPublicJournal(getParam(req.params.id));

    if (!journal) {
      return res.status(404).json({ message: "Jurnal publik tidak ditemukan" });
    }

    const userId = res.locals.userId as string;
    const where = {
      userId_journalId: { userId, journalId: journal.id },
    };

    const existing = await prisma.journalBookmark.findUnique({ where });

    if (existing) {
      await prisma.journalBookmark.delete({ where });
    } else {
      await prisma.journalBookmark.create({
        data: { userId, journalId: journal.id },
      });
    }

    return res.json({
      bookmarked: !existing,
      message: existing ? "Bookmark dihapus" : "Jurnal disimpan",
    });
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    return res.status(500).json({ message: "Gagal memproses bookmark" });
  }
});

// Daftar bookmark pengguna yang login
router.get("/bookmarks", authenticate, async (_req, res) => {
  try {
    const bookmarks = await prisma.journalBookmark.findMany({
      where: {
        userId: res.locals.userId as string,
        journal: { status: "PUBLISHED", visibility: "PUBLIC" },
      },
      select: {
        createdAt: true,
        journal: {
          select: {
            id: true,
            title: true,
            content: true,
            updatedAt: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ bookmarks });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return res.status(500).json({ message: "Gagal mengambil bookmark" });
  }
});

export default router;
