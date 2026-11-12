# Neon PostgreSQL migration preparation

`0001_initial.sql` creates the target PostgreSQL schema in an empty database. It does not alter the existing D1 database or move data. Photo bytes belong in object storage; listing `images` stores their URLs/keys, never originals or image blobs.

The running application still uses D1. The chosen target is Neon PostgreSQL and Neon S3-compatible Object Storage. The PostgreSQL client/schema are prepared; the configurable S3 adapter is connected to uploads and media reads. See `NEON-SETUP.md`. Do not deploy a database cutover until the PostgreSQL repository, data transfer and account/listing/enquiry regression checks have been completed against the provisioned target.

For the cutover, replace the SQLite Drizzle schema/driver with PostgreSQL and the Neon serverless HTTP driver. Replace D1-specific `batch`, prepared statements and `meta.changes` handling; PostgreSQL writes should use `RETURNING`. Admin setup and enquiry rate limiting need transaction-safe locking because PostgreSQL concurrency differs from SQLite's serialized writes. Transfer existing IDs and timestamps unchanged; convert SQLite boolean integers to PostgreSQL booleans. Keep the source database available until target counts and saved-home/account isolation are verified.

Keep bucket configuration separate from the database URL. Existing referenced photo objects must stay available when their database records move. New editor uploads send only WebP and the upload API rejects unconverted JPEG/PNG files before writing any object.
