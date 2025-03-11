document.addEventListener("DOMContentLoaded", () => {
  // Load saved settings
  chrome.storage.sync.get(["tone", "industry", "apiKey", "postAssist", "commentAssist", "postImprove"], (data) => {
    if (data.tone) document.getElementById("tone").value = data.tone
    if (data.industry) document.getElementById("industry").value = data.industry
    if (data.apiKey) document.getElementById("api-key").value = data.apiKey

    if (data.postAssist !== undefined) {
      document.getElementById("post-assist").checked = data.postAssist
    }

    if (data.commentAssist !== undefined) {
      document.getElementById("comment-assist").checked = data.commentAssist
    }

    if (data.postImprove !== undefined) {
      document.getElementById("post-improve").checked = data.postImprove
    }
  })

  // Save settings
  document.getElementById("save-settings").addEventListener("click", () => {
    const tone = document.getElementById("tone").value
    const industry = document.getElementById("industry").value
    const apiKey = document.getElementById("api-key").value
    const postAssist = document.getElementById("post-assist").checked
    const commentAssist = document.getElementById("comment-assist").checked
    const postImprove = document.getElementById("post-improve").checked

    chrome.storage.sync.set(
      {
        tone,
        industry,
        apiKey,
        postAssist,
        commentAssist,
        postImprove,
      },
      () => {
        // Show success message
        const button = document.getElementById("save-settings")
        const originalText = button.textContent
        button.textContent = "Settings Saved!"
        button.style.backgroundColor = "#0a8a0a"

        setTimeout(() => {
          button.textContent = originalText
          button.style.backgroundColor = ""
        }, 1500)

        // Notify content script that settings have changed
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "settingsUpdated" })
        })
      },
    )
  })
})

