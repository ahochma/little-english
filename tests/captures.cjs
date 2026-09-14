// Additional real-flow captures with browser clock advancement (no seeded completion).
const {chromium}=(()=>{try{return require('playwright')}catch(_){return require('/data/workspace/toddler-english-ios/prototype/node_modules/playwright')}})();
const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),url=require('node:url').pathToFileURL(root+'/index.html').href;
(async()=>{const b=await chromium.launch({headless:true,args:['--no-sandbox']});try{
for(const [name,viewport] of [['phone',{width:390,height:844}],['tablet',{width:820,height:1180}],['narrow',{width:320,height:568}],['landscape',{width:844,height:390}]]){
const c=await b.newContext({viewport,offline:true,reducedMotion:'reduce'}),p=await c.newPage(),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
await p.addInitScript(()=>Object.defineProperty(window,'speechSynthesis',{value:undefined}));await p.clock.install();await p.goto(url);
async function click(s){await p.clock.fastForward(500);await p.locator(s).first().click()}
async function shot(s){await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:root+'/screenshots/'+s+'.png',fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
await shot(name+'-map');for(const id of ['fire-trucks','vehicles','colours','food','animals']){
await click(`button[data-stage="${id}"]`);await click('[data-action="next"]');for(let i=0;i<4;i++){await click('[data-action="next"]');await click('[data-answer="correct"]');await click('[data-action="next"]')}
assert.equal(await p.locator('#app').getAttribute('data-phase'),'recap');if(id==='animals')await shot(name+'-animals-recap');await click('[data-action="map"]');}
assert.equal(await p.locator('[data-completed="true"]').count(),5);await shot(name+'-complete-map');await click('[data-action="parents"]');await shot(name+'-parent-gate');await click('[data-gate="correct"]');await click('[data-action="reset"]');await shot(name+'-reset-confirmation');
assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await c.close();console.log('PASS complete-flow screenshots '+name)}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
