(function(root){
 class Lesson {
  constructor(){this.token=0;this.state={phase:'home',index:0,feedback:null,busy:false};}
  select(id){if(!['fire-trucks','vehicles','colours','food','animals'].includes(id))return;this.token++;this.state={stage:id,phase:'explore',index:0,feedback:null,busy:false};}
  beginAudio(){this.state.busy=true;return ++this.token;}
  endAudio(token){if(token===this.token)this.state.busy=false;}
  send(event,value){
   if(['stop','restart','start'].includes(event)){this.token++;this.state.busy=false;}
   if(this.state.busy)return this.state;
   const s=this.state;
   if(event==='stop'){this.state={phase:'home',index:0,feedback:null,busy:false};}
   else if(event==='restart'||(event==='start'&&s.phase==='home')){this.select(s.stage||'fire-trucks');}
   else if(event==='next'){
    if(s.phase==='explore')s.phase='learn';
    else if(s.phase==='learn')s.phase='quiz';
    else if(s.phase==='quiz'&&s.feedback==='correct'){
     s.feedback=null; if(s.index===3){s.phase='recap';this.onComplete?.(s.stage);}else{s.index++;s.phase='learn';}
    }
   }else if(event==='answer'&&s.phase==='quiz'&&s.feedback!=='correct')s.feedback=value?'correct':'retry';
   return this.state;
  }
 }
 if(typeof module!=='undefined') module.exports={Lesson}; else root.Lesson=Lesson;
})(typeof window!=='undefined'?window:globalThis);
