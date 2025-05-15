import axios from 'axios'

export async function analyzeGitHubProfile(username) {
  try {
    const userRes = await axios.get(`https://api.github.com/users/${username}`)
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`)
    const eventsRes = await axios.get(`https://api.github.com/users/${username}/events?per_page=100`)

    const user = userRes.data
    const repos = reposRes.data
    const events = eventsRes.data

    const languageCount = {}
    repos.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
      }
    })
    const mainLanguage = Object.keys(languageCount).reduce((a, b) => 
      languageCount[a] > languageCount[b] ? a : b, null)

    const pushEvents = events.filter(e => e.type === 'PushEvent')
    const commitCount = pushEvents.reduce((acc, event) => acc + event.payload.commits.length, 0)
    const accountAgeDays = (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
    const commitsPerDay = commitCount / Math.max(1, accountAgeDays)
    
    let commitFrequency
    if (commitsPerDay > 5) commitFrequency = 'Grindset 💪'
    else if (commitsPerDay > 1) commitFrequency = 'Consistent 🚀'
    else if (commitsPerDay > 0.1) commitFrequency = 'Casual 😎'
    else commitFrequency = 'Ghost 👻'

    const auraScore = Math.min(100, Math.floor(
      (repos.length * 1.5) + 
      (commitCount * 0.5) + 
      (languageCount[mainLanguage] || 0) * 2 +
      (user.followers * 0.2)
    ))

    return {
      username: user.login,
      mainLanguage,
      commitFrequency,
      repoCount: repos.length,
      commitCount,
      followers: user.followers,
      accountAgeDays: Math.floor(accountAgeDays),
      auraScore,
      rawData: {
        repos,
        events
      }
    }
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('GitHub user not found')
    }
    throw new Error('Failed to fetch GitHub data')
  }
}