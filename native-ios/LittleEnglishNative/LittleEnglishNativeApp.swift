import SwiftUI

@main
struct LittleEnglishNativeApp: App {
    @StateObject private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(model)
        }
    }
}

struct ContentView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        ZStack {
            Color("Cream").ignoresSafeArea()
            if let lesson = model.lesson {
                LessonView(lesson: lesson)
            } else {
                JourneyMapView()
            }
        }
    }
}

struct JourneyMapView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                HStack {
                    Label("little English", systemImage: "heart.fill")
                        .font(.title3.bold()).foregroundStyle(Color("Brick"))
                    Spacer()
                    Text("מדבקות: \(model.progress.completed.count)")
                        .font(.subheadline.bold())
                }
                .padding(.bottom, 12)

                Text("A world to\nsay hello to.")
                    .font(.system(size: 42, weight: .bold, design: .rounded))
                    .foregroundStyle(Color("Ink"))
                Text("חמש תחנות קטנות. בוחרים תמונה, מקשיבים ומשחקים יחד.")
                    .font(.body).foregroundStyle(Color("Ink"))
                    .environment(\.layoutDirection, .rightToLeft)

                ForEach(Journey.all) { journey in
                    JourneyTile(journey: journey, complete: model.progress.completed.contains(journey.id)) {
                        model.start(journey.id)
                    }
                }

                Button("הגדרות להורים") { model.parentSettingsOpen = true }
                    .buttonStyle(.bordered).frame(maxWidth: .infinity).padding(.top, 8)
                Text("בלי ציונים, בלי לחץ · אפשר לעצור מתי שרוצים")
                    .font(.footnote).frame(maxWidth: .infinity).foregroundStyle(.secondary)
                    .environment(\.layoutDirection, .rightToLeft)
            }
            .padding(20)
        }
        .sheet(isPresented: $model.parentSettingsOpen) { ParentSettingsView() }
    }
}

struct JourneyTile: View {
    let journey: Journey
    let complete: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: journey.id.symbol).font(.system(size: 38)).frame(width: 56).foregroundStyle(Color("Brick"))
                VStack(alignment: .leading) {
                    Text(journey.id.englishTitle).font(.title3.bold())
                    Text(journey.id.hebrewTitle).font(.subheadline)
                }
                Spacer()
                if complete { Image(systemName: "checkmark.seal.fill").font(.title2).foregroundStyle(Color("Brick")) }
            }
            .padding(16).frame(maxWidth: .infinity).background(complete ? Color("Sage") : .white, in: RoundedRectangle(cornerRadius: 22))
        }
        .buttonStyle(.plain).accessibilityLabel("Open \(journey.id.englishTitle)")
    }
}

struct LessonView: View {
    @EnvironmentObject private var model: AppModel
    let lesson: LessonState

    var body: some View {
        VStack(spacing: 20) {
            HStack {
                Button("Map") { model.stop() }.buttonStyle(.bordered)
                Spacer()
                Text("\(lesson.journey.englishTitle) · \(lesson.wordIndex + 1)/4").font(.subheadline.bold())
                Spacer()
                Button("Stop") { model.stop() }.buttonStyle(.bordered)
            }
            .padding(.horizontal, 20).padding(.top, 12)

            switch lesson.phase {
            case .explore: ExploreView(lesson: lesson)
            case .learn: LearnView(lesson: lesson)
            case .quiz: QuizView(lesson: lesson)
            case .recap: RecapView(lesson: lesson)
            }
        }
    }
}

struct ExploreView: View {
    @EnvironmentObject private var model: AppModel
    let lesson: LessonState

    var body: some View {
        VStack(spacing: 14) {
            Text("Explore together").font(.largeTitle.bold())
            Text("נוגעים בתמונה ומקשיבים").foregroundStyle(.secondary).environment(\.layoutDirection, .rightToLeft)
            ForEach(Journey.find(lesson.journey).words) { word in
                WordRow(word: word)
            }
            Spacer()
            PrimaryButton(title: "Start") { advance() }.padding(.horizontal, 20)
        }
        .padding(.horizontal, 20)
    }

    private func advance() { var state = lesson; state.next(); model.lesson = state }
}

struct LearnView: View {
    @EnvironmentObject private var model: AppModel
    let lesson: LessonState

    var body: some View {
        VStack(spacing: 20) {
            Text("Listen & look").font(.largeTitle.bold())
            WordCardView(word: lesson.currentWord, large: true)
            Text(lesson.currentWord.word).font(.system(size: 34, weight: .bold, design: .rounded))
            Text("Tap the picture to hear it").foregroundStyle(.secondary)
            Spacer()
            PrimaryButton(title: "I’m ready") { var state = lesson; state.next(); model.lesson = state }.padding(.horizontal, 20)
        }
        .padding(.horizontal, 20)
    }
}

