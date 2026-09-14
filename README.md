# Five Little Journeys — Little English v2

A complete, parent-supervised **browser prototype** for Hebrew-speaking children aged 3–6. Tap-only; no account, microphone, recordings, ads, analytics, competition or penalties. **Not a native iOS app, PWA, deployment or App Store release.** The accepted `../prototype/` is unchanged.

## Open the prototype

1. Copy **`index.html`** to the Mac and open it in a real browser (Safari/Chrome → File → Open File), not an attachment preview. The HTML is portable: all styles, scripts and original SVG illustrations are inline, with no runtime dependencies.
2. Read the Hebrew parent guidance on the map. Choose any picture; all five themes are available from the beginning. Check that understandable US English is actually audible.
3. Explore by tapping any of the four pictures. The speaker repeats, the arrow continues. Each word has a learn picture and two-picture recognition. A wrong answer stays on the same question with “Let’s try again.” Correct feedback also waits for a tap.
4. Finishing the four activities opens the recap and awards **one fixed participation sticker**. Tap any recap word to hear it. Choose the map, replay, another journey, or the persistent square Stop button to take a break. No next lesson starts automatically.
5. On the map, the dashed path connects the five pictured themes. A check badge and matching album sticker indicate completion. The first unfinished stage is gently suggested, never required. Every stage remains replayable.

**Portable file:** `/data/workspace/toddler-english-ios/prototype-v2/index.html`  
**Archive:** `five-little-journeys-v2.zip` — extract it before opening the HTML. Includes editable sources, tests, real logs and screenshots; excludes browser downloads and dependencies.

On iOS, Files/Quick Look or mail attachment previews may not execute JavaScript. Start in a real desktop browser. A physical iPhone/iPad and Safari listening/opening check remains necessary; responsive Chromium testing does not establish Apple-device support.

## Curriculum

| Stage | Four word encounters |
|---|---|
| Fire trucks | **fire truck, red, ladder, wheel** |
| Vehicles | car, bus, bicycle, airplane |
| Colours | red, blue, yellow, green |
| Food | apple, banana, bread, egg |
| Animals | cat, dog, elephant, fish |

There are **20 word encounters, 19 unique words**: red is intentionally repeated. All illustrations are original inline SVGs. Colour recognition uses identical swatch shapes, differing only in colour; this activity depends on colour discrimination. Answer positions alternate deterministically. There is no adaptive assessment or mastery claim. A sticker records participation, not retention or ability.

## Parent reset and privacy

The map’s **הגדרות להורים** opens a Hebrew reading/arithmetic gate (choose seven for three plus four), then the reset control. Reset requires a second explicit confirmation; Cancel preserves all stickers. This is a toddler-oriented accidental-access barrier, **not authentication**. Stop always remains unrestricted.

The only application write is to localStorage key **`little-english-progress-v2`**, containing:

```json
{"version":2,"completed":["fire-trucks","vehicles"]}
```

- Only known completed stage IDs and the schema version are stored. No child identity, timestamps, answer history, audio state, streaks or analytics.
- Nothing is saved merely by opening the app, choosing a theme, or leaving an unfinished lesson.
- Completion is idempotent. Replay/repeated final taps do not create more stickers.
- Reload restores completion when storage is available. Lesson position is deliberately not saved; reload returns to the map.
- Malformed JSON, unknown IDs/versions, invalid field types and unexpected extra fields are rejected as an empty map with an honest notice. Duplicate known IDs are deduplicated.
- If storage access or writes fail, the current page retains in-memory progress and displays a Hebrew warning that refresh may lose it.
- Reset writes the empty completion list **only to this app key**; it never clears unrelated storage. If storage is denied, reset is session-only and the warning remains.
- Browser data clearing removes progress. `file://` storage behaviour and identity vary by browser and file location; moving/renaming the HTML, private mode, or switching browsers can make prior progress unavailable. No cloud backup exists.
- A restrictive Content Security Policy blocks page network connections. No fonts, CDNs, API calls or third-party media are loaded. Tests run with Chromium offline networking.

## Audio — important limits

The unchanged proven `audio.js` controller uses Speech Synthesis and only a voice reporting **localService=true** and **en-US**, with `lang='en-US'`, rate 0.82. It does not silently substitute remote, non-US or other-language voices. Replay rechecks voices, so delayed voice discovery can recover.

