# OPALÉRA — backend

A real backend for the storefront: accounts, sessions, a per-account cart
and wishlist, order history, and product reviews — all persisted on the
server instead of only in the browser's localStorage.

## Run it

Requires only Node.js (v16+) — there are no npm dependencies to install.

```
node server.js
```

Then open http://localhost:3000 — that's the storefront, served by the
same server.

Data is stored in `data/db.json` (created automatically on first run).
Delete that file to reset everything.

## What's real now

- **Product catalogue** — the 80 pieces live in the database (seeded
  into `data/db.json` on first run), served via `GET /api/products`.
  The frontend fetches them at load time instead of having them
  hardcoded into `index.html`.
- **Accounts** — sign up / sign in are real HTTP requests. Passwords are
  hashed with `scrypt` (Node's built-in crypto) and never stored in
  plain text. Sessions use a random token in an httpOnly cookie.
- **Cart & wishlist** — saved to your account once you're signed in, so
  they follow you to another browser/device. They're still cached in
  localStorage too, for instant UI and so guests (not signed in) can
  still add items before creating an account.
- **Orders** — checkout creates a real order on the server
  (`POST /api/orders`), returned with an order reference. Card/EFT
  *capture* is still a simulated UI step (no real payment gateway is
  wired up, and no card details are ever sent to this server) — that's
  the one piece intentionally left as a placeholder for a real
  processor like Stripe, Paystack or PayFast.
- **Reviews** — submitting a review posts to the server, and a review is
  automatically marked "Verified purchase" by checking your real order
  history. The seeded sample reviews/ratings baked into the page are
  unchanged and blend with real ones, exactly as before.

## API

All endpoints are under `/api`. Auth uses a cookie, so the frontend
calls `fetch(..., { credentials: "include" })`.

| Method | Path                | Auth | Description                       |
|--------|---------------------|------|------------------------------------|
| POST   | /api/auth/signup    |      | Create account, starts a session   |
| POST   | /api/auth/login     |      | Sign in                            |
| POST   | /api/auth/logout    |      | End the session                    |
| GET    | /api/auth/me        |      | Current signed-in user, or null    |
| GET    | /api/products       |      | The product catalogue              |
| GET    | /api/cart           | ✓    | Your saved cart                    |
| PUT    | /api/cart           | ✓    | Replace your saved cart            |
| GET    | /api/wishlist       | ✓    | Your saved wishlist (product IDs)  |
| PUT    | /api/wishlist       | ✓    | Replace your saved wishlist        |
| GET    | /api/reviews        |      | All reviews                        |
| GET    | /api/reviews/:pid   |      | Reviews for one product            |
| POST   | /api/reviews        | ✓    | Submit a review                    |
| GET    | /api/orders         | ✓    | Your order history                 |
| POST   | /api/orders         | ✓    | Place an order (checkout)          |

## Deploying so your whole team can access it (no installs needed)

Running it locally means only your laptop can reach `localhost:3000`.
For a group project, it's much easier to put it on a free host — then
everyone just opens a link.

1. Create a free account at **github.com**, make a new repository, and
   upload this whole `opalera-backend` folder (drag-and-drop works —
   no command line needed).
2. Create a free account at **render.com**, click **New → Web Service**,
   and connect it to that GitHub repo. Render will detect `render.yaml`
   in this project automatically and fill in the settings for you.
3. Click **Deploy**. After a minute or two you'll get a URL like
   `https://opalera-backend.onrender.com` — that's your live site.
   Share that link with your group.

Note: on the free plan, the server "sleeps" after 15 minutes of no
traffic and takes ~30 seconds to wake back up on the next visit — and
`data/db.json` resets on restart, so saved accounts/orders won't
survive forever. Both are expected on a free tier and fine for a class
project/demo.

## Swapping in a real database / payment gateway later

Everything reads/writes through the `db` object and `saveDb()` at the
top of `server.js` — swap that for Postgres/SQLite/etc. without
touching the route handlers or the frontend. The one spot to wire a
real payment processor is the `POST /api/orders` handler (see the
comment there) and the card form submit handler in `public/index.html`.
