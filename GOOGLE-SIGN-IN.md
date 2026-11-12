# Google sign-in setup

Google is now the application's sign-in provider. Credentials are deliberately blank until supplied. Until then, the Google button is disabled with a clear message and Google sign-in endpoints return HTTP 503. With a configured session secret/origin, local session/CSRF/sign-out endpoints remain available so existing sessions can still sign out if Google credentials are removed. No fake Google identity or implicit ChatGPT login is enabled.

## Credentials to configure later

Create an OAuth client of type **Web application** in Google Cloud, configure the consent screen and add test users if the app is still in testing. Request only `openid email profile`.

Configure these server-side values (see `google-auth.env.example`):

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the OAuth client.
- `AUTH_SECRET`, a random secret of at least 32 characters. A strong secret was generated in the ignored local `.dev.vars`; use a separate generated secret for production and keep it stable across deployments.
- `AUTH_URL`, the exact site origin without a path. Use `http://127.0.0.1:5173` for this local preview and `https://stillwell-homes.fabledduck32.chatgpt.site` for the current hosted version.

Register these exact authorized redirect URIs on the corresponding Google OAuth client:

```
http://127.0.0.1:5173/api/auth/callback/google
https://stillwell-homes.fabledduck32.chatgpt.site/api/auth/callback/google
```

Use separate local/production clients if preferred. If using `localhost` or a custom domain, register that exact origin/callback and update AUTH_URL; the origin is checked rather than inferred from arbitrary headers. No other Google API keys, service-account credentials or refresh-token permissions are needed for basic sign-in. Store production values in runtime secrets, never source, browser environment variables or the hosting manifest.

## Implemented behavior

Auth.js handles Google OpenID Connect, authorization-code exchange, state, nonce, PKCE and ID-token validation. Only Google profiles with verified email are accepted. Sessions are encrypted HttpOnly cookies with SameSite=Lax, Secure on HTTPS, and a seven-day lifetime. Sign-in and sign-out POSTs require CSRF tokens. Return destinations stay on this site, retain pending saves and search context, and reject authentication loops. A callback failure shows a recoverable login state and retains a valid pending destination.

Saved homes and administrator checks use `google:<Google subject ID>`. Emails are display/contact fields, never account-linking or administrator proof. The first Google administrator must enter the existing private setup key; claiming another Google administrator through setup is blocked once one exists. Legacy administrator rows are retained but cannot authenticate through the app. Listings remain shared; old users' saved homes are retained under their old IDs. Any desired transfer must verify both accounts explicitly; do not automatically merge by email. Never expose the private setup key in the browser bundle.

The hosting platform's private-site access gate remains separate. Its existing ChatGPT routes/helper are retained for hosting compatibility; app account access ignores platform identity headers. Changing the hosting audience or deploying to a standalone origin is separate work.

## Verification

`node scripts/check-google-auth.mjs` exercises the protocol against mocked Google discovery/token/JWKS endpoints, including a signed test ID token. It contacts no live Google account. `node scripts/check-google-flows.mjs` tests local session access, account isolation and first-Google-admin setup against a disposable local database. It needs local AUTH_SECRET/AUTH_URL and the existing local setup key and creates the `google:local_seedy` test administrator. Then `node scripts/check-regressions.mjs` can run against the API runner at port 5175 using short-lived local test cookies. Remove this QA administrator after testing before activating a real Google owner.

The original `check-flows.mjs` and historical `.design/browser-check.mjs` belong to the former ChatGPT login implementation and are not Google authentication checks. Live Google sign-in remains unverified until real credentials and consent-screen settings are supplied.

References: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Google web-server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server).
