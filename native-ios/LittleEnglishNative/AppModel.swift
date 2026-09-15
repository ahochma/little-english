import Foundation

@MainActor
final class AppModel: ObservableObject {
    @Published private(set) var progress: ProgressSnapshot
    @Published var activeJourney: JourneyID?
    @Published var lesson: LessonState?
    @Published var parentSettingsOpen = false

    private let storageKey = "littleEnglishProgressV1"

    init() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode(ProgressSnapshot.self, from: data) {
            progress = decoded
        } else {
            progress = .empty
        }
    }

    func start(_ id: JourneyID) {
        activeJourney = id
        lesson = LessonState(journey: id)
    }

    func stop() {
        activeJourney = nil
        lesson = nil
    }

    func completeCurrentJourney() {
        guard let id = activeJourney else { return }
        progress.complete(id)
        save()
    }

    func resetProgress() {
        progress.reset(confirmed: true)
        save()
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(progress) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }
}
