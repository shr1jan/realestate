import { env } from "cloudflare:workers";
import { S3PhotoStore } from "./s3-photo-store";

function neonBucket() {
  const values = [env.AWS_ENDPOINT_URL_S3, env.S3_BUCKET, env.AWS_ACCESS_KEY_ID, env.AWS_SECRET_ACCESS_KEY];
  if (!values.some(Boolean)) return null;
  if (!values.every(Boolean)) throw new Error("Neon bucket configuration is incomplete.");
  return new S3PhotoStore({ endpoint: env.AWS_ENDPOINT_URL_S3!, bucket: env.S3_BUCKET!, accessKeyId: env.AWS_ACCESS_KEY_ID!, secretAccessKey: env.AWS_SECRET_ACCESS_KEY!, region: env.AWS_REGION || "us-east-2", sessionToken: env.AWS_SESSION_TOKEN });
}
export async function putPhoto(key: string, bytes: Uint8Array) {
  if (!key.endsWith(".webp")) throw new Error("Only converted WebP photos can be stored.");
  const store = neonBucket();
  if (store) return store.put(key, bytes);
  if (!env.BUCKET) throw new Error("Photo storage has not been configured.");
  await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: "image/webp" } });
}
export async function getPhoto(key: string) {
  const store = neonBucket();
  if (store) return store.get(key);
  if (!env.BUCKET) throw new Error("Photo storage has not been configured.");
  return env.BUCKET.get(key);
}
