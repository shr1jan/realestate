// Optional JSON on stdin: {"username":"...","password":"..."}.
// Without stdin, generate a strong local password. Never prints credentials.
import fs from 'node:fs/promises';import {randomBytes,pbkdf2Sync} from 'node:crypto';
let input='';if(!process.stdin.isTTY)for await(const chunk of process.stdin)input+=chunk;
const value=input.trim()?JSON.parse(input):{};const username=value.username||'admin';const password=value.password||randomBytes(24).toString('base64url');
if(!/^[a-zA-Z0-9._-]{3,64}$/.test(username)||typeof password!=='string'||password.length<16||password.length>256)throw Error('Use a 3–64 character username and a password of 16–256 characters.');
const salt=randomBytes(16);const hash='pbkdf2-sha256$100000$'+salt.toString('hex')+'$'+pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex');
let text=await fs.readFile('.dev.vars','utf8').catch(()=>'');text=text.replace(/^ADMIN_(USERNAME|PASSWORD_HASH|SESSION_SECRET|AUTH_URL)=.*\r?\n?/gm,'');
text+='\nADMIN_USERNAME='+username+'\nADMIN_PASSWORD_HASH="'+hash+'"\nADMIN_SESSION_SECRET='+randomBytes(48).toString('base64url')+'\nADMIN_AUTH_URL=http://127.0.0.1:5173\n';
await fs.writeFile('.dev.vars',text,{mode:0o600});await fs.writeFile('ADMIN-CREDENTIALS.local.json',JSON.stringify({username,password},null,2),{mode:0o600});console.log('Local admin configured. Credentials are in the ignored ADMIN-CREDENTIALS.local.json file. Existing admin sessions are invalidated.');
