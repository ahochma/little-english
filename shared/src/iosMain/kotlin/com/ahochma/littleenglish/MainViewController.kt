package com.ahochma.littleenglish

import androidx.compose.ui.window.ComposeUIViewController
import platform.UIKit.UIViewController
import platform.Foundation.NSUserDefaults

private class IosProgressStore : ProgressStore {
    private val defaults = NSUserDefaults.standardUserDefaults
    private val key = "little_english_completed_journeys"

    override fun load(): JourneyProgress {
        val raw = defaults.stringForKey(key) ?: return JourneyProgress.empty()
        val completed = raw.split(',')
            .mapNotNull { value -> JourneyId.entries.firstOrNull { it.name == value } }
            .toSet()
        return JourneyProgress(completed)
    }

    override fun save(progress: JourneyProgress) {
        defaults.setObject(progress.completed.joinToString(",") { it.name }, forKey = key)
    }
}

fun MainViewController(): UIViewController = ComposeUIViewController {
    LittleEnglishApp(
        progressStore = IosProgressStore(),
        // Audio stays silent until approved bundled assets exist.
        onSpeak = {},
    )
}
