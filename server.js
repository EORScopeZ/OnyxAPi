const http = require("http");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const routes = {};
const apiDir = path.join(__dirname, "api");
fs.readdirSync(apiDir).forEach((file) => {
  if (file.startsWith("_") || !file.endsWith(".js")) return;
  const name = "/" + file.replace(".js", "");
  routes[name] = require(path.join(apiDir, file));
});

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  const topLevel = "/" + urlPath.split("/")[1];
  const handler = routes[urlPath] || routes[topLevel] || routes["/index"];

  if (handler) {
    handler(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found." }));
  }
});

server.listen(PORT, () => {
  console.log(`[Onyx] API running on http://localhost:${PORT}`);
});
