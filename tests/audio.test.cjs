const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
function make(synth,timeout=20){assert.ok(fs.existsSync(require('node:path').join(__dirname,'../audio.js')),'speech controller exists');const {AudioPlayer}=require('../audio.js');return new AudioPlayer(synth,function(text){this.text=text},timeout);}
const voice={lang:'en-US',localService:true,name:'Test local US'};
function fake(){return {getVoices:()=>[voice],cancel(){},speak(u){this.u=u;}};}
test('unavailable API and absent local US voice release control with honest status',()=>{
 for(const synth of [null,{...fake(),getVoices:()=>[]},{...fake(),getVoices:()=>[{...voice,localService:false}]}]){
 let result;make(synth).play('red',s=>result=s);assert.equal(result,'unavailable');
 }
});
test('speech error and hung speech both release control',async()=>{
 const synth=fake(),p=make(synth);let status;p.play('red',s=>status=s);synth.u.onerror();assert.equal(status,'error');
 p.play('wheel',s=>status=s);await new Promise(r=>setTimeout(r,40));assert.equal(status,'timeout');
});
test('cancel invalidates old events and replay cannot release a newer utterance',()=>{
 const synth=fake(),p=make(synth);let calls=[];p.play('red',s=>calls.push(s));const old=synth.u;
 p.play('wheel',s=>calls.push(s));old.onend();assert.deepEqual(calls,[]);
 assert.equal(synth.u.lang,'en-US');assert.equal(synth.u.voice,voice);
 synth.u.onend();assert.deepEqual(calls,['ready']);
 p.play('red',s=>calls.push(s));p.cancel();synth.u.onerror();assert.deepEqual(calls,['ready']);
});
