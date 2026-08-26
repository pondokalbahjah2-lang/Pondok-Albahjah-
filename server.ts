import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for getting prayer times
  app.post("/api/prayer-times", async (req, res) => {
    try {
      const { location = "Cirebon", latitude, longitude } = req.body;
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
      let url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(location)}&country=Indonesia&method=20`;
      
      if (latitude && longitude) {
        url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=20`;
      }
      
      const aladhanRes = await fetch(url);
      const aladhanData = await aladhanRes.json();
      
      if (aladhanData && aladhanData.data && aladhanData.data.timings) {
        const t = aladhanData.data.timings;
        return res.json({
          Subuh: t.Fajr,
          Dzuhur: t.Dhuhr,
          Ashar: t.Asr,
          Maghrib: t.Maghrib,
          Isya: t.Isha
        });
      }
      throw new Error("Invalid format from Aladhan API");
    } catch (error: any) {
      console.error("Prayer times fetch error:", error);
      // Hardcoded fallback if all else fails
      res.json({
        Subuh: "04:35",
        Dzuhur: "11:51",
        Ashar: "15:12",
        Maghrib: "17:47",
        Isya: "18:59"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
