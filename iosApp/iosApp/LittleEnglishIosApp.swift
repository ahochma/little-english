import SwiftUI
import LittleEnglishShared

struct ComposeAppView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        MainViewControllerKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

@main
struct LittleEnglishIosApp: App {
    var body: some Scene {
        WindowGroup {
            ComposeAppView()
                .ignoresSafeArea()
        }
    }
}
