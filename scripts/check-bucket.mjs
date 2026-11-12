import assert from 'node:assert/strict';
import { S3PhotoStore } from '../lib/s3-photo-store.ts';
const config={endpoint:'https://storage.example.test/branch',bucket:'photos',accessKeyId:'test-key',secretAccessKey:'test-secret',region:'us-east-2',sessionToken:'test-session'};
const requests=[];const original=globalThis.fetch;
let status=200;
globalThis.fetch=async input=>{requests.push(new Request(input));return new Response(status===200?'image bytes':null,{status,headers:{'Content-Type':'image/webp','ETag':'"fixture"'}});};
try{
 const store=new S3PhotoStore(config);await store.put('abc-123.webp',new Uint8Array([1,2,3]));
 const put=requests.at(-1);assert.equal(put.method,'PUT');assert.equal(put.url,'https://storage.example.test/branch/photos/abc-123.webp');assert.match(put.headers.get('Authorization'),/^AWS4-HMAC-SHA256 /);assert.equal(put.headers.get('Content-Type'),'image/webp');assert.equal(put.headers.get('X-Amz-Security-Token'),'test-session');assert.equal(new URL(put.url).search,'');assert.deepEqual([...new Uint8Array(await put.arrayBuffer())],[1,2,3]);
 const image=await store.get('abc-123.webp');const headers=new Headers();image.writeHttpMetadata(headers);assert.equal(headers.get('Content-Type'),'image/webp');assert.equal(headers.get('ETag'),'"fixture"');assert.equal(await new Response(image.body).text(),'image bytes');
 status=404;assert.equal(await store.get('abc-123.webp'),null);status=403;await assert.rejects(()=>store.put('abc-123.webp',new Uint8Array([1])),/403/);
 const count=requests.length;await assert.rejects(()=>store.put('abc-123.jpg',new Uint8Array([1])),/Only converted WebP/);await assert.rejects(()=>store.get('../secrets'),/Invalid photo key/);assert.equal(requests.length,count);
 assert.throws(()=>new S3PhotoStore({...config,endpoint:'http://insecure.test'}),/HTTPS/);assert.throws(()=>new S3PhotoStore({...config,endpoint:'https://user:pass@storage.test'}),/HTTPS/);
 console.log('Bucket checks passed: signed PUT/GET, metadata, 404, failed writes, WebP-only storage, key/endpoint validation. No live services contacted.');
}finally{globalThis.fetch=original;}
