const { sendJson, sendCors } = require("../_lib");

const handlers = {
  "/blacklist":           require("../handlers/blacklist"),
  "/unblacklist":        require("../handlers/unblacklist"),
  "/claim":              require("../handlers/claim"),
  "/get-nametag":        require("../handlers/get-nametag"),
  "/getkey":             require("../handlers/getkey"),
  "/list-whitelist":     require("../handlers/list-whitelist"),
  "/log-execution":      require("../handlers/log-execution"),
  "/nametags":           require("../handlers/nametags"),
  "/register-onyx-user": require("../handlers/register-onyx-user"),
  "/revoke":             require("../handlers/revoke"),
  "/set-nametag":        require("../handlers/set-nametag"),
  "/status":             require("../handlers/status"),
  "/validate-user":      require("../handlers/validate-user"),
  "/validate":           require("../handlers/validate"),
  "/whitelist":          require("../handlers/whitelist"),
};

module.exports = function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  if (req.method === "OPTIONS") {
    return sendCors(res);
  }

  const handler = handlers[pathname];
  if (handler) {
    return handler(req, res);
  }

  sendJson(res, { error: "Not found" }, 404);
};
