# SweetBite API

A real backend for SweetBite Cakes, starting with user accounts. Built with
Node.js, Express, and Postgres. Everything else (menu, orders, payments)
plugs into this same structure later — see "Adding more features" below.

## 1. Get a Postgres database

Any of these work — pick one, then copy its connection string:

- **Render** → New → PostgreSQL → copy the "External Database URL"
- **Railway** → New Project → Provision PostgreSQL → copy the connection URL
- **Supabase** → New Project → Settings → Database → Connection string

Or run Postgres locally with Docker:

```bash
docker run --name sweetbite-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sweetbite -p 5432:5432 -d postgres
```

## 2. Configure

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` with the connection string from step 1, and generate
a real `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

If you're on Render/Railway/Supabase in production, set `DATABASE_SSL=true`.

## 3. Install and migrate

```bash
npm install
npm run db:migrate
npm run db:seed   # optional — loads the 6 cakes currently on the live site
```

`db:migrate` and `db:seed` run the SQL files in `db/` directly through
Node's `pg` driver (see `scripts/migrate.js` / `scripts/seed.js`) — no
`psql` install required, and it works the same on Windows, Mac, and Linux.
There's no migration framework here — for a project this size, running the
schema file directly is simpler than adding one. If you outgrow that, look
at `node-pg-migrate` or Prisma Migrate later. `schema.sql` is safe to
re-run — every statement uses `IF NOT EXISTS` / `CREATE OR REPLACE`, so it
won't error or duplicate data on a second run. `db/seed.sql` is also safe
to re-run (`ON CONFLICT (name) DO NOTHING`).

(If you'd rather run the SQL files manually — e.g. to poke around the
database directly — `psql "$DATABASE_URL" -f db/schema.sql` still works
fine if you have `psql` installed; it's just no longer required.)

## 4. Run it

```bash
npm run dev     # auto-restarts on file changes (nodemon)
npm start       # plain node, for production
```

Server boots on `http://localhost:4000` by default.

## API reference

All request/response bodies are JSON. Protected routes need:
`Authorization: Bearer <token>`

### `POST /api/auth/register`
```json
{ "name": "Amara Osei", "email": "amara@email.com", "phone": "0712345678", "password": "at-least-8-chars" }
```
→ `201` `{ "token": "...", "user": { "id": 1, "name": "...", "email": "...", "phone": "...", "createdAt": "..." } }`

### `POST /api/auth/login`
```json
{ "email": "amara@email.com", "password": "at-least-8-chars" }
```
→ `200` `{ "token": "...", "user": { ... } }`

### `GET /api/auth/me`
→ `200` `{ "user": { ... } }`

### `PATCH /api/auth/me`
```json
{ "name": "New Name", "phone": "0700000000" }
```
→ `200` `{ "user": { ... } }`

### `POST /api/auth/change-password`
```json
{ "currentPassword": "old-password", "newPassword": "new-password-8plus" }
```
→ `200` `{ "message": "Password updated." }`

### `GET /api/health`
→ `200` `{ "status": "ok" }` — use this for uptime checks / load balancer health checks.

### `GET /api/cakes`
Public. Optional query params: `?tag=Chocolate` (matches the frontend's filter bar; omit or use `All` for everything), `?includeUnavailable=true` (otherwise sold-out cakes are hidden).
→ `200` `{ "cakes": [ { "id": 1, "name": "...", "shortDesc": "...", "fullDesc": "...", "price": 12900, "tag": "Chocolate", "badge": "popular", "imageUrl": "...", "galleryUrls": ["...", "..."], "isAvailable": true, "createdAt": "..." }, ... ] }`

### `GET /api/cakes/:id`
Public.
→ `200` `{ "cake": { ... same shape as above ... } }`

### `POST /api/cakes`
Requires `Authorization: Bearer <token>` (any logged-in user for now — see the admin-role note below).
```json
{
  "name": "Vanilla Cloud",
  "shortDesc": "Light vanilla sponge with whipped cream.",
  "fullDesc": "A full paragraph description...",
  "price": 3800,
  "tag": "Classic",
  "badge": null,
  "imageUrl": "https://...",
  "galleryUrls": ["https://...", "https://..."]
}
```
`tag` must be one of: `Chocolate`, `Fruity`, `Citrus`, `Premium`, `Classic`, `Caramel`. `badge` is optional: `popular`, `new`, or omit it.
→ `201` `{ "cake": { ... } }`

### `PATCH /api/cakes/:id`
Requires auth. Same body shape as `POST`, but every field is optional — send only what's changing. Also accepts `"isAvailable": false` to mark a cake sold out without deleting it.
→ `200` `{ "cake": { ... } }`

### `DELETE /api/cakes/:id`
Requires auth.
→ `204` no body

## Try it with curl

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Amara Osei","email":"amara@email.com","password":"supersecret123"}'

# Login (grab the token from the response)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amara@email.com","password":"supersecret123"}'

# Fetch the logged-in user
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <token from login>"
```

## Security notes

- Passwords are hashed with bcrypt (10 salt rounds), never stored or returned in plain text.
- JWTs are stateless and expire after `JWT_EXPIRES_IN` (default 7 days). There's no server-side revocation list — if you need instant logout/ban capability later, that means either short-lived tokens + refresh tokens, or a token blocklist table.
- Login and register are rate-limited (20 requests / 15 min / IP) to slow down brute-force guessing.
- `helmet` sets sane security headers; `cors` restricts browser access to the origins listed in `CORS_ORIGIN`.
- Login returns the same error for "no such user" and "wrong password" so the API can't be used to enumerate registered emails.

## Adding more features

Follow the same pattern for each new resource:

1. Add a table to `db/schema.sql` (and re-run `npm run db:migrate`, or write a new migration file once you have more than one).
2. `src/controllers/xController.js` — the actual logic.
3. `src/routes/xRoutes.js` — validation + wiring to the controller.
4. Register it in `src/routes/index.js`: `router.use('/x', require('./xRoutes'))`.

Sensible next resources for this project, in order:
- **`orders`** — replace the localStorage-based cart/order/tracking system in `script.js` with real rows tied to a `user_id` and a real `cake_id`, so orders persist and survive a page refresh or device switch.
- **payments** — M-Pesa (Daraja API) or Stripe, triggered once an order is created.
- **admin role** — add a `role` column to `users` and a `requireAdmin` middleware, then swap the `requireAuth` on the cake write routes for it so only shop staff (not any logged-in customer) can edit the menu.

## Deploying

Render and Railway both auto-detect this as a Node app: set the build
command to `npm install` and the start command to `npm start`, then add
your `.env` values as environment variables in their dashboard (never
commit `.env` — it's already in `.gitignore`).