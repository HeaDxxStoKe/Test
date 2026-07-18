import SwiftUI

/// Haupt-Dashboard nach der Autorisierung: Tages-Kennzahlen oben,
/// Liste der letzten Trainings darunter.
struct DashboardView: View {
    @EnvironmentObject private var healthKit: HealthKitManager

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("Heute")
                        .font(.title2.bold())
                        .padding(.horizontal)

                    LazyVGrid(columns: columns, spacing: 12) {
                        StatCard(
                            title: "Schritte",
                            value: stepsText,
                            symbol: "shoeprints.fill",
                            tint: .green
                        )
                        StatCard(
                            title: "Aktive Kalorien",
                            value: energyText,
                            symbol: "flame.fill",
                            tint: .orange
                        )
                        StatCard(
                            title: "Ruhe-Puls",
                            value: heartRateText,
                            symbol: "heart.fill",
                            tint: .red
                        )
                        StatCard(
                            title: "Trainings (90 T.)",
                            value: "\(healthKit.workouts.count)",
                            symbol: "figure.run",
                            tint: .blue
                        )
                    }
                    .padding(.horizontal)

                    HStack {
                        Text("Letzte Trainings")
                            .font(.title2.bold())
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    if healthKit.workouts.isEmpty {
                        emptyWorkoutsView
                    } else {
                        LazyVStack(spacing: 10) {
                            ForEach(healthKit.workouts) { workout in
                                NavigationLink(value: workout) {
                                    WorkoutRow(workout: workout)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Trainings App")
            .navigationDestination(for: Workout.self) { workout in
                WorkoutDetailView(workout: workout)
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await healthKit.loadAll() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(healthKit.isLoading)
                }
            }
            .refreshable {
                await healthKit.loadAll()
            }
            .overlay {
                if healthKit.isLoading && healthKit.workouts.isEmpty {
                    ProgressView("Lade Fitness-Daten…")
                }
            }
        }
        .task {
            if healthKit.workouts.isEmpty {
                await healthKit.loadAll()
            }
        }
    }

    // MARK: - Formatierte Werte

    private var stepsText: String {
        NumberFormatter.localizedString(from: NSNumber(value: Int(healthKit.todaySteps)), number: .decimal)
    }

    private var energyText: String {
        "\(Int(healthKit.todayActiveEnergy.rounded())) kcal"
    }

    private var heartRateText: String {
        if let hr = healthKit.latestRestingHeartRate {
            return "\(Int(hr.rounded())) bpm"
        }
        return "–"
    }

    private var emptyWorkoutsView: some View {
        VStack(spacing: 8) {
            Image(systemName: "figure.run.circle")
                .font(.system(size: 44))
                .foregroundStyle(.secondary)
            Text("Keine Trainings gefunden")
                .font(.headline)
            Text("Zeichne ein Training mit der Apple-Fitness-App oder Apple Watch auf – es erscheint dann hier.")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .padding(.horizontal)
    }
}

/// Kompakte Kennzahlen-Kachel.
struct StatCard: View {
    let title: String
    let value: String
    let symbol: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: symbol)
                    .foregroundStyle(tint)
                Spacer()
            }
            Text(value)
                .font(.title2.bold())
                .minimumScaleFactor(0.6)
                .lineLimit(1)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    DashboardView()
        .environmentObject(HealthKitManager())
}
