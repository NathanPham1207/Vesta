require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Failed to start server:", error);
});