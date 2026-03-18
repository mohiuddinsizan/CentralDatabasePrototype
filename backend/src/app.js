import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import archiveRoutes from "./routes/archiveRoutes.js";
import chapterRoutes from "./routes/chapterRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import bookRoutes from "./routes/bookRoutes.js";
import bookChapterRoutes from "./routes/bookChapterRoutes.js";
import bookChapterQuestionRoutes from "./routes/bookChapterQuestionRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "Central Question Database API running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/archives", archiveRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/book-chapters", bookChapterRoutes);
app.use("/api/book-chapter-questions", bookChapterQuestionRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;