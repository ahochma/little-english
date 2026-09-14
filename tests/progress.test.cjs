const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
function create(storage){assert.ok(fs.existsSync(require('node:path').join(__dirname,'../progress.js')),'progress implementation exists');return new (require('../progress.js').Progress)(storage);}
const memory=()=>({value:null,getItem(){return this.value},setItem(k,v){this.value=v}});
test('completion awards once and persists only version and completed IDs',()=>{
 const storage=memory(),p=create(storage);assert.deepEqual(p.completed,[]);
 assert.equal(p.complete('fire-trucks'),true);assert.equal(p.complete('fire-trucks'),false);
 assert.deepEqual(JSON.parse(storage.value),{version:2,completed:['fire-trucks']});
 assert.deepEqual(create(storage).completed,['fire-trucks']);
 assert.equal(p.next(),'vehicles');
});
test('invalid saved data rejected safely, duplicates normalised, unknown completion ignored',()=>{
 for(const raw of ['{','null','[]','{"version":1,"completed":[]}','{"version":2,"completed":["intruder"]}','{"version":2,"completed":[],"name":"child"}','{"version":2,"completed":"food"}']){
  const s=memory();s.value=raw;const p=create(s);assert.deepEqual(p.completed,[]);assert.equal(p.notice,'invalid');
 }
 const s=memory();s.value=JSON.stringify({version:2,completed:['food','food']});const p=create(s);assert.deepEqual(p.completed,['food']);assert.equal(p.complete('unknown'),false);
});
test('denied storage keeps session progress and reset needs explicit confirmation',()=>{
 const p=create({getItem(){throw Error('denied')},setItem(){throw Error('denied')}});
 assert.equal(p.notice,'unavailable');p.complete('food');assert.deepEqual(p.completed,['food']);
 assert.equal(p.reset(false),false);assert.deepEqual(p.completed,['food']);
 assert.equal(p.reset(true),true);assert.deepEqual(p.completed,[]);
 const s=memory(),q=create(s);q.complete('animals');q.reset(true);assert.deepEqual(create(s).completed,[]);
});
