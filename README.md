# OPALÉRA — The House of Every Gem

E-commerce group project (IFM2B10 · Quantum Coders): a fine-jewellery
storefront with a real Node.js backend — accounts, per-account cart and
wishlist, orders with printable invoices, verified-purchase reviews, a
manager console, and a password-reset flow.

## Run it

Requires only Node.js (v16+), no installs:

```
node opalera-backend/server.js
```

Then open http://localhost:3000 — it redirects to the storefront. The one
server hosts the whole site and its API together. Always browse via
http://localhost:3000 (not by opening an HTML file directly), or the pages
can't reach the API.

## Folder layout

The project is organised so that HTML, styles, scripts and the backend
each live in their own place:

| Path | What it is |
|---|---|
| `pages/` | **All the site's HTML pages** — the storefront (`jewellery_Html.html`), the 80 product pages + `product.html` template, `payment.html`, `invoice.html`, `account.html`, `admin.html` (Manager Console) and the policy pages |
| `css/` | `product-style.css` — shared styles for the product/checkout/account pages |
| `opalera-backend/` | The Node backend: `server.js` (API, sessions, orders, reviews, and the product catalogue), `data/db.json` (storage, created on first run), and a standalone single-page build in `public/` for solo deployment (e.g. Render) |
| `opalera-backend/js/` | The site's JavaScript: `opalera-data.js` (catalogue helpers + API, loaded by every page), `product-page.js` (product-page logic), `generate-product-pages.js` (rebuild the 80 pages: `node opalera-backend/js/generate-product-pages.js`) |
| `docs/` | Proposal, progress documents, presentation, dataset, image attributions |
| `archive/` | Earlier builds kept for the project record (not part of the running site) |

Pages link to styles and scripts with root-absolute paths (`/css/…`,
`/opalera-backend/js/…`), so the folders can move without breaking links.

## Features

- **Accounts** with password hashing (scrypt) and cookie sessions
- **Forgot / reset password** — one-time 6-digit code (email delivery simulated for the demo), single-use, expires in 15 min
- **Show / hide password** eye icon on every password field
- **Cart, wishlist, orders and reviews** saved per account on the server
- **Printable tax invoices** for every order
- **Manager Console** (`pages/admin.html`) — stock, pieces and sales reports
- **Product catalogue in the database**, served via `GET /api/products`

Product photography hotlinks to Pexels (free stock-photo library) at 1200px.
Delete `opalera-backend/data/db.json` to reset all demo accounts, orders and
reviews (the catalogue re-seeds automatically on the next run).

## Demo accounts

- **Patron:** `demo@example.com` / `demo123` (has order history & invoices)
- **Manager:** `manager@opalera.co.za` / `Opalera2026` (opens the console)
