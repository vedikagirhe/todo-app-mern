require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const todoRoutes = require("./routes/todos");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""));

app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server tools and local requests with no Origin header.
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "To-Do API is running." });
});
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.use("/api/todos", todoRoutes);

// Central error handler
app.use((error, req, res, next) => {
  console.error(error);
  if (error.message && error.message.startsWith("CORS blocked")) {
    return res.status(403).json({ success: false, message: error.message });
  }
  res.status(500).json({ success: false, message: "Server error. Check backend logs." });
});

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing. Add it to backend/.env.");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();
