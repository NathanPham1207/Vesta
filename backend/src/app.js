const express = require("express");
const cors = require("cors");
const inventoryRoutes = require("./routes/inventoryRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const recipeRoutes = require("./routes/recipeRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logger for development and debugging.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.use("/inventory", inventoryRoutes);
app.use("/scan/receipt", receiptRoutes);
app.use("/recipes", recipeRoutes);
app.use("/api/recipes", recipeRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;
