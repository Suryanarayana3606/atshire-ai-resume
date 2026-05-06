import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import mammoth from "mammoth";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configure Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

app.get("/api/test-json", (req, res) => {
  res.json({ success: true, message: "API is reachable and returning JSON" });
});

// Text Extraction API (PDF/DOCX)
app.post("/api/extract-text", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: `File upload error: ${err.message}` });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`Extracting text from: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);

    try {
      let text = "";
      if (file.mimetype === "application/pdf") {
        try {
          console.log("Using classic pdf-parse for extraction");
          const data = await pdf(file.buffer);
          text = data.text;
        } catch (pdfErr: any) {
          console.error("PDF-Parse Runtime Error:", pdfErr);
          return res.status(500).json({ error: `PDF parsing failed: ${pdfErr.message}` });
        }
      } else if (
        file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        try {
          const data = await mammoth.extractRawText({ buffer: file.buffer });
          text = data.value;
        } catch (docxErr: any) {
          console.error("Mammoth Error:", docxErr);
          return res.status(500).json({ error: `DOCX parsing failed: ${docxErr.message}` });
        }
      } else {
        return res.status(400).json({ error: "Unsupported file type. Use PDF or DOCX." });
      }

      if (!text || text.trim().length === 0) {
        return res.status(422).json({ error: "Extracted text is empty. The document might be an image or protected." });
      }

      res.status(200).json({ text: text.trim() });
    } catch (error: any) {
      console.error("General Extraction Error:", error);
      res.status(500).json({ error: error.message || "Internal server error during extraction" });
    }
  });
});

// API 404 Fallback
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled Global Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
});

async function startServer() {
  console.log("Starting server setup...");
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("Initializing Vite dev server...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      
      // Fallback for SPA in dev mode if vite middleware misses it
      app.get("*", async (req, res, next) => {
        if (req.url.startsWith("/api")) return next();
        try {
          const fs = await import("fs");
          let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
          template = await vite.transformIndexHtml(req.url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e) {
          console.error("Vite transformation error:", e);
          next(e);
        }
      });

      console.log("Vite middleware loaded in dev mode");
    } else {
      console.log("Production mode: serving static files from /dist");
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> Server definitively running on http://0.0.0.0:${PORT} <<<`);
    });
  } catch (err) {
    console.error("CRITICAL ERROR starting server:", err);
    process.exit(1);
  }
}

startServer();
