import SwiftUI

/// Kleiner Kompatibilitäts-Wrapper. Nutzt `ContentUnavailableView` auf iOS 17+
/// und fällt auf eine einfache VStack-Darstellung für ältere Versionen zurück.
struct ContentUnavailableViewCompat: View {
    let title: String
    let systemImage: String
    let description: String

    var body: some View {
        if #available(iOS 17.0, *) {
            ContentUnavailableView {
                Label(title, systemImage: systemImage)
            } description: {
                Text(description)
            }
        } else {
            VStack(spacing: 12) {
                Image(systemName: systemImage)
                    .font(.system(size: 52))
                    .foregroundStyle(.secondary)
                Text(title)
                    .font(.title3.bold())
                Text(description)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            .padding()
        }
    }
}
