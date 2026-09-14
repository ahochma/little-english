package com.ahochma.littleenglish

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class JourneyProgressTest {
    @Test
    fun `finishing a journey awards exactly one sticker and keeps it on replay`() {
        val progress = JourneyProgress.empty()

        val firstCompletion = progress.complete(JourneyId.FireTrucks)
        val replayCompletion = firstCompletion.complete(JourneyId.FireTrucks)

        assertEquals(setOf(JourneyId.FireTrucks), firstCompletion.completed)
        assertEquals(firstCompletion, replayCompletion)
        assertEquals(JourneyId.Vehicles, replayCompletion.suggestedNext())
    }

    @Test
    fun `all journeys are available before any journey is completed`() {
        assertEquals(JourneyId.entries.toSet(), JourneyCatalog.all.map { it.id }.toSet())
        assertTrue(JourneyProgress.empty().isAvailable(JourneyId.Animals))
    }

    @Test
    fun `reset is deliberate and clears local completion only after confirmation`() {
        val completed = JourneyProgress.empty().complete(JourneyId.Food)

        assertEquals(completed, completed.reset(confirmed = false))
        assertTrue(completed.reset(confirmed = true).completed.isEmpty())
        assertFalse(completed.completed.isEmpty())
    }
}
