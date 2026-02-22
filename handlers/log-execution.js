const { sendJson, sendCors, readBody, kvSet, now } = require("../_lib");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return sendCors(res);
  if (req.method !== "POST") return sendJson(res, { error: "Method not allowed." }, 405);

  const body = await readBody(req);

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const entry = {
    username: (body.username || "Unknown").trim(),
    userId: body.userId || null,
    hwid: (body.hwid || "Unknown").trim(),
    executor: (body.executor || "Unknown").trim(),
    thumbUrl: body.thumbUrl || null,
    type: body.type || "Unknown",
    ip,
    at: now(),
  };

  // Store under a unique key so bot can list all logs via kvList("execlog:")
  const key = `execlog:${entry.at}:${entry.username.toLowerCase()}`;
  await kvSet(key, entry, 60 * 60 * 24 * 7); // keep for 7 days

  // Forward to Discord Bot for real-time notification
  const botUrl = process.env.BOT_URL;
  if (botUrl) {
    try {
      await fetch(`${botUrl.replace(/\/$/, "")}/log-execution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch (e) {
      console.error("Failed to forward log to bot:", e);
    }
  }

  return sendJson(res, { ok: true });
};
