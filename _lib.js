/**
 * _lib.js — Onyx Key System shared utilities
 * Storage: local JSON file (no external database needed)
 * Drop-in replacement for Upstash KV
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ── Storage file location ─────────────────────────────────────────────────────
// On Railway this persists across deploys as long as you use the same volume.
// All data lives in one JSON file next to this file.
const DB_PATH = path.join(__dirname, "onyx_db.json");

// ── In-memory DB with file persistence ───────────────────────────────────────
let db = { records: {} };

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      db = JSON.parse(raw);
      if (!db.records) db.records = {};
    }
  } catch (e) {
    console.error("[DB] Failed to load DB, starting fresh:", e.message);
    db = { records: {} };
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("[DB] Failed to save DB:", e.message);
  }
}

// Load on startup
loadDb();

// Auto-save every 30 seconds as a safety net
setInterval(saveDb, 30_000);

// ── TTL cleanup — remove expired records on read ──────────────────────────────
function isExpired(record) {
  if (!record) return true;
  if (record._expiresAt && Date.now() > record._expiresAt) return true;
  return false;
}

// ── KV API (matches Upstash interface used by routes) ────────────────────────

async function kvGet(key) {
  const record = db.records[key];
  if (!record || isExpired(record)) {
    if (record) {
      delete db.records[key]; // clean up expired
      saveDb();
    }
    return null;
  }
  return record.value;
}

/**
 * @param {string} key
 * @param {*} value  — anything JSON-serialisable
 * @param {number} [ttlSeconds] — optional TTL in seconds
 */
async function kvSet(key, value, ttlSeconds) {
  db.records[key] = {
    value,
    _expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    _updatedAt: Date.now(),
  };
  saveDb();
  return value;
}

async function kvDel(key) {
  delete db.records[key];
  saveDb();
}

/**
 * Returns all keys that start with the given prefix.
 * Mimics Upstash's kvList behaviour.
 */
async function kvList(prefix) {
  const now = Date.now();
  return Object.entries(db.records)
    .filter(([k, v]) => k.startsWith(prefix) && (!v._expiresAt || v._expiresAt > now))
    .map(([k]) => k);
}

// ── CORS headers ──────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-server-secret",
};

function sendCors(res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  res.writeHead(204);
  res.end();
}

function sendJson(res, data, status = 200) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// ── Body parser ───────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function verifySecret(req) {
  const secret = process.env.SERVER_SECRET;
  if (!secret) return false;
  return req.headers["x-server-secret"] === secret;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function now() {
  return Math.floor(Date.now() / 1000);
}

function generateKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "ONYX-";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) key += "-";
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

module.exports = {
  // KV
  kvGet,
  kvSet,
  kvDel,
  kvList,
  // HTTP
  sendJson,
  sendCors,
  readBody,
  CORS,
  // Auth
  verifySecret,
  // Misc
  now,
  generateKey,
};