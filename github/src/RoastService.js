import axios from 'axios'

export async function generateRoast(auraData) {
  // Replace with your actual Google API key
  const API_KEY = 'YOUR_GOOGLE_API_KEY'
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

  try {
    const prompt = `Generate a funny, sarcastic Gen-Z style roast (1-2 sentences max) about a GitHub programmer based on these stats:
    - Main language: ${auraData.mainLanguage || 'None'}
    - Total repositories: ${auraData.repoCount}
    - Total commits: ${auraData.commitCount}
    - Commit frequency: ${auraData.commitFrequency}
    - Followers: ${auraData.followers}
    - Account age: ${Math.floor(auraData.accountAgeDays)} days
    
    Make it:
    - Use current Gen-Z slang (2023-2024)
    - Funny but not mean-spirited
    - Relate to programming culture
    - Maximum 2 sentences
    - Include emoji if appropriate
    
    Examples:
    "Bruh, your commit messages are giving 'fixed stuff' energy 💀"
    "Not you using tabs like it's 1995... we need to have a talk 😬"`

    const response = await axios.post(API_URL, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.9,  // More creative
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 120
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Extract the generated text
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!generatedText) {
      throw new Error('No roast generated - try again!')
    }

    return generatedText
  } catch (error) {
    console.error('Roast generation failed:', error)
    // Fallback to a generic roast if API fails
    return `Couldn't generate a roast (API issue), but your code's probably mid anyway 💀`
  }
}