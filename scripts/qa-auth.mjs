// Local regression tooling only. Never bundled into the application.
import fs from 'node:fs/promises';
import {encode} from '@auth/core/jwt';
export async function localAuthSettings(){const text=await fs.readFile('.dev.vars','utf8');const get=name=>{const raw=text.match(new RegExp('^'+name+'=(.*)$','m'))?.[1]?.trim()||'';return raw.startsWith('"')?JSON.parse(raw):raw;};const secret=get('AUTH_SECRET');if(secret.length<32)throw Error('Configure a local AUTH_SECRET before testing Google sessions.');return{secret,key:get('ADMIN_SETUP_KEY')};}
export async function qaIdentity(subject='local_seedy',email='seedy@sites.test') {const{secret}=await localAuthSettings();const cookieName='authjs.session-token';const token=await encode({secret,salt:cookieName,maxAge:600,token:{userId:'google:'+subject,email,name:'QA '+subject}});return{cookie:cookieName+'='+token};}
