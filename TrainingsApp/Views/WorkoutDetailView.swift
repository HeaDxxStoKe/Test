import SwiftUI

/// Detailansicht eines einzelnen Trainings.
struct WorkoutDetailView: View {
    let workout: Workout

    var body: some View {
        List {
            Section {
                HStack {
                    Image(systemName: workout.symbolName)
                        .font(.system(size: 40))
                        .foregroundStyle(.tint)
                        .frame(width: 64, height: 64)
                        .background(.tint.opacity(0.12), in: Circle())
                    VStack(alignment: .leading, spacing: 4) {
                        Text(workout.activityName)
                            .font(.title2.bold())
                        Text(workout.startDate.formatted(date: .complete, time: .shortened))
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 8)
            }

            Section("Details") {
                DetailRow(label: "Dauer", value: workout.formattedDuration)
                if let distance = workout.formattedDistance {
                    DetailRow(label: "Distanz", value: distance)
                }
                if let energy = workout.formattedEnergy {
                    DetailRow(label: "Aktive Kalorien", value: energy)
                }
                DetailRow(label: "Start", value: workout.startDate.formatted(date: .omitted, time: .shortened))
                DetailRow(label: "Ende", value: workout.endDate.formatted(date: .omitted, time: .shortened))
            }
        }
        .navigationTitle(workout.activityName)
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}
