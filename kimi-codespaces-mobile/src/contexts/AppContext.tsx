import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import {
  Session,
  Repository,
  Message,
  MessageRole,
  AIModel,
  mockActiveSession,
  SessionStatus,
  OnboardingStep,
  type CodespaceInfo,
} from '../models/types'
import { CodespacesAPI, type Codespace } from '../services/codespaces'

interface AppContextType {
  // Sessions
  sessions: Session[]
  activeSession: Session | null
  openSession: (session: Session) => void
  closeSession: () => void
  createNewSession: (title: string, repository: Repository, codespace?: CodespaceInfo) => Session
  addMessageToSession: (sessionId: string, message: Message) => void

  // Codespaces
  codespaces: Codespace[]
  loadCodespaces: (accessToken: string) => Promise<void>
  createCodespace: (
    accessToken: string,
    owner: string,
    repo: string,
    branch?: string
  ) => Promise<Codespace>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([mockActiveSession])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [codespaces, setCodespaces] = useState<Codespace[]>([])

  const openSession = useCallback((session: Session) => {
    setActiveSession(session)
  }, [])

  const closeSession = useCallback(() => {
    setActiveSession(null)
  }, [])

  const createNewSession = useCallback(
    (title: string, repository: Repository, codespace?: CodespaceInfo): Session => {
      const newSession: Session = {
        id: `session-${Date.now()}`,
        title,
        repository,
        codespace,
        createdAt: new Date(),
        status: SessionStatus.Idle,
        messages: [],
      }
      setSessions((prev) => [newSession, ...prev])
      return newSession
    },
    []
  )

  const addMessageToSession = useCallback((sessionId: string, message: Message) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: [...s.messages, message],
          }
        }
        return s
      })
    )
  }, [])

  const loadCodespaces = useCallback(async (accessToken: string) => {
    try {
      const result = await CodespacesAPI.listCodespaces(accessToken)
      setCodespaces(result)
    } catch (e) {
      console.error('[AppContext] Failed to load codespaces', e)
    }
  }, [])

  const createCodespace = useCallback(
    async (accessToken: string, owner: string, repo: string, branch?: string) => {
      const result = await CodespacesAPI.createCodespace(accessToken, {
        owner,
        repo,
        branch,
        displayName: `${owner}-${repo}-${branch || 'main'}`,
      })
      setCodespaces((prev) => [...prev, result])
      return result
    },
    []
  )

  return (
    <AppContext.Provider
      value={{
        sessions,
        activeSession,
        openSession,
        closeSession,
        createNewSession,
        addMessageToSession,
        codespaces,
        loadCodespaces,
        createCodespace,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppState = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider')
  }
  return context
}

// Re-export types for convenience
export type { Session, Repository, Message, AIModel, OnboardingStep, CodespaceInfo }
export { MessageRole, SessionStatus, ToolType, ToolCallStatus } from '../models/types'
