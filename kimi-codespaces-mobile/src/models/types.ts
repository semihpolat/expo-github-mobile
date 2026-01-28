// MARK: - Repository

export interface Repository {
  id: string
  name: string
  owner: string
  defaultBranch: string
  language?: string
  private?: boolean
  description?: string
  updatedAt?: string
}

export const getFullName = (repo: Repository) => `${repo.owner}/${repo.name}`

// No more mock repos - we fetch from GitHub API
export const mockRepositories: Repository[] = []

// MARK: - Session

export enum SessionStatus {
  Idle = 'Idle',
  Running = 'Running',
  Completed = 'Completed',
  Error = 'Error',
}

export interface Session {
  id: string
  title: string
  repository: Repository
  codespace?: CodespaceInfo
  createdAt: Date
  status: SessionStatus
  messages: Message[]
}

export interface CodespaceInfo {
  name: string
  displayName: string
  status: string
  webUrl: string
}

// MARK: - Message

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  toolCalls: ToolCall[]
}

// MARK: - Tool Call (simplified for Codespaces operations)

export enum ToolType {
  Write = 'Write',
  Bash = 'Bash',
  Read = 'Read',
  Edit = 'Edit',
  Glob = 'Glob',
  Grep = 'Grep',
  Codespaces = 'Codespaces',
  AgentEdit = 'AgentEdit',
}

export enum ToolCallStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

export interface ToolCall {
  id: string
  type: ToolType
  name: string
  input: string
  output?: string
  status: ToolCallStatus
}

// MARK: - AI Model (OpenRouter / Kimi)

export interface AIModel {
  id: string
  name: string
  displayName: string
  provider: string
}

export const AIModels = {
  kimi: {
    id: 'kimi/kimi-2.5',
    name: 'kimi',
    displayName: 'Kimi 2.5',
    provider: 'Moonshot',
  } as AIModel,
  claude: {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'claude',
    displayName: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
  } as AIModel,
  gpt: {
    id: 'openai/gpt-4o',
    name: 'gpt',
    displayName: 'GPT-4o',
    provider: 'OpenAI',
  } as AIModel,
}

export const allModels = [AIModels.kimi, AIModels.claude, AIModels.gpt]

// MARK: - Onboarding State

export enum OnboardingStep {
  Welcome = 'welcome',
  CreateCodespace = 'create_codespace',
  SelectRepo = 'select_repo',
  SelectBranch = 'select_branch',
  ConfigCodespace = 'config_codespace',
  Complete = 'complete',
}

export interface OnboardingState {
  step: OnboardingStep
  selectedRepo?: Repository
  selectedBranch?: string
  codespaceCreated?: boolean
}

// MARK: - Mock Data (minimal for development)

const now = new Date()

export const mockSessions: Session[] = []

export const mockActiveSession: Session = {
  id: 'active-1',
  title: 'Welcome to Kimi Codespaces',
  repository: {
    id: 'demo',
    name: 'example-repo',
    owner: 'demo-user',
    defaultBranch: 'main',
    language: 'TypeScript',
  },
  createdAt: new Date(now.getTime() - 1800 * 1000),
  status: SessionStatus.Idle,
  messages: [
    {
      id: 'm-welcome',
      role: MessageRole.Assistant,
      content: 'Welcome to Kimi Codespaces! Sign in with GitHub to create a Codespace and start editing code with AI assistance.',
      timestamp: new Date(),
      toolCalls: [],
    },
  ],
}
