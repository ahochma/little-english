package com.ahochma.littleenglish

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Cream = Color(0xFFFFF7EA)
private val Ink = Color(0xFF294541)
private val Brick = Color(0xFFAC382D)
private val Sage = Color(0xFFE3EAD9)
private val Gold = Color(0xFFF3D58D)

@Composable
fun LittleEnglishApp(
    progressStore: ProgressStore = remember { InMemoryProgressStore() },
    onSpeak: (String) -> Unit = {},
) {
    var progress by remember { mutableStateOf(progressStore.load()) }
    var activeJourney by remember { mutableStateOf<JourneyId?>(null) }
    var session by remember { mutableStateOf<LessonSession?>(null) }
    var sessionRevision by remember { mutableStateOf(0) }
    var showParentReset by remember { mutableStateOf(false) }

    fun save(updated: JourneyProgress) {
        progressStore.save(updated)
        progress = updated
    }

    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = Cream, contentColor = Ink) {
            if (activeJourney == null || session == null) {
                JourneyMap(
                    progress = progress,
                    onSelect = { id ->
                        activeJourney = id
                        session = LessonSession(id)
                    },
                    onParentReset = { showParentReset = true },
                )
            } else {
                sessionRevision
                LessonScreen(
                    session = session!!,
                    onBackToMap = {
                        activeJourney = null
                        session = null
                    },
                    onSessionChanged = { sessionRevision += 1 },
                    onRestart = { session = LessonSession(activeJourney!!) },
                    onComplete = { id -> save(progress.complete(id)) },
                    onSpeak = onSpeak,
                )
            }
            if (showParentReset) {
                ParentResetDialog(
                    onCancel = { showParentReset = false },
                    onConfirm = {
                        save(progress.reset(confirmed = true))
                        showParentReset = false
                    },
                )
            }
        }
    }
}

@Composable
private fun JourneyMap(
    progress: JourneyProgress,
    onSelect: (JourneyId) -> Unit,
    onParentReset: () -> Unit,
) {
    Column(modifier = Modifier.fillMaxSize().padding(20.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text("little English", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Brick)
            Spacer(Modifier.weight(1f))
            Text("מדבקות: ${progress.completed.size}", color = Ink, fontSize = 16.sp)
        }
        Spacer(Modifier.height(26.dp))
        Text("A world to say hello to", fontSize = 34.sp, lineHeight = 39.sp, fontWeight = FontWeight.Bold)
        Text("חמש תחנות קטנות. בוחרים תמונה, מקשיבים ומשחקים יחד.", modifier = Modifier.padding(top = 8.dp), color = Ink)
        Spacer(Modifier.height(20.dp))
        JourneyCatalog.all.forEach { journey ->
            val done = journey.id in progress.completed
            JourneyTile(journey, done, onClick = { onSelect(journey.id) })
            Spacer(Modifier.height(12.dp))
        }
        Spacer(Modifier.weight(1f))
        OutlinedButton(onClick = onParentReset, modifier = Modifier.fillMaxWidth()) {
            Text("הגדרות להורים")
        }
        Text("בלי ציונים, בלי לחץ · אפשר לעצור מתי שרוצים", modifier = Modifier.fillMaxWidth().padding(top = 12.dp), textAlign = TextAlign.Center, color = Ink)
    }
}

