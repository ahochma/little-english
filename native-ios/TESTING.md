# Native iOS testing

## Parent gate TDD evidence

### RED

1. Added `testParentGateStaysLockedForWrongAnswerAndUnlocksForThreePlusFour` to `LittleEnglishNativeTests/LittleEnglishNativeTests.swift` before adding a `ParentGate` production type.
2. Attempted to run the XCTest target on this Linux host:

   ```text
   $ xcodebuild test -project LittleEnglishNative.xcodeproj -scheme LittleEnglishNative -destination 'platform=iOS Simulator,name=iPhone 15'
   /usr/bin/bash: line 5: xcodebuild: command not found
   ```

   Linux has no Xcode/XCTest runtime, so the intended compile-time RED (`cannot find 'ParentGate' in scope`) cannot be executed here. The test references the not-yet-defined `ParentGate`, so it is a genuine test-first failure on a Mac with Xcode.

### GREEN

1. Implemented `ParentGate` with `3 + 4` as its required answer and the test's `5` then `7` behavior.
2. Ran the following static source validation on this host after the implementation:

   ```text
   PASS: static privacy and parent-gate flow scan
   ```

   The scan verifies the iOS 17 target, required gate flow markers (including choices `5`, `7`, and `9`), the retained reset confirmation dialog, removal of the direct settings presentation, and no native source references to network, audio, analytics, camera, microphone, location, or speech services.

Executable XCTest GREEN evidence remains pending on a Mac with Xcode because this Linux host has neither `xcodebuild` nor a Swift/XCTest toolchain. Run `LittleEnglishNativeTests` there to verify the test suite.
