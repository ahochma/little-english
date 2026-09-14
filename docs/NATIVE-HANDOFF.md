# Native SwiftUI/XCTest handoff — Fire Truck Lesson

**Status:** planning handoff only. No native project, production Swift, Xcode build, simulator run, or device run was created or claimed in this milestone.

## Scope and non-negotiable behavior

Build one native, tap-only SwiftUI lesson for ages 3–6. The child learns these English words in this order:

1. `fire truck`
2. `red`
3. `ladder`
4. `wheel`

The parent first sees Hebrew RTL setup/support text. The child flow is English/LTR and picture-led:

`parentHome → explore → learn(word) → recognition(word) → … → recap`

- Tapping a pictured word or replay control plays its bundled English audio.
- Each recognition screen contains exactly two distinct pictured choices: the target and one approved distractor.
- A wrong answer leaves the same word/question active, gives a gentle retry prompt, and records no failure score.
- A correct answer locks that question against further answer/next taps until the state transition is accepted.
- Recap shows all four words, each replayable; **Play again** restarts at explore and **All done/Stop** cancels audio and returns to parent home.
- There is no child reading requirement, speech input, recording, score, timer, reward economy, or network dependency.

Do not treat the browser prototype as native verification. It is the interaction reference only; the native lesson must use bundled, parent-reviewed audio rather than browser speech synthesis.

## Implementation decision defaults

These defaults keep the first slice native, small, and testable. They are implementation assumptions, not parent decisions unless marked otherwise.

| Area | Default |
|---|---|
| Language/UI/test framework | Swift, SwiftUI, XCTest; no third-party packages. |
| Deployment target | **iOS 17.0 minimum — provisional.** Confirm after the parent provides the oldest iPhone/iPad and installed iOS version. Do not use iOS-17-only APIs in lesson logic; lowering the target later should be straightforward. |
| Devices | Universal iPhone and iPad layout, pending parent confirmation of actual test device(s). |
| Architecture | A value-type, dependency-free lesson reducer/domain model; SwiftUI renders its state; a small audio adapter is injected at the view-model boundary. |
| App state | In memory only for this milestone. No persistence, progress history, telemetry, or account. |
| Images | App-bundled original/vector illustrations in the asset catalog. Do not fetch images. |
| Audio | App-bundled, reviewed, US-English recordings; no `AVSpeechSynthesizer`, remote media, or system voice dependency. |
| Sound behavior | Audio is interruptible. A new play request cancels/replaces the prior request. Stop/app background cancels playback. No auto-play assumption beyond the parent-approved flow. |
| Parent gate | Omit parent settings from this one-lesson slice. The initial Hebrew parent home is guidance, not a protected settings area. Add a gate before any future settings/progress/reset surface. |

At native-project creation, use a standard **iOS App** target plus a unit-test target; enable SwiftUI lifecycle. Keep the app target and test target names consistent (for example `LittleEnglish` and `LittleEnglishTests`). Avoid UI tests in the first logic slice; add XCUITest only after the accessible identifiers and target device are agreed.

## Recommended project structure

```text
LittleEnglish/
  LittleEnglishApp.swift                         # composition root only
  App/
    ParentHomeView.swift                         # Hebrew RTL parent guidance/start
    FireTruckLessonView.swift                    # renders state; no transition rules
    FireTruckLessonViewModel.swift               # reducer coordination + audio lifecycle
    Components/
      LessonPictureButton.swift
      RecognitionChoiceView.swift
      ReplayButton.swift
  LessonDomain/
    FireTruckLesson.swift                        # four ordered content records
    LessonState.swift                            # phase/index/feedback model
    LessonEvent.swift                            # user/lifecycle events
    LessonReducer.swift                          # pure transition function
    RecognitionChoice.swift                      # target/distractor representation
  Audio/
    LessonAudioPlayer.swift                      # protocol
    BundledLessonAudioPlayer.swift               # AVFoundation implementation
    AudioAsset.swift                             # typed asset mapping
  Resources/
    Media.xcassets/                              # named original illustrations/colors
    Audio/
      fire_truck_en-US.m4a
      red_en-US.m4a
      ladder_en-US.m4a
      wheel_en-US.m4a
    Localizable.xcstrings                        # Hebrew parent copy and English UI/accessibility copy
LittleEnglishTests/
  LessonDomain/
    LessonReducerTests.swift
    FireTruckLessonTests.swift
  App/
    FireTruckLessonViewModelTests.swift
  Audio/
    AudioAssetTests.swift
```

`LessonDomain` must not import SwiftUI, AVFoundation, UIKit, or Foundation APIs that make it environment-dependent. Its tests run with plain XCTest. `BundledLessonAudioPlayer` is the only object allowed to know about `AVAudioPlayer`/bundle resource URLs. Views should not choose a word, increment an index, or decide whether a tap is legal.

## State machine and pure interfaces

### Data model

Use names equivalent to the following (signatures are a contract for the implementer, not production code in this handoff):

