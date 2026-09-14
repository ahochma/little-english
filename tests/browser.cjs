const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(_){({chromium}=require('/data/workspace/toddler-english-ios/prototype/node_modules/playwright'));}
const root=path.resolve(__dirname,'..'),url=require('node:url').pathToFileURL(root+'/index.html').href;
const ids=['fire-trucks','vehicles','colours','food','animals'],key='little-english-progress-v2';
(async()=>{
 assert.ok(fs.existsSync(root+'/index.html'),'v2 artifact exists');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let scenarios=0;fs.mkdirSync(root+'/screenshots',{recursive:true});
 async function setup(size,mode='working',storage='normal'){
 const context=await browser.newContext({viewport:size,hasTouch:true,offline:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
 await page.addInitScript(({mode,storage,key})=>{
 if(storage==='denied')Object.defineProperty(window,'localStorage',{get(){throw Error('denied')}});
 if(storage==='write-denied')Storage.prototype.setItem=function(){throw Error('quota')};
 if(storage==='corrupt')localStorage.setItem(key,'{"version":2,"completed":["alien"]}');
 if(mode==='real')return;
 window.audioCalls=[];window.cancelCount=0;
 Object.defineProperty(window,'SpeechSynthesisUtterance',{value:function(text){this.text=text}});
 Object.defineProperty(window,'speechSynthesis',{value:mode==='unsupported'?undefined:{getVoices:()=>mode==='none'?[]:[{lang:'en-US',localService:true}],cancel(){window.cancelCount++},speak(u){window.lastUtterance=u;window.audioCalls.push(u.text);if(mode!=='hung')setTimeout(()=>mode==='error'?u.onerror():u.onend(),30)}}});
 },{mode,storage,key});await page.goto(url);return {context,page,errors,requests};}
 async function click(p,s){await p.locator(s).first().click();await p.waitForTimeout(470);}
 async function phase(p,name){assert.equal(await p.locator('#app').getAttribute('data-phase'),name);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no overflow');assert.deepEqual(await p.locator('button:visible').evaluateAll(bs=>bs.filter(b=>{const r=b.getBoundingClientRect();return r.width<44||r.height<44||!(b.getAttribute('aria-label')||b.innerText).trim()}).map(b=>b.outerHTML)),[]);assert.equal(await p.locator('[data-action="stop"]:visible').count(),1,'stop always available');}
 async function shot(p,name){await p.screenshot({path:root+'/screenshots/'+name+'.png',fullPage:true});}
 async function finish(p,id,label){await click(p,`[data-stage="${id}"]`);await phase(p,'explore');if(label)await shot(p,label+'-'+id+'-explore');await click(p,'[data-action="replay"]');await click(p,'[data-action="next"]');
 for(let i=0;i<4;i++){await phase(p,'learn');assert.equal(await p.locator('#app').getAttribute('data-index'),String(i));await click(p,'[data-action="next"]');await phase(p,'quiz');assert.equal(await p.locator('[data-answer]').count(),2);await click(p,'[data-answer="wrong"]');assert.match(await p.locator('#feedback').innerText(),/try again/i);await phase(p,'quiz');if(label&&i===2)await shot(p,label+'-'+id+'-retry');await p.locator('[data-answer="correct"]').click();await p.evaluate(()=>{for(let j=0;j<6;j++){document.querySelector('[data-answer="correct"]').click();document.querySelector('[data-action="next"]')?.click()}});await phase(p,'quiz');await p.waitForTimeout(470);await click(p,'[data-action="next"]');}
 await phase(p,'recap');assert.equal(await p.locator('[data-word]').count(),4);for(let i=0;i<4;i++)await click(p,`[data-word="${i}"]`);if(label)await shot(p,label+'-'+id+'-recap');}
 async function done(o){assert.deepEqual(o.errors,[]);assert.deepEqual(o.requests,[]);await o.context.close();scenarios++;}
 try{
 for(const [label,size] of [['phone',{width:390,height:844}],['tablet',{width:820,height:1180}],['narrow',{width:320,height:568}],['landscape',{width:844,height:390}]]){
 const o=await setup(size),p=o.page;await phase(p,'home');await shot(p,label+'-map');assert.equal(await p.locator('button[data-stage]').count(),5);
 await click(p,'[data-stage="animals"]');await click(p,'[data-action="stop"]');assert.equal(await p.locator('[data-completed="true"]').count(),0,'unfinished stage does not award');
 for(let i=0;i<ids.length;i++){await finish(p,ids[i],label==='phone'?label:null);assert.equal(await p.locator('#sticker-total').innerText(),String(i+1));await p.evaluate(()=>document.querySelector('[data-action="next"]')?.click());await p.reload();await phase(p,'home');assert.equal(await p.locator('[data-completed="true"]').count(),i+1);}
 await shot(p,label+'-complete-map');await finish(p,'animals');assert.equal(await p.locator('#sticker-total').innerText(),'5');await click(p,'[data-action="map"]');assert.equal(await p.locator('[data-suggested="true"]').count(),0);
 await p.evaluate(()=>localStorage.setItem('unrelated','keep'));
 await click(p,'[data-action="parents"]');assert.equal(await p.locator('[data-action="reset"]').count(),0);await click(p,'[data-gate="wrong"]');assert.equal(await p.locator('[data-action="reset"]').count(),0);await click(p,'[data-gate="correct"]');await click(p,'[data-action="reset"]');await click(p,'[data-action="cancel-reset"]');assert.equal(await p.locator('#sticker-total').innerText(),'5');await click(p,'[data-action="reset"]');await click(p,'[data-action="confirm-reset"]');await p.reload();assert.equal(await p.locator('[data-completed="true"]').count(),0);assert.equal(await p.evaluate(()=>localStorage.getItem('unrelated')),'keep');await done(o);console.log('PASS all 5 themes + replay + reset: '+label);
 }
 for(const storage of ['corrupt','denied','write-denied']){const o=await setup({width:390,height:844},'none',storage),p=o.page;await finish(p,'food');assert.match(await p.locator('#storage-status').innerText(),storage==='corrupt'?/מקומית/:/נשמרת|שמירה/);assert.equal(await p.locator('#sticker-total').innerText(),'1');await click(p,'[data-action="map"]');assert.equal(await p.locator('[data-completed="true"]').count(),1);await done(o);console.log('PASS storage '+storage);}
 for(const mode of ['none','unsupported','error','hung','real']){const o=await setup({width:360,height:740},mode),p=o.page;await click(p,'[data-stage="fire-trucks"]');if(mode==='hung'){assert.equal(await p.locator('[data-action="next"]').isDisabled(),true);await click(p,'[data-action="cancel-audio"]');assert.equal(await p.locator('[data-action="next"]').isDisabled(),false);await click(p,'[data-action="replay"]');await p.waitForFunction(()=>!document.querySelector('[data-action="next"]').disabled,{},{timeout:14000});assert.match(await p.locator('#audio-status').innerText(),/זמן/);await click(p,'[data-action="replay"]');}
 if(['none','unsupported'].includes(mode))assert.match(await p.locator('#audio-status').innerText(),/אין קול/);if(mode==='error')assert.match(await p.locator('#audio-status').innerText(),/לא הצליחה/);if(mode==='real')console.log('Real speech: '+await p.locator('#audio-status').innerText());await click(p,'[data-action="stop"]');if(mode==='hung')await p.evaluate(()=>lastUtterance.onend());await phase(p,'home');await done(o);console.log('PASS audio '+mode);}
 console.log(`PASS ${scenarios} scenarios; zero page errors, zero HTTP requests, no overflow; simulated speech is NOT audible verification.`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
