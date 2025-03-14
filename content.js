//const Input = require("postcss/lib/input")

let settings = {
  tone: "professional",
  industry: "technology",
  apiKey: "",
  postAssist: true,
  commentAssist: true,
  postImprove: true,
}

// Load settings when content script initializes
chrome.storage.sync.get(["tone", "industry", "apiKey", "postAssist", "commentAssist", "postImprove"], (data) => {
  settings = { ...settings, ...data }
  initializeExtension()
})

// Listen for settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "settingsUpdated") {
    chrome.storage.sync.get(["tone", "industry", "apiKey", "postAssist", "commentAssist", "postImprove"], (data) => {
      settings = { ...settings, ...data }
    })
  }
})

function initializeExtension() {
  // Initialize the extension functionality
  setupPostCreationAssistant()
  setupCommentReplyAssistant()

  // Set up mutation observer to detect new elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        try {
          //setupPostCreationAssistant()
          setupCommentReplyAssistant()
      } catch (error) {
          console.error("MutationObserver Error:", error);
      }
      }
    })
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

function setupPostCreationAssistant() {
  if (!settings.postAssist) return

  // Find all post creation areas
  const postEditors = document.querySelectorAll(".share-box-feed-entry__closed-share-box, .share-box")
  console.log('this is the post editors', postEditors)
  postEditors.forEach((editor) => {
    // Check if we've already added our button
    if (editor.querySelector(".linkedin-ai-button")) return

    // Find the toolbar or create insertion point
    const toolbar = editor.querySelector(".share-creation-state__footer") || editor.parentElement

    if (toolbar) {
      // Create AI assistant button
      const aiButton = document.createElement("button")
      aiButton.className = "linkedin-ai-button"
      aiButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Zm0 12.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
        </svg>
        AI Assist
      `

      aiButton.addEventListener("click", () => {
        handlePostAssistant(editor)
      })

      // Add button to toolbar
      toolbar.appendChild(aiButton)
    }
  })
}

function setupCommentReplyAssistant() {
  if (!settings.commentAssist) return

  // Find all comment input areas
  const commentInputs = document.querySelectorAll(".comments-comment-texteditor")
  console.log('these are all the comment inputs', commentInputs)
  commentInputs.forEach((input) => {
    // Check if we've already added our button
    const container = input.querySelector(".ql-container")
    console.log('this is the container', container)
    if (input.querySelector(".linkedin-ai-button")) return

    // Find the comment actions area
    const actionsArea = container.closest(".comments-comment-box-comment__text-editor")
    console.log('this is the actions area', actionsArea)
    if (actionsArea) {
      // Create AI assistant button
      const aiButton = document.createElement("button")
      aiButton.className = "linkedin-ai-button"
      aiButton.style.fontSize = "12px"
      aiButton.style.padding = "4px 8px"
      aiButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Zm0 12.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
        </svg>
        AI Reply
      `

      aiButton.addEventListener("click", () => {
        handleCommentAssistant(input)
        //setInterval(() => {
        //}, 1000)
      })

      // Add button to actions area
      actionsArea.prepend(aiButton)
    }
  })
}

async function handlePostAssistant(editor) {
  // Create suggestions container if it doesn't exist
  let suggestionsContainer = editor.parentElement.querySelector(".linkedin-ai-suggestions")

  if (!suggestionsContainer) {
    suggestionsContainer = document.createElement("div")
    suggestionsContainer.className = "linkedin-ai-suggestions"
    editor.parentElement.appendChild(suggestionsContainer)
  }

  // Show loading state
  suggestionsContainer.innerHTML = `
    <div class="linkedin-ai-loading">
      <div class="linkedin-ai-loading-spinner"></div>
      <span>Generating suggestions...</span>
    </div>
  `

  try {
    // Get the current post content
    const postContent = editor.textContent.trim()

    // Get post context (optional)
    const postContext = getPostContext()

    // Generate suggestions
    const suggestions = await generatePostSuggestions(postContent, postContext)

    // Display suggestions
    displayPostSuggestions(suggestionsContainer, suggestions, editor)
  } catch (error) {
    suggestionsContainer.innerHTML = `
      <div style="color: red; padding: 10px;">
        Error: ${error.message || "Failed to generate suggestions"}
      </div>
    `
  }

  // try to add ai assist to .share-box
  const shareButton = editor.querySelector('.share-box-feed-entry__top-bar .artdeco-button')
  shareButton.addEventListener('click', () => {
    setupPostCreationAssistant()
  })
}