```swift
enum LessonPhase: Equatable {
    case parentHome
    case explore
    case learn(wordIndex: Int)
    case recognition(wordIndex: Int, feedback: RecognitionFeedback?)
    case recap
}

enum RecognitionFeedback: Equatable { case retry, correct }

enum LessonEvent: Equatable {
    case start
    case next
    case selectChoice(wordID: WordID)
    case restart
    case stop
}

enum WordID: String, CaseIterable, Equatable {
    case fireTruck = "fire_truck"
    case red
    case ladder
    case wheel
}

struct LessonState: Equatable {
    let phase: LessonPhase
}

struct RecognitionPrompt: Equatable {
    let target: WordID
    let choices: [WordID] // exactly two, target occurs exactly once
}

protocol LessonReducing {
    func reduce(_ state: LessonState, event: LessonEvent) -> LessonState
}
```

Keep the immutable ordered lesson content in `FireTruckLesson`: word ID, English display/accessibility text, image asset name, audio asset, and recognition distractor. The approved fixed prompts are:

| Target | Distractor |
|---|---|
| fire truck | bus |
| red | blue |
| ladder | wheel |
| wheel | ladder |

The reducer must derive prompts from content, rather than encode view-specific button positions. The UI may alternate display order deterministically by word index; tests must assert both choices are present and distinct, not a fixed left/right position.

### Legal transitions

| Current phase | Event | Next state |
|---|---|---|
| `parentHome` | `start` | `explore` |
| `explore` | `next` | `learn(0)` |
| `learn(i)` | `next` | `recognition(i, nil)` |
| `recognition(i, nil/retry)` | wrong `selectChoice` | `recognition(i, .retry)` |
| `recognition(i, nil/retry)` | target `selectChoice` | `recognition(i, .correct)` |
| `recognition(i, .correct)` | `next`, for i < 3 | `learn(i + 1)` |
| `recognition(3, .correct)` | `next` | `recap` |
| any phase | `stop` | `parentHome` |
| `recap` | `restart` | `explore` |

All other events are no-ops: notably `next` before a correct choice, extra choice taps after `.correct`, `start` outside parent home, and `restart` outside recap. This gives rapid taps deterministic behavior without timers in the domain layer.

### Audio seam

Define a narrow injected interface at the view-model boundary:

```swift
protocol LessonAudioPlaying: AnyObject {
    func play(_ asset: AudioAsset)
    func stop()
}
```

The view model maps an explicit replay/picture tap to the current `WordID`/`AudioAsset`, then calls `play`. It calls `stop` before state-changing `start`, `next`, `restart`, or `stop` operations where existing audio must not continue, and on scene deactivation. The reducer remains pure and does not model playback completion. Use a recording fake in XCTest; do not mock AVFoundation.

## Offline audio asset policy

All four files below are required before the lesson is considered complete. Their names are exact, case-sensitive resource names:

```text
Resources/Audio/fire_truck_en-US.m4a
Resources/Audio/red_en-US.m4a
Resources/Audio/ladder_en-US.m4a
Resources/Audio/wheel_en-US.m4a
```

Policy:

- Each file contains **only** the target US-English word/phrase, spoken slowly and clearly: “fire truck”, “red”, “ladder”, “wheel”. No music, effects, praise, or child data.
- Use the same parent-approved voice, recording chain, loudness treatment, and file encoding for all four. Preferred container/codec: `.m4a` AAC-LC, mono, 44.1 kHz (or a single documented consistent alternative if source delivery requires it).
- Record/render files locally, review them with the parent on the actual device speaker, then include them in the app target’s **Copy Bundle Resources**. Playback must use `Bundle.main.url(forResource:withExtension:)` by exact typed mapping; missing files are a developer-visible failure during testing, never a silent fallback to speech synthesis/network.
- Do not download, stream, generate with a cloud API, or use installed system voices. Do not include a voice provider SDK.
- The production audio player must hold one player at a time, stop/deallocate the prior player before replacement, and stop when the lesson stops or app becomes inactive. It must request no permissions.
- Keep original high-quality source recordings outside the shipped bundle only if the parent wants archival copies; ship only the four review-approved derivatives. Do not put a child’s name or identifying metadata in files.

## Accessibility and localization

### Child activity

- Use large picture buttons with a minimum **60 × 60 pt** tappable frame; primary child choices should be materially larger where layout allows. Do not rely on tiny icon-only hit areas.
- Each interactive control receives a concise English accessibility label (for example, “Hear fire truck”, “Choose ladder”, “Play again”, “Stop lesson”). Decorative art is hidden from accessibility; the button, not its image fragments, is the element.
- Provide accessibility hints only when they add action guidance (for example, “Plays the English word”). Announce gentle retry/correct feedback through an appropriate SwiftUI accessibility live-update mechanism, without announcing a score.
- Respect Dynamic Type, VoiceOver, Switch Control, Increased Contrast, and **Reduce Motion**. No essential information may depend on animation, color alone, or sound alone. The word’s picture and English text remain visible.
- Keep child lesson semantic direction `.leftToRight`; use simple English strings and do not translate the four learning targets in child UI.

