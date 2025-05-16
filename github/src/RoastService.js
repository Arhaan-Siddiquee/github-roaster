import axios from 'axios'

export async function generateRoast(auraData) {
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
  if (!API_KEY) {
    console.error('Google API key not configured')
    return "Couldn't generate roast (API not configured)"
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

  try {
    const prompt = `Generate a super-mean, brutally honest Hinglish roast (1-2 sentences max) about a GitHub programmer based on these stats:

    - Main language: ${auraData.mainLanguage || 'None'}
    - Total repositories: ${auraData.repoCount}
    - Total commits: ${auraData.commitCount}
    - Commit frequency: ${auraData.commitFrequency}
    - Followers: ${auraData.followers}
    - Account age: ${Math.floor(auraData.accountAgeDays)} days

    Guidelines:
    - Use latest trending Hinglish and pop-culture slang (2024 level), include recent viral words, memes,(don't include a person/individual) or references.
    - Make it *super mean* in tone to motivate the user (ego boost roast).
    - Include tech/programming culture references.
    - Can include subtle gali-level abuses if needed for extra spice (like “bhai tu toh X ka baap nikla”).
    - Use abuses (example- bsdk, chutiya etc) only if it fits the context.
    - Use emojis appropriately.
    - Max 2 sentences.
    - Sarcastic, witty, and sharp like a viral roast tweet or meme.
    `

    const response = await axios.post(API_URL, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 120
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
           "Your code's so basic, even this roast function failed 💀"
  } catch (error) {
    console.error('Roast generation failed:', error)
    return `API Error: ${error.response?.data?.error?.message || error.message}`
  }
}