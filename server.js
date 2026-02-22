const http = require("http");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Load the main router from api/index.js
const router = require("./api/index.js");

const server = http.createServer((req, res) => {
  // Add CORS headers (optional but good for frontend testing)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-server-secret");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Pass every request to api/index.js handler
  router(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Onyx] API running on http://0.0.0.0:${PORT}`);
});