Unavailable API/voice, thrown errors and speech errors release controls with a Hebrew explanation. A hung utterance is cancelled after **12 seconds**. The immediate **ביטול שמע** control and always-visible Stop also cancel. Generation tokens reject stale callbacks; backgrounding the tab cancels pending speech. A 450 ms tap guard prevents accidental rapid advancement, including with absent audio. There are no child timers, sound effects, queues or automatic lesson transitions.

**Offline speech is not guaranteed.** The local-voice flag and speech end event do not prove audible output, pronunciation quality, or OS behaviour. This host’s actual headless Chromium has no usable local US voice. Successful playback lifecycle tests use a simulated browser speech API; they are **not listening tests**. If speech is unavailable, the caregiver must read the English prompts/words aloud or pause to configure an appropriate voice. Silent pictures alone do not teach pronunciation.

Native guaranteed-offline audio would require a separately approved native build with bundled/verified audio. No native code or Xcode build is included or claimed.

## Editable files

- `index.html` — generated portable artifact.
- `build.cjs` — deterministic inline assembly.
- `app.js` — five-theme vocabulary, map, parent gate, orchestration, rendering.
- `lesson.js` — pure lesson state, stage selection, transitions, speech tokens and completion callback.
- `progress.js` — minimal validated local progress and idempotent completion/reset.
- `audio.js` — reused robust local-US speech controller.
- `illustrations.js` — original truck artwork plus vehicles, colour swatches, food and animals.
- `styles.css` — cream/red illustrated map, focused learning screens, responsive sizes, visible focus and reduced motion.
- `tests/*.test.cjs` — Node built-in state/audio/progress unit tests.
- `tests/browser.cjs` — complete browser matrix.
- `tests/edges.cjs` — additional browser privacy, speech, motion and persistence checks.
- `screenshots/` — real Chromium captures, not mockups.

## Reproduce verification

From `/data/workspace/toddler-english-ios/prototype-v2`:

```sh
node build.cjs
node --test tests/*.test.cjs
```

Use existing development-only dependencies on this Linux host:

```sh
export LD_LIBRARY_PATH=/data/workspace/toddler-english-ios/prototype/.browser-libs/root/usr/lib/x86_64-linux-gnu
export PLAYWRIGHT_BROWSERS_PATH=/data/workspace/toddler-english-ios/prototype/.browsers
node tests/browser.cjs
node tests/edges.cjs
```

Browser tests first try local `playwright`, then the original prototype’s absolute dependency path. The app itself uses neither. On a separate Mac/Linux development machine:

```sh
npm install
npx playwright install chromium
node tests/browser.cjs
node tests/edges.cjs
```

Linux may additionally need the standard Playwright browser system dependencies. Dependencies and browser binaries are not included in the archive.

## Verification evidence

Final verification results are recorded in `VERIFICATION.md`, with raw output in `tests/`.

Incremental test-first history:
- `01-progress-red.txt` → `02-progress-green.txt`: first persisted, idempotent sticker.
- `03-validation-red.txt` → `04-validation-green.txt`: malformed/denied storage and deliberate reset.
- `05-stage-red.txt` → `06-stage-green.txt`: selectable stages and completion only after all four recognition loops.
- `07-browser-red.txt`: browser acceptance test failed before the v2 HTML existed.
- Subsequent browser logs preserve encountered failures as well as successful reruns, rather than replacing failures with fabricated output.

Surface/design choice: **Explore** picture map, with a secondary focused **Learn** activity. Local humanist fonts, warm paper tones, distinct literal artwork, large tap targets, restrained fixed celebration and reduced-motion support. Vertical scrolling is normal on short screens; the Stop header remains sticky. The map and word grids are actual learning controls, not marketing feature tiles.

## Still requires caregiver/device review

Audible US English quality, actual Safari/iPhone/iPad behaviour, accessibility certification and observed child comprehension have **not** been verified. Review with a caregiver and stop when the child loses interest. No claim of educational effectiveness, native offline audio, real-device fit or learning mastery is made. Nothing was deployed, published, committed or submitted to the App Store.
