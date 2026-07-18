import SwiftUI

@main
struct TrainingsAppApp: App {
    // Zentraler HealthKit-Manager, der an alle Views weitergereicht wird.
    @StateObject private var healthKitManager = HealthKitManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(healthKitManager)
        }
    }
}
