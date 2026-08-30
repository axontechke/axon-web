import { execSync } from 'node:child_process';
const tables = ["blog","contact","delivery_methods","global_colors","orders","price_trackers","product_reviews","product_variants","reviews","support_requests","whatsapp_api_logs","whatsapp_notifications","config","products","users","product_variant_images","global_sim_types"];
function get(table, remote){
  const flag = remote ? '--remote' : '--local';
  const cmd = `npx wrangler d1 execute axon-tech-db ${flag} --command "PRAGMA table_info(${table});" --json`;
  try {
    const out = execSync(cmd, {encoding:'utf8', maxBuffer: 10*1024*1024, stdio: ['pipe','pipe','pipe']});
    const start = out.indexOf('[');
    const end = out.lastIndexOf(']');
    if (start===-1) return {error: out.slice(0,1000)};
    const json = JSON.parse(out.slice(start, end+1));
    const results = json[0]?.results;
    return results;
  } catch(e){
    const msg = (e.stdout?.toString()||'') + (e.stderr?.toString()||'') + e.message;
    return {error: msg.slice(0,1200)};
  }
}
for (const t of tables){
  const rem = get(t,true);
  const loc = get(t,false);
  console.log(`\n=== ${t} ===`);
  if (rem?.error) console.log('remote ERROR:', rem.error.slice(0,600).replace(/\n/g,' '));
  else console.log('remote:', rem?.map(c=>c.name+':'+c.type).join(', ') || 'EMPTY');
  if (loc?.error) console.log('local ERROR:', loc.error.slice(0,600).replace(/\n/g,' '));
  else console.log('local :', loc?.map(c=>c.name+':'+c.type).join(', ') || 'EMPTY');
  if (Array.isArray(rem) && Array.isArray(loc)){
     const rCols = rem.map(c=>c.name).join(',');
     const lCols = loc.map(c=>c.name).join(',');
     if (rCols!==lCols) console.log('>>> DIFF cols!');
     else console.log('identical columns');
     // check type differences
     for(let i=0;i<Math.min(rem.length, loc.length);i++){
       if(rem[i].type!==loc[i].type || rem[i].dflt_value!==loc[i].dflt_value) console.log(` col ${rem[i].name} diff remote ${rem[i].type}/${rem[i].dflt_value} vs local ${loc[i].type}/${loc[i].dflt_value}`);
     }
  } else {
    console.log('comparison skip due to error/missing');
  }
}
