import Foundation
import Observation
import SwiftUI

@Observable
@MainActor
final class AppState {
    var sessions: [Session] = Session.mockList
    var repositories: [Repository] = Repository.mockList
    var selectedModel: AIModel = .sonnet
    var currentSession: Session?
    var navigationPath = NavigationPath()

    // Current input state
    var messageInput: String = ""
    var selectedRepository: Repository?
    var selectedBranch: String = "main"

    init() {
        self.selectedRepository = repositories.first
    }

    func createNewSession(title: String, repository: Repository) -> Session {
        let session = Session(
            id: UUID().uuidString,
            title: title,
            repository: repository,
            createdAt: Date(),
            status: .idle,
            messages: []
        )
        sessions.insert(session, at: 0)
        return session
    }

    func sendMessage(_ content: String, to session: Session) {
        guard let index = sessions.firstIndex(where: { $0.id == session.id }) else { return }

        let message = Message(
            id: UUID().uuidString,
            role: .user,
            content: content,
            timestamp: Date(),
            toolCalls: []
        )

        sessions[index].messages.append(message)
        sessions[index].status = .running

        // Simulate assistant response after a delay
        simulateResponse(for: sessions[index])
    }

    private func simulateResponse(for session: Session) {
        guard let index = sessions.firstIndex(where: { $0.id == session.id }) else { return }

        // Create a simulated assistant response
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            guard let self else { return }

            let assistantMessage = Message(
                id: UUID().uuidString,
                role: .assistant,
                content: "Anladım! Şimdi bu değişiklikleri yapmaya başlıyorum...",
                timestamp: Date(),
                toolCalls: [
                    ToolCall(
                        id: UUID().uuidString,
                        type: .read,
                        name: "Read",
                        input: "/home/user/\(session.repository.name)/README.md",
                        output: "# \(session.repository.name)\n\nProject description...",
                        status: .completed
                    )
                ]
            )

            self.sessions[index].messages.append(assistantMessage)
            self.sessions[index].status = .idle
        }
    }

    func openSession(_ session: Session) {
        currentSession = session
        navigationPath.append(session)
    }

    func selectRepository(_ repository: Repository) {
        selectedRepository = repository
        selectedBranch = repository.defaultBranch
    }
}