async function handleCommentAssistant(commentInput) {
  // Create suggestions container if it doesn't exist
  const commentBox = commentInput.querySelector(".ql-container")
  console.log('-------------------->', commentInput, commentBox)
  let suggestionsContainer = commentBox.querySelector(".linkedin-ai-suggestions")

  if (!suggestionsContainer) {
    suggestionsContainer = document.createElement("div")
    suggestionsContainer.className = "linkedin-ai-suggestions"
    commentBox.appendChild(suggestionsContainer)
  }

  // Show loading state
  suggestionsContainer.innerHTML = `
    <div class="linkedin-ai-loading">
      <div class="linkedin-ai-loading-spinner"></div>
      <span>Generating reply suggestions...</span>
    </div>
  `

  try {
    // Get the post and comment context
    const context = getCommentContext(commentInput)

    // Generate suggestions
    const suggestions = await generateCommentSuggestions(context)

    // Display suggestions
    displayCommentSuggestions(suggestionsContainer, suggestions, commentInput)
  } catch (error) {
    suggestionsContainer.innerHTML = `
      <div style="color: red; padding: 10px;">
        Error: ${error.message || "Failed to generate suggestions"}
      </div>
    `
  }
}

function getPostContext() {
  // Try to get context from the page (like hashtags, trending topics, etc.)
  const context = {
    industry: settings.tone,
    recentTopics: [],
  }

  // Look for trending topics or hashtags
  const trendingElements = document.querySelectorAll(
    ".feed-shared-news-module__headline, .feed-shared-news-module__sub-headline",
  )
  trendingElements.forEach((element) => {
    if (element.textContent.trim()) {
      context.recentTopics.push(element.textContent.trim())
    }
  })

  return context
}

function getCommentContext(commentInput) {
  const context = {
    postContent: "",
    previousComments: [],
    postWriter: ""
  }

  // Try to get the original post content
  const postContainer = commentInput.closest(".feed-shared-update-v2")
  const postCreatorContainer = postContainer.querySelector(".update-components-actor__meta")
  
  if (postContainer) {
    const postTextElement = postContainer.querySelector(".feed-shared-update-v2__description")
    if (postTextElement) {
      context.postContent = postTextElement.textContent.trim()
    }
  }

  // Try to get previous comments
  const commentsContainer = commentInput.closest(".comments-comment-item, .comments-comments-list")
  if (commentsContainer) {
    const commentElements = commentsContainer.querySelectorAll(".comments-comment-item__main-content")
    commentElements.forEach((comment) => {
      context.previousComments.push(comment.textContent.trim())
    })
  }

  // Try to get post writer
  const postCreatorInnerContainer = postCreatorContainer.querySelector(".update-components-actor__title span")
  if (postCreatorContainer) {
    const creatorFullname = postCreatorInnerContainer.querySelector("span span")
    context.postWriter = creatorFullname.textContent.trim()
  }
  console.log('this is the post writer', context.postWriter)
  return context
}

async function generatePostSuggestions(postContent, context) {
  // Check if API key is available
  if (!settings.apiKey) {
    throw new Error("Please add your OpenAI API key in the extension settings")
  }

  // Prepare the prompt
  let prompt = `Generate 3 professional LinkedIn post suggestions`

  if (postContent) {
    prompt += ` based on this draft: "${postContent}" written by ${context.postWriter}`
  } else {
    prompt += ` for a ${settings.industry} professional`
  }

  prompt += `. The tone should be ${settings.tone}.`

  if (context.recentTopics && context.recentTopics.length > 0) {
    prompt += ` Consider these trending topics: ${context.recentTopics.join(", ")}.`
  }

  prompt += ` Each post should be concise (under 200 words), engaging, and include relevant hashtags.`

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
          content: `You are a professional LinkedIn content assistant. You help create engaging, professional posts for the ${settings.industry} industry in a ${settings.tone} tone.`,
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
    throw new Error(data.error?.message || "Failed to generate suggestions")
  }

  // Parse the response to extract the suggestions
  const content = data.choices[0].message.content

  // Split the content into separate suggestions
  const suggestions = content
    .split(/\d+\.\s+/)
    .filter(Boolean)
    .map((s) => s.trim())

  return suggestions
}

