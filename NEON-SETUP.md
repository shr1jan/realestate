# Neon integration preparation

The PostgreSQL client, schema and initial SQL are prepared under `db/postgres/`. The running application still uses D1; no database cutover, data transfer or Neon provisioning has happened. Keep that boundary until a Neon database is available for testing. `DATABASE_URL` is a server-side secret, never a browser environment variable.

Photo storage has a working S3-compatible adapter using signed requests. It follows Neon's documented path-style endpoint pattern. Configure these server-side values from your Neon branch's Object Storage settings:

- `AWS_ENDPOINT_URL_S3`: the supplied branch storage endpoint.
- `S3_BUCKET`: the bucket name you create for listing photos.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: storage credentials.
- `AWS_REGION`: the region supplied by Neon (defaults to `us-east-2`).
- `AWS_SESSION_TOKEN`: only if the issued credentials require it.

Use `neon.env.example` for key names. For local use, add actual values to ignored `.dev.vars`. Hosted values belong in Sites runtime secrets. An entirely absent S3 configuration continues using the existing local/R2 bucket. Partial S3 configuration fails clearly; configured S3 errors never silently write to R2. Once configured, `/media/` reads from the selected bucket, so transfer existing referenced uploads before switching a populated environment.

Only converted `.webp` files can be written by the application. The original JPEG/PNG is processed in the browser and never uploaded or retained in the bucket. Existing referenced JPEG/PNG assets remain readable; the change does not bulk-delete photographs already in use.

Before database cutover, follow `db/postgres/README.md`: replace the active D1 queries with PostgreSQL operations, apply the SQL to the selected target, transfer data preserving IDs and timestamps, and verify permissions, saved homes, listing editing, enquiries and concurrent writes against Neon. The single-admin unique index is provided; enquiry rate limiting must use PostgreSQL-safe transaction isolation/retries rather than assuming SQLite serialization. Do not set a fake DATABASE_URL or remove the current D1 binding to simulate completion.

Validated locally: application upload flow and existing D1 regressions, plus mocked S3 signing/transport checks. Live Neon database and bucket operations cannot be verified until the resources are provisioned.

References: [Neon photo storage example](https://neon.com/blog/building-a-private-searchable-photo-library-on-the-neon-backend), [Neon serverless driver](https://github.com/neondatabase/serverless).
