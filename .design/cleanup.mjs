import fs from 'node:fs';
const {testListingId}=JSON.parse(fs.readFileSync('.design/review/flow-results.json','utf8'));if(!/^[a-f0-9-]{36}$/.test(testListingId))throw new Error('Invalid QA listing identifier');
fs.writeFileSync('.design/cleanup.sql',`DELETE FROM saved_homes WHERE user_id = 'local_seedy';\nDELETE FROM inquiries WHERE email IN ('qa-flow@stillwell.test','browser-qa@stillwell.test');\nDELETE FROM listings WHERE id = '${testListingId}' AND title = 'QA lifecycle home';\n`);
