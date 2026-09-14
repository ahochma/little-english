package com.ahochma.littleenglish

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val progressStore = AndroidProgressStore(applicationContext)
        setContent {
            LittleEnglishApp(
                progressStore = progressStore,
                // Audio intentionally stays silent until approved, bundled recordings are added.
                onSpeak = {},
            )
        }
    }
}
