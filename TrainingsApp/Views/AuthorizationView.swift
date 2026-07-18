import SwiftUI

/// Onboarding-/Berechtigungs-Screen. Erklärt, warum die App Zugriff auf
/// die Apple-Fitness-/Health-Daten braucht, und startet den HealthKit-Dialog.
struct AuthorizationView: View {
    @EnvironmentObject private var healthKit: HealthKitManager
    @State private var isRequesting = false

    var body: some View {
        VStack(spacing: 28) {
            Spacer()

            Image(systemName: "figure.run.circle.fill")
                .font(.system(size: 88))
                .foregroundStyle(.tint)
                .symbolRenderingMode(.hierarchical)

            VStack(spacing: 12) {
                Text("Trainings App")
                    .font(.largeTitle.bold())

                Text("Verbinde deine Apple-Fitness-Daten, um Trainings, aktive Kalorien, Schritte und Herzfrequenz an einem Ort zu sehen.")
                    .font(.body)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 24)
            }

            VStack(alignment: .leading, spacing: 16) {
                PermissionRow(symbol: "figure.strengthtraining.traditional",
                              text: "Trainings & Workouts")
                PermissionRow(symbol: "flame.fill",
                              text: "Aktive Kalorien")
                PermissionRow(symbol: "shoeprints.fill",
                              text: "Schritte")
                PermissionRow(symbol: "heart.fill",
                              text: "Herzfrequenz")
            }
            .padding(.horizontal, 40)

            Spacer()

            Button {
                Task {
                    isRequesting = true
                    await healthKit.requestAuthorization()
                    isRequesting = false
                }
            } label: {
                HStack {
                    if isRequesting {
                        ProgressView()
                            .tint(.white)
                    }
                    Text("Mit Apple Health verbinden")
                        .font(.headline)
                }
                .frame(maxWidth: .infinity)
                .padding()
            }
            .buttonStyle(.borderedProminent)
            .padding(.horizontal, 24)
            .disabled(isRequesting)

            if let errorMessage = healthKit.errorMessage {
                Text(errorMessage)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }

            Text("Deine Daten bleiben auf dem Gerät. Die App liest nur und speichert nichts extern.")
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .padding(.bottom, 8)
        }
    }
}

private struct PermissionRow: View {
    let symbol: String
    let text: String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: symbol)
                .font(.title3)
                .foregroundStyle(.tint)
                .frame(width: 28)
            Text(text)
                .font(.body)
            Spacer()
        }
    }
}

#Preview {
    AuthorizationView()
        .environmentObject(HealthKitManager())
}
