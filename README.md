# Trainings App – Apple-Fitness-Integration (Prototyp)

Ein SwiftUI-iOS-Prototyp, der die **Apple-Fitness-/Health-Daten** über
**HealthKit** ausliest und in einem Dashboard darstellt: Trainings/Workouts,
aktive Kalorien, Schritte und Herzfrequenz.

> **Wichtig:** Apple bietet für Fitness-/Health-Daten **keine Web-/REST-API**.
> Der einzige unterstützte Zugriff läuft über **HealthKit** aus einer nativen
> iOS-App. Deshalb ist dieser Prototyp in Swift/SwiftUI umgesetzt und muss mit
> **Xcode auf macOS** gebaut werden.

## Funktionsumfang

- 🔐 **Autorisierung** über den nativen HealthKit-Berechtigungsdialog
- 🏃 **Trainings** der letzten 90 Tage inkl. Dauer, Distanz und Kalorien
- 📊 **Tages-Dashboard**: Schritte, aktive Kalorien, letzter Ruhepuls
- 🔎 **Detailansicht** je Training
- ↻ **Pull-to-Refresh** und manuelles Neuladen

## Projektstruktur

```
TrainingsApp/
├── App/
│   └── TrainingsAppApp.swift          # App-Einstieg, injiziert HealthKitManager
├── Models/
│   └── Workout.swift                  # UI-Modell, aus HKWorkout erzeugt
├── HealthKit/
│   ├── HealthKitManager.swift         # Kern: Auth + Datenabruf (async/await)
│   └── HKWorkoutActivityType+Display.swift  # Namen & SF-Symbole je Sportart
├── Views/
│   ├── ContentView.swift              # Routing Auth ↔ Dashboard
│   ├── AuthorizationView.swift        # Onboarding + Berechtigung anfordern
│   ├── DashboardView.swift            # Kennzahlen + Trainingsliste
│   ├── WorkoutRow.swift               # Listenzeile
│   ├── WorkoutDetailView.swift        # Detailansicht
│   └── ContentUnavailableViewCompat.swift
├── Resources/
│   └── Info.plist                     # NSHealth*UsageDescription
└── TrainingsApp.entitlements          # HealthKit-Capability
```

## Bauen & Starten

### Voraussetzungen
- macOS mit **Xcode 15+**
- Ein **echtes iPhone** ist empfohlen (HealthKit-Daten stehen im Simulator nur
  eingeschränkt zur Verfügung; Trainings lassen sich im Simulator über
  *Health-App → Daten hinzufügen* teils simulieren)
- Ein Apple-Developer-Team zum Signieren (HealthKit erfordert eine
  gültige Signatur/Provisioning mit HealthKit-Capability)

### Variante A – mit XcodeGen (empfohlen)
```bash
brew install xcodegen
xcodegen generate        # erzeugt TrainingsApp.xcodeproj aus project.yml
open TrainingsApp.xcodeproj
```

### Variante B – manuell in Xcode
1. Neues Projekt **App** (SwiftUI, iOS) anlegen, z. B. `TrainingsApp`.
2. Die Dateien aus `TrainingsApp/` in das Projekt ziehen (Ordnerstruktur beibehalten).
3. Unter **Signing & Capabilities** die Capability **HealthKit** hinzufügen.
4. In der `Info.plist` die beiden Schlüssel `NSHealthShareUsageDescription`
   und `NSHealthUpdateUsageDescription` setzen (siehe `Resources/Info.plist`).
5. Deployment Target auf **iOS 16.0** oder höher stellen.
6. Auf einem echten iPhone ausführen.

## Nächste Ausbaustufen (Ideen)

- Wochen-/Monats-Charts mit **Swift Charts**
- Live-Updates via `HKObserverQuery` / Background Delivery
- Filter nach Sportart, Trends (Distanz/Zeit über Wochen)
- Zusätzliche Metriken: VO₂max, Schlaf, HRV
- Export/Teilen einzelner Trainings

## Hinweis zum Datenschutz

Die App liest ausschließlich lokal aus HealthKit und schreibt keine Daten
zurück. Es findet keine Übertragung an externe Server statt.
