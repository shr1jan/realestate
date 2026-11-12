# Separate administrator sign-in

Administrators use `/admin/login`, reached directly by URL. Public desktop/mobile navigation, footer, saved homes and Google sign-in contain no admin-entry links or buttons. The admin pages have their own shell, username/password form and sign-out control. Google sign-in is only for user accounts and saved homes; even former Google administrator records no longer grant admin access. The old setup-key activation endpoint is disabled.

The generated local credentials are in ignored `ADMIN-CREDENTIALS.local.json`. Open it locally; do not commit it or paste its password into source. Use `http://127.0.0.1:5173/admin/login` for this preview.

The development server explicitly denies HTTP access to private credential files, environment files and local verification tooling. Read credentials through the local filesystem/editor, never through a website URL.

## Configuration and rotation

`node scripts/configure-admin.mjs` creates a strong random password for username `admin`, writes the local credential file and updates ignored `.dev.vars`. To choose a different username/password, the script also accepts JSON through stdin; use a password of at least 16 characters. Do not pass passwords as shell arguments. Running this script rotates the local session secret and invalidates existing admin sessions.

Runtime keys (see `admin-auth.env.example`):

- `ADMIN_USERNAME`: the administrator username.
- `ADMIN_PASSWORD_HASH`: salted PBKDF2-SHA256 hash in the documented script-generated format. Plaintext passwords are never stored in runtime configuration or the database.
- `ADMIN_SESSION_SECRET`: independent random secret for encrypted admin sessions.
- `ADMIN_AUTH_URL`: exact origin, `http://127.0.0.1:5173` locally and `https://stillwell-homes.fabledduck32.chatgpt.site` on the current hosted site.

Production uses the same configured username/password as the delivered local credential file, with the origin set for the hosted site. Keep runtime values secret. If changing credentials later, update the hosted username/hash/session secret as well as local settings. Password or username changes invalidate existing sessions through a credential-version check.

Passwords use a random 16-byte salt and 100,000 PBKDF2-SHA256 iterations supported by the Worker runtime. The generated password has 192 bits of randomness. Each source IP is limited to ten login attempts per 15-minute window through an atomic database counter. Sessions last eight hours, use a separate encrypted HttpOnly SameSite=Strict cookie (Secure on HTTPS), and never grant a user session. Admin API authorization checks the admin cookie independently of Google cookies or legacy role rows.

Apply the new `drizzle/0001_admin_login_limits.sql` migration to D1 as part of deployment. The prepared PostgreSQL schema also includes the rate-limit table; its runtime database cutover remains separate work. Existing listings/enquiries remain unchanged. The old admin table is retained as historical data, not used for authorization.

## Checks

`node scripts/check-admin-auth.mjs` checks direct-link login, public-link removal, separate sessions, invalid credentials, CSRF/origin protections, cookie tampering, logout and throttling against the local server. `scripts/check-regressions.mjs` uses Google user cookies for user operations and a real local username/password login for admin operations. Tests use only the ignored local credential file and do not contact live Google services.
