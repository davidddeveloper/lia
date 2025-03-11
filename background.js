chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings
  chrome.storage.sync.get(["tone", "industry", "apiKey", "postAssist", "commentAssist", "postImprove"], (data) => {
    // Only set defaults for values that don't exist
    const defaults = {
      tone: data.tone || "professional",
      industry: data.industry || "technology",
      apiKey: data.apiKey || "",
      postAssist: data.postAssist !== undefined ? data.postAssist : true,
      commentAssist: data.commentAssist !== undefined ? data.commentAssist : true,
      postImprove: data.postImprove !== undefined ? data.postImprove : true,
    }

    chrome.storage.sync.set(defaults)
  })
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateAIContent") {
    // This would handle any background processing if needed
    // For now, we're doing API calls directly from the content script
    sendResponse({ success: true })
  }

  return true // Keep the message channel open for async responses
})

