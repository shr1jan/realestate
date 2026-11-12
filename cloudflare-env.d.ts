declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_SETUP_KEY?: string;
    DATABASE_URL?: string;
    AWS_ENDPOINT_URL_S3?: string;
    S3_BUCKET?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_SESSION_TOKEN?: string;
    AWS_REGION?: string;
  }
}