### Parent-facing Hebrew

- Store parent guidance in `Localizable.xcstrings` under Hebrew (`he`), use native localized `Text`, and apply `.environment(\.layoutDirection, .rightToLeft)` only to the Hebrew parent guidance subtree. Do not globally force RTL over child English screens.
- Hebrew copy must be parent reviewed for wording and RTL punctuation. It must explain: tap-only activity; four English words; no need to read/speak/record; replay/stop availability; fully bundled audio after install; and no data collection.
- Keep English keys/strings separately localizable for system/accessibility UI. The language choice for app chrome and the parent’s device-language fallback need parent confirmation; default to Hebrew parent copy when Hebrew is available, then English fallback.

## Privacy and platform boundaries

This milestone is entirely local after installation. The native target must contain no code, SDK, entitlement, plist usage description, or UI for:

- network/API calls, cloud sync, analytics, crash/behavior tracking, advertisements, accounts, login, purchases, subscriptions, external links/web views, sharing, or user-generated content;
- microphone, camera, speech recognition, photo library, location, contacts, Bluetooth, notifications, or video;
- child profile data, identifiers, persistent progress/usage history, or background audio.

Do not add `NSMicrophoneUsageDescription`, `NSCameraUsageDescription`, or `NSSpeechRecognitionUsageDescription`. Do not add an App Store, distribution, submission, account, or deployment workflow. `AVFoundation` is permitted solely for local bundled-file playback and needs no privacy permission for that use.

## TDD vertical slices (XCTest)

Strict rule: write one XCTest first, run that **specific** test and observe the expected RED failure because the behavior/type is missing or incorrect, implement the smallest production change, rerun it for GREEN, then run the full unit target. Do not write all tests before implementation; do not write production code before the named RED test.

Use the Xcode test navigator or `xcodebuild test` only on the parent’s Mac once a scheme/destination exists. This Linux planning environment cannot run or fabricate Xcode results.

| Slice | Exact XCTest name | RED expectation | Minimal GREEN outcome |
|---|---|---|---|
| 1 | `test_start_fromParentHome_entersExplore` | Fails because the reducer/state event API or transition does not exist. | `.start` changes only `.parentHome` to `.explore`. |
| 2 | `test_next_fromExplore_entersFirstWordLearn` | Fails because ordered lesson index/state is absent. | `.next` from explore becomes `.learn(wordIndex: 0)`. |
| 3 | `test_wrongRecognitionChoice_keepsPromptAndSetsRetryFeedback` | Fails because choice evaluation/feedback is absent. | Wrong choice returns same recognition index with `.retry`; no advance. |
| 4 | `test_correctRecognitionChoice_locksRecognitionUntilNext` | Fails because correct state/no-op protection is absent. | Target sets `.correct`; later `selectChoice` leaves that state unchanged. |
| 5 | `test_next_afterFinalCorrectRecognition_entersRecap` | Fails because final-word branching is absent. | Correct word index 3 plus next yields `.recap`. |
| 6 | `test_stop_fromAnyLessonPhase_returnsParentHome` | Fails because stop/reset is absent or incomplete. | Stop from explore, learn, recognition, and recap returns parent home. |
| 7 | `test_audioAsset_forEachLessonWord_hasExactBundledFilename` | Fails because typed audio mapping is absent/wrong. | IDs map exactly to the four filenames listed above. |
| 8 | `test_stop_stopsAudioAndReturnsToParentHome` | Fails because view model has no injected audio lifecycle behavior. | Recording fake receives `stop()` and state becomes parent home. |
| 9 | `test_replayCurrentWord_playsItsBundledAudioAsset` | Fails because replay mapping/command is absent. | Recording fake receives the current word’s typed `AudioAsset`, with no state advance. |

After each green cycle, run the full `LittleEnglishTests` unit target. Once all nine are green, manually test on the parent’s chosen device(s): start; all four replay controls; each wrong/correct recognition path; rapid repeated taps; recap; restart; stop during audio; VoiceOver; Dynamic Type; Reduce Motion; offline/airplane-mode launch and playback. Record actual device model, iOS version, Xcode version, and outcomes in a later verification note—do not infer them.

## Decisions still required from the parent

1. **Approve the current prototype**: the four words, artwork direction, calm retry/recap flow, and no-score interaction.
2. **Provide test hardware and iOS version(s)**: iPhone, iPad, or both; oldest iOS version to support. This confirms/replaces the provisional iOS 17.0 minimum and defines the Xcode test destination.
3. **Approve the recorded US-English voice** after listening on the real target-device speaker (including any preference on voice age/gender/accent). No recording should be treated as final before this review.
4. **Confirm Hebrew parent-copy review** and preferred app-language fallback when the device is not set to Hebrew.

No other decision is needed to begin the test-first domain slice once these are answered.
