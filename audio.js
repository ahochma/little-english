(function(root){
 class AudioPlayer {
  constructor(synth,Utterance,timeout=12000){this.synth=synth;this.Utterance=Utterance;this.timeout=timeout;this.generation=0;}
  cancel(){this.generation++;clearTimeout(this.timer);try{this.synth?.cancel();}catch(_){} }
  play(text,done){
   this.cancel();const generation=this.generation;let settled=false;
   const finish=status=>{if(settled||generation!==this.generation)return;settled=true;clearTimeout(this.timer);if(status!=='ready')try{this.synth?.cancel();}catch(_){}done(status);};
   try{
    const voice=this.synth?.getVoices().find(v=>v.localService&&/^en[-_]US$/i.test(v.lang));
    if(!voice||!this.Utterance){finish('unavailable');return;}
    const u=new this.Utterance(text);this.utterance=u;u.lang='en-US';u.voice=voice;u.rate=0.82;u.pitch=1;u.volume=1;
    u.onend=()=>finish('ready');u.onerror=()=>finish('error');
    this.timer=setTimeout(()=>finish('timeout'),this.timeout);this.synth.speak(u);
   }catch(_){finish('error');}
  }
 }
 if(typeof module!=='undefined')module.exports={AudioPlayer};else root.AudioPlayer=AudioPlayer;
})(typeof window!=='undefined'?window:globalThis);
