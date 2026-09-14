// Produces a portable, single-file artifact; no server or build tools needed to open it.
const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const html=`<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">
<title>Five Little Journeys · Little English</title>
<style>${read('styles.css')}</style>
</head>
<body><div class="shell">
<header class="topbar"><div class="brand"><span class="brand-mark" aria-hidden="true"></span>little English</div><div class="top-actions"><span class="total" lang="he" dir="rtl">מדבקות: <span id="sticker-total">0</span></span><button class="quiet" data-action="stop" aria-label="Stop and take a break"><span class="icon" aria-hidden="true"><svg viewBox="0 0 32 32"><rect x="7" y="7" width="18" height="18" rx="3" fill="currentColor"/></svg></span><span>Stop</span></button></div></header>
<main id="app"></main>
<aside class="audio-panel" lang="he" dir="rtl" aria-label="מצב שמע להורים"><p id="audio-status" role="status" aria-live="polite"></p><button type="button" id="cancel-audio" data-action="cancel-audio" hidden>ביטול שמע</button></aside>
<p id="storage-status" lang="he" dir="rtl" role="status"></p><footer class="footer" lang="he" dir="rtl">זמן קטן ביחד · בלי ציונים, בלי לחץ · אפשר לעצור מתי שרוצים</footer>
<noscript><p lang="he" dir="rtl">יש להפעיל JavaScript בדפדפן כדי לפתוח את ההדגמה. אין צורך בחשבון או באינטרנט לתמונות ולפעילות.</p></noscript>
</div>
${['lesson.js','progress.js','audio.js','illustrations.js','app.js'].map(name=>`<script>\n${read(name)}\n</script>`).join('\n')}
</body></html>`;
fs.writeFileSync(path.join(__dirname,'index.html'),html);
console.log(`Built self-contained index.html (${Buffer.byteLength(html)} bytes)`);
