let settings = {
  apiKey: "", // Replace with your actual API key or fetch from storage
  industry: "Technology",
  tone: "Professional",
  postImprove: true,
}

chrome.storage.sync.get(["tone", "industry", "apiKey", "postAssist", "commentAssist", "postImprove"], (data) => {
  settings = { ...settings, ...data }

})
// Function to analyze and improve an existing post
async function analyzeAndImprovePost(postContent) {
  // Check if API key is available
  if (!settings.apiKey) {
    throw new Error("Please add your OpenAI API key in the extension settings")
  }

  // Prepare the prompt
  const prompt = `
    Analyze this LinkedIn post and rewrite it with improvements:
    
    "${postContent}"
    
    Rewrite it to make it more engaging, professional, and effective.
    Focus on:
    1. Clarity and conciseness
    2. Professional tone
    3. Engagement potential
    4. Appropriate hashtags
    5. Call to action
    
    Format your response as a list of specific post improvements.
  `

  {/** const prompt = `
    Analyze this LinkedIn post and suggest improvements:
    
    "${postContent}"
    
    Provide specific suggestions to make it more engaging, professional, and effective.
    Focus on:
    1. Clarity and conciseness
    2. Professional tone
    3. Engagement potential
    4. Appropriate hashtags
    5. Call to action
    
    Format your response as a list of specific suggestions.
  ` */}

  // Call the OpenAI API
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional LinkedIn content expert. You help improve posts for the ${settings.industry} industry in a ${settings.tone} tone.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to generate improvements")
  }

  // Return the improvement suggestions
  return data.choices[0].message.content
}

// Function to add the improvement button to posts
function setupPostImprovement() {
  if (!settings.postImprove) return

  // Find all published posts by the current user
  const userPosts = document.querySelectorAll(".feed-shared-update-v2")
  console.log('---------------------->', userPosts)

  userPosts.forEach((post) => {
    // Check if this is the user's own post
    //const actorName = post.querySelector(".feed-shared-actor__name")
    const actorName = post.querySelector(".update-components-actor__title")
    console.log('---------------------->', actorName)
    //if (!actorName || !isCurrentUser(actorName.textContent.trim())) return

    // Check if we've already added our button
    if (post.querySelector(".linkedin-ai-improve-button")) return

    // Find the post actions area
    const actionsArea = post.querySelector(".feed-shared-social-action-bar") //before feed-shared-social-actions
    console.log('---------------------->', actionsArea)
    if (actionsArea) {
      // Create AI improvement button
      const improveButton = document.createElement("button")
      improveButton.className = "linkedin-ai-improve-button"
      improveButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Zm0 12.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
        </svg>
        Improve Post
      `

      improveButton.style.border = "none"
      improveButton.style.background = "none"
      improveButton.style.color = "#0a66c2"
      improveButton.style.fontWeight = "600"
      improveButton.style.fontSize = "14px"
      improveButton.style.display = "flex"
      improveButton.style.alignItems = "center"
      improveButton.style.cursor = "pointer"
      improveButton.style.padding = "4px 8px"
      improveButton.style.borderRadius = "4px"

      improveButton.addEventListener("mouseover", function () {
        this.style.backgroundColor = "#e7f3ff"
      })

      improveButton.addEventListener("mouseout", function () {
        this.style.backgroundColor = "transparent"
      })

      improveButton.addEventListener("click", () => {
        handlePostImprovement(post)
      })

      // Add button to actions area
      actionsArea.appendChild(improveButton)
    }
  })
}

// Helper function to check if a post is by the current user
function isCurrentUser(name) {
  // This is a simplified check - in a real extension, you'd want to
  // compare with the actual logged-in user's name
  //const profileName = document.querySelector(".profile-rail-card__actor-link")
  const profileName = document.querySelector(".single-line-truncate")
  if (profileName) {
    return profileName.textContent.trim() === name
  }
  return false
}

// Function to handle post improvement
async function handlePostImprovement(post) {
  // Get the post content
  const postContent = post.querySelector(".feed-shared-update-v2__description")
  if (!postContent) return

  // Create suggestions container if it doesn't exist
  let suggestionsContainer = post.querySelector(".linkedin-ai-suggestions")

  if (!suggestionsContainer) {
    suggestionsContainer = document.createElement("div")
    suggestionsContainer.className = "linkedin-ai-suggestions"
    post.appendChild(suggestionsContainer)
  }

  // Show loading state
  suggestionsContainer.innerHTML = `
    <div class="linkedin-ai-loading">
      <div class="linkedin-ai-loading-spinner"></div>
      <span>Analyzing your post...</span>
    </div>
  `

  try {
    // Get the post content text
    const content = postContent.textContent.trim()

    // Generate improvement suggestions
    const improvements = await analyzeAndImprovePost(content)

    // Display improvements
    suggestionsContainer.innerHTML = `
      <h3>Post Improvement Suggestions</h3>
      <div class="linkedin-ai-improvement">
        ${improvements.replace(/\n/g, "<br>")}
      </div>
      <div class="linkedin-ai-actions">
        <button class="linkedin-ai-dismiss">Dismiss</button>
      </div>
    `

    // Add click event to dismiss button
    const dismissButton = suggestionsContainer.querySelector(".linkedin-ai-dismiss")
    dismissButton.addEventListener("click", () => {
      suggestionsContainer.remove()
    })
  } catch (error) {
    suggestionsContainer.innerHTML = `
      <div style="color: red; padding: 10px;">
        Error: ${error.message || "Failed to generate improvements"}
      </div>
    `
  }
}

// Export functions to be used in content.js
// Note: In a real extension, you'd use modules or a different approach
// This is just for demonstration purposes
window.postImprovement = {
  setupPostImprovement,
  analyzeAndImprovePost,
  handlePostImprovement,
}

//export { setupPostImprovement, analyzeAndImprovePost, handlePostImprovement }
