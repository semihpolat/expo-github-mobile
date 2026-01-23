import SwiftUI

struct StatusIndicator: View {
    let status: SessionStatus

    var body: some View {
        HStack(spacing: AppTheme.spacingXS) {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)

            Text(status.rawValue)
                .font(.subheadline)
                .foregroundStyle(AppTheme.secondaryText)
        }
    }

    private var statusColor: Color {
        switch status {
        case .idle:
            return AppTheme.secondaryText
        case .running:
            return AppTheme.accent
        case .completed:
            return AppTheme.success
        case .error:
            return AppTheme.error
        }
    }
}

// MARK: - Loading Indicator

struct LoadingIndicator: View {
    @State private var isAnimating = false

    var body: some View {
        HStack(spacing: AppTheme.spacingXS) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(AppTheme.accent)
                    .frame(width: 6, height: 6)
                    .scaleEffect(isAnimating ? 1.0 : 0.5)
                    .animation(
                        .easeInOut(duration: 0.6)
                            .repeatForever()
                            .delay(Double(index) * 0.2),
                        value: isAnimating
                    )
            }
        }
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - Tool Status Badge

struct ToolStatusBadge: View {
    let status: ToolCallStatus

    var body: some View {
        HStack(spacing: AppTheme.spacingXS) {
            switch status {
            case .pending:
                Image(systemName: "clock")
                    .foregroundStyle(AppTheme.secondaryText)
            case .running:
                ProgressView()
                    .scaleEffect(0.7)
                    .tint(AppTheme.accent)
            case .completed:
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(AppTheme.success)
            case .failed:
                Image(systemName: "xmark.circle.fill")
                    .foregroundStyle(AppTheme.error)
            }
        }
        .font(.caption)
    }
}

#Preview {
    VStack(spacing: 20) {
        StatusIndicator(status: .idle)
        StatusIndicator(status: .running)
        StatusIndicator(status: .completed)
        StatusIndicator(status: .error)

        Divider()

        LoadingIndicator()

        Divider()

        HStack(spacing: 20) {
            ToolStatusBadge(status: .pending)
            ToolStatusBadge(status: .running)
            ToolStatusBadge(status: .completed)
            ToolStatusBadge(status: .failed)
        }
    }
    .padding()
    .background(AppTheme.background)
    .preferredColorScheme(.dark)
}
