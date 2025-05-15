import axios from 'axios'

// Create authenticated GitHub API instance
const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
})

// Add token if available
if (import.meta.env.VITE_GITHUB_TOKEN) {
  githubAPI.defaults.headers.common['Authorization'] = `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
}

export async function analyzeGitHubProfile(username) {
  try {
    // Get user and repos data (parallel requests)
    const [userRes, reposRes] = await Promise.all([
      githubAPI.get(`/users/${username}`),
      githubAPI.get(`/users/${username}/repos`, {
        params: {
          per_page: 100,
          sort: 'updated',
          direction: 'desc'
        }
      })
    ])

    const user = userRes.data
    const repos = reposRes.data

    // Calculate main language
    const languageCount = {}
    repos.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
      }
    })
    const mainLanguage = Object.keys(languageCount).reduce((a, b) => 
      languageCount[a] > languageCount[b] ? a : b, null)

    // Get commit count for each repo (parallel with rate limiting)
    const BATCH_SIZE = 5 // Process 5 repos at a time to avoid rate limits
    let totalCommits = 0
    let processedRepos = 0

    while (processedRepos < repos.length) {
      const batch = repos.slice(processedRepos, processedRepos + BATCH_SIZE)
      const batchCounts = await Promise.all(
        batch.map(async repo => {
          try {
            // Try contributors API first
            const contributorsRes = await githubAPI.get(`/repos/${repo.full_name}/contributors`)
            const userContributions = contributorsRes.data.find(c => 
              c.login.toLowerCase() === username.toLowerCase())
            return userContributions?.contributions || 0
          } catch (error) {
            if (error.response?.status === 403) {
              // Rate limited - wait before retrying
              await new Promise(resolve => setTimeout(resolve, 5000))
              return 0
            }
            // Fallback to commit count API
            try {
              const commitsRes = await githubAPI.get(`/repos/${repo.full_name}/commits`, {
                params: {
                  author: username,
                  per_page: 1
                }
              })
              // If we can get the first page, check for total count in headers
              if (commitsRes.headers.link) {
                const lastPageMatch = commitsRes.headers.link.match(/page=(\d+)>; rel="last"/)
                if (lastPageMatch) {
                  return parseInt(lastPageMatch[1])
                }
              }
              return commitsRes.data.length
            } catch {
              return 0
            }
          }
        })
      )
      totalCommits += batchCounts.reduce((sum, count) => sum + count, 0)
      processedRepos += BATCH_SIZE
      
      // Small delay between batches to avoid rate limits
      if (processedRepos < repos.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Calculate commit frequency
    const accountAgeDays = (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
    const commitsPerDay = totalCommits / Math.max(1, accountAgeDays)
    
    let commitFrequency
    if (commitsPerDay > 5) commitFrequency = 'Grindset 💪'
    else if (commitsPerDay > 1) commitFrequency = 'Consistent 🚀'
    else if (commitsPerDay > 0.1) commitFrequency = 'Casual 😎'
    else commitFrequency = 'Ghost 👻'

    const auraScore = Math.min(100, Math.floor(
      (repos.length * 1.5) + 
      (totalCommits * 0.5) + 
      (languageCount[mainLanguage] || 0) * 2 +
      (user.followers * 0.2)
    ))

    return {
      username: user.login,
      mainLanguage,
      commitFrequency,
      repoCount: repos.length,
      commitCount: totalCommits,
      followers: user.followers,
      accountAgeDays: Math.floor(accountAgeDays),
      auraScore,
      avatarUrl: user.avatar_url
    }
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('GitHub user not found')
    }
    if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded - try again later')
    }
    throw new Error('Failed to fetch GitHub data')
  }
}