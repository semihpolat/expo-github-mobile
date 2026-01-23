import SwiftUI

struct MessageInputView: View {
    @Binding var text: String
    let placeholder: String
    let onSend: () -> Void

    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(alignment: .bottom, spacing: AppTheme.spacingSM) {
            // Add attachment button
            Button {
                // Add attachment action
            } label: {
                Image(systemName: "plus")
                    .font(.title3)
                    .foregroundStyle(AppTheme.secondaryText)
                    .frame(width: 36, height: 36)
            }

            // Text input
            ZStack(alignment: .leading) {
                if text.isEmpty {
                    Text(placeholder)
                        .foregroundStyle(AppTheme.tertiaryText)
                        .padding(.horizontal, AppTheme.spacingMD)
                        .padding(.vertical, AppTheme.spacingMD)
                }

                TextEditor(text: $text)
                    .scrollContentBackground(.hidden)
                    .padding(.horizontal, AppTheme.spacingSM)
                    .padding(.vertical, AppTheme.spacingSM)
                    .frame(minHeight: 40, maxHeight: 120)
                    .focused($isFocused)
            }
            .background(AppTheme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusLG))

            // Send button
            Button(action: onSend) {
                Image(systemName: "arrow.up")
                    .font(.body)
                    .fontWeight(.semibold)
                    .foregroundStyle(text.isEmpty ? AppTheme.tertiaryText : AppTheme.buttonPrimaryText)
                    .frame(width: 36, height: 36)
                    .background(text.isEmpty ? AppTheme.chipBackground : AppTheme.accent)
                    .clipShape(Circle())
            }
            .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        .padding(.horizontal, AppTheme.spacingMD)
    }
}

#Preview {
    ZStack {
        AppTheme.background.ignoresSafeArea()
        VStack {
            Spacer()
            MessageInputView(
                text: .constant(""),
                placeholder: "Ask Claude to help with code...",
                onSend: {}
            )
        }
    }
    .preferredColorScheme(.dark)
}
