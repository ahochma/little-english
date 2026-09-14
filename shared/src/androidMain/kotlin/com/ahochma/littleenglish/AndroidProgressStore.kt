package com.ahochma.littleenglish

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

class AndroidProgressStore(context: Context) : ProgressStore {
    private val preferences = context.getSharedPreferences("little_english_progress", Context.MODE_PRIVATE)

    override fun load(): JourneyProgress = try {
        val raw = preferences.getString("completed_journeys", "[]") ?: "[]"
        val values = JSONArray(raw)
        val ids = buildSet {
            for (index in 0 until values.length()) {
                JourneyId.entries.firstOrNull { it.name == values.optString(index) }?.let(::add)
            }
        }
        JourneyProgress(ids)
    } catch (_: Exception) {
        JourneyProgress.empty()
    }

    override fun save(progress: JourneyProgress) {
        val values = JSONArray(progress.completed.map { it.name })
        preferences.edit().putString("completed_journeys", values.toString()).apply()
    }
}
