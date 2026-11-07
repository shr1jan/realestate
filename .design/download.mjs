import fs from 'node:fs/promises';
const css=await fs.readFile('.design/fonts-source.css','utf8');
const urls=[...css.matchAll(/src: url\((.*?)\)/g)].map(x=>x[1]);
const names=['serif-500','serif-600','sans-400','sans-500','sans-600','sans-700'];
await Promise.all(urls.map(async(u,i)=>{const r=await fetch(u); if(!r.ok)throw new Error(r.status); await fs.writeFile(`public/fonts/${names[i]}.ttf`,Buffer.from(await r.arrayBuffer()));}));
const photos={ 'house-2':'photo-1600596542815-ffad4c1539a9','house-3':'photo-1600607687920-4e2a09cf159d','house-4':'photo-1600047509807-ba8f99d2cdde','house-5':'photo-1600585154340-be6161a56a0c','living':'photo-1600210492486-724fe5c67fb0','kitchen':'photo-1556912172-45b7abe8b7e1','bedroom':'photo-1611892440504-42a792e24d32'};
await Promise.all(Object.entries(photos).map(async([n,id])=>{const u=`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;const r=await fetch(u);if(!r.ok)throw new Error(n+': '+r.status);await fs.writeFile(`public/images/${n}.jpg`,Buffer.from(await r.arrayBuffer()));console.log(n+' downloaded');}));
await fs.writeFile('.design/image-origins.json',JSON.stringify(photos,null,2));
