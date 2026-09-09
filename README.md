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
| `pages/` | **All the site's HTML pages** — the storefront (`jewellery_Html.html`), the 80 product pages + `product.html` template, `payment.html`, `invoice.html` (with tracking QR code), `tracking.html` (order-tracking timeline), `account.html`, `admin.html` (Manager Console) and the policy pages |
| `css/` | `product-style.css` — shared styles for the product/checkout/account pages |
| `opalera-backend/` | The Node backend: `server.js` (API, sessions, orders, reviews, and the product catalogue), `data/db.json` (storage, created on first run), and a standalone single-page build in `public/` for solo deployment (e.g. Render) |
| `opalera-backend/js/` | The site's JavaScript: `opalera-data.js` (catalogue helpers + API, loaded by every page), `product-page.js` (product-page logic), `generate-product-pages.js` (rebuild the 80 pages: `node opalera-backend/js/generate-product-pages.js`) |
| `docs/` | Proposal, progress documents, presentation, dataset, image attributions |

Pages link to styles and scripts with root-absolute paths (`/css/…`,
`/opalera-backend/js/…`), so the folders can move without breaking links.

## Features

- **Accounts** with password hashing (scrypt) and cookie sessions
- **Forgot / reset password** — one-time 6-digit code (email delivery simulated for the demo), single-use, expires in 15 min
- **Show / hide password** eye icon on every password field
- **Cart, wishlist, orders and reviews** saved per account on the server
- **Printable tax invoices** for every order
- **User roles** — every account is a `patron` or a `manager`; the console signs in under its own server session (scope `manager`), so a patron signed in on the storefront and the manager in the console never collide
- **Product catalogue in the database**, retrieved by every page through the web service `GET /api/products` (names, prices, photos, descriptions, stock, retired flags). Stock is deducted on the server at checkout.
- **Manager Console** (`pages/admin.html`, manager role only):
  - *Product management* — add a piece (`POST /api/products`), edit any piece's name / collection / price / photo / description / stock (`PUT /api/products/:id`), retire or restore it from the storefront, or delete it (`DELETE /api/products/:id`). Changes appear on the storefront and product pages immediately.
  - *Reports* with filters — period (all time, 30 / 90 days, this year, custom month range), collection, province and source (sample history / live orders). Values: pieces sold with growth vs the prior quarter, revenue, orders and average order value, **different products sold** (a read-only text control), **stock on hand** (units and vault value by collection), **registered users per day**, best sellers, sales by collection, units by province.
  - *Orders* from every patron (`GET /api/admin/orders`) and *Patrons* with sign-up dates and roles (`GET /api/admin/users`).

### Bonus enhancements

- **Compare pieces** — tick the compare icon on up to three pieces and open a side-by-side table (photo, price with "Best price", stone, metal, patron rating with "Top rated", availability) with add-to-bag straight from the comparison
- **Order tracking timeline** — every order has a live Placed → Paid → Packed → Shipped → Delivered timeline (a collection path for pay-at-counter orders) at `pages/tracking.html`, with status chips on the account page
- **QR code on invoices** — each invoice carries a scannable QR code (and a status strip) that opens that order's tracking page

Product photography hotlinks to Pexels at 1200px.
Delete `opalera-backend/data/db.json` to reset all demo accounts, orders and
reviews (the catalogue re-seeds automatically on the next run).

## Demo accounts

- **Patron:** `demo@example.com` / `demo123` (has order history & invoices)
- **Manager:** `manager@opalera.co.za` / `Opalera2026` (opens the console)
