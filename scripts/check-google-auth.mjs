import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {encode} from '@auth/core/jwt';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
await fs.mkdir('.design/refinement',{recursive:true});
await build({entryPoints:['lib/google-auth.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.design/refinement/google-auth.bundle.mjs'});
const {handleGoogleAuth,readGoogleSession,sessionCookie,googleAuthConfig}=await import('../.design/refinement/google-auth.bundle.mjs?'+Date.now());
const settings={AUTH_URL:'https://app.example.test',AUTH_SECRET:'a-test-only-secret-with-more-than-32-characters',GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'test-client-secret'};
const base=settings.AUTH_URL+'/api/auth';const checks=[];const jar=new Map();
function absorb(r){for(const value of r.headers.getSetCookie()){const pair=value.split(';')[0];const i=pair.indexOf('=');if(pair.slice(i+1))jar.set(pair.slice(0,i),pair.slice(i+1));else jar.delete(pair.slice(0,i));}}
const cookie=()=>[...jar].map(([k,v])=>k+'='+v).join('; ');
async function req(path,{method='GET',form}={}){const r=await handleGoogleAuth(new Request(base+path,{method,headers:{cookie:cookie(),...(form?{'Content-Type':'application/x-www-form-urlencoded'}:{})},body:form?new URLSearchParams(form):undefined}),settings);absorb(r);return r;}
async function check(name,fn){await fn();checks.push({name,status:'pass'});console.log('PASS '+name);}
const original=globalThis.fetch;let nonce,tokenCalls=0;const {publicKey,privateKey}=await generateKeyPair('RS256');const jwk={...await exportJWK(publicKey),kid:'qa-key',use:'sig',alg:'RS256'};
globalThis.fetch=async(input,init)=>{const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
if(url==='https://accounts.google.com/.well-known/openid-configuration')return Response.json({issuer:'https://accounts.google.com',authorization_endpoint:'https://accounts.google.com/o/oauth2/v2/auth',token_endpoint:'https://oauth2.googleapis.com/token',jwks_uri:'https://www.googleapis.com/oauth2/v3/certs',userinfo_endpoint:'https://openidconnect.googleapis.com/v1/userinfo',response_types_supported:['code'],subject_types_supported:['public'],id_token_signing_alg_values_supported:['RS256'],code_challenge_methods_supported:['S256']});
if(url==='https://www.googleapis.com/oauth2/v3/certs')return Response.json({keys:[jwk]});
if(url==='https://oauth2.googleapis.com/token'){tokenCalls++;const body=new URLSearchParams(String(init?.body));assert.ok(body.get('code_verifier'));const id_token=await new SignJWT({email:'qa@example.test',email_verified:true,name:'Google QA',nonce}).setProtectedHeader({alg:'RS256',kid:'qa-key'}).setIssuer('https://accounts.google.com').setAudience('test-client').setSubject('qa-subject').setIssuedAt().setExpirationTime('5m').sign(privateKey);return Response.json({access_token:'qa-access',token_type:'Bearer',expires_in:300,id_token});}
throw Error('Unexpected external request: '+url);};
try{
await check('Missing configuration fails closed with a useful 503',async()=>{const r=await handleGoogleAuth(new Request(base+'/signin/google'),{});assert.equal(r.status,503);assert.match((await r.json()).error,/not configured/);});
await check('A different host cannot initiate Google sign-in',async()=>assert.equal((await handleGoogleAuth(new Request('https://evil.example/api/auth/csrf'),settings)).status,400));
await check('Sign-in POST without CSRF never redirects to Google',async()=>{const r=await req('/signin/google',{method:'POST',form:{callbackUrl:'/saved'}});assert.match(r.headers.get('location'),/MissingCSRF/);});
let csrfToken;
await check('CSRF token is paired with secure HttpOnly cookies',async()=>{const r=await req('/csrf');csrfToken=(await r.json()).csrfToken;assert.ok(csrfToken);assert.ok(r.headers.getSetCookie().some(v=>v.includes('HttpOnly')&&v.includes('Secure')&&v.includes('SameSite=Lax')));});
let authUrl;
await check('Google authorization uses state, nonce and PKCE and preserves pending save',async()=>{const r=await req('/signin/google',{method:'POST',form:{csrfToken,callbackUrl:'/homes/ridgeview-house?save=ridgeview-house'}});authUrl=new URL(r.headers.get('location'));assert.equal(authUrl.origin,'https://accounts.google.com');for(const key of ['state','nonce','code_challenge'])assert.ok(authUrl.searchParams.get(key));assert.equal(authUrl.searchParams.get('code_challenge_method'),'S256');assert.equal(authUrl.searchParams.get('redirect_uri'),base+'/callback/google');nonce=authUrl.searchParams.get('nonce');});
const oauthJar=new Map(jar);
await check('Incorrect state is rejected before exchanging the authorization code',async()=>{const r=await req('/callback/google?code=unused&state=invalid');assert.match(r.headers.get('location'),/error=/);assert.equal(tokenCalls,0);});
jar.clear();for(const pair of oauthJar)jar.set(...pair);
await check('Verified Google callback establishes a session with a stable Google subject ID',async()=>{const r=await req('/callback/google?code=qa-code&state='+encodeURIComponent(authUrl.searchParams.get('state')));assert.equal(r.headers.get('location'),settings.AUTH_URL+'/homes/ridgeview-house?save=ridgeview-house');const user=await readGoogleSession(cookie(),settings);assert.equal(user?.userId,'google:qa-subject');assert.equal(user?.email,'qa@example.test');});
await check('Tampered and expired sessions are rejected',async()=>{const name=sessionCookie(settings);assert.equal(await readGoogleSession(name+'=tampered',settings),null);const old=await encode({secret:settings.AUTH_SECRET,salt:name,maxAge:-120,token:{userId:'google:expired',email:'qa@example.test'}});assert.equal(await readGoogleSession(name+'='+old,settings),null);});
await check('Unverified Google emails cannot sign in and external return URLs are rejected',async()=>{const c=googleAuthConfig(settings);assert.equal(await c.callbacks.signIn({account:{provider:'google'},profile:{email_verified:false}}),false);assert.equal(await c.callbacks.redirect({url:'https://evil.example',baseUrl:settings.AUTH_URL}),settings.AUTH_URL+'/saved');assert.equal(await c.callbacks.redirect({url:'/api/auth/callback/google',baseUrl:settings.AUTH_URL}),settings.AUTH_URL+'/saved');});
await check('CSRF-protected sign-out clears the app session',async()=>{const r=await req('/signout',{method:'POST',form:{csrfToken,callbackUrl:'/'}});assert.equal(r.headers.get('location'),settings.AUTH_URL+'/');assert.ok(r.headers.getSetCookie().some(v=>v.startsWith(sessionCookie(settings)+'=;')&&v.includes('Max-Age=0')));});
await check('Local CSRF and sign-out remain available if Google credentials are removed',async()=>{const local={AUTH_URL:settings.AUTH_URL,AUTH_SECRET:settings.AUTH_SECRET};const csrf=await handleGoogleAuth(new Request(base+'/csrf'),local);assert.equal(csrf.status,200);const value=(await csrf.json()).csrfToken;const cookies=csrf.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');const r=await handleGoogleAuth(new Request(base+'/signout',{method:'POST',headers:{cookie:cookies,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrfToken:value,callbackUrl:'/'})}),local);assert.equal(r.status,302);});
await fs.writeFile('.design/refinement/google-auth-results.json',JSON.stringify({checks,externalServices:'Google endpoints were mocked with a signed test ID token; no live account was used.'},null,2));
}finally{globalThis.fetch=original;}
