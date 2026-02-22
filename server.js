const http = require("http");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const router = require("./api/index.js");

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-server-secret");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  router(req, res);
});

server.setTimeout(30_000);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Onyx] API running on port ${PORT}`);
});
