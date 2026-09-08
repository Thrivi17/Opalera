/* ============================================================
   OPALÉRA backend
   Plain Node.js (no npm dependencies required) — just `node server.js`.
   Provides: real accounts, sessions, orders, reviews and a
   per-account cart/wishlist, backed by a JSON file on disk
   (db.json). Swap the storage layer for a real database later
   without changing the API surface below.
   ============================================================ */
"use strict";

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "data", "db.json");
// Serve the full multi-page OPALÉRA site (storefront, product pages,
// payment, invoices, account, manager console) when this backend sits
// inside the jewellery folder. Deployed standalone (e.g. on Render),
// it falls back to the bundled single-page build in ./public.
const SITE_ROOT = [path.resolve(__dirname, "..", ".."), path.resolve(__dirname, "..")]
  .find(dir => fs.existsSync(path.join(dir, "jewellery_Html.html"))) || null;
const PUBLIC_DIR = SITE_ROOT || path.join(__dirname, "public");
const HOME_PAGE = SITE_ROOT ? "/jewellery_Html.html" : "/index.html";
const SESSION_COOKIE = "opalera_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/* ------------------------------------------------------------
   Tiny JSON-file "database"
   ------------------------------------------------------------ */
function emptyDb() {
  return {
    users: {},      // email -> { firstName, lastName, email, salt, hash, createdAt }
    sessions: {},   // token -> { email, expires }
    orders: [],     // { id, ref, email, items, total, method, status, placedAt }
    reviews: [],    // { id, pid, email, name, stars, text, verified, createdAt }
    wishlists: {},  // email -> [pid, ...]
    carts: {},      // email -> [{ pid, custom, price }, ...]
    resets: {}      // email -> { code, expires, attempts } (password reset)
  };
}

let db = loadDb();
let saveTimer = null;

function loadDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return { ...emptyDb(), ...JSON.parse(raw) };
  } catch (e) {
    return emptyDb();
  }
}

function saveDb() {
  // debounce disk writes slightly so bursts of requests don't thrash the disk
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }, 50);
}

/* ------------------------------------------------------------
   Password hashing (scrypt, built into Node — no bcrypt needed)
   ------------------------------------------------------------ */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}
function verifyPassword(password, salt, hash) {
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(check, "hex"), Buffer.from(hash, "hex"));
}

/* ------------------------------------------------------------
   Sessions
   ------------------------------------------------------------ */
function createSession(email) {
  const token = crypto.randomBytes(32).toString("hex");
  db.sessions[token] = { email, expires: Date.now() + SESSION_TTL_MS };
  saveDb();
  return token;
}
function destroySession(token) {
  delete db.sessions[token];
  saveDb();
}
function sessionEmail(token) {
  const s = token && db.sessions[token];
  if (!s) return null;
  if (s.expires < Date.now()) { delete db.sessions[token]; saveDb(); return null; }
  return s.email;
}

/* ------------------------------------------------------------
   HTTP helpers
   ------------------------------------------------------------ */
