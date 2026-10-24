
import { Router } from "express";
import { prisma } from "../../config/prisma";

const router = Router();

// Daftar penulis yang memiliki jurnal publik
router.get("/", async (_req, res) => {
  try {
    const authors = await prisma.user.findMany({
      where: {
        journals: {
          some: {
            status: "PUBLISHED",
            visibility: "PUBLIC",
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            journals: {
              where: {
                status: "PUBLISHED",
                visibility: "PUBLIC",
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json({
      authors: authors.map((author) => ({
        id: author.id,
        name: author.name,
        publicJournalCount: author._count.journals,
      })),
    });
  } catch (error) {
    console.error("Get public authors error:", error);

    return res.status(500).json({
      message: "Gagal mengambil daftar penulis",
    });
  }
});

// Profil publik dan jurnal publik milik penulis
router.get("/:id", async (req, res) => {
  try {
    const author = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        id: true,
        name: true,
        journals: {
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
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!author || author.journals.length === 0) {
      return res.status(404).json({
        message: "Profil penulis atau jurnal publik tidak ditemukan",
      });
    }

    return res.json({
      author: {
        id: author.id,
        name: author.name,
      },
      journals: author.journals,
    });
  } catch (error) {
    console.error("Get public author error:", error);

    return res.status(500).json({
      message: "Gagal mengambil profil penulis",
    });
  }
});

export default router;
