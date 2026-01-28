import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GitHubAuth, type GitHubUser } from '../services/githubAuth'

const SETTINGS_KEY = '@kimi_settings'
const ONBOARDED_KEY = '@kimi_onboarded'

export interface Settings {
  openRouterApiKey?: string
  selectedModelId?: string
  codespaceLocation?: string
  onboardingComplete: boolean
}

// Default settings from environment variables
const DEFAULT_SETTINGS: Settings = {
  openRouterApiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '',
  selectedModelId: process.env.EXPO_PUBLIC_DEFAULT_MODEL || 'kimi/kimi-2.5',
  codespaceLocation: process.env.EXPO_PUBLIC_CODESPACE_LOCATION || 'WestUs2',
  onboardingComplete: false,
}

export const loadSettings = async (): Promise<Settings> => {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY)
    const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY)

    if (raw) {
      const saved = JSON.parse(raw) as Partial<Settings>
      return {
        openRouterApiKey: saved.openRouterApiKey || DEFAULT_SETTINGS.openRouterApiKey,
        selectedModelId: saved.selectedModelId || DEFAULT_SETTINGS.selectedModelId,
        codespaceLocation: saved.codespaceLocation || DEFAULT_SETTINGS.codespaceLocation,
        onboardingComplete: saved.onboardingComplete ?? false,
      }
    }
    return DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings', e)
  }
}

export const setOnboardingComplete = async (complete: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDED_KEY, complete ? 'true' : 'false')
  } catch (e) {
    console.error('Failed to save onboarding state', e)
  }
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings().then(async (s) => {
      // Check onboarding separately
      const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY)
      setSettings({
        ...s,
        onboardingComplete: onboarded === 'true',
      })
      setLoading(false)
    })
  }, [])

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    await saveSettings(newSettings)

    if (updates.onboardingComplete !== undefined) {
      await setOnboardingComplete(updates.onboardingComplete)
    }
  }, [settings])

  return { settings, updateSettings, loading }
}

export const useAuth = () => {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    GitHubAuth.init().then((state) => {
      setUser(state.user)
      setIsAuthenticated(state.isAuthenticated)
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(async () => {
    try {
      const state = await GitHubAuth.signIn()
      setUser(state.user)
      setIsAuthenticated(true)
      return { success: true, user: state.user }
    } catch (e) {
      console.error('[useAuth] Sign in failed', e)
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
    }
  }, [])

  const signOut = useCallback(async () => {
    await GitHubAuth.signOut()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return {
    user,
    isAuthenticated,
    loading,
    signIn,
    signOut,
    accessToken: GitHubAuth.getAccessToken(),
  }
}
