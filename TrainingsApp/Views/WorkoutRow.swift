import SwiftUI

/// Zeile in der Trainings-Liste.
struct WorkoutRow: View {
    let workout: Workout

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: workout.symbolName)
                .font(.title2)
                .foregroundStyle(.tint)
                .frame(width: 44, height: 44)
                .background(.tint.opacity(0.12), in: Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(workout.activityName)
                    .font(.headline)
                Text(workout.startDate.formatted(date: .abbreviated, time: .shortened))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(workout.formattedDuration)
                    .font(.subheadline.weight(.medium))
                if let energy = workout.formattedEnergy {
                    Text(energy)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
    }
}

#Preview {
    // Preview ohne echte HealthKit-Daten ist hier nicht möglich,
    // da `Workout` aus einem `HKWorkout` erzeugt wird.
    Text("WorkoutRow – im Simulator/Gerät mit echten Daten testen")
        .padding()
}
