import { useState, useEffect, useCallback } from 'react'
import { GitHubAPI, type GitHubRepo, type GitHubBranch } from '../services/github'
import { useAuth } from './useSettings'

export const useGitHubRepos = (accessToken: string | null | undefined) => {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRepos = useCallback(async () => {
    if (!accessToken) {
      setRepos([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fetchedRepos = await GitHubAPI.getUserRepos(accessToken)
      // Sort by updated
      const sortedRepos = fetchedRepos.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      setRepos(sortedRepos)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch repositories')
      setRepos([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    fetchRepos()
  }, [fetchRepos])

  return { repos, loading, error, refetch: fetchRepos }
}

export const useGitHubBranches = (
  accessToken: string | null | undefined,
  owner: string,
  repo: string
) => {
  const [branches, setBranches] = useState<GitHubBranch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBranches = useCallback(async () => {
    if (!accessToken || !owner || !repo) {
      setBranches([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fetchedBranches = await GitHubAPI.getRepoBranches(accessToken, owner, repo)
      setBranches(fetchedBranches)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch branches')
      setBranches([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, owner, repo])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  return { branches, loading, error, refetch: fetchBranches }
}

export { type GitHubRepo, type GitHubBranch }
