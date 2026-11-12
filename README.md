# Stillwell

A real estate website with property browsing, account-based saved homes and a protected listing management portal. The initial Austin/USD collection contains six clearly marked fictional homes.

## Run locally

Node 22.13+ is required. Run `npm ci`, then `npm run build`. Apply the schema once:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_steady_leader.sql
```

Set `ADMIN_SETUP_KEY` to a long random secret in the ignored `.dev.vars` file, then run `npm run dev`. The local URL is `http://127.0.0.1:5173`. Local sign-in uses the starter's loopback-only `seedy@sites.test` development identity. Hosted authentication is provided by Sites; development mock auth is absent from production builds.

Visit `/admin`, sign in and activate the first administrator with the private setup key. The activation is atomic and stops accepting new administrators after the first account is configured. Local and hosted databases are separate, so activate the account in each environment you use. The key must also be configured as a Sites runtime secret for hosted setup. The current private key and owner instructions are in `ADMIN-ACCESS.local.md`, an ignored local file.

## Features

- Public browsing, buy/rent, location search, maximum price, property type, bedrooms and price sorting.
- Property detail pages with galleries, keyboard controls, features and an enquiry form.
- Sign-in is required to save. The original property is preserved through login and the pending save is completed.
- Saved homes are stored per stable account ID in D1.
- Server-authorized admin listing creation and updates, publication, drafts and archives.
- Photo uploads to R2 (JPG, PNG, WebP, 8 MB each), or HTTPS image URLs. Uploaded assets are served through `/media/`.
  Admin file uploads are converted to WebP in the browser before transfer, retaining dimensions. The encoder tests qualities from 85–100 against sampled local RGB SSIM and pixel error, increasing quality for difficult photos. These are conservative similarity heuristics, not a guarantee of perceptual identity or a percentage of original quality. Some photos require lossless output or produce larger files. Existing WebP is retained when recompression would enlarge it; image URLs and existing uploads are unchanged.
- Enquiries persist in D1 and appear in the admin inbox. No email delivery provider is configured; the listing manager can reply using the visitor's email link.
- Responsive desktop/tablet/mobile layouts, semantic controls, visible focus and reduced-motion support.

Contact actions appear only on individual property detail pages. Draft and archived homes are excluded from public pages and cannot be newly saved.

## Storage and deployment

Neon PostgreSQL and Neon S3-compatible Object Storage integration preparation is documented in [NEON-SETUP.md](NEON-SETUP.md). Active database queries remain on D1 until the future tested cutover. New photo writes accept only converted WebP; originals are never stored. The storage adapter can use the Neon bucket once its complete server-side configuration is supplied.

Cloudflare D1 uses `DB`; R2 uses `BUCKET`. Schema and generated migration metadata are committed under `db/` and `drizzle/`. Seeds are application data and are inserted once into an empty catalogue, outside schema migrations. Archiving preserves listings and their associated enquiries.

`.openai/hosting.json` identifies the private Sites project. Sites provisioning applies the migrations and connects production storage. Build with the Sites build helper or `npm run build`. Stop the built preview before rebuilding on Windows because Wrangler holds handles inside `dist/`.

The app supports anonymous property browsing when the Site audience is made public. The first publication is owner-private for review; this hosting access boundary is separate from the app's optional save-login flow.

## Validation

`npx tsc --noEmit` checks types. `scripts/check-flows.mjs` exercises a fresh local database and the first-admin setup, then the listing lifecycle, permissions, saves, uploads and enquiries. It intentionally creates local test data; it is a first-setup integration check, not a repeatable production command.

For the regression suite, start the loopback-only API runner with `node node_modules/vite/bin/vite.js --config scripts/vite/qa.config.ts --port 5175`, then run `node scripts/check-regressions.mjs`. This runner accepts synthetic identity headers so account isolation can be tested; it is a local test configuration and is never used for production. Use an initialized local database with `local_seedy` as its administrator. The suite writes clearly named QA listings and enquiries and emits cleanup SQL under `.design/refinement/`. The separate runner avoids a Windows Wrangler proxy restart issue during rejected-body tests; browser QA uses the built production Worker.

Listing updates include `expectedUpdatedAt` from the editor's loaded record. A stale write receives HTTP 409 rather than overwriting another edit. Saved counts and lists include only published homes. JSON endpoints reject malformed or oversized input with client errors, and photo-upload parsing errors remain JSON responses.

`.design/browser-check.mjs` records interactive browser QA using the installed design skill's local browser runner. Captures and the visual evidence receipt are under `.design/final/`. QA captures are excluded from Git and deployment assets. `DESIGN.md` records the implemented system.

The latest bug-fix/refinement pass is recorded under `.design/refinement/`: 33 API regressions, 32 interactive browser checks and 29 final production layout/API checks. Original release captures under `.design/final/` remain as the visual baseline. Upload checks include a real 4 MB PNG and oversized streamed requests without Content-Length. Browser checks also cover failed images before hydration, response-body timeouts, preserved search filters through sign-in, and navigation guards during pending saves/uploads.

## Before public launch

Replace the fictional properties and illustrative photographs through the admin portal. Set the real brand, service market and contact/privacy information. If automatic email notifications are desired, connect an email provider; current enquiries are delivered to the portal inbox.