struct QuizView: View {
    @EnvironmentObject private var model: AppModel
    let lesson: LessonState

    var body: some View {
        VStack(spacing: 18) {
            Text("Can you find it?").font(.largeTitle.bold())
            Text("Find the \(lesson.currentWord.word)").font(.title3)
            if lesson.answerWasCorrect == false { Text("Let’s try again").foregroundStyle(Color("Brick")).bold() }
            HStack(spacing: 16) {
                QuizChoice(word: lesson.currentWord) { answer(true) }
                QuizChoice(word: WordCard(word: lesson.currentWord.foil, foil: lesson.currentWord.word, symbol: foilSymbol(lesson.currentWord.foil))) { answer(false) }
            }
            Spacer()
            if lesson.answerWasCorrect == true {
                PrimaryButton(title: "Next") { var state = lesson; state.next(); model.lesson = state }.padding(.horizontal, 20)
            } else {
                Button("Hear it again") {}.buttonStyle(.bordered).padding(.bottom, 20)
            }
        }
        .padding(.horizontal, 20)
    }

    private func answer(_ correct: Bool) { var state = lesson; state.answer(isCorrect: correct); model.lesson = state }
}

struct RecapView: View {
    @EnvironmentObject private var model: AppModel
    let lesson: LessonState

    var body: some View {
        VStack(spacing: 18) {
            Text("A little journey, complete").font(.system(size: 30, weight: .bold, design: .rounded)).multilineTextAlignment(.center)
            Image(systemName: "seal.fill").font(.system(size: 100)).foregroundStyle(Color("Gold"))
            Text("מדבקה אחת, מזכרת מהפעילות").environment(\.layoutDirection, .rightToLeft)
            Spacer()
            PrimaryButton(title: "Collect sticker") { model.completeCurrentJourney(); model.stop() }.padding(.horizontal, 20)
            Button("Play again") { model.lesson = LessonState(journey: lesson.journey) }.buttonStyle(.bordered)
        }
        .padding(20)
    }
}

struct WordRow: View {
    let word: WordCard
    var body: some View { WordCardView(word: word, large: false) }
}

struct WordCardView: View {
    let word: WordCard
    let large: Bool
    var body: some View {
        Group {
            if large {
                VStack(spacing: 12) { Image(systemName: word.symbol).font(.system(size: 100)).frame(width: 220, height: 220).background(Color("Sage"), in: RoundedRectangle(cornerRadius: 32)) }
            } else {
                HStack { Image(systemName: word.symbol).font(.title).frame(width: 44); Text(word.word).font(.title3.bold()); Spacer() }
                    .padding(14).background(.white, in: RoundedRectangle(cornerRadius: 18))
            }
        }
        .accessibilityLabel("Hear \(word.word)")
    }
}

struct QuizChoice: View {
    let word: WordCard
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) { Image(systemName: word.symbol).font(.system(size: 76)); Text(word.word).font(.headline) }
                .frame(maxWidth: .infinity, minHeight: 180).background(.white, in: RoundedRectangle(cornerRadius: 24))
        }.buttonStyle(.plain).accessibilityLabel("Choose \(word.word)")
    }
}

struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    var body: some View { Button(title, action: action).buttonStyle(.borderedProminent).tint(Color("Brick")).controlSize(.large).frame(maxWidth: .infinity) }
}

struct ParentSettingsView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.dismiss) private var dismiss
    @State private var showConfirmation = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Text("להורים בלבד").font(.title.bold()).environment(\.layoutDirection, .rightToLeft)
                Text("איפוס מוחק רק את המדבקות שנשמרו במכשיר הזה.").multilineTextAlignment(.center).environment(\.layoutDirection, .rightToLeft)
                Button("אפסו מדבקות") { showConfirmation = true }.buttonStyle(.borderedProminent).tint(Color("Brick"))
                Spacer()
            }.padding().navigationTitle("הגדרות")
                .confirmationDialog("לאפס את המדבקות?", isPresented: $showConfirmation, titleVisibility: .visible) {
                    Button("אפסו מדבקות", role: .destructive) { model.resetProgress(); dismiss() }
                    Button("ביטול", role: .cancel) {}
                }
        }
    }
}

private func foilSymbol(_ word: String) -> String {
    switch word {
    case "bus": "bus.fill"; case "blue", "yellow", "green", "red": "circle.fill"; case "wheel": "circle.dashed"; case "ladder": "ladder"; case "airplane": "airplane"; case "car": "car.fill"; case "bicycle": "bicycle"; case "banana": "leaf.fill"; case "bread": "takeoutbag.and.cup.and.straw.fill"; case "egg": "circle.fill"; case "apple": "apple.logo"; case "dog": "dog.fill"; case "elephant", "cat": "pawprint.fill"; case "fish": "fish.fill"; default: "star.fill"
    }
}
