
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);


const journalSchema = z.object({
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(200),
  content: z
    .string()
    .max(100000, "Isi jurnal maksimal 100.000 karakter")
    .refine(
      (value) => value.trim().length > 0,
      "Isi jurnal tidak boleh kosong"
    ),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
});


// Melihat semua jurnal milik pengguna yang login
router.get("/", async (_req, res) => {
  try {
    const journals = await prisma.journal.findMany({
      where: { userId: res.locals.userId },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ journals });
  } catch (error) {
    console.error("Get journals error:", error);
    return res.status(500).json({
      message: "Gagal mengambil jurnal",
    });
  }
});

// Membuat jurnal baru
router.post("/", async (req, res) => {
  const parsed = journalSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Data jurnal tidak valid",
      errors: parsed.error.issues,
    });
  }

  try {
    const journal = await prisma.journal.create({
      
    data: {
    title: parsed.data.title,
    content: parsed.data.content,
    status: parsed.data.status ?? "DRAFT",
    visibility: parsed.data.visibility ?? "PRIVATE",
    userId: res.locals.userId,
    },

    });

    return res.status(201).json({
      message: "Jurnal berhasil dibuat",
      journal,
    });
  } catch (error) {
    console.error("Create journal error:", error);
    return res.status(500).json({
      message: "Gagal membuat jurnal",
    });
  }
});

// Mengedit jurnal milik sendiri
router.put("/:id", async (req, res) => {
  const parsed = journalSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Data jurnal tidak valid",
      errors: parsed.error.issues,
    });
  }

  try {
    const result = await prisma.journal.updateMany({
      where: {
        id: req.params.id,
        userId: res.locals.userId,
      },
      data: parsed.data,
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Jurnal tidak ditemukan",
      });
    }

    const journal = await prisma.journal.findFirst({
      where: {
        id: req.params.id,
        userId: res.locals.userId,
      },
    });

    return res.json({
      message: "Jurnal berhasil diperbarui",
      journal,
    });
  } catch (error) {
    console.error("Update journal error:", error);
    return res.status(500).json({
      message: "Gagal memperbarui jurnal",
    });
  }
});

// Menghapus jurnal milik sendiri
router.delete("/:id", async (req, res) => {
  try {
    const result = await prisma.journal.deleteMany({
      where: {
        id: req.params.id,
        userId: res.locals.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Jurnal tidak ditemukan",
      });
    }

    return res.json({
      message: "Jurnal berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete journal error:", error);
    return res.status(500).json({
      message: "Gagal menghapus jurnal",
    });
  }
});

export default router;