async function generateCommentSuggestions(context) {
  // Check if API key is available
  if (!settings.apiKey) {
    throw new Error("Please add your OpenAI API key in the extension settings")
  }

  // Prepare the prompt
  let prompt = `Generate 3 professional LinkedIn comment replies`

  if (context.postContent) {
    prompt += ` to this post: "${context.postContent}"`
  }

  if (context.previousComments && context.previousComments.length > 0) {
    prompt += `. Consider these previous comments: ${context.previousComments.join(" | ")}`
  }

  prompt += `. The tone should be ${settings.tone}.`
  prompt += ` Each reply should be concise (under 100 words), thoughtful, and add value to the conversation.`

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
          content: `You are a professional LinkedIn comment assistant. You help create thoughtful, engaging replies for the ${settings.industry} industry in a ${settings.tone} tone.`,
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
    throw new Error(data.error?.message || "Failed to generate suggestions")
  }

  // Parse the response to extract the suggestions
  const content = data.choices[0].message.content

  // Split the content into separate suggestions
  const suggestions = content
    .split(/\d+\.\s+/)
    .filter(Boolean)
    .map((s) => s.trim())

  return suggestions
}

function displayPostSuggestions(container, suggestions, editor) {
  container.innerHTML = `
    <h3>AI Post Suggestions</h3>
    <div class="linkedin-ai-suggestion-list">
      ${suggestions
        .map(
          (suggestion, index) => `
        <div class="linkedin-ai-suggestion" data-index="${index}">
          ${suggestion}
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="linkedin-ai-actions">
      <button class="linkedin-ai-dismiss">Dismiss</button>
      <button class="linkedin-ai-regenerate">Regenerate</button>
    </div>
  `

  // Add click event to suggestions
  const suggestionElements = container.querySelectorAll(".linkedin-ai-suggestion")
  suggestionElements.forEach((element) => {
    element.addEventListener("click", function () {
      const index = this.getAttribute("data-index")
      const suggestion = suggestions[index]

      // Insert the suggestion into the editor
      const editorBox = editor.querySelector('.share-box-feed-entry__top-bar .artdeco-button')
      insertTextIntoEditor(editorBox, suggestion)

      // Remove the suggestions container
      container.remove()
    })
  })

  // Add click event to dismiss button
  const dismissButton = container.querySelector(".linkedin-ai-dismiss")
  dismissButton.addEventListener("click", () => {
    container.remove()
  })

  // Add click event to regenerate button
  const regenerateButton = container.querySelector(".linkedin-ai-regenerate")
  regenerateButton.addEventListener("click", () => {
    handlePostAssistant(editor)
  })
}

function displayCommentSuggestions(container, suggestions, commentInput) {
  container.innerHTML = `
    <h3>AI Reply Suggestions</h3>
    <div class="linkedin-ai-suggestion-list">
      ${suggestions
        .map(
          (suggestion, index) => `
        <div class="linkedin-ai-suggestion" data-index="${index}">
          ${suggestion}
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="linkedin-ai-actions">
      <button class="linkedin-ai-dismiss">Dismiss</button>
      <button class="linkedin-ai-regenerate">Regenerate</button>
    </div>
  `

  // Add click event to suggestions
  const suggestionElements = container.querySelectorAll(".linkedin-ai-suggestion")
  suggestionElements.forEach((element) => {
    element.addEventListener("click", function () {
      const index = this.getAttribute("data-index")
      const suggestion = suggestions[index]

      // Insert the suggestion into the comment input
      const commentInputEditor = commentInput.querySelector('.ql-editor')
      insertTextIntoEditor(commentInputEditor, suggestion)

      // Remove the suggestions container
      container.remove()
    })
  })

  // Add click event to dismiss button
  const dismissButton = container.querySelector(".linkedin-ai-dismiss")
  dismissButton.addEventListener("click", () => {
    container.remove()
  })

  // Add click event to regenerate button
  const regenerateButton = container.querySelector(".linkedin-ai-regenerate")
  regenerateButton.addEventListener("click", () => {
    handleCommentAssistant(commentInput)
  })
}

function insertTextIntoEditor(editor, text) {
  // For contentEditable elements
  console.log(editor, text)
  if (editor.isContentEditable) {
    editor.textContent = text.replaceAll('"', '')

    // Dispatch input event to trigger LinkedIn's event handlers
    const inputEvent = new Event("input", { bubbles: true })
    editor.dispatchEvent(inputEvent)
  }
  // For textarea elements
  else if (editor.tagName === "TEXTAREA") {
    editor.value = text

    // Dispatch input event
    const inputEvent = new Event("input", { bubbles: true })
    editor.dispatchEvent(inputEvent)
  } else {
    editor.textContent = text
  }
}

