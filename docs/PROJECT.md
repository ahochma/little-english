# Toddler English — Private iOS App

## Status
**Clickable prototype ready for parent review.** Standalone artifact: `prototype/index.html`; download package: `prototype/meet-the-fire-truck-prototype.zip`. Chief of Staff independently reran the tests: 7 unit tests and 9 Chromium browser scenarios passed; ZIP integrity and HTML byte match verified, phone exploration screenshot inspected. Actual audible speech, Safari, and physical iOS devices remain unverified. No native iOS build or deployment has started.

## Purpose
Create a parent-supervised iPhone/iPad application that helps toddlers begin learning English through short, playful, repeatable activities.

## Ownership and operating model
- **Chief of Staff:** coordinates priorities, decisions, milestones, and specialist work.
- **Toddler English iOS Product Agent:** owns product discovery, child-safe learning design, backlog, Swift/SwiftUI implementation planning, and test-first development.
- **User:** owns product decisions and any App Store deployment or submission.

## Hard boundary: no App Store work
This project is for private development and testing only. Do not submit, publish, deploy, create a store listing, or perform release-delivery work unless the user explicitly asks.

## Product principles
1. Toddler-first: calm, simple, short, visually clear.
2. Parent-supervised: parent settings and controls are separate from the child experience.
3. Privacy-first: offline/local by default; no ads, purchases, social features, external links for children, or tracking by default.
4. Learning by repetition: hear, see, choose or respond, celebrate gently, repeat.
5. Accessible interaction: large targets, minimal reading requirements, restrained motion and sound.

## Initial MVP charter

### Audience and session model
- Designed for children **3–6 years old**, beginning English learners, with a parent or caregiver nearby.
- A calm session should cover **3–5 words** and finish in **under 7 minutes**.
- The learning loop is: **hear → see → tap/replay → recognise → warm confirmation → recap/break**.

### V1 content and experience
- Home screen with **4–6 vocabulary themes** and an initial library of **20–30 common nouns**.
- Each word has a consistent illustration, clear English pronunciation, replay control, and a two- or three-choice recognition prompt.
- Large, tap-friendly visuals; no reading required to complete a child activity.
- Gentle confirmation and immediate retry; no punitive feedback, time pressure, streaks, or reward economy.
- A local-only caregiver view for words explored, recently used themes, sound-effect preference, progress reset, and concise usage guidance.
- Fully offline child-facing operation after installation.

### Parent-supervised safety and privacy guardrails
- No ads, purchases, accounts, external links, browser access, chat, social features, user-generated content, location data, analytics SDKs, microphone/camera access, or child-identifying data.
- Parent settings must be protected by a simple parent gate (for example, hold-to-unlock or a basic math gate).
- The experience should encourage short, shared sessions and stopping when the child is frustrated.

## Measurable acceptance criteria
- A caregiver starts an activity in **two taps or fewer** from the home screen.
- At least **20 usable words across four themes** are available.
- Every word supports display, clear audio, replay, and recognition practice.
- A 3–5 word session completes in **under seven minutes**.
- Functionality works without network access after installation.
- No child-facing screen exposes advertising, purchasing, logins, external links, or data collection.
- Parent settings are protected by the selected parent gate.
- On the selected iPhone/iPad test device, all core child controls use large targets and do not require reading.

## Explicitly out of scope for v1
- App Store submission, public distribution, payments, subscriptions, ads, or any deployment work.
- Accounts, cloud sync, login, sharing, messaging, multiplayer, remote analytics, behavioural tracking, or children’s data collection.
- AI conversations, speech recognition, pronunciation scoring, voice recording, video, long-form lessons, extensive animation, or a gamified reward economy.
- A deeply adaptive curriculum, multiple languages, advanced grammar, reading instruction, or formal assessment.

## Development standard
Native iOS implementation is the default: **Swift + SwiftUI + XCTest**. Build every behaviour as a small vertical slice using RED → GREEN → REFACTOR. Do not claim an iOS build works until it has been verified on macOS with Xcode.

## Confirmed product inputs
- **Home/first language:** Hebrew. The parent-facing guidance and any optional support should be Hebrew; the child-facing vocabulary activity teaches English.
- **Initial content themes:** fire trucks, vehicles, colours, food, and animals.
- **First mini-lesson:** fire trucks.
- **V1 interaction:** tap-only; defer speech recognition and spoken responses.
- **Personalisation:** the content direction should be especially engaging for a young boy, without using gender stereotypes as a restriction on access or learning.

## Current approved milestone: clickable prototype
- Build one complete fire-truck lesson before expanding the curriculum.
- Proposed starter vocabulary: fire truck, red, ladder, wheel.
- Flow: explore → learn/replay → two-picture recognition with gentle retry → recap → replay or stop.
- US English is the working voice default; exact voice remains subject to parent review.
- Responsive phone and tablet layouts are a prototype assumption, not confirmed native device support.
- Browser prototype first; native SwiftUI implementation follows review. No App Store work.
- Browser speech synthesis is a prototype aid, not a guarantee of offline audio. The native offline requirement will need bundled/verified audio.
- The larger 20-word/four-theme criteria above are later MVP targets, not acceptance criteria for this first prototype.

## Development access
The user confirms access to a Mac with Xcode. No remote access has been provided; no native build is verified here.

## Decisions still needed
1. Confirm test device(s) and iOS version: iPhone, iPad, or both.
2. Review the prototype's vocabulary, voice, illustrations, and child interaction before native implementation.

## Approved expansion: five-stage browser prototype
The user positively reviewed the first prototype and explicitly approved expanding to five themed stages: fire trucks, vehicles, colours, food, animals. This supersedes the single-lesson scope for the next milestone, not the no-App-Store boundary.

- Preserve `prototype/`; build the new version under `prototype-v2/`.
- Each stage contains a small tap-only learn/recognise/recap loop.
- Child-visible map shows completed stages and a suggested next step; all stages remain selectable and replayable.
- One predictable collectible sticker per completed stage. Replays do not duplicate rewards; mistakes never remove progress. Completion is participation, not demonstrated mastery.
- This explicitly permits gentle progress gamification, while excluding competitive scores, streaks, countdowns, variable rewards, purchases, and pressure to continue.
- Store only completed-stage IDs and a schema version locally in the browser; no account, child identity, timestamps, or remote tracking. Parent may deliberately reset with confirmation.
- Explain local/browser-specific storage and failure modes; no cross-device sync is promised.
- Keep English pronunciation and Hebrew parent support, accessible targets and reduced motion, stop/break always available.
- Verify every stage and persistence/reload/reset/corruption/replay behaviour, not just the first theme.

## Kotlin Multiplatform mobile implementation
The user explicitly approved Kotlin Multiplatform with Compose Multiplatform as the native direction, so the app can share product logic and UI across Android and iPhone/iPad. This supersedes the prior SwiftUI-only implementation assumption.

- Keep one shared KMP module for lesson state, progress, Compose UI, and the five approved themes.
- Keep Android and iOS host layers thin: app-local persistence and platform lifecycle/audio integration only.
- The iOS host still needs a Mac with Xcode for framework compilation, signing, simulator, and physical-device verification.
- Voice recordings remain separate local assets; no API key, remote TTS call, or system voice belongs in the app.
- Private device/simulator testing is approved. No App Store or public release work is authorized.

## Next milestone
Review the built Android debug app and run the iOS host on the user's Mac. Then add approved bundled voice assets and platform-local playback as a separately verified slice.
