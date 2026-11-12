-- Prepared Neon PostgreSQL schema. Apply to the selected empty target database.
-- Millisecond timestamps and JSON text preserve existing listing data formats.
BEGIN;
CREATE TABLE listings (
  id text PRIMARY KEY, title text NOT NULL, address text NOT NULL,
  neighborhood text NOT NULL, city text NOT NULL, price integer NOT NULL CHECK (price > 0),
  transaction text NOT NULL CHECK (transaction IN ('buy','rent')),
  type text NOT NULL CHECK (type IN ('House','Townhouse','Condo')),
  beds integer NOT NULL, baths double precision NOT NULL, sqft integer NOT NULL, year integer NOT NULL,
  description text NOT NULL, features text NOT NULL, images text NOT NULL,
  status text NOT NULL CHECK (status IN ('published','draft','archived')),
  featured boolean NOT NULL DEFAULT false, demo boolean NOT NULL DEFAULT false,
  created_at bigint NOT NULL, updated_at bigint NOT NULL
);
CREATE TABLE saved_homes (
  user_id text NOT NULL, listing_id text NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at bigint NOT NULL, PRIMARY KEY (user_id,listing_id)
);
CREATE TABLE admins (user_id text PRIMARY KEY, email text NOT NULL, created_at bigint NOT NULL);
CREATE UNIQUE INDEX admins_single_owner ON admins ((true));
CREATE TABLE inquiries (
  id text PRIMARY KEY, listing_id text NOT NULL REFERENCES listings(id),
  name text NOT NULL, email text NOT NULL, phone text NOT NULL,
  message text NOT NULL, created_at bigint NOT NULL
);
CREATE INDEX inquiries_email_created_idx ON inquiries (lower(email),created_at);
CREATE INDEX listings_status_created_idx ON listings (status,created_at DESC);
CREATE INDEX saved_homes_user_created_idx ON saved_homes (user_id,created_at DESC);
COMMIT;
