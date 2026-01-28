import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Configure WebBrowser for auth
WebBrowser.maybeCompleteAuthSession()

// TODO: Add your GitHub OAuth App credentials here
// Create at: https://github.com/settings/developers
const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || ''
const GITHUB_CLIENT_SECRET = process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET || ''
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'kimicodespaces',
  path: 'auth',
})

// GitHub OAuth discovery document (for use with AuthRequest)
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
}

// Storage keys
const ACCESS_TOKEN_KEY = '@kimi_github_access_token'
const REFRESH_TOKEN_KEY = '@kimi_github_refresh_token'
const USER_DATA_KEY = '@kimi_github_user_data'

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  type: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: GitHubUser | null
  accessToken: string | null
}

export class GitHubAuth {
  private static accessToken: string | null = null
  private static user: GitHubUser | null = null

  /**
   * Initialize auth from storage
   */
  static async init(): Promise<AuthState> {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem(ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
      ])

      if (token) {
        this.accessToken = token
        if (userStr) {
          this.user = JSON.parse(userStr)
        }
        return {
          isAuthenticated: true,
          user: this.user,
          accessToken: token,
        }
      }
    } catch (e) {
      console.error('[GitHubAuth] Failed to load from storage', e)
    }

    return {
      isAuthenticated: false,
      user: null,
      accessToken: null,
    }
  }

  /**
   * Get the current access token
   */
  static getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Get the current user
   */
  static getUser(): GitHubUser | null {
    return this.user
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.accessToken !== null
  }

  /**
   * Sign in with GitHub OAuth
   */
  static async signIn(): Promise<AuthState> {
    if (!GITHUB_CLIENT_ID) {
      throw new Error(
        'GitHub Client ID not configured. Please add EXPO_PUBLIC_GITHUB_CLIENT_ID to .env'
      )
    }

    console.log('[GitHubAuth] Starting OAuth flow, redirect to:', REDIRECT_URI)

    // Create AuthRequest for GitHub OAuth
    const request = new AuthSession.AuthRequest({
      clientId: GITHUB_CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scopes: ['repo', 'user', 'codespaces'],
      usePKCE: false, // Disable PKCE for GitHub OAuth
    })

    // Prompt the user to authorize
    const result = await request.promptAsync(discovery)

    console.log('[GitHubAuth] Auth result:', result.type)

    if (result.type === 'success') {
      const { params } = result
      const code = params.code as string

      // Exchange code for access token
      // Note: In production, this should be done server-side to keep client secret safe
      const tokenResponse = await this.exchangeCodeForToken(code)

      // Fetch user info
      const user = await this.fetchUser(tokenResponse.access_token)

      // Store credentials
      this.accessToken = tokenResponse.access_token
      this.user = user

      await Promise.all([
        AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token),
        AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user)),
      ])

      return {
        isAuthenticated: true,
        user,
        accessToken: tokenResponse.access_token,
      }
    }

    throw new Error('Authentication cancelled')
  }

  /**
   * Exchange authorization code for access token
   * TODO: Move this to a backend service in production
   */
  private static async exchangeCodeForToken(code: string): Promise<{ access_token: string }> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('[GitHubAuth] Token exchange failed:', text)
      throw new Error('Failed to exchange code for token')
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error_description || 'OAuth error')
    }

    return { access_token: data.access_token }
  }

  /**
   * Fetch user information
   */
  private static async fetchUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Kimi-Codespaces-Mobile',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user information')
    }

    return await response.json()
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    this.accessToken = null
    this.user = null

    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_DATA_KEY),
    ])
  }
}
