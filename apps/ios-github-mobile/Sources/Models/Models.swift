import Foundation

// MARK: - Repository

struct Repository: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let owner: String
    let defaultBranch: String

    var fullName: String {
        "\(owner)/\(name)"
    }

    static let mock = Repository(
        id: "1",
        name: "clawdbot",
        owner: "semihpolat",
        defaultBranch: "main"
    )

    static let mockList: [Repository] = [
        Repository(id: "1", name: "clawdbot", owner: "semihpolat", defaultBranch: "main"),
        Repository(id: "2", name: "systemss", owner: "semihpolat", defaultBranch: "main"),
        Repository(id: "3", name: "Awesome-Prompts", owner: "semihpolat", defaultBranch: "main"),
        Repository(id: "4", name: "statue", owner: "semihpolat", defaultBranch: "main"),
        Repository(id: "5", name: "littleagents", owner: "semihpolat", defaultBranch: "main"),
        Repository(id: "6", name: "ultimateaiscraper", owner: "semihpolat", defaultBranch: "main"),
    ]
}

// MARK: - Session

struct Session: Identifiable, Hashable {
    let id: String
    let title: String
    let repository: Repository
    let createdAt: Date
    var status: SessionStatus
    var messages: [Message]

    static func == (lhs: Session, rhs: Session) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

enum SessionStatus: String, Codable {
    case idle = "Idle"
    case running = "Running"
    case completed = "Completed"
    case error = "Error"
}

// MARK: - Message

struct Message: Identifiable, Hashable {
    let id: String
    let role: MessageRole
    let content: String
    let timestamp: Date
    var toolCalls: [ToolCall]

    static func == (lhs: Message, rhs: Message) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

enum MessageRole: String, Codable {
    case user
    case assistant
    case system
}

// MARK: - Tool Call

struct ToolCall: Identifiable, Hashable {
    let id: String
    let type: ToolType
    let name: String
    let input: String
    var output: String?
    var status: ToolCallStatus

    static func == (lhs: ToolCall, rhs: ToolCall) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

enum ToolType: String, Codable {
    case write = "Write"
    case bash = "Bash"
    case read = "Read"
    case edit = "Edit"
    case glob = "Glob"
    case grep = "Grep"

    var color: SwiftUI.Color {
        switch self {
        case .write, .edit:
            return AppTheme.toolWrite
        case .bash:
            return AppTheme.toolBash
        case .read, .glob, .grep:
            return AppTheme.toolRead
        }
    }
}

enum ToolCallStatus: String, Codable {
    case pending
    case running
    case completed
    case failed
}

// MARK: - AI Model

struct AIModel: Identifiable, Hashable {
    let id: String
    let name: String
    let displayName: String

    static let sonnet = AIModel(id: "sonnet-4.5", name: "sonnet", displayName: "Sonnet 4.5")
    static let opus = AIModel(id: "opus-4.5", name: "opus", displayName: "Opus 4.5")
    static let haiku = AIModel(id: "haiku", name: "haiku", displayName: "Haiku")

    static let all: [AIModel] = [.sonnet, .opus, .haiku]
}

// MARK: - Mock Data

extension Session {
    static let mockList: [Session] = [
        Session(
            id: "1",
            title: "Design Claude Code system architecture for mobile",
            repository: Repository.mockList[1],
            createdAt: Date().addingTimeInterval(-3600),
            status: .idle,
            messages: []
        ),
        Session(
            id: "2",
            title: "Add popular tweets with images to platform showcase",
            repository: Repository.mockList[2],
            createdAt: Date().addingTimeInterval(-7200),
            status: .idle,
            messages: []
        ),
        Session(
            id: "3",
            title: "Add popular tweets with images to platform library",
            repository: Repository.mockList[2],
            createdAt: Date().addingTimeInterval(-10800),
            status: .idle,
            messages: []
        ),
        Session(
            id: "4",
            title: "Evaluate migrating SvelteKit project to Next.js",
            repository: Repository.mockList[3],
            createdAt: Date().addingTimeInterval(-14400),
            status: .idle,
            messages: []
        ),
        Session(
            id: "5",
            title: "Update resources list with current tools and links",
            repository: Repository.mockList[4],
            createdAt: Date().addingTimeInterval(-18000),
            status: .idle,
            messages: []
        ),
        Session(
            id: "6",
            title: "Sync fork with original repository",
            repository: Repository.mockList[3],
            createdAt: Date().addingTimeInterval(-21600),
            status: .idle,
            messages: []
        ),
        Session(
            id: "7",
            title: "Improve UI Design with Shadcn Style",
            repository: Repository.mockList[5],
            createdAt: Date().addingTimeInterval(-25200),
            status: .idle,
            messages: []
        ),
    ]

    static func mockActiveSession() -> Session {
        Session(
            id: "active-1",
            title: "Add popular tweets with images to platform",
            repository: Repository.mockList[2],
            createdAt: Date().addingTimeInterval(-1800),
            status: .running,
            messages: [
                Message(
                    id: "m1",
                    role: .assistant,
                    content: "Haklisın, hemen README.md'yi oluşturup push yapıyorum!",
                    timestamp: Date().addingTimeInterval(-1200),
                    toolCalls: [
                        ToolCall(
                            id: "tc1",
                            type: .write,
                            name: "Write",
                            input: "/home/user/Awesome-Prompts/README.md",
                            output: """
                            + # Awesome AI Prompts
                            +
                            + A curated collection of powerful AI prompts that went viral on X/Twitter.
                            + These prompts have been battle-tested by thousands of users and proven to deliver
                            + exceptional results with ChatGPT, Claude, and other LLMs.
                            +
                            """,
                            status: .completed
                        )
                    ]
                ),
                Message(
                    id: "m2",
                    role: .assistant,
                    content: "Şimdi commit ve push yapıyorum:",
                    timestamp: Date().addingTimeInterval(-900),
                    toolCalls: [
                        ToolCall(
                            id: "tc2",
                            type: .bash,
                            name: "Bash",
                            input: "git add README.md && git status",
                            output: nil,
                            status: .completed
                        ),
                        ToolCall(
                            id: "tc3",
                            type: .bash,
                            name: "Bash",
                            input: "git commit -m \"$(cat <<'EOF'\nAdd comprehensive Awesome AI Prompts collection...\nEOF\n)\"",
                            output: nil,
                            status: .completed
                        ),
                        ToolCall(
                            id: "tc4",
                            type: .bash,
                            name: "Bash",
                            input: "git push -u origin claude/add-popular-tweets-dy04J",
                            output: nil,
                            status: .completed
                        )
                    ]
                ),
                Message(
                    id: "m3",
                    role: .assistant,
                    content: "Push tamam! Şimdi PR oluşturuyorum:",
                    timestamp: Date().addingTimeInterval(-600),
                    toolCalls: []
                ),
            ]
        )
    }
}
