import { AwsClient } from "aws4fetch";

export type BucketConfig = { endpoint: string; bucket: string; accessKeyId: string; secretAccessKey: string; region: string; sessionToken?: string };
export class S3PhotoStore {
  private client: AwsClient;
  private base: string;
  constructor(config: BucketConfig) {
    const endpoint = new URL(config.endpoint);
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) throw new Error("The bucket endpoint must be an HTTPS URL without credentials or query parameters.");
    if (!config.bucket || /[\/\\\x00-\x20]/.test(config.bucket)) throw new Error("The bucket name is invalid.");
    this.base = endpoint.href.replace(/\/+$/, "") + "/" + encodeURIComponent(config.bucket);
    this.client = new AwsClient({ accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey, sessionToken: config.sessionToken, region: config.region, service: "s3", retries: 2 });
  }
  private url(key: string) {
    if (!/^[a-f0-9-]+\.(webp|jpg|png)$/.test(key)) throw new Error("Invalid photo key.");
    return this.base + "/" + encodeURIComponent(key);
  }
  async put(key: string, bytes: Uint8Array) {
    if (!key.endsWith(".webp")) throw new Error("Only converted WebP photos can be stored.");
    const response = await this.client.fetch(this.url(key), { method: "PUT", headers: { "Content-Type": "image/webp" }, body: bytes.slice().buffer });
    if (!response.ok) { await response.body?.cancel(); throw new Error(`Photo storage failed (${response.status}).`); }
    await response.body?.cancel();
  }
  async get(key: string) {
    const response = await this.client.fetch(this.url(key));
    if (response.status === 404) { await response.body?.cancel(); return null; }
    if (!response.ok) { await response.body?.cancel(); throw new Error(`Photo retrieval failed (${response.status}).`); }
    return { body: response.body, writeHttpMetadata(headers: Headers) {
      for (const name of ["Content-Type", "Content-Length", "ETag", "Last-Modified"]) {
        const value = response.headers.get(name); if (value) headers.set(name, value);
      }
    } };
  }
}
