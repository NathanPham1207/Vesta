const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.post("/scan/receipt", upload.single("image"), (req, res) => {
  console.log("Uploaded file:", req.file);

  res.json({
    store: "Walmart",
    purchaseDate: "2026-03-20",
    items: [
      { name: "Milk", quantity: 1, price: 3.99 },
      { name: "Eggs", quantity: 1, price: 4.49 },
      { name: "Bread", quantity: 1, price: 2.79 },
    ],
  });
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.post("/ping", (req, res) => {
  res.json({ ok: true });
});

app.post("/inventory", (req, res) => {
  console.log("Inventory received:", req.body);

  res.json({
    success: true,
    message: "Items saved successfully",
    items: req.body.items || [],
  });
});
