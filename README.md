# Little English — Kotlin Multiplatform app

This repository now contains the original browser prototype **and** a Kotlin Multiplatform (KMP) app foundation for Android and iPhone/iPad.

## What works today

- Shared Kotlin lesson logic for all five journeys: fire trucks, vehicles, colours, food, and animals.
- Shared Compose Multiplatform interface for the map, tap-only learning flow, two-choice recognition, gentle retry, recap, and fixed completion sticker.
- Local-only completion storage:
  - Android: `SharedPreferences`
  - iOS: `NSUserDefaults`
- No account, analytics, tracking, microphone, camera, network API calls, streaks, scores, purchases, or child data.
- All stages remain selectable and replayable. A sticker records participation after a full four-word journey; it does not claim mastery.
- Audio is deliberately a safe no-op until approved voice recordings are bundled. It does not use Siri or send text to a speech API.

## Project layout

```text
shared/       Shared Kotlin model, lesson flow, progress logic, and Compose UI
androidApp/   Android app entry point
iosApp/       SwiftUI host and XcodeGen project template
index.html    Previous standalone browser prototype
```

## Verified in this environment

```bash
./gradlew :shared:desktopTestTest
```

The shared Kotlin test suite passed. This Linux build host does not contain an Android SDK or Xcode, so it cannot build an APK or iOS simulator app here.

## Android: open and run

1. Install Android Studio (current stable) with Android SDK Platform 35.
2. Clone this repository and open its root directory in Android Studio.
3. Let Gradle sync, select the `androidApp` run configuration, choose an Android device/emulator, and run it.
4. The minimum Android version is API 26 (Android 8).

## iPhone/iPad: open and run on your Mac

Requirements: Xcode 16+, JDK 21, and [XcodeGen](https://github.com/yonaskolb/XcodeGen).

```bash
git clone https://github.com/ahochma/little-english.git
cd little-english
brew install xcodegen
cd iosApp
xcodegen generate
open LittleEnglish.xcodeproj
```

In Xcode:

1. Select the **LittleEnglish** target.
2. Set your Apple Development Team under **Signing & Capabilities**.
3. Choose an iPhone/iPad simulator or your own device.
4. Run. The pre-build script calls `:shared:embedAndSignAppleFrameworkForXcode` to build and embed the KMP framework.

This is private device/simulator testing only. No App Store submission, deployment, or public release is included.

## Audio next step

The selected ElevenLabs library voice cannot currently be used by the account through the API. When an approved voice is available, add licensed MP3 assets under the app resources and implement platform-local playback. This keeps the app offline and prevents API keys from ever being present in the app.

## Legacy browser prototype

`index.html` remains a separately tested browser prototype. Open it directly in a browser; it is not used by the native KMP app.
