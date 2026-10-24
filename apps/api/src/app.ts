
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./config/prisma";
import authRoutes from "./modules/auth/auth.routes";
import journalRoutes from "./modules/journals/journals.routes";
import publicJournalRoutes from "./modules/journals/public-journals.routes";
import publicAuthorRoutes from "./modules/journals/public-authors.routes";
import interactionRoutes from "./modules/journals/interactions.routes";
import path from "path";
import uploadRoutes from "./routes/upload.routes";
const app = express();


app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"))
);

app.use("/api/upload", uploadRoutes);

// Rute publik
app.use("/api/public-journals", publicJournalRoutes);
app.use("/api/public-authors", publicAuthorRoutes);

// Rute autentikasi
app.use("/api/auth", authRoutes);

// Rute interaksi harus sebelum journalRoutes
app.use("/api/journals", interactionRoutes);
app.use("/api/interactions", interactionRoutes);

// Rute jurnal milik pengguna
app.use("/api/journals", journalRoutes);

app.use("/api/interactions", interactionRoutes);
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      message: "Journaling API berjalan",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "error",
      message: "Koneksi database gagal",
    });
  }
});

export default app;
