import SwiftUI

struct SessionListView: View {
    @Environment(AppState.self) private var appState
    @State private var showingNewSessionSheet = false

    var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                // Session list
                ScrollView {
                    LazyVStack(spacing: 0) {
                        // Status indicator
                        HStack {
                            Text("Idle")
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.secondaryText)
                            Spacer()
                        }
                        .padding(.horizontal, AppTheme.spacingLG)
                        .padding(.top, AppTheme.spacingMD)
                        .padding(.bottom, AppTheme.spacingSM)

                        // Sessions
                        ForEach(appState.sessions) { session in
                            SessionRowView(session: session)
                                .onTapGesture {
                                    appState.openSession(session)
                                }
                        }
                    }
                }

                // New session button
                Button {
                    showingNewSessionSheet = true
                } label: {
                    Text("New session")
                        .font(.body)
                        .fontWeight(.medium)
                        .foregroundStyle(AppTheme.buttonPrimaryText)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppTheme.spacingMD)
                        .background(AppTheme.buttonPrimary)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusFull))
                }
                .padding(.horizontal, AppTheme.spacingLG)
                .padding(.vertical, AppTheme.spacingMD)
                .background(AppTheme.background)
            }
        }
        .navigationTitle("Code")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    // Settings/filter menu
                } label: {
                    Image(systemName: "line.3.horizontal.decrease")
                        .foregroundStyle(AppTheme.primaryText)
                }
            }
        }
        .sheet(isPresented: $showingNewSessionSheet) {
            NewSessionSheet()
        }
    }
}

// MARK: - Session Row

struct SessionRowView: View {
    let session: Session

    var body: some View {
        HStack(alignment: .center, spacing: AppTheme.spacingMD) {
            VStack(alignment: .leading, spacing: AppTheme.spacingXS) {
                Text(session.title)
                    .font(.body)
                    .foregroundStyle(AppTheme.primaryText)
                    .lineLimit(2)

                Text(session.repository.fullName)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.secondaryText)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.footnote)
                .foregroundStyle(AppTheme.tertiaryText)
        }
        .padding(.horizontal, AppTheme.spacingLG)
        .padding(.vertical, AppTheme.spacingMD)
        .contentShape(Rectangle())
    }
}

// MARK: - New Session Sheet

struct NewSessionSheet: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var messageText = ""
    @State private var selectedRepository: Repository?
    @State private var selectedBranch = "main"
    @State private var selectedModel: AIModel = .sonnet
    @State private var showModelPicker = false
    @State private var showRepoPicker = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()

                VStack(spacing: 0) {
                    Spacer()

                    // Message input area
                    VStack(spacing: AppTheme.spacingMD) {
                        // Text input
                        MessageInputView(
                            text: $messageText,
                            placeholder: "Ask Claude to help with code...",
                            onSend: createSession
                        )

                        // Bottom chips
                        HStack(spacing: AppTheme.spacingSM) {
                            // Model picker
                            Button {
                                showModelPicker = true
                            } label: {
                                HStack(spacing: AppTheme.spacingXS) {
                                    Image(systemName: "cube")
                                    Text(selectedModel.displayName)
                                    Image(systemName: "chevron.down")
                                        .font(.caption2)
                                }
                            }
                            .chipStyle()

                            // Repository picker
                            Button {
                                showRepoPicker = true
                            } label: {
                                HStack(spacing: AppTheme.spacingXS) {
                                    Image(systemName: "folder")
                                    Text(selectedRepository?.name ?? "Select repo")
                                }
                            }
                            .chipStyle()

                            // Branch
                            if selectedRepository != nil {
                                HStack(spacing: AppTheme.spacingXS) {
                                    Image(systemName: "arrow.triangle.branch")
                                    Text(selectedBranch)
                                }
                                .chipStyle()
                            }

                            Spacer()
                        }
                        .padding(.horizontal, AppTheme.spacingMD)
                    }
                    .padding(.bottom, AppTheme.spacingLG)
                }
            }
            .navigationTitle("New Session")
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
                selectedRepository = appState.repositories.first
            }
            .sheet(isPresented: $showModelPicker) {
                ModelPickerSheet(selectedModel: $selectedModel)
                    .presentationDetents([.medium])
            }
            .sheet(isPresented: $showRepoPicker) {
                RepositoryPickerSheet(
                    repositories: appState.repositories,
                    selectedRepository: $selectedRepository
                )
                .presentationDetents([.medium, .large])
            }
        }
    }

    private func createSession() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              let repository = selectedRepository else { return }

        let session = appState.createNewSession(
            title: String(messageText.prefix(50)),
            repository: repository
        )
        appState.sendMessage(messageText, to: session)
        dismiss()
        appState.openSession(session)
    }
}

#Preview {
    NavigationStack {
        SessionListView()
    }
    .environment(AppState())
    .preferredColorScheme(.dark)
}
