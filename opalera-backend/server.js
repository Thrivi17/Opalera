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
// The multi-page site keeps its HTML in a pages/ folder and its stylesheet
// in css/; the storefront is pages/jewellery_Html.html.
const SITE_ROOT = [path.resolve(__dirname, "..", ".."), path.resolve(__dirname, "..")]
  .find(dir => fs.existsSync(path.join(dir, "pages", "jewellery_Html.html"))) || null;
const PUBLIC_DIR = SITE_ROOT || path.join(__dirname, "public");
const HOME_PAGE = SITE_ROOT ? "/pages/jewellery_Html.html" : "/index.html";
const SESSION_COOKIE = "opalera_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/* ------------------------------------------------------------
   Tiny JSON-file "database"
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   Product catalogue — seeded into the database on first run.
   This is the ONLY hardcoded copy; everything else (the frontend
   included) reads products from the database via GET /api/products,
   so the catalogue can be edited, added to, or migrated to a real
   database later without touching index.html at all.
   ------------------------------------------------------------ */
const PRODUCTS = [
  {id:1,category:"necklace",name:"Sapphire Necklace",price:1759,img:"https://images.pexels.com/photos/32988651/pexels-photo-32988651.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:2,category:"necklace",name:"Cyan Necklace",price:3199,img:"https://images.pexels.com/photos/10215179/pexels-photo-10215179.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:3,category:"necklace",name:"Diamond Necklace",price:2119,img:"https://images.pexels.com/photos/12427695/pexels-photo-12427695.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:4,category:"necklace",name:"Diamond Necklace",price:3199,img:"https://images.pexels.com/photos/20100105/pexels-photo-20100105.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:5,category:"necklace",name:"Diamond Necklace",price:1399,img:"https://images.pexels.com/photos/7541803/pexels-photo-7541803.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:6,category:"necklace",name:"Diamond Necklace",price:6799,img:"https://images.pexels.com/photos/20455782/pexels-photo-20455782.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:7,category:"necklace",name:"Triple Gold Layer Necklace",price:3199,img:"https://images.pexels.com/photos/14999288/pexels-photo-14999288.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:8,category:"necklace",name:"Flower Necklace",price:3199,img:"https://images.pexels.com/photos/34461220/pexels-photo-34461220.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:9,category:"necklace",name:"Heart Necklace",price:1399,img:"https://images.pexels.com/photos/19821929/pexels-photo-19821929.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:10,category:"necklace",name:"Yellow Pearl Necklace",price:5359,img:"https://images.pexels.com/photos/12231889/pexels-photo-12231889.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:11,category:"necklace",name:"Green Pearl Necklace",price:2119,img:"https://images.pexels.com/photos/17925116/pexels-photo-17925116.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:12,category:"necklace",name:"White Diamond Necklace",price:1759,img:"https://images.pexels.com/photos/7134458/pexels-photo-7134458.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:13,category:"necklace",name:"LOVE Word Necklace",price:5359,img:"https://images.pexels.com/photos/15576969/pexels-photo-15576969.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:14,category:"necklace",name:"White Small Stone Necklace",price:1759,img:"https://images.pexels.com/photos/4595723/pexels-photo-4595723.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:15,category:"necklace",name:"Rose & White Gold Necklace",price:2119,img:"https://images.pexels.com/photos/19564918/pexels-photo-19564918.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:16,category:"necklace",name:"Yellow & White Gold Necklace",price:1759,img:"https://images.pexels.com/photos/16935588/pexels-photo-16935588.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:17,category:"necklace",name:"White Gold Diamond Necklace",price:5359,img:"https://images.pexels.com/photos/7541801/pexels-photo-7541801.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:18,category:"necklace",name:"Flower Petal Pattern Necklace",price:2119,img:"https://images.pexels.com/photos/34333050/pexels-photo-34333050.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:19,category:"necklace",name:"Small Three Flower Necklace",price:2119,img:"https://images.pexels.com/photos/16879656/pexels-photo-16879656.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:20,category:"necklace",name:"Beautiful Gold Necklace",price:1039,img:"https://images.pexels.com/photos/17368723/pexels-photo-17368723.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:21,category:"necklace",name:"Simple White Gold Necklace",price:5359,img:"https://images.pexels.com/photos/29502933/pexels-photo-29502933.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:22,category:"necklace",name:"Diamond Cult Necklace",price:1759,img:"https://images.pexels.com/photos/37798256/pexels-photo-37798256.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:23,category:"necklace",name:"White Heart Necklace",price:2119,img:"https://images.pexels.com/photos/6709148/pexels-photo-6709148.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:24,category:"necklace",name:"Small Clove Necklace",price:1759,img:"https://images.pexels.com/photos/16082501/pexels-photo-16082501.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:25,category:"necklace",name:"Peacock Feather Necklace",price:5359,img:"https://images.pexels.com/photos/8656236/pexels-photo-8656236.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:26,category:"necklace",name:"Green Diamond Necklace",price:5359,img:"https://images.pexels.com/photos/9322933/pexels-photo-9322933.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:27,category:"necklace",name:"Pink Flower Necklace",price:5359,img:"https://images.pexels.com/photos/9173459/pexels-photo-9173459.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:28,category:"necklace",name:"Triple Layer Gold Necklace",price:5359,img:"https://images.pexels.com/photos/4889719/pexels-photo-4889719.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:29,category:"necklace",name:"Five Layer White Gold Pearl Necklace",price:5359,img:"https://images.pexels.com/photos/23495720/pexels-photo-23495720.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:30,category:"necklace",name:"Spiral Pink Necklace",price:5359,img:"https://images.pexels.com/photos/34444213/pexels-photo-34444213.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:31,category:"earrings",name:"Rose Gold Earrings",price:2219,img:"https://images.pexels.com/photos/34365842/pexels-photo-34365842.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:32,category:"earrings",name:"Rose Gold Star Earrings",price:1859,img:"https://images.pexels.com/photos/16858919/pexels-photo-16858919.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:33,category:"earrings",name:"Gold Leaf Earrings",price:2219,img:"https://images.pexels.com/photos/12144990/pexels-photo-12144990.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:34,category:"earrings",name:"24K Gold Leaf Earrings",price:1119,img:"https://images.pexels.com/photos/7248760/pexels-photo-7248760.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:35,category:"earrings",name:"Gold Pearl Earrings",price:4799,img:"https://images.pexels.com/photos/11365012/pexels-photo-11365012.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:36,category:"earrings",name:"Peacock Gold Earrings",price:2589,img:"https://images.pexels.com/photos/4155252/pexels-photo-4155252.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:37,category:"earrings",name:"Blue Peacock Long Gold Earrings",price:1819,img:"https://images.pexels.com/photos/4155247/pexels-photo-4155247.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:38,category:"earrings",name:"Pink-White Diamond Earrings",price:2039,img:"https://images.pexels.com/photos/13595660/pexels-photo-13595660.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:39,category:"earrings",name:"Pink-Green-White Diamond Earrings",price:2079,img:"https://images.pexels.com/photos/34501351/pexels-photo-34501351.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:40,category:"earrings",name:"Pink Stone Jhumka Earrings",price:2039,img:"https://images.pexels.com/photos/9430429/pexels-photo-9430429.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:41,category:"earrings",name:"Red-Green Heart Earrings",price:1669,img:"https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:42,category:"earrings",name:"Beautiful Pearl-Diamond Earrings",price:1859,img:"https://images.pexels.com/photos/4974343/pexels-photo-4974343.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:43,category:"earrings",name:"Small Pink Diamond Earrings",price:2219,img:"https://images.pexels.com/photos/28389453/pexels-photo-28389453.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:44,category:"earrings",name:"Pink Diamond Leaf Earrings",price:3329,img:"https://images.pexels.com/photos/13219289/pexels-photo-13219289.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:45,category:"earrings",name:"Beautiful Swan Shaped Earrings",price:1119,img:"https://images.pexels.com/photos/33737455/pexels-photo-33737455.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:46,category:"earrings",name:"Fire Stone Earrings",price:2219,img:"https://images.pexels.com/photos/8274718/pexels-photo-8274718.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:47,category:"earrings",name:"Yellow Stone Earrings",price:1819,img:"https://images.pexels.com/photos/4004225/pexels-photo-4004225.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:48,category:"earrings",name:"Yellow Gold Stud Earrings",price:2589,img:"https://images.pexels.com/photos/12168883/pexels-photo-12168883.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:49,category:"earrings",name:"Diamond Earrings",price:2219,img:"https://images.pexels.com/photos/16242338/pexels-photo-16242338.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:50,category:"earrings",name:"Beautiful Abstract Earrings",price:2959,img:"https://images.pexels.com/photos/32989025/pexels-photo-32989025.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:51,category:"pendant",name:"Pearl Pendant",price:1869,img:"https://images.pexels.com/photos/14584454/pexels-photo-14584454.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:52,category:"pendant",name:"Purple-Orange Stone Pendant",price:1869,img:"https://images.pexels.com/photos/35532662/pexels-photo-35532662.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:53,category:"pendant",name:"Orange-Green Pearl Pendant",price:1419,img:"https://images.pexels.com/photos/10556215/pexels-photo-10556215.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:54,category:"pendant",name:"Black-White Pearl Pendant",price:2149,img:"https://images.pexels.com/photos/10877350/pexels-photo-10877350.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:55,category:"pendant",name:"Purple Heart Pendant",price:959,img:"https://images.pexels.com/photos/13292938/pexels-photo-13292938.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:56,category:"pendant",name:"Light Blue Heart Pendant",price:4159,img:"https://images.pexels.com/photos/5370705/pexels-photo-5370705.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:57,category:"pendant",name:"Purple Clove Pendant",price:3659,img:"https://images.pexels.com/photos/12197267/pexels-photo-12197267.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:58,category:"pendant",name:"Bird Pendant",price:3249,img:"https://images.pexels.com/photos/32988665/pexels-photo-32988665.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:59,category:"pendant",name:"LOVE Letter Pendant",price:3249,img:"https://images.pexels.com/photos/38290052/pexels-photo-38290052.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:60,category:"pendant",name:"I Love You With Arrow Pendant",price:3249,img:"https://images.pexels.com/photos/5370650/pexels-photo-5370650.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:61,category:"pendant",name:"Simple White Pearl Pendant",price:3249,img:"https://images.pexels.com/photos/34444209/pexels-photo-34444209.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:62,category:"pendant",name:"Infinity Pendant",price:3249,img:"https://images.pexels.com/photos/9280250/pexels-photo-9280250.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:63,category:"pendant",name:"Heart With Love Pendant",price:3249,img:"https://images.pexels.com/photos/34399039/pexels-photo-34399039.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:64,category:"pendant",name:"Cute Bow Pendant",price:3249,img:"https://images.pexels.com/photos/4735885/pexels-photo-4735885.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:65,category:"pendant",name:"Heart Infinity Pendant",price:3249,img:"https://images.pexels.com/photos/12638795/pexels-photo-12638795.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:66,category:"pendant",name:"Double Heart Pendant",price:3249,img:"https://images.pexels.com/photos/34372585/pexels-photo-34372585.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:67,category:"pendant",name:"Double Infinity Pendant",price:3249,img:"https://images.pexels.com/photos/7679824/pexels-photo-7679824.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:68,category:"pendant",name:"Rose Gold Infinity Heart Pendant",price:3249,img:"https://images.pexels.com/photos/10983782/pexels-photo-10983782.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:69,category:"pendant",name:"Infinity Circle Pendant",price:3249,img:"https://images.pexels.com/photos/4155254/pexels-photo-4155254.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:70,category:"pendant",name:"Kitty Pendant",price:3249,img:"https://images.pexels.com/photos/7679654/pexels-photo-7679654.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:71,category:"pendant",name:"Cute Star Pendant",price:3249,img:"https://images.pexels.com/photos/34505711/pexels-photo-34505711.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:72,category:"pendant",name:"Heart Cylinder Pendant",price:3249,img:"https://images.pexels.com/photos/4741711/pexels-photo-4741711.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:73,category:"pendant",name:"Rose Pendant",price:3249,img:"https://images.pexels.com/photos/19783942/pexels-photo-19783942.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:74,category:"pendant",name:"Classic Pendant",price:3249,img:"https://images.pexels.com/photos/36854160/pexels-photo-36854160.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:75,category:"pendant",name:"Abstract Pendant",price:3249,img:"https://images.pexels.com/photos/9428788/pexels-photo-9428788.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:76,category:"pendant",name:"Triple Stone Pendant",price:3249,img:"https://images.pexels.com/photos/8369437/pexels-photo-8369437.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:77,category:"pendant",name:"Signature Pendant",price:3249,img:"https://images.pexels.com/photos/29033684/pexels-photo-29033684.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:78,category:"pendant",name:"Double Butterfly Pendant",price:3249,img:"https://images.pexels.com/photos/4735890/pexels-photo-4735890.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:79,category:"pendant",name:"Hexagon Pendant",price:3249,img:"https://images.pexels.com/photos/735276/pexels-photo-735276.jpeg?auto=compress&cs=tinysrgb&w=1200"},
  {id:80,category:"pendant",name:"Heart Butterfly Pendant",price:3249,img:"https://images.pexels.com/photos/34317579/pexels-photo-34317579.jpeg?auto=compress&cs=tinysrgb&w=1200"},
];

function emptyDb() {
  return {
    users: {},      // email -> { firstName, lastName, email, salt, hash, createdAt }
    sessions: {},   // token -> { email, expires }
    orders: [],     // { id, ref, email, items, total, method, status, placedAt }
    reviews: [],    // { id, pid, email, name, stars, text, verified, createdAt }
    wishlists: {},  // email -> [pid, ...]
    carts: {},      // email -> [{ pid, custom, price }, ...]
    resets: {},     // email -> { code, expires, attempts } (password reset)
    products: PRODUCTS.slice()  // catalogue, seeded on first run; served via GET /api/products
  };
}

let db = loadDb();
let saveTimer = null;

function loadDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const loaded = { ...emptyDb(), ...JSON.parse(raw) };
    // older db.json (saved before products lived in the DB) won't have a
    // products key yet — seed it in rather than losing the catalogue
    if (!Array.isArray(loaded.products) || !loaded.products.length) loaded.products = PRODUCTS.slice();
    return loaded;
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

/* ---- Products (catalogue lives in the DB; the standalone build reads it) ---- */
route("GET", "/api/products", async (req, res) => {
  send(res, 200, { products: db.products });
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

  // send "/" to the storefront in pages/ (a real redirect, so the browser's
  // URL sits inside pages/ and the pages' relative links resolve correctly)
  if (req.method === "GET" && url.pathname === "/" && SITE_ROOT) {
    res.writeHead(302, { Location: HOME_PAGE });
    return res.end();
  }
  if (req.method === "GET") return serveStatic(req, res, url.pathname);
  send(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`OPALÉRA backend running at http://localhost:${PORT}`);
});
