import { Router } from "express";
import { prisma } from "../../config/prisma";

const router = Router();

// Menampilkan jurnal yang benar-benar publik
router.get("/", async (_req, res) => {
  try {
    const journals = await prisma.journal.findMany({
      where: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return res.json({ journals });
  } catch (error) {
    console.error("Get public journals error:", error);

    return res.status(500).json({
      message: "Gagal mengambil jurnal publik",
    });
  }
});

// Membaca satu jurnal publik berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const journal = await prisma.journal.findFirst({
      where: {
        id: req.params.id,
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!journal) {
      return res.status(404).json({
        message: "Jurnal publik tidak ditemukan",
      });
    }

    return res.json({ journal });
  } catch (error) {
    console.error("Get public journal error:", error);

    return res.status(500).json({
      message: "Gagal mengambil jurnal publik",
    });
  }
});

export default router;