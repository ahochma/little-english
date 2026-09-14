# Fire-truck prototype — parent review

## Purpose
Review one small English-learning interaction before investing in native iOS implementation. This is not an assessment of language acquisition, and completing the activity does not prove mastery.

## Agreed context
Ages 3–6, Hebrew-speaking beginners, tap-only, first theme fire trucks. Working vocabulary: fire truck, red, ladder, wheel. US English working default. User has a Mac with Xcode; actual target device and iOS version remain to be confirmed.

## Review with a caregiver
1. Open the prototype in a desktop browser first; check that English audio is audible and intelligible. Browser voices vary and can require downloading an OS voice. Never assume offline speech works.
2. Start the lesson and try tapping the main picture and replay control.
3. Try a wrong recognition choice. It should encourage another try without scoring, shame, or time pressure.
4. Complete the lesson and try both replay and stop.
5. Resize to a narrow phone-like viewport and a wider tablet-like viewport. Browser sizing is not a real iOS-device test.
6. If appropriate, explore briefly together with the child. Stop if they become frustrated or lose interest. Avoid coaching every tap: note where the pictures or prompts are unclear instead.

## Feedback that matters
- Is the voice easy to understand, and is its pace comfortable?
- Can the child tell ladder and wheel apart from the illustrations?
- Is red clearly a colour concept rather than another object's name?
- Are the tap targets easy to reach and distinguish?
- Can the child replay a prompt without reading?
- Is the experience calm? Does the caregiver need a clearer stopping point?

Do not record the child's voice, image, name, or behavioural analytics. A brief parent-written observation is sufficient.

## Native handoff after approval
- Confirm iPhone/iPad model, iOS version, and Xcode version.
- Agree on final words, illustrations, and pronunciation assets.
- Implement the lesson state machine with XCTest first, then the SwiftUI screens.
- Use bundled pronunciation audio to meet the offline requirement, with asset rights documented.
- Validate interrupted audio, background/foreground transitions, rapid taps, accessibility, and device layouts.
- Build/run in Simulator and privately on the owner's device through Xcode. Signing/account choices stay with the owner; no App Store submission or public distribution is authorized.
