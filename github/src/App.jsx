import { useState } from 'react'
import { analyzeGitHubProfile } from './GithubService'
import { generateRoast } from './RoastService'

export default function App() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [auraData, setAuraData] = useState(null)
  const [roast, setRoast] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username) return
    
    setIsLoading(true)
    setError('')
    setAuraData(null)
    setRoast('')
    
    try {
      const data = await analyzeGitHubProfile(username)
      setAuraData(data)
      
      const roastText = await generateRoast(data)
      setRoast(roastText)
    } catch (err) {
      setError(err.message || 'Failed to analyze GitHub profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-xl mx-auto mt-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 text-center tracking-tight">
            GitHub Aura
          </h1>
          <p className="text-center mt-3 text-zinc-400 text-sm">
            Decode your coding vibe in Gen-Z slang
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-10 relative">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
            <div className="relative flex items-center bg-zinc-900 rounded-lg">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="GitHub username"
                className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-zinc-200"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="min-w-24 px-4 py-3 text-sm font-medium text-black bg-gradient-to-r from-violet-400 to-cyan-400 rounded-r-lg transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Scanning</span>
                  </div>
                ) : (
                  'Calculate'
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-8 bg-red-900/20 rounded-lg border border-red-800/50 animate-fade-in">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {auraData && (
          <div className="animate-fade-in">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden mb-6">
              <div className="p-5 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                    {username}'s Aura
                  </h2>
                  <div className="px-2 py-1 bg-violet-500/20 rounded text-violet-300 text-xs font-medium">
                    {auraData.auraScore}/100
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 divide-x divide-y divide-zinc-800">
                <div className="p-4">
                  <p className="text-xs text-zinc-500 mb-1">Main Language</p>
                  <p className="font-medium">{auraData.mainLanguage || 'None'}</p>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-zinc-500 mb-1">Commit Frequency</p>
                  <p className="font-medium">{auraData.commitFrequency}</p>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-zinc-500 mb-1">Repo Count</p>
                  <p className="font-medium">{auraData.repoCount}</p>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-zinc-500 mb-1">User Type</p>
                  <p className="font-medium">{auraData.userType || 'Developer'}</p>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative p-5 bg-zinc-900 rounded-lg">
                <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">The vibe check</h3>
                <p className="text-zinc-300 italic">"{roast}"</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}