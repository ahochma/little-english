package com.ahochma.littleenglish

enum class JourneyId(val hebrewTitle: String, val englishTitle: String, val sticker: String) {
    FireTrucks("כבאיות", "Fire trucks", "🚒"),
    Vehicles("כלי תחבורה", "Vehicles", "🚌"),
    Colours("צבעים", "Colours", "🎨"),
    Food("אוכל", "Food", "🍎"),
    Animals("חיות", "Animals", "🐘"),
}

data class WordCard(
    val word: String,
    val foil: String,
    val emoji: String,
)

data class Journey(
    val id: JourneyId,
    val intro: String,
    val words: List<WordCard>,
)

object JourneyCatalog {
    val all: List<Journey> = listOf(
        Journey(JourneyId.FireTrucks, "Meet the fire truck.", listOf(
            WordCard("fire truck", "bus", "🚒"), WordCard("red", "blue", "🔴"),
            WordCard("ladder", "wheel", "🪜"), WordCard("wheel", "ladder", "⚙️"),
        )),
        Journey(JourneyId.Vehicles, "Let’s go! Meet the vehicles.", listOf(
            WordCard("car", "bus", "🚗"), WordCard("bus", "airplane", "🚌"),
            WordCard("bicycle", "car", "🚲"), WordCard("airplane", "bicycle", "✈️"),
        )),
        Journey(JourneyId.Colours, "Look at the colours.", listOf(
            WordCard("red", "blue", "🔴"), WordCard("blue", "yellow", "🔵"),
            WordCard("yellow", "green", "🟡"), WordCard("green", "red", "🟢"),
        )),
        Journey(JourneyId.Food, "Let’s look at food.", listOf(
            WordCard("apple", "banana", "🍎"), WordCard("banana", "bread", "🍌"),
            WordCard("bread", "egg", "🍞"), WordCard("egg", "apple", "🥚"),
        )),
        Journey(JourneyId.Animals, "Say hello to the animals.", listOf(
            WordCard("cat", "dog", "🐱"), WordCard("dog", "elephant", "🐶"),
            WordCard("elephant", "fish", "🐘"), WordCard("fish", "cat", "🐟"),
        )),
    )

    fun journey(id: JourneyId): Journey = all.first { it.id == id }
}

data class JourneyProgress(val completed: Set<JourneyId>) {
    fun complete(id: JourneyId): JourneyProgress = copy(completed = completed + id)
    fun isAvailable(id: JourneyId): Boolean = id in JourneyId.entries
    fun suggestedNext(): JourneyId? = JourneyId.entries.firstOrNull { it !in completed }
    fun reset(confirmed: Boolean): JourneyProgress = if (confirmed) empty() else this

    companion object {
        fun empty() = JourneyProgress(emptySet())
    }
}

enum class LessonStep { Explore, Learn, Quiz, Recap }

data class LessonState(
    val journeyId: JourneyId,
    val wordIndex: Int = 0,
    val step: LessonStep = LessonStep.Explore,
    val answerWasCorrect: Boolean? = null,
) {
    val currentWord: WordCard get() = JourneyCatalog.journey(journeyId).words[wordIndex]
}

class LessonSession(journeyId: JourneyId) {
    var state: LessonState = LessonState(journeyId)
        private set

    fun next() {
        state = when (state.step) {
            LessonStep.Explore -> state.copy(step = LessonStep.Learn)
            LessonStep.Learn -> state.copy(step = LessonStep.Quiz, answerWasCorrect = null)
            LessonStep.Quiz -> if (state.answerWasCorrect == true) advanceAfterCorrect() else state
            LessonStep.Recap -> state
        }
    }

    fun answer(isCorrect: Boolean) {
        if (state.step == LessonStep.Quiz && state.answerWasCorrect != true) {
            state = state.copy(answerWasCorrect = isCorrect)
        }
    }

    private fun advanceAfterCorrect(): LessonState =
        if (state.wordIndex == JourneyCatalog.journey(state.journeyId).words.lastIndex) {
            state.copy(step = LessonStep.Recap, answerWasCorrect = null)
        } else {
            state.copy(wordIndex = state.wordIndex + 1, step = LessonStep.Learn, answerWasCorrect = null)
        }
}