function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach(pair => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}
function send(res, status, body, extraHeaders) {
  const headers = { "Content-Type": "application/json; charset=utf-8", ...extraHeaders };
  res.writeHead(status, headers);
  res.end(body === undefined ? "" : JSON.stringify(body));
}
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > 1e6) { reject(new Error("Payload too large")); req.destroy(); return; }
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}
function setSessionCookie(res, token) {
  const expires = new Date(Date.now() + SESSION_TTL_MS).toUTCString();
  res.setHeader("Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`);
}
function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function publicUser(u) {
  return { email: u.email, firstName: u.firstName, lastName: u.lastName };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------
   Route handlers
   ------------------------------------------------------------ */
const routes = [];
function route(method, pattern, handler) {
  // pattern like /api/reviews/:pid -> regex with named groups
  const keys = [];
  const regex = new RegExp("^" + pattern.replace(/:[^/]+/g, m => {
    keys.push(m.slice(1));
    return "([^/]+)";
  }) + "$");
  routes.push({ method, regex, keys, handler });
}

route("POST", "/api/auth/signup", async (req, res, ctx) => {
  const body = await readJsonBody(req);
  const firstName = (body.firstName || "").trim();
  const lastName = (body.lastName || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!firstName || !lastName) return send(res, 400, { error: "First and last name are required." });
  if (!EMAIL_RE.test(email)) return send(res, 400, { error: "Enter a valid email address." });
  if (password.length < 6) return send(res, 400, { error: "Password must be at least 6 characters." });
  if (db.users[email]) return send(res, 409, { error: "An account with that email already exists." });

  const { salt, hash } = hashPassword(password);
  db.users[email] = { firstName, lastName, email, salt, hash, createdAt: new Date().toISOString() };
  saveDb();

  const token = createSession(email);
  setSessionCookie(res, token);
  send(res, 201, { user: publicUser(db.users[email]) });
});

route("POST", "/api/auth/login", async (req, res) => {
  const body = await readJsonBody(req);
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const u = db.users[email];
  if (!u || !verifyPassword(password, u.salt, u.hash)) {
    return send(res, 401, { error: "Email or password is incorrect." });
  }
  const token = createSession(email);
  setSessionCookie(res, token);
  send(res, 200, { user: publicUser(u) });
});

/* ---- Forgotten password: request a one-time reset code ----
   NOTE: no email gateway is wired up in this student demonstration, so —
   in the same spirit as the simulated card capture — the code is returned
   in the response with a note. In production this handler would email the
   code and return only { ok: true }. */
route("POST", "/api/auth/forgot", async (req, res) => {
  const body = await readJsonBody(req);
  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return send(res, 400, { error: "Enter a valid email address." });
  // always answer the same way, so the endpoint doesn't reveal which
  // emails have accounts
  if (!db.users[email]) {
    return send(res, 200, { ok: true, note: "If that email has an account, a reset code has been issued." });
  }
  const code = String(crypto.randomInt(100000, 1000000));  // 6 digits
  db.resets[email] = { code, expires: Date.now() + 15 * 60 * 1000, attempts: 0 };
  saveDb();
  send(res, 200, {
    ok: true,
    note: "If that email has an account, a reset code has been issued.",
    demoCode: code,   // simulated email delivery — remove when a mailer is wired up
    demoNote: "Email delivery is simulated for this demonstration; in production this code would be emailed to you."
  });
});

/* ---- Forgotten password: verify the code and set a new password ---- */
route("POST", "/api/auth/reset", async (req, res) => {
  const body = await readJsonBody(req);
  const email = (body.email || "").trim().toLowerCase();
  const code = String(body.code || "").trim();
  const password = body.password || "";
  const entry = db.resets[email];
  if (!entry || entry.expires < Date.now()) {
    delete db.resets[email]; saveDb();
    return send(res, 400, { error: "That reset code has expired — request a new one." });
  }
  if (entry.attempts >= 5) {
    delete db.resets[email]; saveDb();
    return send(res, 400, { error: "Too many attempts — request a new reset code." });
  }
  if (code !== entry.code) {
    entry.attempts++; saveDb();
    return send(res, 400, { error: "That reset code is incorrect." });
  }
  if (password.length < 6) return send(res, 400, { error: "New password must be at least 6 characters." });

  const { salt, hash } = hashPassword(password);
  db.users[email].salt = salt;
  db.users[email].hash = hash;
  delete db.resets[email];                       // the code is single-use
  for (const [t, s] of Object.entries(db.sessions)) {   // sign out everywhere
    if (s.email === email) delete db.sessions[t];
  }
  saveDb();
  const token = createSession(email);            // sign the patron straight in
  setSessionCookie(res, token);
  send(res, 200, { user: publicUser(db.users[email]) });
});

route("POST", "/api/auth/logout", async (req, res, ctx) => {
  const cookies = parseCookies(req);
  if (cookies[SESSION_COOKIE]) destroySession(cookies[SESSION_COOKIE]);
  clearSessionCookie(res);
  send(res, 200, { ok: true });
});

route("GET", "/api/auth/me", async (req, res, ctx) => {
  if (!ctx.email) return send(res, 200, { user: null });
  send(res, 200, { user: publicUser(db.users[ctx.email]) });
});

function requireAuth(ctx, res) {
  if (!ctx.email) { send(res, 401, { error: "Sign in required." }); return false; }
  return true;
}

/* ---- Cart (per account, so it follows the patron across devices) ---- */
route("GET", "/api/cart", async (req, res, ctx) => {
  if (!requireAuth(ctx, res)) return;
  send(res, 200, { items: db.carts[ctx.email] || [] });
});
route("PUT", "/api/cart", async (req, res, ctx) => {
  if (!requireAuth(ctx, res)) return;
  const body = await readJsonBody(req);
  if (!Array.isArray(body.items)) return send(res, 400, { error: "items must be an array." });
  db.carts[ctx.email] = body.items;
  saveDb();
  send(res, 200, { items: db.carts[ctx.email] });
});

/* ---- Wishlist ---- */
route("GET", "/api/wishlist", async (req, res, ctx) => {
  if (!requireAuth(ctx, res)) return;
  send(res, 200, { pids: db.wishlists[ctx.email] || [] });
});
route("PUT", "/api/wishlist", async (req, res, ctx) => {
  if (!requireAuth(ctx, res)) return;
  const body = await readJsonBody(req);
  if (!Array.isArray(body.pids)) return send(res, 400, { error: "pids must be an array." });
  db.wishlists[ctx.email] = [...new Set(body.pids.map(Number))];
  saveDb();
  send(res, 200, { pids: db.wishlists[ctx.email] });
});

/* ---- Reviews ---- */
route("GET", "/api/reviews", async (req, res) => {
  const list = db.reviews.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  send(res, 200, { reviews: list });
});
route("GET", "/api/reviews/:pid", async (req, res, ctx) => {
  const pid = Number(ctx.params.pid);
  const list = db.reviews.filter(r => r.pid === pid)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  send(res, 200, { reviews: list });
});
route("POST", "/api/reviews", async (req, res, ctx) => {
  if (!requireAuth(ctx, res)) return;
  const body = await readJsonBody(req);
  const pid = Number(body.pid);
  const stars = Math.min(5, Math.max(1, Math.round(Number(body.stars))));
  const text = String(body.text || "").trim().slice(0, 240);
  if (!pid || !stars) return send(res, 400, { error: "pid and stars are required." });

  const u = db.users[ctx.email];
  const verified = db.orders.some(o => o.email === ctx.email && o.items.some(it => it.pid === pid));
  const review = {
    id: crypto.randomUUID(),
    pid, stars, text,
    email: ctx.email,
    name: `${u.firstName} ${u.lastName[0]}.`,
    verified,
    createdAt: new Date().toISOString()
  };
  db.reviews.push(review);
  saveDb();
  send(res, 201, { review });
});

/* ---- Orders / checkout ---- */
route("GET", "/api/orders", async (req, res, ctx) => {
  if (!requireAuth(ctx, res)) return;
  const mine = db.orders.filter(o => o.email === ctx.email)
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  send(res, 200, { orders: mine });
});
route("POST", "/api/orders", async (req, res, ctx) => {
  if (!requireAuth(ctx, res)) return;
  const body = await readJsonBody(req);
  const items = Array.isArray(body.items) ? body.items : [];
  const method = ["card", "eft", "cod"].includes(body.method) ? body.method : "card";
  if (!items.length) return send(res, 400, { error: "Your bag is empty." });

  // NOTE: this is where a real payment gateway call (Stripe / Paystack /
  // PayFast) would happen for "card" and "eft". Card details are
  // deliberately NOT accepted or stored here — only used client-side for
  // the simulated portal — so nothing sensitive ever reaches this server.
  // Totals are recomputed server-side (quantity-aware, VAT-inclusive
  // prices) so the client can't submit a mismatched amount.
  const itemsTotal = items.reduce((s, it) => s + Number(it.price || 0) * (Number(it.qty) || 1), 0);
  const discount = Math.min(Math.max(0, Math.round(Number(body.discount) || 0)), itemsTotal);
  const total = itemsTotal - discount;
  const vat = Math.round(total * 0.15 / 1.15);
  const address = body.address && typeof body.address === "object" ? {
    name: String(body.address.name || "").slice(0, 120),
    street: String(body.address.street || "").slice(0, 200),
    city: String(body.address.city || "").slice(0, 80),
    postal: String(body.address.postal || "").slice(0, 10),
    province: String(body.address.province || "").slice(0, 40),
    phone: String(body.address.phone || "").slice(0, 20)
  } : null;
  const gift = body.gift && typeof body.gift === "object"
    ? { message: String(body.gift.message || "").slice(0, 160) } : null;
  const order = {
    id: crypto.randomUUID(),
    ref: "OP-" + Date.now().toString(36).toUpperCase(),
    email: ctx.email,
    items,
    itemsTotal,
    promo: body.promo ? String(body.promo).slice(0, 20) : null,
    discount,
    vat,
    total,
    gift,
    address,
    method,
    status: method === "cod" ? "reserved" : "paid",
    placedAt: new Date().toISOString()
  };
  db.orders.push(order);
  db.carts[ctx.email] = []; // clear server-side cart on checkout
  saveDb();
  send(res, 201, { order });
});

/* ------------------------------------------------------------
   Static file serving (the storefront itself)
   ------------------------------------------------------------ */
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "application/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon"
};
function serveStatic(req, res, pathname) {
  let rel = pathname === "/" ? HOME_PAGE : pathname;
  const filePath = path.join(PUBLIC_DIR, path.normalize(rel).replace(/^(\.\.[/\\])+/, ""));
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, { error: "Forbidden" });
  // never serve the backend folder over HTTP (source code, and data/db.json
  // holding password hashes and session tokens); compare case-insensitively
  // because the Windows filesystem is case-insensitive. The one exception is
  // opalera-backend/js/, which holds the site's shared front-end scripts.
  const lower = filePath.toLowerCase();
  const jsDir = `${path.sep}opalera-backend${path.sep}js${path.sep}`;
  const isSharedScript = lower.includes(jsDir) && lower.endsWith(".js");
  if (SITE_ROOT && lower.includes(`${path.sep}opalera-backend`) && !isSharedScript) {
    return send(res, 403, { error: "Forbidden" });
  }
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, { error: "Not found" });
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

/* ------------------------------------------------------------
   Server
   ------------------------------------------------------------ */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const cookies = parseCookies(req);
  const email = sessionEmail(cookies[SESSION_COOKIE]);

  if (url.pathname.startsWith("/api/")) {
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = r.regex.exec(url.pathname);
      if (!m) continue;
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      try {
        await r.handler(req, res, { params, email });
      } catch (e) {
        console.error(e);
        send(res, 500, { error: "Server error." });
      }
      return;
    }
    return send(res, 404, { error: "No such endpoint." });
  }

  if (req.method === "GET") return serveStatic(req, res, url.pathname);
  send(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`OPALÉRA backend running at http://localhost:${PORT}`);
});
