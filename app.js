/* Primary surface: Explore — a winding picture map. Secondary: focused Learn. */
(()=>{
'use strict';
const stages=[
 {id:'fire-trucks',title:'Fire trucks',he:'כבאיות',intro:'Meet the fire truck.',words:['fire truck','red','ladder','wheel'],foils:['bus','blue','wheel','ladder']},
 {id:'vehicles',title:'On the move',he:'כלי תחבורה',intro:'Let’s go! Meet the vehicles.',words:['car','bus','bicycle','airplane']},
 {id:'colours',title:'A little colour',he:'צבעים',intro:'Look at the colours.',words:['red','blue','yellow','green']},
 {id:'food',title:'At the table',he:'אוכל',intro:'Let’s look at food.',words:['apple','banana','bread','egg']},
 {id:'animals',title:'Animal friends',he:'חיות',intro:'Say hello to the animals.',words:['cat','dog','elephant','fish']}
];
const lesson=new Lesson(),player=new AudioPlayer(window.speechSynthesis,window.SpeechSynthesisUtterance);
let storage;try{storage=window.localStorage;}catch(_){}const progress=new Progress(storage);
const app=document.querySelector('#app');let acceptedAt=-1000,guardTimer,status='initial',parentView='',fresh=false,resting=false;
lesson.onComplete=id=>{fresh=progress.complete(id)};
const paths={play:'<path d="m10 6 15 10-15 10Z" fill="currentColor"/>',next:'<path d="M6 16h20M18 7l9 9-9 9"/>',stop:'<rect x="7" y="7" width="18" height="18" rx="3" fill="currentColor"/>',replay:'<path d="M4 12h6l7-6v20l-7-6H4Z"/><path d="M22 10q7 6 0 12M26 5q12 11 0 22"/>',map:'<path d="m3 15 13-11 13 11M7 13v15h7v-9h5v9h7V13"/>',check:'<path d="m6 16 7 7 14-15"/>',restart:'<path d="M7 11a11 11 0 1 1-1 12M7 4v8h8"/>'};
const icon=n=>`<span class="icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${paths[n]}</svg></span>`;
const button=(action,label,content,cls='quiet')=>`<button type="button" class="${cls}" data-action="${action}" aria-label="${label}">${content}</button>`;
const stage=()=>stages.find(t=>t.id===lesson.state.stage)||stages[0];
const swatch=t=>t.id==='colours'?`<div class="colour-cluster">${['red','blue','yellow'].map(w=>illustration(w)).join('')}</div>`:illustration(t.words[0],true);
const messages={initial:'להורים: בחרו תמונה ובדקו ששומעים אנגלית אמריקאית. אם אין קול, הקריאו יחד.',speaking:'מתנגן קול באנגלית אמריקאית. אפשר לבטל שמע או לעצור בכל רגע.',ready:'נבחר קול מקומי באנגלית אמריקאית. ודאו ששמעתם בבירור; הדפדפן אינו יכול לבדוק זאת.',unavailable:'אין קול מקומי באנגלית אמריקאית זמין. הקריאו יחד או הגדירו קול במכשיר ונסו שוב ברמקול. הפעילות זמינה ללא שמע.',error:'השמעת הקול לא הצליחה. אפשר לנסות שוב או להקריא יחד ולהמשיך.',timeout:'השמעת הקול חרגה ממגבלת הזמן ונעצרה. אפשר לנסות שוב או להקריא יחד.',cancelled:'השמעת הקול בוטלה. אפשר להמשיך, להקריא יחד או לנסות שוב.'};
function prompt(){const s=lesson.state,t=stage(),w=t.words[s.index];if(s.phase==='explore')return `${t.intro} Tap a picture to listen.`;if(s.phase==='learn')return `${w}.`;if(s.phase==='quiz'){const find=`Find ${t.id==='colours'||w==='red'?'':'the '}${w}.`;return s.feedback==='correct'?`Yes! ${w}.`:s.feedback==='retry'?`Let’s try again. ${find}`:find;}if(s.phase==='recap')return `${t.words.join('. ')}. All done! You can take a break.`;return '';}
function sync(){const guarded=performance.now()-acceptedAt<450;
app.querySelectorAll('[data-action="next"],[data-answer]').forEach(b=>b.disabled=lesson.state.busy||guarded||(b.hasAttribute('data-answer')&&lesson.state.feedback==='correct'));
app.querySelectorAll('[data-stage],[data-word],[data-action="replay"],[data-action="restart"],[data-action="picture"],[data-action="continue"]').forEach(b=>b.disabled=guarded);
document.querySelector('#audio-status').textContent=messages[status];document.querySelector('#cancel-audio').hidden=!lesson.state.busy;
document.querySelector('#storage-status').textContent=progress.notice==='unavailable'?'שמירה מקומית אינה זמינה. המדבקות נשמרות רק כל עוד הדף פתוח; רענון עלול למחוק אותן.':progress.notice==='invalid'?'נתוני השמירה לא תקינים. התחלנו מפה ריקה; לא נשמר מידע אישי.':'ההתקדמות נשמרת מקומית בדפדפן הזה בלבד. ניקוי נתוני הדפדפן מוחק אותה.';
document.querySelector('#sticker-total').textContent=progress.completed.length;
}
function speak(text=prompt()){const token=lesson.beginAudio();status='speaking';sync();player.play(text,result=>{lesson.endAudio(token);status=result;sync()});}
function mark(){acceptedAt=performance.now();clearTimeout(guardTimer);guardTimer=setTimeout(sync,460);}
function stopAudio(){player.cancel();lesson.endAudio(lesson.token);status='cancelled';}
function parent(){if(parentView==='gate')return `<section class="parent-box" lang="he" dir="rtl"><h2>להורים בלבד</h2><p>כדי לפתוח את הגדרות ההורה, בחרו את התוצאה של שלוש ועוד ארבע.</p><div class="gate-options"><button data-gate="wrong">5</button><button data-gate="correct">7</button><button data-gate="wrong">9</button></div>${button('close-parent','סגירה','ביטול')}</section>`;
if(parentView==='settings'||parentView==='confirm')return `<section class="parent-box" lang="he" dir="rtl"><h2>ההתקדמות שלנו</h2><p>מדבקה מציינת השתתפות בפעילות, לא שליטה במילים. נשמרים רק גרסת נתונים ומזהי שלבים שהושלמו, ללא שם, תאריך, תשובות או מעקב.</p>${parentView==='confirm'?`<p class="confirm-copy">למחוק את כל המדבקות של ההדגמה הזו? אי אפשר לבטל מחיקה.</p>${button('confirm-reset','אישור מחיקת כל המדבקות','כן, למחוק מדבקות','primary')}${button('cancel-reset','ביטול המחיקה','לא, לשמור')}`:button('reset','איפוס ההתקדמות','איפוס המדבקות')}${button('close-parent','סגירת הגדרות','סגירה')}</section>`;return '';}
function render(focus=false){const s=lesson.state,t=stage();app.dataset.phase=s.phase;app.dataset.index=s.index;app.dataset.stage=s.stage||'';
if(s.phase==='home'){
 app.innerHTML=`<section class="map-heading"><p class="kicker">Little journeys · First words</p><h1 tabindex="-1">A world to<br><em>say hello to.</em></h1><p lang="he" dir="rtl">חמש תחנות קטנות. בוחרים תמונה, מקשיבים ומשחקים יחד.</p></section>${resting?'<p class="break-note" lang="he" dir="rtl" role="status">סיימנו לעכשיו. אפשר לנוח ולחזור מתי שרוצים.</p>':''}<section class="map" aria-label="Choose any of five stages">${stages.map((t,i)=>{const done=progress.completed.includes(t.id),next=progress.next()===t.id;return `<button class="map-stop" data-stage="${t.id}" data-completed="${done}" data-suggested="${next}" aria-label="${t.title}, ${t.he}${done?', activity completed':next?', suggested next':''}"><span class="map-art">${swatch(t)}</span><span class="map-label"><small>${String(i+1).padStart(2,'0')}</small><strong>${t.title}</strong><span lang="he" dir="rtl">${t.he}</span></span>${done?`<span class="earned" aria-label="Sticker collected">${icon('check')}</span>`:next?'<span class="suggestion" lang="he" dir="rtl">אפשר להתחיל כאן</span>':''}</button>`}).join('')}</section><section class="album" aria-label="Your participation stickers"><div><p class="kicker">Our little collection</p><h2 lang="he" dir="rtl">מזכרת מכל תחנה</h2></div><div class="sticker-row">${stages.map(t=>progress.completed.includes(t.id)?`<span class="mini-sticker" aria-label="${t.title} sticker">${illustration(t.words[0])}</span>`:`<span class="empty-sticker" aria-label="${t.title} sticker not yet collected"></span>`).join('')}</div><p lang="he" dir="rtl">כל תחנה פתוחה תמיד. אפשר לחזור לשחק, או לעצור.</p></section><section class="guidance" lang="he" dir="rtl"><h2>זמן קטן ביחד.</h2><p>לגילאי 3–6, בליווי מבוגר. נוגעים בתמונה כדי לשמוע; החץ ממשיך כשמוכנים. בוחרים בין שתי תמונות ואפשר לנסות שוב ללא הגבלה. אין צורך לקרוא, לדבר או להקליט.</p><p>מדבקה קבועה אחת בסיום כל תחנה — מזכרת מהפעילות, לא ציון. אין צורך לסיים את כל התחנות. הריבוע עוצר בכל רגע.</p><p>זו הדגמת דפדפן, לא אפליקציית iOS. השמע תלוי בקול המקומי המותקן; אין הבטחה לשמע ללא אינטרנט. אם אין קול, הקריאו את המילים יחד.</p>${button('parents','הגדרות להורים','הגדרות להורים')}</section>${parent()}`;
}else{
 const titles={explore:t.title,learn:'Listen & look',quiz:'Can you find it?',recap:'A little journey, complete.'};
 let body='';
 if(s.phase==='explore'){body=`<p class="activity-hint" lang="he" dir="rtl">נוגעים בתמונה ומקשיבים</p><div class="explore-grid">${t.words.map((w,i)=>`<button class="explore-word" data-word="${i}" aria-label="Hear ${w}">${illustration(w)}<span>${w}</span></button>`).join('')}</div>`;}
 if(s.phase==='learn'){const w=t.words[s.index];body=`<div class="stage">${button('picture',`Hear ${w}`,illustration(w,true),'picture-button')}<p class="word">${w}</p><p class="activity-hint">Tap the picture to listen</p></div>`;}
 if(s.phase==='quiz'){const w=t.words[s.index],foil=t.foils?t.foils[s.index]:t.words[(s.index+1)%4];const choices=[{w,correct:true},{w:foil,correct:false}];if(s.index%2)choices.reverse();body=`<p class="activity-hint">Listen, then tap a picture</p><div class="choices">${choices.map(c=>`<button class="choice ${c.correct&&s.feedback==='correct'?'chosen':''}" data-answer="${c.correct?'correct':'wrong'}" aria-label="Choose ${c.w}">${illustration(c.w)}</button>`).join('')}</div><p class="feedback" id="feedback" role="status">${s.feedback==='correct'?`Yes! ${w}.`:s.feedback==='retry'?'Let’s try again.':'Which one?'}</p>`;}
 if(s.phase==='recap'){body=`<div class="celebration ${fresh?'new-sticker':''}"><span class="recap-sticker">${illustration(t.words[0])}</span><div><h2>${fresh?'A sticker for our time together.':'Hello again, little sticker.'}</h2><p lang="he" dir="rtl">${fresh?'מדבקה אחת, מזכרת מהפעילות.':'המדבקה כבר באוסף. תמיד אפשר לשחק שוב.'}</p></div></div><div class="recap-grid">${t.words.map((w,i)=>`<button class="recap-word" data-word="${i}" aria-label="Hear ${w}">${illustration(w)}<span>${icon('replay')}${w}</span></button>`).join('')}</div>`;}
 const controls=s.phase==='recap'?`${button('map','Return to stage map',icon('map')+'<span>Map</span>','primary')}${button('restart','Replay this stage',icon('restart')+'<span>Play again</span>')}${progress.next()?button('continue','Continue to suggested next stage',icon('next')+'<span>Another little journey</span>'):''}<p lang="he" dir="rtl">אפשר להמשיך רק אם רוצים, או לקחת הפסקה בכפתור העצירה.</p>`:`${button('replay','Replay English audio',icon('replay')+'<span>Again</span>','replay')}${s.phase!=='quiz'||s.feedback==='correct'?button('next','Next activity',icon('next'),'primary next'):''}`;
 app.innerHTML=`<section class="lesson"><div class="lesson-heading"><div><p class="kicker">${t.title} · ${s.phase==='recap'?'Our words':s.phase==='explore'?'Explore together':`Word ${s.index+1} of 4`}</p><h1 tabindex="-1">${titles[s.phase]}</h1></div>${button('map','Return to stage map',icon('map'),'quiet map-home')}</div>${body}<div class="controls ${s.phase==='recap'?'recap-controls':''}">${controls}</div></section>`;
}
sync();if(focus)app.querySelector('h1')?.focus({preventScroll:true});}
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||b.disabled)return;const a=b.dataset.action;
if(a==='stop'||a==='map'){stopAudio();lesson.send('stop');resting=a==='stop';parentView='';acceptedAt=-1000;render(true);return;}
if(a==='cancel-audio'){stopAudio();sync();return;}
if(a==='parents'){parentView='gate';render();return;}if(a==='close-parent'){parentView='';render();return;}
if(b.dataset.gate){if(b.dataset.gate==='correct')parentView='settings';render();return;}
if(a==='reset'&&parentView==='settings'){parentView='confirm';render();return;}
if(a==='cancel-reset'){parentView='settings';render();return;}
if(a==='confirm-reset'&&parentView==='confirm'){progress.reset(true);parentView='settings';render();return;}
if(performance.now()-acceptedAt<450)return;
if(b.dataset.stage||a==='continue'){const id=b.dataset.stage||progress.next();if(!id)return;mark();stopAudio();lesson.select(id);fresh=false;parentView='';resting=false;render(true);speak();return;}
if(b.hasAttribute('data-word')){mark();speak(stage().words[Number(b.dataset.word)]);return;}
if(a==='replay'||a==='picture'){mark();speak();return;}
if(b.hasAttribute('data-answer')){if(lesson.state.busy||lesson.state.feedback==='correct')return;mark();lesson.send('answer',b.dataset.answer==='correct');render();speak();return;}
if(a==='next'||a==='restart'){if(a==='next'&&lesson.state.busy)return;mark();stopAudio();lesson.send(a);render(true);speak();}
});
window.addEventListener('pagehide',stopAudio);document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();sync()}});render();
})();
