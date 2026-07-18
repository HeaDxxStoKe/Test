import HealthKit

/// Kleine Hilfs-Erweiterung, um HealthKit-Sportarten in der UI
/// mit Namen und passenden SF-Symbolen darzustellen.
extension HKWorkoutActivityType {
    var displayName: String {
        switch self {
        case .running:            return "Laufen"
        case .walking:            return "Gehen"
        case .cycling:            return "Radfahren"
        case .swimming:           return "Schwimmen"
        case .hiking:             return "Wandern"
        case .yoga:               return "Yoga"
        case .functionalStrengthTraining,
             .traditionalStrengthTraining:
                                  return "Krafttraining"
        case .highIntensityIntervalTraining:
                                  return "HIIT"
        case .rowing:             return "Rudern"
        case .elliptical:         return "Crosstrainer"
        case .coreTraining:       return "Core-Training"
        case .dance:              return "Tanzen"
        case .pilates:            return "Pilates"
        default:                  return "Training"
        }
    }

    var symbolName: String {
        switch self {
        case .running:            return "figure.run"
        case .walking:            return "figure.walk"
        case .cycling:            return "figure.outdoor.cycle"
        case .swimming:           return "figure.pool.swim"
        case .hiking:             return "figure.hiking"
        case .yoga:               return "figure.yoga"
        case .functionalStrengthTraining,
             .traditionalStrengthTraining:
                                  return "figure.strengthtraining.traditional"
        case .highIntensityIntervalTraining:
                                  return "figure.highintensity.intervaltraining"
        case .rowing:             return "figure.rower"
        case .elliptical:         return "figure.elliptical"
        case .coreTraining:       return "figure.core.training"
        case .dance:              return "figure.dance"
        case .pilates:            return "figure.pilates"
        default:                  return "figure.mixed.cardio"
        }
    }
}
