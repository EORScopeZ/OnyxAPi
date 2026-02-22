const getkey = require("../handlers/getkey");
const claim = require("../handlers/claim");
const validate = require("../handlers/validate");
const validateUser = require("../handlers/validate-user");
const whitelist = require("../handlers/whitelist");
const revoke = require("../handlers/revoke");
const blacklist = require("../handlers/blacklist");
const listWhitelist = require("../handlers/list-whitelist");
const status = require("../handlers/status");
const registerOnyx = require("../handlers/register-onyx-user");
const nametags = require("../handlers/nametags");
const setNametag = require("../handlers/set-nametag");
const getNametag = require("../handlers/get-nametag");
const logExecution = require("../handlers/log-execution");

module.exports = function handler(req, res) {
  const url = req.url || "/";
  const path = url.split("?")[0];

  if (path === "/getkey") return getkey(req, res);
  if (path === "/claim") return claim(req, res);
  if (path === "/validate") return validate(req, res);
  if (path === "/validate-user") return validateUser(req, res);
  if (path === "/whitelist") return whitelist(req, res);
  if (path === "/revoke") return revoke(req, res);
  if (path === "/blacklist") return blacklist(req, res);
  if (path === "/unblacklist") return blacklist(req, res);
  if (path === "/list-whitelist") return listWhitelist(req, res);
  if (path === "/register-onyx-user") return registerOnyx(req, res);
  if (path === "/nametags") return nametags(req, res);
  if (path === "/set-nametag") return setNametag(req, res);
  if (path.startsWith("/status/")) return status(req, res);
  if (path.startsWith("/get-nametag/")) return getNametag(req, res);
  if (path === "/log-execution") return logExecution(req, res);

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found." }));
};
