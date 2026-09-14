package com.ahochma.littleenglish

interface ProgressStore {
    fun load(): JourneyProgress
    fun save(progress: JourneyProgress)
}

class InMemoryProgressStore(initial: JourneyProgress = JourneyProgress.empty()) : ProgressStore {
    private var value = initial
    override fun load(): JourneyProgress = value
    override fun save(progress: JourneyProgress) {
        value = progress
    }
}
