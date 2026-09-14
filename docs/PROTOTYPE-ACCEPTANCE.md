# Prototype acceptance checklist

Scope: one four-word fire-truck browser prototype, not the later full native MVP.

## Required behaviour
- A parent sees Hebrew setup guidance before the child activity.
- Start leads to fire-truck exploration; tap/replay repeats the English pronunciation.
- Learn introduces fire truck, red, ladder, wheel.
- Recognition offers two distinct pictured choices for each prompt.
- Incorrect selections retain the same prompt and allow immediate retry, without a failure score.
- Correct selections cannot advance the question repeatedly through rapid taps.
- Recap includes every introduced word and supports replay/restart and stop.
- Stop cancels pending prompts/audio and returns to an appropriate resting screen.

## Presentation
- Phone and tablet layouts have no horizontal overflow.
- Main controls are comfortably larger than standard minimum touch targets.
- Child activity can be understood through pictures and audio; text is supplementary.
- Hebrew guidance has correct RTL direction; English activity remains LTR.
- Keyboard focus and accessible button names are present.
- Reduced-motion preferences are respected.

## Privacy and audio
- No microphone/camera permissions, login, analytics, network-loaded content, or stored child data.
- Unsupported or unavailable browser speech has a visible explanation rather than silent success.
- Browser speech uses the US English preference, but voice availability/quality needs caregiver verification on the target browser.
- No claim of iOS, Safari, offline speech, or real-device verification unless actually performed.

## Evidence
- Node lesson-state tests exercised RED then GREEN.
- Browser end-to-end flow exercised, including incorrect choice, recap, restart and stop.
- Mobile/tablet screenshots inspected.
- Actual results and remaining limitations recorded in prototype README/report.

## Exit to native implementation
Parent approves interaction, words, and audio direction; test device/iOS version is confirmed; SwiftUI/XCTest work begins as a separate milestone. No App Store work.