@Composable
private fun JourneyTile(journey: Journey, isComplete: Boolean, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = if (isComplete) Sage else Color.White),
        shape = RoundedCornerShape(22.dp),
    ) {
        Row(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(journey.id.sticker, fontSize = 48.sp)
            Spacer(Modifier.width(16.dp))
            Column(Modifier.weight(1f)) {
                Text(journey.id.englishTitle, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text(journey.id.hebrewTitle, color = Ink)
            }
            if (isComplete) Text("✓", fontSize = 30.sp, color = Brick, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun LessonScreen(
    session: LessonSession,
    onBackToMap: () -> Unit,
    onSessionChanged: () -> Unit,
    onRestart: () -> Unit,
    onComplete: (JourneyId) -> Unit,
    onSpeak: (String) -> Unit,
) {
    val state = session.state
    val word = state.currentWord
    fun update(action: () -> Unit) {
        action()
        onSessionChanged()
    }
    Column(modifier = Modifier.fillMaxSize().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            OutlinedButton(onClick = onBackToMap) { Text("Map") }
            Spacer(Modifier.weight(1f))
            Text("${session.state.journeyId.englishTitle} · ${state.wordIndex + 1}/4", color = Ink)
            Spacer(Modifier.width(8.dp))
            OutlinedButton(onClick = onBackToMap) { Text("Stop") }
        }
        Spacer(Modifier.height(26.dp))
        when (state.step) {
            LessonStep.Explore -> {
                Text("Explore together", fontSize = 32.sp, fontWeight = FontWeight.Bold)
                Text("נוגעים בתמונה ומקשיבים", color = Ink)
                Spacer(Modifier.height(22.dp))
                JourneyCatalog.journey(state.journeyId).words.forEach { card ->
                    Card(Modifier.fillMaxWidth().padding(vertical = 5.dp).clickable { onSpeak(card.word) }, colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(card.emoji, fontSize = 42.sp); Spacer(Modifier.width(14.dp)); Text(card.word, fontSize = 22.sp)
                        }
                    }
                }
                Spacer(Modifier.weight(1f))
                PrimaryButton("Start") { update { session.next() } }
            }
            LessonStep.Learn -> {
                Text("Listen & look", fontSize = 32.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(26.dp))
                WordPicture(word, onClick = { onSpeak(word.word) })
                Text(word.word, fontSize = 32.sp, fontWeight = FontWeight.Bold)
                Text("Tap the picture to hear it", color = Ink)
                Spacer(Modifier.weight(1f))
                PrimaryButton("I’m ready") { update { session.next() } }
            }
            LessonStep.Quiz -> {
                Text("Can you find it?", fontSize = 32.sp, fontWeight = FontWeight.Bold)
                Text("Find the ${word.word}", fontSize = 22.sp)
                Spacer(Modifier.height(16.dp))
                if (state.answerWasCorrect == false) Text("Let’s try again", color = Brick, fontWeight = FontWeight.Bold)
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    Choice(word, true) { update { session.answer(true) } }
                    Choice(WordCard(word.foil, word.word, foilEmoji(word.foil)), false) { update { session.answer(false) } }
                }
                Spacer(Modifier.weight(1f))
                if (state.answerWasCorrect == true) PrimaryButton("Next") { update { session.next() } }
                else OutlinedButton(onClick = { onSpeak(word.word) }, modifier = Modifier.fillMaxWidth()) { Text("Hear it again") }
            }
            LessonStep.Recap -> {
                Text("A little journey, complete", fontSize = 30.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                Spacer(Modifier.height(14.dp))
                Text(session.state.journeyId.sticker, fontSize = 96.sp)
                Text("מדבקה אחת, מזכרת מהפעילות", color = Ink)
                Spacer(Modifier.height(18.dp))
                PrimaryButton("Collect sticker") {
                    onComplete(session.state.journeyId)
                    onBackToMap()
                }
                OutlinedButton(onClick = onRestart, modifier = Modifier.fillMaxWidth().padding(top = 10.dp)) { Text("Play again") }
            }
        }
    }
}

@Composable
private fun RowScope.Choice(card: WordCard, correct: Boolean, onClick: () -> Unit) {
    Card(modifier = Modifier.weight(1f).clickable(onClick = onClick), colors = CardDefaults.cardColors(containerColor = Color.White)) {
        Column(Modifier.fillMaxWidth().padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(card.emoji, fontSize = 80.sp)
            Text(card.word, fontSize = 16.sp)
        }
    }
}

@Composable
private fun WordPicture(card: WordCard, onClick: () -> Unit) {
    Card(modifier = Modifier.size(210.dp).clickable(onClick = onClick), colors = CardDefaults.cardColors(containerColor = Sage)) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(card.emoji, fontSize = 120.sp) }
    }
}

@Composable
private fun PrimaryButton(label: String, onClick: () -> Unit) {
    Button(onClick = onClick, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Brick)) {
        Text(label, fontSize = 18.sp)
    }
}

@Composable
private fun ParentResetDialog(onCancel: () -> Unit, onConfirm: () -> Unit) {
    Surface(modifier = Modifier.fillMaxSize().background(Color(0x99000000))) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Card(modifier = Modifier.padding(28.dp), colors = CardDefaults.cardColors(containerColor = Cream)) {
                Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("להורים בלבד", fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    Text("איפוס מוחק רק את המדבקות שנשמרו במכשיר הזה.", textAlign = TextAlign.Center, modifier = Modifier.padding(vertical = 12.dp))
                    Button(onClick = onConfirm, colors = ButtonDefaults.buttonColors(containerColor = Brick)) { Text("אפסו מדבקות") }
                    OutlinedButton(onClick = onCancel, modifier = Modifier.padding(top = 8.dp)) { Text("ביטול") }
                }
            }
        }
    }
}

private fun foilEmoji(word: String): String = when (word) {
    "bus" -> "🚌"; "blue" -> "🔵"; "wheel" -> "⚙️"; "ladder" -> "🪜"; "airplane" -> "✈️"; "car" -> "🚗"; "bicycle" -> "🚲"
    "yellow" -> "🟡"; "green" -> "🟢"; "banana" -> "🍌"; "bread" -> "🍞"; "egg" -> "🥚"; "apple" -> "🍎"
    "dog" -> "🐶"; "elephant" -> "🐘"; "fish" -> "🐟"; "cat" -> "🐱"; else -> "⭐"
}
