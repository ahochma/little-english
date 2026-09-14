const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('five concrete four-word curricula have distinct original illustrations, 20 encounters / 19 unique words',()=>{
 const source=fs.readFileSync(root+'/app.js','utf8');
 const groups=[...source.matchAll(/words:(\[[^\]]+\])/g)].map(m=>JSON.parse(m[1].replace(/'/g,'"')));
 assert.deepEqual(groups,[['fire truck','red','ladder','wheel'],['car','bus','bicycle','airplane'],['red','blue','yellow','green'],['apple','banana','bread','egg'],['cat','dog','elephant','fish']]);
 const words=[...new Set(groups.flat())];assert.equal(groups.flat().length,20);assert.equal(words.length,19);
 const context={window:{}};vm.runInNewContext(fs.readFileSync(root+'/illustrations.js','utf8'),context);
 const drawings=words.map(w=>context.window.illustration(w));assert.equal(new Set(drawings).size,19,'every named word has its own drawing, not the fallback truck');
 for(const svg of drawings){assert.match(svg,/<svg viewBox="0 0 640 400"/);assert.doesNotMatch(svg,/<image|https?:\/\/(?!www.w3.org)/);}
});
test('portable artifact contains all sources inline and a deny-network CSP',()=>{
 const html=fs.readFileSync(root+'/index.html','utf8');
 for(const file of ['app.js','lesson.js','progress.js','audio.js','illustrations.js','styles.css'])assert.ok(html.includes(fs.readFileSync(root+'/'+file,'utf8')),file+' included verbatim');
 assert.match(html,/connect-src 'none'/);assert.doesNotMatch(html,/<script[^>]+src=|<link\b|<iframe\b/);
});
