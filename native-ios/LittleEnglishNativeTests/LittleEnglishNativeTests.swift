import XCTest
@testable import LittleEnglishNative

final class LittleEnglishNativeTests: XCTestCase {
    func testCompletingAJourneyAwardsOneStickerAndReplayIsIdempotent() {
        var progress = ProgressSnapshot.empty

        progress.complete(.fireTrucks)
        progress.complete(.fireTrucks)

        XCTAssertEqual(progress.completed, [.fireTrucks])
        XCTAssertEqual(progress.suggestedNext, .vehicles)
    }

    func testEveryJourneyIsAvailableBeforeAnyStickerIsCollected() {
        XCTAssertEqual(Journey.all.map(\.id), JourneyID.allCases)
        XCTAssertTrue(ProgressSnapshot.empty.isAvailable(.animals))
    }

    func testWrongAnswerDoesNotAdvanceAndCorrectAnswerWaitsForNextTap() {
        var lesson = LessonState(journey: .fireTrucks)
        lesson.next()
        lesson.next()
        lesson.answer(isCorrect: false)
        XCTAssertEqual(lesson.phase, .quiz)
        XCTAssertEqual(lesson.wordIndex, 0)

        lesson.answer(isCorrect: true)
        XCTAssertEqual(lesson.phase, .quiz)
        lesson.next()
        XCTAssertEqual(lesson.phase, .learn)
        XCTAssertEqual(lesson.wordIndex, 1)
    }

    func testParentResetNeedsExplicitConfirmation() {
        var progress = ProgressSnapshot(completed: [.food])
        progress.reset(confirmed: false)
        XCTAssertEqual(progress.completed, [.food])
        progress.reset(confirmed: true)
        XCTAssertTrue(progress.completed.isEmpty)
    }
}
