(function(root){
const IDS=['fire-trucks','vehicles','colours','food','animals'];
const KEY='little-english-progress-v2';
class Progress{
 constructor(storage){
  this.storage=storage;this.completed=[];this.notice='';let raw;
  try{raw=storage.getItem(KEY);}catch(_){this.notice='unavailable';return;}
  if(raw===null)return;
  try{const data=JSON.parse(raw);
   if(!data||Array.isArray(data)||data.version!==2||Object.keys(data).sort().join(',')!=='completed,version'||!Array.isArray(data.completed)||!data.completed.every(id=>IDS.includes(id)))throw Error('Invalid');
   this.completed=IDS.filter(id=>data.completed.includes(id));
  }catch(_){this.notice='invalid';}
 }
 save(){try{this.storage.setItem(KEY,JSON.stringify({version:2,completed:this.completed}));this.notice='';}catch(_){this.notice='unavailable';}}
 complete(id){if(!IDS.includes(id)||this.completed.includes(id))return false;this.completed=IDS.filter(x=>x===id||this.completed.includes(x));this.save();return true;}
 next(){return IDS.find(id=>!this.completed.includes(id))||null;}
 reset(confirmed){if(confirmed!==true)return false;this.completed=[];this.save();return true;}
}
if(typeof module!=='undefined')module.exports={Progress,IDS,KEY};else Object.assign(root,{Progress,STAGE_IDS:IDS,PROGRESS_KEY:KEY});
})(typeof window!=='undefined'?window:globalThis);
