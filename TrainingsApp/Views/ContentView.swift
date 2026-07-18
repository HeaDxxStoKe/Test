import SwiftUI

/// Einstiegs-View: entscheidet zwischen Autorisierungs-Screen und Dashboard.
struct ContentView: View {
    @EnvironmentObject private var healthKit: HealthKitManager

    var body: some View {
        Group {
            switch healthKit.authorizationState {
            case .unknown, .notRequested, .denied:
                AuthorizationView()
            case .unavailable:
                UnavailableView()
            case .requested:
                DashboardView()
            }
        }
        .onAppear {
            healthKit.refreshAvailability()
        }
    }
}

/// Wird angezeigt, wenn HealthKit auf dem Gerät nicht verfügbar ist
/// (z. B. iPad oder bestimmte Simulatoren).
struct UnavailableView: View {
    var body: some View {
        ContentUnavailableViewCompat(
            title: "HealthKit nicht verfügbar",
            systemImage: "heart.slash",
            description: "Auf diesem Gerät stehen keine Health-/Fitness-Daten zur Verfügung. Bitte auf einem iPhone mit der Health-App testen."
        )
    }
}

#Preview {
    ContentView()
        .environmentObject(HealthKitManager())
}
