const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'../lesson.js');
function create(){assert.ok(fs.existsSync(file),'lesson state implementation exists'); return new (require(file).Lesson)();}
test('parent starts exploration; only an explicit next opens the first word',()=>{
 const l=create(); assert.equal(l.state.phase,'home'); l.send('start');
 assert.equal(l.state.phase,'explore'); assert.equal(l.state.index,0);
 l.send('next'); assert.equal(l.state.phase,'learn');
});

test('four word learn / recognition loops permit gentle retry and finish in recap',()=>{
 const l=create(); l.send('start'); l.send('next');
 for(let i=0;i<4;i++){
  assert.equal(l.state.index,i); assert.equal(l.state.phase,'learn');
  l.send('next'); assert.equal(l.state.phase,'quiz');
  l.send('next'); assert.equal(l.state.phase,'quiz');
  l.send('answer',false); assert.equal(l.state.feedback,'retry'); assert.equal(l.state.phase,'quiz');
  l.send('answer',true); assert.equal(l.state.feedback,'correct');
  l.send('answer',false); assert.equal(l.state.feedback,'correct');
  l.send('next');
 }
 assert.equal(l.state.phase,'recap');
 l.send('restart'); assert.equal(l.state.phase,'explore'); assert.equal(l.state.index,0);
 l.send('stop'); assert.equal(l.state.phase,'home');
});

test('speech locks progress and answers; stale completions cannot release newer speech',()=>{
 const l=create();l.send('start');const first=l.beginAudio();
 l.send('next'); assert.equal(l.state.phase,'explore');
 const second=l.beginAudio();l.endAudio(first);assert.equal(l.state.busy,true);
 l.endAudio(second);assert.equal(l.state.busy,false);l.send('next');l.send('next');
 const third=l.beginAudio();l.send('answer',true);assert.equal(l.state.feedback,null);
 l.send('stop');l.endAudio(third);assert.equal(l.state.phase,'home');assert.equal(l.state.busy,false);
});
test('replay and audio completion never automatically advance the lesson',()=>{
 const l=create();l.send('start');l.send('next');
 const token=l.beginAudio();l.endAudio(token);assert.equal(l.state.phase,'learn');
 l.send('restart');assert.equal(l.state.busy,false);
});
test('stage selection cancels old speech and awards only after entire lesson, including replay',()=>{
 const l=create();assert.equal(typeof l.select,'function');let completed=[];
 l.onComplete=id=>completed.push(id);
 for(const id of ['fire-trucks','vehicles','colours','food','animals']){
  l.select(id);assert.equal(l.state.stage,id);assert.equal(l.state.phase,'explore');
  const token=l.beginAudio();l.send('stop');l.endAudio(token);assert.deepEqual(completed,[]);
 }
 l.select('food');l.send('next');for(let i=0;i<4;i++){l.send('next');l.send('answer',false);l.send('next');assert.equal(l.state.phase,'quiz');l.send('answer',true);l.send('next');}
 assert.deepEqual(completed,['food']);l.send('next');assert.deepEqual(completed,['food']);
 l.select('unknown');assert.equal(l.state.stage,'food');assert.equal(l.state.phase,'recap');
});
