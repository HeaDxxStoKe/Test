import Foundation
import HealthKit

/// App-eigenes, UI-freundliches Modell für ein Training.
/// Wird aus einem `HKWorkout` erzeugt, damit die Views nicht direkt
/// mit HealthKit-Typen arbeiten müssen.
struct Workout: Identifiable, Hashable {
    let id: UUID
    let activityType: HKWorkoutActivityType
    let startDate: Date
    let endDate: Date
    let duration: TimeInterval
    /// Aktive Energie in Kilokalorien (kann fehlen, daher optional).
    let activeEnergyKilocalories: Double?
    /// Distanz in Metern (nur bei Distanz-Sportarten vorhanden).
    let distanceMeters: Double?

    init(hkWorkout: HKWorkout) {
        self.id = hkWorkout.uuid
        self.activityType = hkWorkout.workoutActivityType
        self.startDate = hkWorkout.startDate
        self.endDate = hkWorkout.endDate
        self.duration = hkWorkout.duration

        if let energy = hkWorkout.totalEnergyBurned {
            self.activeEnergyKilocalories = energy.doubleValue(for: .kilocalorie())
        } else {
            self.activeEnergyKilocalories = nil
        }

        if let distance = hkWorkout.totalDistance {
            self.distanceMeters = distance.doubleValue(for: .meter())
        } else {
            self.distanceMeters = nil
        }
    }
}

extension Workout {
    /// Menschenlesbarer Name der Sportart.
    var activityName: String {
        activityType.displayName
    }

    /// SF-Symbol passend zur Sportart.
    var symbolName: String {
        activityType.symbolName
    }

    var formattedDuration: String {
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.hour, .minute]
        formatter.unitsStyle = .abbreviated
        return formatter.string(from: duration) ?? "–"
    }

    var formattedDistance: String? {
        guard let distanceMeters else { return nil }
        let measurement = Measurement(value: distanceMeters, unit: UnitLength.meters)
        let formatter = MeasurementFormatter()
        formatter.unitOptions = .naturalScale
        formatter.numberFormatter.maximumFractionDigits = 2
        return formatter.string(from: measurement)
    }

    var formattedEnergy: String? {
        guard let activeEnergyKilocalories else { return nil }
        return "\(Int(activeEnergyKilocalories.rounded())) kcal"
    }
}
