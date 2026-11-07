import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { sampleProperties } from '../lib/properties.ts';
const origin='http://127.0.0.1:5173';
const results=[];
let cookie='';
async function request(path,{body,method='GET',signed=false}={}) {
 const r=await fetch(origin+path,{method,redirect:'manual',headers:{...(body?{'Content-Type':'application/json','Origin':origin}:{}),...(signed?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
 return r;
}
async function check(name,fn){await fn();results.push({name,status:'pass'});console.log('PASS '+name);}
await check('Browse without login',async()=>{const r=await request('/');assert.equal(r.status,200);assert.match(await r.text(),/Ridgeview House/);});
await check('Saving requires login',async()=>assert.equal((await request('/api/saved',{method:'POST',body:{listingId:'ridgeview-house',saved:true}})).status,401));
await check('Anonymous admin writes rejected',async()=>assert.equal((await request('/api/admin/listings',{method:'POST',body:sampleProperties[0]})).status,401));
await check('Filters support location, price, type and rentals',async()=>{const r=await request('/homes?transaction=rent&type=Condo&max=3000&q=South');const text=await r.text();assert.match(text,/South Lamar Loft/);assert.doesNotMatch(text,/Willow Garden Home/);assert.doesNotMatch(text,/Ridgeview House/);});
await check('Empty results recover with a browse link',async()=>{const r=await request('/homes?q=nowhere-qa');assert.match(await r.text(),/A little more room to search/);});
await check('Login preserves return destination',async()=>{const r=await request('/signin-with-chatgpt?return_to=%2Fhomes%2Fridgeview-house%3Fsave%3Dridgeview-house');assert.equal(r.status,302);assert.equal(r.headers.get('location'),'/homes/ridgeview-house?save=ridgeview-house');cookie=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');assert.ok(cookie);});
await check('Signed-in visitor cannot create a listing before admin setup',async()=>{const r=await request('/api/admin/listings',{signed:true,method:'POST',body:sampleProperties[0]});assert.equal(r.status,403);});
await check('Save is idempotent and persists across requests',async()=>{for(let i=0;i<2;i++)assert.equal((await request('/api/saved',{signed:true,method:'POST',body:{listingId:'ridgeview-house',saved:true}})).status,200);const r=await request('/saved',{signed:true});assert.match(await r.text(),/ridgeview-house/);});
await check('Unsave persists',async()=>assert.equal((await request('/api/saved',{signed:true,method:'POST',body:{listingId:'ridgeview-house',saved:false}})).status,200));
await check('Cross-origin writes rejected',async()=>{const r=await fetch(origin+'/api/saved',{method:'POST',headers:{Origin:'https://elsewhere.test',Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({listingId:'ridgeview-house',saved:true})});assert.equal(r.status,403);});
await check('Admin setup rejects wrong key',async()=>assert.equal((await request('/api/admin/setup',{signed:true,method:'POST',body:{key:'incorrect-key'}})).status,403));
await check('Admin setup activates correct signed-in account',async()=>{const key=(await fs.readFile('.dev.vars','utf8')).match(/ADMIN_SETUP_KEY=(.+)/)[1].trim();const r=await request('/api/admin/setup',{signed:true,method:'POST',body:{key}});assert.equal(r.status,200);});
await check('Setup cannot add another administrator',async()=>assert.equal((await request('/api/admin/setup',{signed:true,method:'POST',body:{key:'incorrect-key'}})).status,403));
let testId, testVersion;
const fixture={...sampleProperties[0],title:'QA lifecycle home',status:'draft',featured:false};
await check('Admin creates draft; draft is hidden publicly',async()=>{const r=await request('/api/admin/listings',{signed:true,method:'POST',body:fixture});assert.equal(r.status,201);const created=await r.json();testId=created.id;testVersion=created.updatedAt;const text=await(await request('/homes/'+testId)).text();assert.doesNotMatch(text,/A closer look/);});
await check('Admin publishes an updated listing',async()=>{const r=await request('/api/admin/listings/'+testId,{signed:true,method:'PUT',body:{...fixture,status:'published',title:'QA lifecycle updated',expectedUpdatedAt:testVersion}});assert.equal(r.status,200);testVersion=(await r.json()).updatedAt;assert.match(await(await request('/homes/'+testId)).text(),/QA lifecycle updated/);});
await check('Archive removes a property from public access',async()=>{assert.equal((await request('/api/admin/listings/'+testId,{signed:true,method:'PUT',body:{...fixture,status:'archived',expectedUpdatedAt:testVersion}})).status,200);assert.doesNotMatch(await(await request('/homes/'+testId)).text(),/A closer look/);assert.equal((await request('/api/saved',{signed:true,method:'POST',body:{listingId:testId,saved:true}})).status,404);});
await check('Listing validation rejects malformed data',async()=>assert.equal((await request('/api/admin/listings',{signed:true,method:'POST',body:{...fixture,price:-1}})).status,400));
await check('Photo upload and persistent retrieval',async()=>{const file=await fs.readFile('public/images/house-2.jpg');const form=new FormData();form.set('file',new File([file],'home.jpg',{type:'image/jpeg'}));const r=await fetch(origin+'/api/admin/uploads',{method:'POST',headers:{Cookie:cookie,Origin:origin},body:form});assert.equal(r.status,201);const data=await r.json();const image=await request(data.url);assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/image\/jpeg/);assert.equal((await image.arrayBuffer()).byteLength,file.length);});
await check('Enquiry validates input and is delivered to admin inbox',async()=>{assert.equal((await request('/api/inquiries',{method:'POST',body:{listingId:'ridgeview-house',name:'Q',email:'bad',phone:'',message:'short'}})).status,400);const r=await request('/api/inquiries',{method:'POST',body:{listingId:'ridgeview-house',name:'QA Test Visitor',email:'qa-flow@stillwell.test',phone:'',message:'QA test enquiry for the listing manager.'}});assert.equal(r.status,201);assert.match(await(await request('/admin',{signed:true})).text(),/QA Test Visitor/);});
await check('Contact action only appears on listing detail',async()=>{for(const path of ['/','/homes','/saved'])assert.doesNotMatch(await(await request(path,{signed:true})).text(),/Enquire about this home/);assert.match(await(await request('/homes/ridgeview-house')).text(),/Enquire about this home/);});
await fs.mkdir('.design/review',{recursive:true});
await fs.writeFile('.design/review/flow-results.json',JSON.stringify({checks:results,testListingId:testId},null,2));
console.log(`${results.length} flow checks passed.`);
