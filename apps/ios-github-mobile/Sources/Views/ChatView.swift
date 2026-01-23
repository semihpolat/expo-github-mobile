import SwiftUI

struct ChatView: View {
    @Environment(AppState.self) private var appState
    let session: Session
    @State private var messageText = ""
    @State private var showModelPicker = false
    @State private var selectedModel: AIModel = .sonnet
    @State private var showCreatePR = false

    private var currentSession: Session {
        appState.sessions.first { $0.id == session.id } ?? session
    }

    var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                // Messages scroll view
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: AppTheme.spacingLG) {
                            ForEach(currentSession.messages) { message in
                                MessageView(message: message)
                                    .id(message.id)
                            }

                            // Create PR button if there are tool calls
                            if currentSession.messages.contains(where: { !$0.toolCalls.isEmpty }) {
                                CreatePRButton(
                                    branchName: "claude/add-popular-tweets-dy04J",
                                    showCreatePR: $showCreatePR
                                )
                                .padding(.horizontal, AppTheme.spacingLG)
                            }
                        }
                        .padding(.vertical, AppTheme.spacingMD)
                    }
                    .onChange(of: currentSession.messages.count) { _, _ in
                        if let lastMessage = currentSession.messages.last {
                            withAnimation {
                                proxy.scrollTo(lastMessage.id, anchor: .bottom)
                            }
                        }
                    }
                }

                // Input area
                VStack(spacing: AppTheme.spacingMD) {
                    MessageInputView(
                        text: $messageText,
                        placeholder: "Add feedback...",
                        onSend: sendMessage
                    )

                    // Bottom chips
                    HStack(spacing: AppTheme.spacingSM) {
                        // Branch indicator
                        HStack(spacing: AppTheme.spacingXS) {
                            Text("Branch")
                                .foregroundStyle(AppTheme.secondaryText)
                            Text("claude/add-popular-tweets...")
                                .foregroundStyle(AppTheme.primaryText)
                        }
                        .font(.caption)
                        .padding(.horizontal, AppTheme.spacingMD)
                        .padding(.vertical, AppTheme.spacingSM)
                        .background(AppTheme.chipBackground)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusMD))

                        // Create PR button inline
                        Button {
                            showCreatePR = true
                        } label: {
                            HStack(spacing: AppTheme.spacingXS) {
                                Text("Create PR")
                                    .foregroundStyle(AppTheme.primaryText)
                                Image(systemName: "arrow.up.right")
                                    .font(.caption)
                                Image(systemName: "ellipsis")
                                    .font(.caption2)
                            }
                        }
                        .font(.caption)
                        .padding(.horizontal, AppTheme.spacingMD)
                        .padding(.vertical, AppTheme.spacingSM)
                        .background(AppTheme.chipBackground)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusMD))

                        Spacer()
                    }
                    .padding(.horizontal, AppTheme.spacingMD)
                }
                .padding(.bottom, AppTheme.spacingMD)
                .background(AppTheme.background)
            }
        }
        .navigationTitle(session.repository.fullName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                VStack(spacing: 2) {
                    Text(String(session.title.prefix(30)) + (session.title.count > 30 ? "..." : ""))
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(AppTheme.primaryText)
                    Text("\(session.repository.fullName) · Default")
                        .font(.caption2)
                        .foregroundStyle(AppTheme.secondaryText)
                }
            }

            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button("View on GitHub") {}
                    Button("Copy branch name") {}
                    Divider()
                    Button("Delete session", role: .destructive) {}
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .foregroundStyle(AppTheme.primaryText)
                }
            }
        }
        .sheet(isPresented: $showCreatePR) {
            CreatePRSheet(session: currentSession)
                .presentationDetents([.medium])
        }
    }

    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        appState.sendMessage(messageText, to: currentSession)
        messageText = ""
    }
}

// MARK: - Message View

