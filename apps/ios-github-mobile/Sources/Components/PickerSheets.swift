import SwiftUI

// MARK: - Model Picker Sheet

struct ModelPickerSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var selectedModel: AIModel

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()

                List {
                    ForEach(AIModel.all) { model in
                        Button {
                            selectedModel = model
                            dismiss()
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: AppTheme.spacingXS) {
                                    Text(model.displayName)
                                        .font(.body)
                                        .foregroundStyle(AppTheme.primaryText)

                                    Text(modelDescription(for: model))
                                        .font(.caption)
                                        .foregroundStyle(AppTheme.secondaryText)
                                }

                                Spacer()

                                if model.id == selectedModel.id {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(AppTheme.accent)
                                }
                            }
                            .padding(.vertical, AppTheme.spacingXS)
                        }
                    }
                    .listRowBackground(AppTheme.cardBackground)
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Select Model")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundStyle(AppTheme.primaryText)
                }
            }
        }
    }

    private func modelDescription(for model: AIModel) -> String {
        switch model.name {
        case "sonnet":
            return "Balanced performance and speed"
        case "opus":
            return "Most capable, complex tasks"
        case "haiku":
            return "Fast and efficient"
        default:
            return ""
        }
    }
}

// MARK: - Repository Picker Sheet

struct RepositoryPickerSheet: View {
    @Environment(\.dismiss) private var dismiss
    let repositories: [Repository]
    @Binding var selectedRepository: Repository?
    @State private var searchText = ""

    private var filteredRepositories: [Repository] {
        if searchText.isEmpty {
            return repositories
        }
        return repositories.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.owner.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()

                List {
                    ForEach(filteredRepositories) { repo in
                        Button {
                            selectedRepository = repo
                            dismiss()
                        } label: {
                            HStack {
                                Image(systemName: "folder")
                                    .foregroundStyle(AppTheme.secondaryText)

                                VStack(alignment: .leading, spacing: AppTheme.spacingXS) {
                                    Text(repo.name)
                                        .font(.body)
                                        .foregroundStyle(AppTheme.primaryText)

                                    Text(repo.owner)
                                        .font(.caption)
                                        .foregroundStyle(AppTheme.secondaryText)
                                }

                                Spacer()

                                if repo.id == selectedRepository?.id {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(AppTheme.accent)
                                }
                            }
                            .padding(.vertical, AppTheme.spacingXS)
                        }
                    }
                    .listRowBackground(AppTheme.cardBackground)
                }
                .scrollContentBackground(.hidden)
                .searchable(text: $searchText, prompt: "Search repositories")
            }
            .navigationTitle("Select Repository")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundStyle(AppTheme.primaryText)
                }
            }
        }
    }
}

#Preview("Model Picker") {
    ModelPickerSheet(selectedModel: .constant(.sonnet))
        .preferredColorScheme(.dark)
}

#Preview("Repository Picker") {
    RepositoryPickerSheet(
        repositories: Repository.mockList,
        selectedRepository: .constant(nil)
    )
    .preferredColorScheme(.dark)
}
