// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { pool } from "./src/db.js";
import notesRouter from "./src/routes/notes.js";
import authRouter from "./src/routes/auth.js";
import { swaggerDocs } from "./src/swagger.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "*" })); // cho phép mọi nguồn, đảm bảo emulator kết nối
app.use(express.json());

// Route kiểm tra server
app.get("/", (req, res) => {
  res.send("✅ Node.js server is running successfully!");
});

// Route test DB
app.get("/testdb", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route test kết nối từ Android Emulator
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "pong" });
});

// Routes chính
app.use("/api/notes", notesRouter);
app.use("/api/auth", authRouter);

// Swagger UI
swaggerDocs(app);

// Start server
app.listen(PORT, () => {
  console.log("Loaded JWT_SECRET =", process.env.JWT_SECRET);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:${PORT}/api-docs`);
});
