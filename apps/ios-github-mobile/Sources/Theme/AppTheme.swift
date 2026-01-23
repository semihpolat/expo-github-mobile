import SwiftUI

enum AppTheme {
    // Background colors
    static let background = Color(red: 0.08, green: 0.08, blue: 0.08)
    static let surfaceBackground = Color(red: 0.12, green: 0.12, blue: 0.12)
    static let cardBackground = Color(red: 0.16, green: 0.16, blue: 0.16)
    static let inputBackground = Color(red: 0.14, green: 0.14, blue: 0.14)

    // Text colors
    static let primaryText = Color.white
    static let secondaryText = Color(white: 0.6)
    static let tertiaryText = Color(white: 0.45)

    // Accent colors
    static let accent = Color(red: 0.85, green: 0.55, blue: 0.35) // Warm orange like Claude
    static let accentLight = Color(red: 0.95, green: 0.75, blue: 0.55)

    // Status colors
    static let success = Color(red: 0.3, green: 0.7, blue: 0.4)
    static let warning = Color(red: 0.9, green: 0.7, blue: 0.3)
    static let error = Color(red: 0.9, green: 0.4, blue: 0.4)

    // Tool colors
    static let toolWrite = Color(red: 0.4, green: 0.7, blue: 0.4)
    static let toolBash = Color(red: 0.5, green: 0.6, blue: 0.8)
    static let toolRead = Color(red: 0.7, green: 0.6, blue: 0.8)

    // Chip/Tag colors
    static let chipBackground = Color(red: 0.2, green: 0.2, blue: 0.2)
    static let chipBorder = Color(white: 0.3)

    // Button colors
    static let buttonPrimary = Color(white: 0.95)
    static let buttonPrimaryText = Color.black

    // Spacing
    static let spacingXS: CGFloat = 4
    static let spacingSM: CGFloat = 8
    static let spacingMD: CGFloat = 12
    static let spacingLG: CGFloat = 16
    static let spacingXL: CGFloat = 24

    // Corner radius
    static let radiusSM: CGFloat = 6
    static let radiusMD: CGFloat = 10
    static let radiusLG: CGFloat = 16
    static let radiusXL: CGFloat = 24
    static let radiusFull: CGFloat = 100
}

// MARK: - View Modifiers

struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(AppTheme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusLG))
    }
}

struct ChipStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.subheadline)
            .foregroundStyle(AppTheme.primaryText)
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.vertical, AppTheme.spacingSM)
            .background(AppTheme.chipBackground)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusFull))
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.radiusFull)
                    .stroke(AppTheme.chipBorder, lineWidth: 1)
            )
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }

    func chipStyle() -> some View {
        modifier(ChipStyle())
    }
}
