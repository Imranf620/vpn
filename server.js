import express from "express";
import connectDb from "./config/connectDb.js";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import fileRoutes from "./routes/file.js";

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.json({ limit: "50mb", extended: true }));


// Enable CORS
app.use(
  cors({
    origin:"http://localhost:5000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With"],
    exposedHeaders: ["Authorization"],
  })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "vpn.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "public",  "checkout.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public",  "login.html"));
  });

  app.get("/upload", (req, res) => {
    res.sendFile(path.join(__dirname, "public",  "fileupload.html"));
  });
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDb();
});
