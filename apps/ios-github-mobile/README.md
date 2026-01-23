# GitHub Mobile - SwiftUI App

A beautiful SwiftUI mobile app inspired by the Claude Code mobile experience. This app provides a clean interface for managing GitHub repositories and sending code requests through an AI assistant.

## Features

- **Session Management**: View and manage coding sessions organized by repository
- **Chat Interface**: Send messages and view AI responses with tool execution details
- **Repository Selection**: Browse and select from your GitHub repositories
- **Model Selection**: Choose between different AI models (Sonnet, Opus, Haiku)
- **Dark Theme**: Beautiful dark theme matching the Claude Code aesthetic
- **PR Creation**: Simulate creating pull requests from the app

## Screenshots

The app is inspired by the Claude Code mobile app UI:
- Session list with repository information
- Chat view with collapsible tool executions (Write, Bash, Read, etc.)
- Bottom input with model/repo selection chips

## Requirements

- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

## Project Structure

```
Sources/
├── GitHubMobileApp.swift      # App entry point
├── ContentView.swift          # Main navigation container
├── Models/
│   ├── Models.swift           # Data models (Session, Message, Repository, etc.)
│   └── AppState.swift         # Observable app state
├── Views/
│   ├── SessionListView.swift  # Session list screen
│   └── ChatView.swift         # Chat/conversation screen
├── Components/
│   ├── MessageInputView.swift # Message input component
│   ├── PickerSheets.swift     # Model and repo picker sheets
│   └── StatusIndicator.swift  # Status indicators and badges
├── Theme/
│   └── AppTheme.swift         # Colors, spacing, and styling
└── Assets.xcassets/           # App icons and colors
```

## Architecture

The app uses modern SwiftUI patterns:
- **@Observable** macro for state management (iOS 17+)
- **NavigationStack** with typed navigation paths
- **Environment** for dependency injection
- **View modifiers** for reusable styling

## Building

### Using Xcode

1. Open `Package.swift` in Xcode
2. Select your target device
3. Build and run (Cmd+R)

### Using Swift Package Manager

```bash
swift build
```

## Mock Data

The app includes mock data for demonstration:
- Sample repositories (clawdbot, systemss, Awesome-Prompts, etc.)
- Sample sessions with various titles
- Mock tool executions (Write, Bash commands)

## Customization

### Colors

Edit `Theme/AppTheme.swift` to customize:
- Background colors
- Accent colors (warm orange by default)
- Text colors
- Tool execution colors

### Mock Data

Edit `Models/Models.swift` to customize:
- `Repository.mockList` - Available repositories
- `Session.mockList` - Session list items
- `Session.mockActiveSession()` - Active session with tool calls

## License

Open source - feel free to use and modify.
