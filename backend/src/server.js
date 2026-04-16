require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (error) => {
    console.error("Failed to start server:", error);
  });