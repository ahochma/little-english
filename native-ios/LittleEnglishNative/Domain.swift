import Foundation

enum JourneyID: String, CaseIterable, Codable, Hashable, Identifiable {
    case fireTrucks, vehicles, colours, food, animals
    var id: String { rawValue }

    var englishTitle: String {
        switch self {
        case .fireTrucks: "Fire trucks"
        case .vehicles: "Vehicles"
        case .colours: "Colours"
        case .food: "Food"
        case .animals: "Animals"
        }
    }

    var hebrewTitle: String {
        switch self {
        case .fireTrucks: "כבאיות"
        case .vehicles: "כלי רכב"
        case .colours: "צבעים"
        case .food: "אוכל"
        case .animals: "חיות"
        }
    }

    var symbol: String {
        switch self {
        case .fireTrucks: "firetruck.fill"
        case .vehicles: "car.fill"
        case .colours: "paintpalette.fill"
        case .food: "apple.logo"
        case .animals: "pawprint.fill"
        }
    }
}

struct WordCard: Equatable, Identifiable {
    let word: String
    let foil: String
    let symbol: String
    var id: String { word }
}

struct Journey: Identifiable, Equatable {
    let id: JourneyID
    let intro: String
    let words: [WordCard]

    static let all: [Journey] = [
        Journey(id: .fireTrucks, intro: "Meet the fire truck.", words: [
            WordCard(word: "fire truck", foil: "bus", symbol: "firetruck.fill"),
            WordCard(word: "red", foil: "blue", symbol: "circle.fill"),
            WordCard(word: "ladder", foil: "wheel", symbol: "ladder"),
            WordCard(word: "wheel", foil: "ladder", symbol: "circle.dashed"),
        ]),
        Journey(id: .vehicles, intro: "Let’s go! Meet the vehicles.", words: [
            WordCard(word: "car", foil: "bus", symbol: "car.fill"),
            WordCard(word: "bus", foil: "airplane", symbol: "bus.fill"),
            WordCard(word: "bicycle", foil: "car", symbol: "bicycle"),
            WordCard(word: "airplane", foil: "bicycle", symbol: "airplane"),
        ]),
        Journey(id: .colours, intro: "Look at the colours.", words: [
            WordCard(word: "red", foil: "blue", symbol: "circle.fill"),
            WordCard(word: "blue", foil: "yellow", symbol: "circle.fill"),
            WordCard(word: "yellow", foil: "green", symbol: "circle.fill"),
            WordCard(word: "green", foil: "red", symbol: "circle.fill"),
        ]),
        Journey(id: .food, intro: "Let’s look at food.", words: [
            WordCard(word: "apple", foil: "banana", symbol: "apple.logo"),
            WordCard(word: "banana", foil: "bread", symbol: "leaf.fill"),
            WordCard(word: "bread", foil: "egg", symbol: "takeoutbag.and.cup.and.straw.fill"),
            WordCard(word: "egg", foil: "apple", symbol: "circle.fill"),
        ]),
        Journey(id: .animals, intro: "Say hello to the animals.", words: [
            WordCard(word: "cat", foil: "dog", symbol: "cat.fill"),
            WordCard(word: "dog", foil: "elephant", symbol: "dog.fill"),
            WordCard(word: "elephant", foil: "fish", symbol: "pawprint.fill"),
            WordCard(word: "fish", foil: "cat", symbol: "fish.fill"),
        ]),
    ]

    static func find(_ id: JourneyID) -> Journey { all.first { $0.id == id }! }
}

struct ProgressSnapshot: Codable, Equatable {
    var completed: Set<JourneyID> = []
    static let empty = ProgressSnapshot()
    var suggestedNext: JourneyID? { JourneyID.allCases.first { !completed.contains($0) } }
    func isAvailable(_ id: JourneyID) -> Bool { JourneyID.allCases.contains(id) }
    mutating func complete(_ id: JourneyID) { completed.insert(id) }
    mutating func reset(confirmed: Bool) { if confirmed { completed.removeAll() } }
}

enum LessonPhase: Equatable { case explore, learn, quiz, recap }

struct LessonState: Equatable {
    let journey: JourneyID
    var wordIndex = 0
    var phase: LessonPhase = .explore
    var answerWasCorrect: Bool?
    var currentWord: WordCard { Journey.find(journey).words[wordIndex] }

    mutating func next() {
        switch phase {
        case .explore: phase = .learn
        case .learn: phase = .quiz; answerWasCorrect = nil
        case .quiz where answerWasCorrect == true:
            if wordIndex == Journey.find(journey).words.count - 1 { phase = .recap; answerWasCorrect = nil }
            else { wordIndex += 1; phase = .learn; answerWasCorrect = nil }
        default: break
        }
    }

    mutating func answer(isCorrect: Bool) {
        guard phase == .quiz, answerWasCorrect != true else { return }
        answerWasCorrect = isCorrect
    }
}
