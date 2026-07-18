import Foundation
import HealthKit

/// Zentrale Schnittstelle zu Apple HealthKit (Datenquelle der Apple-Fitness-App).
///
/// Zuständig für:
///  - Autorisierung (Nutzer:in erlaubt Lesezugriff auf Trainings & Fitness-Daten)
///  - Abruf der Workouts
///  - Abruf der Tages-Kennzahlen (Schritte, aktive Energie, Ø Herzfrequenz)
///
/// Alle veröffentlichten Properties werden auf dem Main-Actor aktualisiert,
/// damit SwiftUI sicher davon lesen kann.
@MainActor
final class HealthKitManager: ObservableObject {

    enum AuthorizationState: Equatable {
        case unknown
        case unavailable          // z. B. auf iPad/Simulator ohne HealthKit
        case notRequested
        case requested            // Dialog wurde angezeigt (Status bleibt aus Datenschutzgründen opak)
        case denied
    }

    @Published private(set) var authorizationState: AuthorizationState = .unknown
    @Published private(set) var workouts: [Workout] = []
    @Published private(set) var todaySteps: Double = 0
    @Published private(set) var todayActiveEnergy: Double = 0      // kcal
    @Published private(set) var latestRestingHeartRate: Double?     // bpm
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?

    private let healthStore = HKHealthStore()

    // MARK: - Zu lesende Datentypen

    private var readTypes: Set<HKObjectType> {
        var types: Set<HKObjectType> = [HKObjectType.workoutType()]
        if let steps = HKObjectType.quantityType(forIdentifier: .stepCount) {
            types.insert(steps)
        }
        if let energy = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned) {
            types.insert(energy)
        }
        if let heartRate = HKObjectType.quantityType(forIdentifier: .heartRate) {
            types.insert(heartRate)
        }
        return types
    }

    // MARK: - Autorisierung

    /// Prüft, ob HealthKit auf dem Gerät überhaupt verfügbar ist.
    func refreshAvailability() {
        guard HKHealthStore.isHealthDataAvailable() else {
            authorizationState = .unavailable
            return
        }
        if authorizationState == .unknown {
            authorizationState = .notRequested
        }
    }

    /// Fordert Lesezugriff an. Aus Datenschutzgründen verrät iOS nicht, ob der
    /// Nutzer Lesezugriff gewährt hat – wir behandeln fehlende Daten deshalb
    /// nicht als „verweigert", sondern zeigen einfach an, was verfügbar ist.
    func requestAuthorization() async {
        guard HKHealthStore.isHealthDataAvailable() else {
            authorizationState = .unavailable
            return
        }

        do {
            try await healthStore.requestAuthorization(toShare: [], read: readTypes)
            authorizationState = .requested
            await loadAll()
        } catch {
            authorizationState = .denied
            errorMessage = "HealthKit-Autorisierung fehlgeschlagen: \(error.localizedDescription)"
        }
    }

    // MARK: - Laden

    /// Lädt alle Daten für das Dashboard parallel.
    func loadAll() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        async let workoutsTask: Void = loadWorkouts()
        async let stepsTask: Void = loadTodaySteps()
        async let energyTask: Void = loadTodayActiveEnergy()
        async let heartRateTask: Void = loadRestingHeartRate()

        _ = await (workoutsTask, stepsTask, energyTask, heartRateTask)
    }

    /// Lädt die letzten Workouts (Standard: letzte 90 Tage, max. 50 Einträge).
    func loadWorkouts(withinLastDays days: Int = 90, limit: Int = 50) async {
        let startDate = Calendar.current.date(byAdding: .day, value: -days, to: Date())
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: Date(), options: .strictStartDate)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

        do {
            let samples = try await querySamples(
                sampleType: HKObjectType.workoutType(),
                predicate: predicate,
                limit: limit,
                sortDescriptors: [sort]
            )
            let hkWorkouts = samples.compactMap { $0 as? HKWorkout }
            self.workouts = hkWorkouts.map(Workout.init(hkWorkout:))
        } catch {
            self.errorMessage = "Trainings konnten nicht geladen werden: \(error.localizedDescription)"
        }
    }

    private func loadTodaySteps() async {
        guard let stepType = HKObjectType.quantityType(forIdentifier: .stepCount) else { return }
        let sum = await sumForToday(quantityType: stepType, unit: .count())
        self.todaySteps = sum ?? 0
    }

    private func loadTodayActiveEnergy() async {
        guard let energyType = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned) else { return }
        let sum = await sumForToday(quantityType: energyType, unit: .kilocalorie())
        self.todayActiveEnergy = sum ?? 0
    }

    private func loadRestingHeartRate() async {
        guard let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate) else { return }
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        do {
            let samples = try await querySamples(
                sampleType: heartRateType,
                predicate: nil,
                limit: 1,
                sortDescriptors: [sort]
            )
            if let quantitySample = samples.first as? HKQuantitySample {
                let bpmUnit = HKUnit.count().unitDivided(by: .minute())
                self.latestRestingHeartRate = quantitySample.quantity.doubleValue(for: bpmUnit)
            }
        } catch {
            // Herzfrequenz ist optional – Fehler hier nicht als kritisch behandeln.
        }
    }

    // MARK: - Query-Helfer (async-Wrapper um HealthKit-Callbacks)

    private func querySamples(
        sampleType: HKSampleType,
        predicate: NSPredicate?,
        limit: Int,
        sortDescriptors: [NSSortDescriptor]?
    ) async throws -> [HKSample] {
        try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: sampleType,
                predicate: predicate,
                limit: limit,
                sortDescriptors: sortDescriptors
            ) { _, samples, error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: samples ?? [])
                }
            }
            healthStore.execute(query)
        }
    }

    /// Summiert einen Quantity-Typ über den heutigen Tag (z. B. Schritte, Energie).
    private func sumForToday(quantityType: HKQuantityType, unit: HKUnit) async -> Double? {
        let startOfDay = Calendar.current.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: Date(), options: .strictStartDate)

        return await withCheckedContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: quantityType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, statistics, _ in
                let value = statistics?.sumQuantity()?.doubleValue(for: unit)
                continuation.resume(returning: value)
            }
            healthStore.execute(query)
        }
    }
}
