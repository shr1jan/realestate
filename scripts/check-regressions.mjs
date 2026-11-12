import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {sampleProperties} from '../lib/properties.ts';
const base=process.env.CHECK_ORIGIN||'http://127.0.0.1:5175';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base))throw new Error('Regression mutations are restricted to a local preview.');
const primary={'oai-authenticated-user-id':'local_seedy','oai-authenticated-user-email':'seedy@sites.test'};
const secondary={'oai-authenticated-user-id':'qa_second_visitor','oai-authenticated-user-email':'qa-second@stillwell.test'};
const checks=[];let id,version;
const unique=crypto.randomUUID();const email=`qa-refine-${unique}@stillwell.test`;
const fixture={...sampleProperties[0],title:`QA regression ${unique}`,featured:false,status:'draft',features:[]};
let initialSavedCount=0;
const savedCount=text=>Number(text.match(/<span class="nav-count">(\d+)<\/span>/)?.[1]||0);
async function req(path,{method='GET',body,raw,identity=primary,headers={}}={}){
 const json=body!==undefined||raw!==undefined;
 const r=await fetch(base+path,{method,headers:{Connection:'close',...identity,...(json?{'Content-Type':'application/json',Origin:base}:{}),...headers},body:raw??(body===undefined?undefined:JSON.stringify(body)),redirect:'manual'});
 const bytes=await r.arrayBuffer();return new Response(bytes,{status:r.status,headers:r.headers});
}
async function check(name,fn){await fn();checks.push({name,status:'pass'});console.log('PASS '+name);await req('/');}
async function update(changes={},expected=version){const r=await req('/api/admin/listings/'+id,{method:'PUT',body:{...fixture,...changes,expectedUpdatedAt:expected}});if(r.ok)version=(await r.clone().json()).updatedAt;return r;}
try{
initialSavedCount=savedCount(await(await req('/saved')).text());
for(const raw of ['{','null','[]','"text"'])await check('Reject invalid JSON shape: '+raw,async()=>assert.equal((await req('/api/saved',{method:'POST',raw})).status,400));
await check('Reject oversized JSON before parsing',async()=>{assert.equal((await req('/api/saved',{method:'POST',raw:'x'.repeat(128*1024+1)})).status,413);await req('/');});
await check('Reject wrong JSON content type',async()=>assert.equal((await req('/api/saved',{method:'POST',raw:'{}',headers:{'Content-Type':'text/plain'}})).status,415));
await check('Cross-site request denied even without Origin',async()=>{const r=await fetch(base+'/api/saved',{method:'POST',headers:{...primary,'Sec-Fetch-Site':'cross-site'}});const text=await r.text();assert.equal(r.status,403,text);});
await check('Anonymous saved write remains protected',async()=>assert.equal((await req('/api/saved',{identity:{},method:'POST',body:{listingId:'ridgeview-house',saved:true}})).status,401));
await check('Non-admin cannot write listings',async()=>assert.equal((await req('/api/admin/listings',{identity:secondary,method:'POST',body:fixture})).status,403));
await check('Repeated login query parameters render safely',async()=>{const r=await req('/login?returnTo=/saved&returnTo=/admin',{identity:{}});const text=await r.text();assert.equal(r.status,200);assert.doesNotMatch(text,/A little pause in your search/);assert.match(text,/Continue with ChatGPT/);});
await check('Login rejects external destinations and auth loops',async()=>{for(const target of ['//elsewhere.test','/\\elsewhere.test','/login/','/%6cogin','/callback']){const r=await req('/login?returnTo='+encodeURIComponent(target),{identity:{}});assert.match(await r.text(),/return_to=%2Fsaved/);}});
await check('Unsupported filters match the visible default controls',async()=>{const text=await(await req('/homes?max=-1&type=invalid&beds=99')).text();assert.match(text,/Ridgeview House/);assert.match(text,/Juniper Townhome/);});
await check('Whitespace searches are normalized',async()=>assert.match(await(await req('/homes?q=%20%20East%20%20%20Austin%20')).text(),/Meadowlark House/));
await check('Detailed validation errors identify their fields',async()=>{const r=await req('/api/admin/listings',{method:'POST',body:{...fixture,price:-1,images:[]}});assert.equal(r.status,400);const data=await r.json();assert.ok(data.fields.price);assert.ok(data.fields.images);});
await check('Admin creates a hidden draft',async()=>{const r=await req('/api/admin/listings',{method:'POST',body:fixture});assert.equal(r.status,201);const data=await r.json();id=data.id;version=data.updatedAt;assert.doesNotMatch(await(await req('/homes/'+id,{identity:{}})).text(),/A closer look/);});
await check('Missing edit version is rejected',async()=>assert.equal((await req('/api/admin/listings/'+id,{method:'PUT',body:fixture})).status,400));
await check('Admin publishes current version',async()=>assert.equal((await update({status:'published'})).status,200));
await check('Concurrent stale edit cannot overwrite a newer edit',async()=>{const stale=version;assert.equal((await update({status:'published',title:fixture.title+' updated'})).status,200);assert.equal((await update({status:'published',title:'Lost overwrite'},stale)).status,409);assert.match(await(await req('/homes/'+id,{identity:{}})).text(),/ updated/);});
await check('Empty features do not leave an empty public section',async()=>assert.doesNotMatch(await(await req('/homes/'+id,{identity:{}})).text(),/The little things, considered/));
await check('Saving is idempotent',async()=>{for(let i=0;i<2;i++)assert.equal((await req('/api/saved',{method:'POST',body:{listingId:id,saved:true}})).status,200);});
await check('Saved homes are isolated between accounts',async()=>{assert.equal((await(await req('/saved')).text()).includes(unique),true);assert.equal((await(await req('/saved',{identity:secondary})).text()).includes(unique),false);});
await check('An account cannot remove another account’s saved home',async()=>{assert.equal((await req('/api/saved',{identity:secondary,method:'POST',body:{listingId:id,saved:false}})).status,200);assert.equal((await(await req('/saved')).text()).includes(unique),true);});
await check('Archiving updates saved count and saved list together',async()=>{assert.equal((await update({status:'archived'})).status,200);const text=await(await req('/saved')).text();assert.equal(text.includes(unique),false);assert.equal(savedCount(text),initialSavedCount);assert.equal((await req('/api/saved',{method:'POST',body:{listingId:id,saved:true}})).status,404);});
await check('Admin can restore the listing without losing its saved relation',async()=>{assert.equal((await update({status:'published'})).status,200);assert.equal((await(await req('/saved')).text()).includes(unique),true);});
await check('Malformed enquiry gets named validation errors',async()=>{const r=await req('/api/inquiries',{identity:{},method:'POST',body:{listingId:id,name:'  ',email:'bad',phone:'',message:'short'}});assert.equal(r.status,400);const d=await r.json();assert.ok(d.fields.name&&d.fields.email&&d.fields.message);});
await check('Concurrent enquiry limit is atomic and email is case-insensitive',async()=>{const statuses=await Promise.all(Array.from({length:8},(_,i)=>req('/api/inquiries',{identity:{},method:'POST',body:{listingId:id,name:'QA regression visitor',email:i%2?email.toUpperCase():email,phone:'',message:'QA regression enquiry for the existing admin inbox.'}}).then(r=>r.status)));assert.equal(statuses.filter(s=>s===201).length,5);assert.equal(statuses.filter(s=>s===429).length,3);});
await check('Invalid multipart bodies return a client error',async()=>assert.equal((await req('/api/admin/uploads',{method:'POST',raw:'broken',headers:{'Content-Type':'multipart/form-data; boundary=bad'}})).status,400));
await check('Truncated image cannot be uploaded as a valid photograph',async()=>{const form=new FormData();form.set('file',new File([new Uint8Array([255,216,255])],'fake.jpg',{type:'image/jpeg'}));const r=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{...primary,Origin:base},body:form});assert.equal(r.status,400);});
await check('Valid photo uploads still round-trip through media storage',async()=>{const file=await fs.readFile('public/images/house-2.jpg');const form=new FormData();form.set('file',new File([file],'home.jpg',{type:'image/jpeg'}));const r=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{...primary,Origin:base},body:form});assert.equal(r.status,201);const data=await r.json();const image=await req(data.url,{identity:{}});assert.equal(image.status,200);assert.equal((await image.arrayBuffer()).byteLength,file.length);});
await check('A streamed photo larger than 1 MB respects the advertised upload limit',async()=>{const file=await fs.readFile('public/images/courtyard.png');assert.ok(file.length>1024*1024);const form=new FormData();form.set('file',new File([file],'courtyard.png',{type:'image/png'}));const multipart=new Response(form);const bytes=new Uint8Array(await multipart.arrayBuffer());let offset=0;const stream=new ReadableStream({pull(c){if(offset===bytes.length)c.close();else{const end=Math.min(offset+65536,bytes.length);c.enqueue(bytes.subarray(offset,end));offset=end;}}});const r=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{...primary,Origin:base,'Content-Type':multipart.headers.get('content-type')},body:stream,duplex:'half',signal:AbortSignal.timeout(20000)});assert.equal(r.status,201,await r.clone().text());const image=await req((await r.json()).url,{identity:{}});assert.equal(image.status,200);assert.equal((await image.arrayBuffer()).byteLength,file.length);});
await check('Oversized uploads without Content-Length return a bounded JSON error',async()=>{let remaining=8*1024*1024+65537;const stream=new ReadableStream({pull(c){if(!remaining)c.close();else{const size=Math.min(65536,remaining);c.enqueue(new Uint8Array(size));remaining-=size;}}});const r=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{...primary,Origin:base,'Content-Type':'multipart/form-data; boundary=qa'},body:stream,duplex:'half',signal:AbortSignal.timeout(10000)});assert.equal(r.status,413);assert.match(r.headers.get('content-type'),/application\/json/);assert.match((await r.json()).error,/8 MB/);});
await check('Enquiries are available only in the admin inbox',async()=>{assert.match(await(await req('/admin')).text(),/QA regression visitor/);assert.doesNotMatch(await(await req('/admin',{identity:secondary})).text(),/QA regression visitor/);});
await check('Contact entry remains confined to property details',async()=>{for(const p of ['/','/homes','/saved'])assert.doesNotMatch(await(await req(p)).text(),/Enquire about this home/);assert.match(await(await req('/homes/ridgeview-house')).text(),/Enquire about this home/);});
}finally{
 await fs.mkdir('.design/refinement',{recursive:true});
 await fs.writeFile('.design/refinement/api-results.json',JSON.stringify({checks,testListingId:id,email},null,2));
 if(id)await fs.writeFile('.design/refinement/cleanup.sql',`DELETE FROM inquiries WHERE listing_id='${id}';\nDELETE FROM listings WHERE id='${id}';\n`);
}
console.log(`${checks.length} regression checks passed.`);
