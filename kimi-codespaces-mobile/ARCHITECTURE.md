# Kimi Codespaces Mobile - Architecture

## Overview

Kimi Codespaces Mobile is a React Native (Expo) app that enables agentic code editing on GitHub repositories using GitHub Codespaces and Kimi 2.5 AI model via OpenRouter.

## Architecture Decision: App → Codespaces Agent

### Chosen Approach

The mobile app communicates **only** with a GitHub Codespaces environment, which runs a full agent server that:

1. **Handles AI communication** with OpenRouter/Kimi 2.5
2. **Executes file operations** (Read, Write, Edit, Bash, Glob, Grep)
3. **Manages git operations** (commit, push, PR creation)
4. **Streams results** back to the mobile app

### Why This Architecture?

| Aspect | App → Codespaces Agent | App → OpenRouter + GitHub API Direct |
|--------|------------------------|--------------------------------------|
| **Security** | ✅ OpenRouter key stays in server-side Codespace | ❌ API keys on mobile device (risk of extraction) |
| **File Access** | ✅ Full filesystem access via Codespace | ❌ No direct file access without intermediate API |
| **Tool Execution** | ✅ Run bash commands, git, tests naturally | ❌ Would need custom execution layer |
| **Complexity** | ✅ Single endpoint for all operations | ❌ Multiple API integrations to manage |
| **Cost** | ✅ Codespace per-usage billing | ⚠️ Mobile platform always running |
| **Offline/Background** | ✅ Agent continues work if app backgrounds | ❌ Mobile execution stops with app |

### Tradeoffs

**Advantages:**
- **Better security model**: Sensitive API keys (OpenRouter) live in the Codespace, not on the user's phone
- **Full development environment**: Access to real bash, git, node, python, etc. without limitations
- **Scalable compute**: Codespaces can be sized up for heavy tasks (large repo analysis, dependency installation)
- **Consistent environment**: Same tools and versions as desktop development

**Disadvantages:**
- **Network dependency**: Requires internet connection to Codespace
- **Codespace startup time**: 30-60 seconds to spin up a new environment
- **GitHub Codespaces limit**: Subject to GitHub's usage quotas
- **Latency**: Additional hop through Codespace for AI responses

## Data Flow

```
┌──────────────────────────────────────────────��──────────────────────────┐
│                        Mobile App (React Native)                        │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────────────────┐  │
│  │ GitHub OAuth │  │   Settings    │  │   Chat/Sessions UI         │  │
│  │   (expo-auth)│  │   (AsyncStore)│  │   (Messages, Tool Calls)   │  │
│  └──────────────┘  └───────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (Bearer token)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       GitHub API                                         │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────────────────┐  │
│  │   Repos      │  │   Branches    │  │   Codespaces API           │  │
│  └──────────────┘  └───────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Create/Start/Communicate
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    GitHub Codespace Environment                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    Agent Server (Node.js/Python)                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐  │ │
│  │  │  1. Receive instruction from mobile app                      │  │ │
│  │  │  2. Call OpenRouter API with Kimi 2.5                        │  │ │
│  │  │  3. Stream AI response + tool calls                          │  │ │
│  │  │  4. Execute tools (Read, Write, Bash, etc.)                  │  │ │
│  │  │  5. Stream results back to mobile                            │  │ │
│  │  └──────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    │ OpenRouter API                      │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    OpenRouter (LLM Gateway)                         │ │
│  │                    - Kimi 2.5 (Moonshot AI)                         │ │
│  │                    - Claude 3.5 Sonnet                              │ │
│  │                    - GPT-4o                                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Structure

### Mobile App Layers

```
kimi-codespaces-mobile/
├── src/
│   ├── contexts/          # State management
│   │   └── AppContext.tsx # Global app state (sessions, codespaces)
│   ├── hooks/             # React hooks
│   │   ├── useSettings.ts # Settings persistence + Auth state
│   │   └── useGitHub.ts   # GitHub API hooks (repos, branches)
│   ├── models/            # TypeScript types
│   │   └── types.ts       # Core interfaces
│   ├── services/          # External API clients
│   │   ├── githubAuth.ts  # GitHub OAuth flow
│   │   ├── github.ts      # GitHub API wrapper
│   │   └── codespaces.ts  # Codespaces API
│   ├── views/             # Screen components
│   │   ├── SessionListView.tsx
│   │   ├── ChatView.tsx
│   │   └── SettingsView.tsx
│   └── components/        # Reusable UI
│       ├── MessageView.tsx
│       ├── MessageInputView.tsx
│       └── NewSessionSheet.tsx
└── App.tsx                # Root + navigation
```

## Authentication Flow

1. **Sign In**: User clicks "Sign in with GitHub"
   - App opens GitHub OAuth page in browser (expo-auth-session)
   - User grants permissions: `repo user codespaces`
   - GitHub redirects to app: `kimicodespaces://auth?code=...`
   - App exchanges code for access token (client-side for now)
   - Token stored in AsyncStorage

2. **API Calls**: All GitHub API requests include:
   ```typescript
   headers: {
     'Authorization': `Bearer ${accessToken}`,
     'User-Agent': 'Kimi-Codespaces-Mobile'
   }
   ```

## Codespaces Integration

### Creating a Codespace

```typescript
const codespace = await CodespacesAPI.createCodespace(accessToken, {
  owner: 'user',
  repo: 'my-repo',
  branch: 'main',
  location: 'WestUs2'
})
```

### Agent Communication (TODO)

The mobile app will send requests to the Codespace's agent endpoint:

```typescript
// POST to: https://{codespace_name}-{port}.{codespace_location}.github.dev/api/agent
const response = await fetch(agentUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`
  },
  body: JSON.stringify({
    instruction: userMessage,
    model: 'kimi/kimi-2.5',
    context: { owner, repo, branch }
  })
})
```

The agent responds with Server-Sent Events (SSE) streaming:
- Text deltas from the AI
- Tool call start/update/end events
- Final result summary

## Security Considerations

1. **OAuth Tokens**: Stored in AsyncStorage (encrypted on iOS/Android)
2. **OpenRouter Keys**: ONLY stored in Codespace environment, never on mobile
3. **Codespace Access**: Uses GitHub's built-in auth; no custom SSH keys needed
4. **HTTPS**: All API communication over TLS

## Future Enhancements

1. **Onboarding Flow**: Guide users through creating their first Codespace
2. **Biometric Auth**: Require Face ID/Touch ID to access the app
3. **Background Sync**: Queue commands when offline, execute when connected
4. **Multiple Sessions**: Run multiple agent tasks in parallel
5. **Real-time Collaboration**: Multiple users editing the same repo
