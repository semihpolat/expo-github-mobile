export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
  }
  description: string | null
  private: boolean
  fork: boolean
  language: string | null
  default_branch: string
  updated_at: string
  stargazers_count: number
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
  }
  protected: boolean
}

export class GitHubAPI {
  private static readonly BASE_URL = 'https://api.github.com'

  private static getHeaders(accessToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Kimi-Codespaces-Mobile',
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    return headers
  }

  /**
   * Fetch repositories for the authenticated user
   * Requires authentication token
   */
  static async getUserRepos(accessToken: string): Promise<GitHubRepo[]> {
    const response = await fetch(
      `${this.BASE_URL}/user/repos?per_page=100&sort=updated&type=all`,
      {
        headers: this.getHeaders(accessToken),
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.')
      } else if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.')
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos = await response.json()
    return repos
  }

  /**
   * Fetch branches for a repository
   */
  static async getRepoBranches(
    accessToken: string,
    owner: string,
    repo: string
  ): Promise<GitHubBranch[]> {
    const response = await fetch(
      `${this.BASE_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=100`,
      {
        headers: this.getHeaders(accessToken),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch branches: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * Get authenticated user info
   */
  static async getUser(accessToken: string): Promise<GitHubRepo['owner'] & { name?: string | null; email?: string | null }> {
    const response = await fetch(`${this.BASE_URL}/user`, {
      headers: this.getHeaders(accessToken),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`)
    }

    return await response.json()
  }
}
