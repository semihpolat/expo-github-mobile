# Kimi Codespaces Mobile

A React Native (Expo) mobile app for agentic code editing on GitHub repositories using GitHub Codespaces and Kimi 2.5 AI model via OpenRouter.

## Features

- **GitHub OAuth Authentication** - Sign in with GitHub to access your repositories
- **Repository & Branch Selection** - Browse and select any repo/branch you have access to
- **Codespaces Integration** - Create and manage GitHub Codespaces for development
- **AI-Powered Editing** - Uses Kimi 2.5 (via OpenRouter) for code understanding and editing
- **Real-time Chat Interface** - Stream AI responses and tool execution updates

## Getting Started

### Prerequisites

- Node.js 22+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on your phone

### Installation

```bash
cd kimi-codespaces-mobile
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Create a GitHub OAuth App at https://github.com/settings/developers:
   - Application name: `Kimi Codespaces Mobile`
   - Homepage URL: `http://localhost:19006` (for Expo Go)
   - Authorization callback URL: `kimicodespaces://auth`

3. Get an OpenRouter API key from https://openrouter.ai/keys

4. Fill in your `.env.local`:
   ```
   EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
   EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-your-key-here
   ```

### Running the App

```bash
# Start Expo dev server
npm start

# Press 'i' for iOS Simulator or 'a' for Android Emulator
# Or scan the QR code with Expo Go app on your phone
```

## Project Structure

```
kimi-codespaces-mobile/
├── src/
│   ├── contexts/      # State management (AppContext)
│   ├── hooks/         # React hooks (useSettings, useGitHub)
│   ├── models/        # TypeScript types
│   ├── services/      # External API clients (GitHub, Codespaces)
│   ├── views/         # Screen components
│   └── components/    # Reusable UI components
├── App.tsx            # Root component and navigation
└── ARCHITECTURE.md    # Architecture documentation
```

## Architecture

This app uses a **Codespaces Agent** architecture:
- Mobile app talks to a GitHub Codespace environment
- The Codespace runs an agent server that handles AI communication (via OpenRouter/Kimi 2.5) and executes file operations
- OpenRouter API keys stay server-side in the Codespace for security

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## Current Status

- ✅ GitHub OAuth authentication
- ✅ Repository and branch listing
- ✅ Settings screen with model selection
- ✅ Session management UI
- ✅ Codespaces API integration
- 🚧 Agent endpoint integration (stubbed with TODOs)
- 🚧 Onboarding flow
- 🚧 OpenRouter Kimi 2.5 streaming

## License

MIT