struct MessageView: View {
    let message: Message
    @State private var expandedToolCalls: Set<String> = []

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.spacingMD) {
            // Message content
            if !message.content.isEmpty {
                Text(message.content)
                    .font(.body)
                    .foregroundStyle(AppTheme.primaryText)
                    .padding(.horizontal, AppTheme.spacingLG)
            }

            // Tool calls
            ForEach(message.toolCalls) { toolCall in
                ToolCallView(
                    toolCall: toolCall,
                    isExpanded: expandedToolCalls.contains(toolCall.id),
                    onToggle: {
                        if expandedToolCalls.contains(toolCall.id) {
                            expandedToolCalls.remove(toolCall.id)
                        } else {
                            expandedToolCalls.insert(toolCall.id)
                        }
                    }
                )
                .padding(.horizontal, AppTheme.spacingLG)
            }
        }
    }
}

// MARK: - Tool Call View

struct ToolCallView: View {
    let toolCall: ToolCall
    let isExpanded: Bool
    let onToggle: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            Button(action: onToggle) {
                HStack(spacing: AppTheme.spacingSM) {
                    // Tool type badge
                    Text(toolCall.type.rawValue)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(toolCall.type.color)

                    // File path or command
                    Text(toolCall.input)
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.secondaryText)
                        .lineLimit(1)

                    Spacer()

                    // Expand indicator
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(AppTheme.tertiaryText)
                }
                .padding(.horizontal, AppTheme.spacingMD)
                .padding(.vertical, AppTheme.spacingSM)
            }
            .buttonStyle(.plain)

            // Expanded content
            if isExpanded, let output = toolCall.output {
                ScrollView(.horizontal, showsIndicators: false) {
                    Text(output)
                        .font(.system(.caption, design: .monospaced))
                        .foregroundStyle(AppTheme.secondaryText)
                        .padding(AppTheme.spacingMD)
                }
                .frame(maxHeight: 200)
                .background(AppTheme.surfaceBackground)
            }
        }
        .background(AppTheme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusMD))
    }
}

// MARK: - Create PR Button

struct CreatePRButton: View {
    let branchName: String
    @Binding var showCreatePR: Bool

    var body: some View {
        HStack {
            Text(branchName)
                .font(.subheadline)
                .foregroundStyle(AppTheme.secondaryText)
                .lineLimit(1)

            Spacer()

            Button {
                showCreatePR = true
            } label: {
                HStack(spacing: AppTheme.spacingXS) {
                    Text("Create PR")
                        .fontWeight(.medium)
                    Image(systemName: "arrow.up.right")
                    Image(systemName: "ellipsis")
                }
                .font(.subheadline)
                .foregroundStyle(AppTheme.primaryText)
            }
        }
        .padding(AppTheme.spacingMD)
        .background(AppTheme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusMD))
    }
}

// MARK: - Create PR Sheet

struct CreatePRSheet: View {
    @Environment(\.dismiss) private var dismiss
    let session: Session
    @State private var prTitle = ""
    @State private var prDescription = ""

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()

                VStack(spacing: AppTheme.spacingLG) {
                    VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
                        Text("Title")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.secondaryText)

                        TextField("PR title", text: $prTitle)
                            .textFieldStyle(.plain)
                            .padding(AppTheme.spacingMD)
                            .background(AppTheme.inputBackground)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusMD))
                    }

                    VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
                        Text("Description")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.secondaryText)

                        TextEditor(text: $prDescription)
                            .scrollContentBackground(.hidden)
                            .padding(AppTheme.spacingMD)
                            .background(AppTheme.inputBackground)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusMD))
                            .frame(minHeight: 120)
                    }

                    Spacer()

                    Button {
                        // Create PR action
                        dismiss()
                    } label: {
                        Text("Create Pull Request")
                            .font(.body)
                            .fontWeight(.medium)
                            .foregroundStyle(AppTheme.buttonPrimaryText)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppTheme.spacingMD)
                            .background(AppTheme.buttonPrimary)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusFull))
                    }
                }
                .padding(AppTheme.spacingLG)
            }
            .navigationTitle("Create PR")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundStyle(AppTheme.primaryText)
                }
            }
            .onAppear {
                prTitle = session.title
            }
        }
    }
}

#Preview {
    NavigationStack {
        ChatView(session: Session.mockActiveSession())
    }
    .environment(AppState())
    .preferredColorScheme(.dark)
}
