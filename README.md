# Trainings App – Strava-Integration (Web-App)

Eine **Next.js-Web-App** (App Router, TypeScript), die sich per **Strava OAuth2**
verbindet und deine Trainings/Aktivitäten übersichtlich darstellt: Kennzahlen,
ein **Wochen-Distanz-Chart** und eine Trainingsliste.

> **Warum Strava und nicht Apple Fitness?** Apple Fitness/Health bietet keine
> Web-/REST-API – der Zugriff geht nur über HealthKit aus einer nativen iOS-App.
> Für eine echte Web-App braucht es eine Quelle mit HTTP-API; Strava passt am
> besten zu „Trainings" (Laufen, Radfahren, Schwimmen …). Fitbit wäre eine
> Alternative und ließe sich analog anbinden.

## Funktionen

- 🔐 **Strava OAuth2** mit CSRF-`state`-Prüfung; Tokens in einem signierten,
  `httpOnly`-Cookie (serverseitig, nie im Browser-JS)
- ♻️ **Automatischer Token-Refresh** über den Refresh-Token
- 📊 **Dashboard**: Anzahl Trainings, Gesamtdistanz, Bewegungszeit, Höhenmeter
- 📈 **Wochen-Chart** (abhängigkeitsfreies SVG) der letzten 8 Wochen
- 📋 **Trainingsliste** mit Sportart, Datum, Distanz und Dauer

## Tech-Stack

- Next.js 16 (App Router, Route Handlers, Server Components)
- React 19 / TypeScript
- Keine externe Chart-Bibliothek (eigenes SVG-Diagramm)

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx                       # Root-Layout
│   ├── globals.css                      # Styles (Light/Dark)
│   ├── page.tsx                         # Landing / „Mit Strava verbinden"
│   ├── dashboard/page.tsx               # Dashboard (Server Component)
│   └── api/
│       ├── auth/strava/route.ts         # OAuth Schritt 1: Redirect zu Strava
│       ├── auth/strava/callback/route.ts# OAuth Schritt 2: Code → Token
│       ├── auth/logout/route.ts         # Logout
│       └── activities/route.ts          # Aktivitäten als JSON (+ Refresh)
├── components/
│   ├── DashboardClient.tsx              # Lädt /api/activities, Zustände
│   ├── StatCards.tsx                    # Kennzahlen-Kacheln
│   ├── WeeklyChart.tsx                  # SVG-Wochen-Chart
│   └── ActivityList.tsx                 # Trainingsliste
└── lib/
    ├── strava.ts                        # Strava-API-Client (OAuth + Fetch)
    ├── session.ts                       # Signiertes Session-Cookie
    ├── aggregate.ts                     # Wochen-Buckets & Summen
    └── format.ts                        # Formatierung (Distanz, Pace, …)
```

## Einrichtung

### 1. Strava-API-App anlegen
Unter <https://www.strava.com/settings/api> eine Anwendung erstellen und als
**Authorization Callback Domain** `localhost` eintragen (für die lokale
Entwicklung). Notiere **Client ID** und **Client Secret**.

### 2. Environment setzen
```bash
cp .env.example .env.local
```
Werte in `.env.local` eintragen:

| Variable                | Beschreibung                                              |
| ----------------------- | -------------------------------------------------------- |
| `STRAVA_CLIENT_ID`      | Client-ID der Strava-App                                 |
| `STRAVA_CLIENT_SECRET`  | Client-Secret (bleibt serverseitig)                      |
| `NEXT_PUBLIC_BASE_URL`  | Basis-URL, lokal `http://localhost:3000`                 |
| `SESSION_SECRET`        | Zufalls-Secret ≥ 32 Zeichen (`openssl rand -base64 32`)  |

### 3. Starten
```bash
npm install
npm run dev
# http://localhost:3000 öffnen → „Mit Strava verbinden"
```

## Skripte

| Befehl              | Zweck                          |
| ------------------- | ------------------------------ |
| `npm run dev`       | Entwicklungsserver             |
| `npm run build`     | Produktions-Build              |
| `npm start`         | Produktionsserver              |
| `npm run typecheck` | TypeScript prüfen (`tsc`)      |

## Verifiziert

`npm run build` und `tsc --noEmit` laufen fehlerfrei. Smoke-Test mit
Dummy-Zugangsdaten bestätigt: Landing rendert, `/api/auth/strava` leitet
korrekt zu Strava weiter (richtiger Scope & `state`), geschützte Routen
antworten ohne Session mit 401 bzw. Redirect.

> **Hinweis:** Der eigentliche Login-Flow und der Abruf echter Aktivitäten
> brauchen gültige Strava-Zugangsdaten und wurden hier (ohne Strava-Account)
> nicht end-to-end durchlaufen.

## Nächste Ausbaustufen

- Filter nach Sportart und Zeitraum
- Detailseite je Training (Splits, Herzfrequenz-Verlauf)
- Serverseitiges Caching der Aktivitäten
- Fitbit als zweite Datenquelle
